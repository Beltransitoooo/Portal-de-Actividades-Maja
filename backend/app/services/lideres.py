from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app import models, schemas


def _exigir_admin(usuario: models.Usuario) -> None:
    if not usuario.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede gestionar los líderes técnicos"
        )


def _existe_nombre(db: Session, nombre: str, excepto_id: Optional[int] = None) -> bool:
    query = db.query(models.LiderTecnico).filter(func.lower(models.LiderTecnico.nombre) == nombre.lower())
    if excepto_id is not None:
        query = query.filter(models.LiderTecnico.id != excepto_id)
    return query.first() is not None


def listar(db: Session):
    return db.query(models.LiderTecnico).order_by(models.LiderTecnico.nombre).all()


def crear(db: Session, datos: schemas.LiderTecnicoCreate, usuario_actual: models.Usuario):
    _exigir_admin(usuario_actual)
    if _existe_nombre(db, datos.nombre):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe un líder técnico con ese nombre")

    lider = models.LiderTecnico(nombre=datos.nombre, activo=True)
    db.add(lider)
    db.commit()
    db.refresh(lider)
    return lider


def actualizar(db: Session, lider_id: int, datos: schemas.LiderTecnicoUpdate, usuario_actual: models.Usuario):
    _exigir_admin(usuario_actual)
    lider = db.query(models.LiderTecnico).filter(models.LiderTecnico.id == lider_id).first()
    if not lider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Líder técnico no encontrado")

    if datos.nombre is not None:
        nombre = " ".join(datos.nombre.split())
        if len(nombre) < 2:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El nombre es demasiado corto")
        if _existe_nombre(db, nombre, excepto_id=lider.id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe un líder técnico con ese nombre")
        lider.nombre = nombre

    # Se desactiva en lugar de borrar: las actividades que lo usan conservan su referencia
    if datos.activo is not None:
        lider.activo = datos.activo

    db.commit()
    db.refresh(lider)
    return lider
