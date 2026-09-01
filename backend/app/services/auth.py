from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app import models, schemas, security

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
    
    if not usuario_db or not security.verificar_contrasena(login_data.contrasena, usuario_db.contrasena):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Credenciales incorrectas"
        )
    
    token = security.crear_token_acceso(datos={"sub": str(usuario_db.id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "es_admin": usuario_db.es_admin,
        "area_id": usuario_db.area_id
    }