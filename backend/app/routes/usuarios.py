from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app import models, schemas, security
from app.database import get_db
from app.services import usuarios as usuarios_service

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/", response_model=list[schemas.UsuarioResponse])
def mostrar_usuarios(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return usuarios_service.listar(db, usuario_actual)


@router.put("/{usuario_id}", response_model=schemas.UsuarioResponse)
def actualizar_usuario(
    usuario_id: int,
    usuario_update: schemas.UsuarioBase,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return usuarios_service.actualizar(db, usuario_id, usuario_update, usuario_actual)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return usuarios_service.eliminar(db, usuario_id, usuario_actual)