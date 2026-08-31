from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import models, schemas, security
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/registrar", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    usuario_existente = (
        db.query(models.Usuario)
        .filter(models.Usuario.usuario == usuario.usuario)
        .first()
    )

    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya existe",
        )

    nuevo_usuario = models.Usuario(
        name_users=usuario.name_users,
        usuario=usuario.usuario,
        contrasena=security.hash_contrasena(usuario.contrasena),
        es_admin=False,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.post("/login")
def Iniciar_Sesion(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario_db = db.query(models.Usuario).filter(func.lower(models.Usuario.usuario) == func.lower(login_data.usuario)).first()
    
    if not usuario_db:
        raise HTTPException(status_code=400, detail="El usuario no existe en la base de datos")
        
    if not security.verificar_contrasena(login_data.contrasena, usuario_db.contrasena):
        raise HTTPException(status_code=400, detail="La contraseña no coincide")
    
    token = security.crear_token_acceso(datos={"sub": str(usuario_db.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "es_admin": usuario_db.es_admin,
        "area_id": usuario_db.area_id
    }
