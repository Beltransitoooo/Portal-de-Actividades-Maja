import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app import models, schemas, security
from google.auth.transport import requests
from google.oauth2 import id_token
from app.config import settings


def _dominio_permitido(correo: str) -> bool:
    dominios = {d.strip().lower() for d in settings.DOMINIOS_REGISTRO.split(",") if d.strip()}
    return correo.rsplit("@", 1)[-1].lower() in dominios


def registrar(db: Session, usuario_in: schemas.UsuarioCreate):
    if not _dominio_permitido(usuario_in.usuario):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden registrar correos corporativos de MAJA",
        )

    usuario_existente = (
        db.query(models.Usuario)
        .filter(func.lower(models.Usuario.usuario) == func.lower(usuario_in.usuario))
        .first()
    )

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado",
        )

    nuevo_usuario = models.Usuario(
        name_users=usuario_in.name_users,
        usuario=usuario_in.usuario,
        contrasena=security.hash_contrasena(usuario_in.contrasena),
        es_admin=False,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


def _respuesta_sesion(usuario_db: models.Usuario) -> dict:
    token = security.crear_token_acceso(datos={"sub": str(usuario_db.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "es_admin": usuario_db.es_admin,
        "area_id": usuario_db.area_id,
        "name_users": usuario_db.name_users,
    }


def login(db: Session, login_data: schemas.LoginRequest):
    credenciales_incorrectas = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Credenciales incorrectas",
    )
    usuario_db = (
        db.query(models.Usuario)
        .filter(func.lower(models.Usuario.usuario) == func.lower(login_data.usuario))
        .first()
    )

    if not usuario_db:
        security.simular_verificacion()  # mismo tiempo de respuesta que con una cuenta real
        raise credenciales_incorrectas

    ahora = datetime.utcnow()
    if usuario_db.bloqueado_hasta and usuario_db.bloqueado_hasta > ahora:
        minutos = max(1, int((usuario_db.bloqueado_hasta - ahora).total_seconds() // 60) + 1)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Demasiados intentos fallidos. Inténtalo de nuevo en {minutos} min o pide a un administrador un enlace de restablecimiento.",
        )

    if not security.verificar_contrasena(login_data.contrasena, usuario_db.contrasena):
        usuario_db.intentos_fallidos = (usuario_db.intentos_fallidos or 0) + 1
        if usuario_db.intentos_fallidos >= settings.INTENTOS_LOGIN_MAX:
            usuario_db.bloqueado_hasta = ahora + timedelta(minutes=settings.MINUTOS_BLOQUEO_LOGIN)
            usuario_db.intentos_fallidos = 0
        db.commit()
        raise credenciales_incorrectas

    if usuario_db.intentos_fallidos or usuario_db.bloqueado_hasta:
        usuario_db.intentos_fallidos = 0
        usuario_db.bloqueado_hasta = None
        db.commit()

    return _respuesta_sesion(usuario_db)


def autenticar_con_google(db: Session, token_google: str):
    try:
        id_info = id_token.verify_oauth2_token(
            token_google, requests.Request(), settings.GOOGLE_CLIENT_ID
        )

        email = id_info.get("email")
        nombre = id_info.get("name", email.split("@")[0] if email else "")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El token de Google no contiene un correo válido",
            )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de Google inválido o expirado",
        )

    usuario_db = (
        db.query(models.Usuario)
        .filter(func.lower(models.Usuario.usuario) == func.lower(email))
        .first()
    )

    if not usuario_db:
        usuario_db = models.Usuario(
            name_users=nombre,
            usuario=email,
            contrasena="",
            es_admin=False,
            area_id=None,
        )
        db.add(usuario_db)
        db.commit()
        db.refresh(usuario_db)

    return _respuesta_sesion(usuario_db)


def restablecer_contrasena(db: Session, datos: schemas.RestablecerContrasenaRequest):
    """Define una contraseña nueva con un enlace de un solo uso (ver usuarios.generar_restablecimiento)."""
    token_hash = hashlib.sha256(datos.token.encode("utf-8")).hexdigest()
    registro = (
        db.query(models.TokenRestablecimiento)
        .filter(models.TokenRestablecimiento.token_hash == token_hash)
        .first()
    )

    # Mismo mensaje para token inexistente, usado o vencido: no se revela cuál fue el caso
    if not registro or registro.usado or registro.expira < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace no es válido o ya venció. Pide uno nuevo a un administrador.",
        )

    usuario_db = db.query(models.Usuario).filter(models.Usuario.id == registro.usuario_id).first()
    if not usuario_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace no es válido o ya venció. Pide uno nuevo a un administrador.",
        )

    usuario_db.contrasena = security.hash_contrasena(datos.contrasena)
    # Con la contraseña nueva se levanta un posible bloqueo por intentos fallidos
    usuario_db.intentos_fallidos = 0
    usuario_db.bloqueado_hasta = None
    registro.usado = True
    db.commit()
    return {"mensaje": "Contraseña actualizada. Ya puedes iniciar sesión."}
