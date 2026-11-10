from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas, security
from app.database import get_db

router = APIRouter(prefix="/areas", tags=["Áreas"])


@router.get("/", response_model=List[schemas.AreaResponse])
def listar_areas(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual),
):
    return db.query(models.Area).order_by(models.Area.nombre).all()


@router.post("/", response_model=schemas.AreaResponse, status_code=status.HTTP_201_CREATED)
def crear_area(
    datos: schemas.AreaCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual),
):
    if not usuario_actual.es_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el administrador puede crear áreas")
    if db.query(models.Area).filter(func.lower(models.Area.nombre) == datos.nombre.lower()).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe un área con ese nombre")
    area = models.Area(nombre=datos.nombre, activa=True)
    db.add(area)
    db.commit()
    db.refresh(area)
    return area
