from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app import models, schemas, security
from google.auth.transport import requests
from google.oauth2 import id_token
from app.config import settings


def registrar(db: Session, usuario_in: schemas.UsuarioCreate):
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


def login(db: Session, login_data: schemas.LoginRequest):
    usuario_db = (
        db.query(models.Usuario)
        .filter(func.lower(models.Usuario.usuario) == func.lower(login_data.usuario))
        .first()
    )

    if not usuario_db or not security.verificar_contrasena(
        login_data.contrasena, usuario_db.contrasena
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credenciales incorrectas",
        )

    token = security.crear_token_acceso(datos={"sub": str(usuario_db.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "es_admin": usuario_db.es_admin,
        "area_id": usuario_db.area_id,
    }


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

    token = security.crear_token_acceso(datos={"sub": str(usuario_db.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "es_admin": usuario_db.es_admin,
        "area_id": usuario_db.area_id,
    }