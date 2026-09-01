from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app import models, schemas

def listar(db: Session, usuario_actual: models.Usuario):
    if usuario_actual.es_admin:
        return db.query(models.Usuario).all()

    return db.query(models.Usuario).filter(models.Usuario.area_id == usuario_actual.area_id).all()


def actualizar(db: Session, usuario_id: int, usuario_update: schemas.UsuarioBase, usuario_actual: models.Usuario):
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

    if usuario_update.area_id is not None:
        area_db = db.query(models.Area).filter(models.Area.id == usuario_update.area_id).first()
        if not area_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El área especificada no existe"
            )
        db_usuario.area_id = usuario_update.area_id

    if usuario_update.name_users is not None:
        db_usuario.name_users = usuario_update.name_users

    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def eliminar(db: Session, usuario_id: int, usuario_actual: models.Usuario):
    if not usuario_actual.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede eliminar usuarios"
        )

    if usuario_id == usuario_actual.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario administrador"
        )

    usuario_db = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    db.delete(usuario_db)
    db.commit()
    return None