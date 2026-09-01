from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app import models, schemas, security
from app.services import actividades as actividades_service

router = APIRouter(prefix="/actividades", tags=["Actividades"])

@router.get("/", response_model=List[schemas.ActividadResponse])
def listar_actividades(
    equipo: Optional[str] = None,
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.listar(db, usuario_actual, equipo, fecha_inicio, fecha_fin)


@router.post("/", response_model=schemas.ActividadResponse, status_code=status.HTTP_201_CREATED)
def crear_actividad(
    actividad: schemas.ActividadCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.crear(db, actividad, usuario_actual)


@router.put("/{actividad_id}", response_model=schemas.ActividadResponse)
def actualizar_actividad(
    actividad_id: int,
    datos: schemas.ActividadUpdate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.actualizar(db, actividad_id, datos, usuario_actual)


@router.delete("/{actividad_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_actividad(
    actividad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.eliminar(db, actividad_id, usuario_actual)