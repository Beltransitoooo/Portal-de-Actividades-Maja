from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app import schemas
from app.database import get_db
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/registrar", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    return auth_service.registrar(db, usuario)

@router.post("/login")
def iniciar_sesion(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, login_data)