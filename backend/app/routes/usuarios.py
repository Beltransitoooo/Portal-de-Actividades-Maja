from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, security

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/", response_model=list[schemas.UsuarioResponse])
def Mostrar_Usuarios(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    if usuario_actual.es_admin:
        return db.query(models.Usuario).all()

    return db.query(models.Usuario).filter(models.Usuario.area_id == usuario_actual.area_id).all()


@router.put("/{usuario_id}", response_model=schemas.UsuarioResponse)
def Actualizar_Usuarios(
    usuario_id: int,
    usuario_update: schemas.UsuarioBase,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    if not usuario_actual.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede editar o reasignar áreas a los usuarios"
        )

    db_usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    if usuario_update.name_users is not None:
        db_usuario.name_users = usuario_update.name_users

    if usuario_update.area_id is not None:
        db_usuario.area_id = usuario_update.area_id

    db.commit()
    db.refresh(db_usuario)
    return db_usuario