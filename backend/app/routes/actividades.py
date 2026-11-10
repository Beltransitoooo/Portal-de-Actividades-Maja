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


# ---------- Horas por día ----------
@router.get("/{actividad_id}/horas", response_model=List[schemas.RegistroHorasResponse])
def listar_horas_actividad(
    actividad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    actividades_service._obtener_actividad(db, actividad_id, usuario_actual)
    return actividades_service.listar_horas(db, usuario_actual, actividad_id=actividad_id)


@router.post("/{actividad_id}/horas", response_model=schemas.RegistroHorasResponse, status_code=status.HTTP_201_CREATED)
def registrar_horas(
    actividad_id: int,
    datos: schemas.RegistroHorasCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.registrar_horas(db, actividad_id, datos, usuario_actual)


@router.delete("/{actividad_id}/horas/{registro_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_horas(
    actividad_id: int,
    registro_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.eliminar_horas(db, actividad_id, registro_id, usuario_actual)


# ---------- Comentarios y evidencias ----------
@router.get("/{actividad_id}/comentarios", response_model=List[schemas.ComentarioResponse])
def listar_comentarios(
    actividad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.listar_comentarios(db, actividad_id, usuario_actual)


@router.post("/{actividad_id}/comentarios", response_model=schemas.ComentarioResponse, status_code=status.HTTP_201_CREATED)
def agregar_comentario(
    actividad_id: int,
    datos: schemas.ComentarioCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.agregar_comentario(db, actividad_id, datos, usuario_actual)


@router.delete("/{actividad_id}/comentarios/{comentario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_comentario(
    actividad_id: int,
    comentario_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.eliminar_comentario(db, actividad_id, comentario_id, usuario_actual)


# ---------- Historial ----------
@router.get("/{actividad_id}/historial", response_model=List[schemas.HistorialResponse])
def listar_historial(
    actividad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return actividades_service.listar_historial(db, actividad_id, usuario_actual)
