from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional
from datetime import date
from app import models, schemas

def listar(
    db: Session, 
    usuario_actual: models.Usuario, 
    equipo: Optional[str] = None, 
    fecha_inicio: Optional[date] = None, 
    fecha_fin: Optional[date] = None
):
    query = db.query(models.Actividad)

    if not usuario_actual.es_admin:
        query = query.filter(models.Actividad.area_id == usuario_actual.area_id)

    if equipo:
        query = query.filter(models.Actividad.equipo == equipo)

    if fecha_inicio:
        query = query.filter(models.Actividad.fecha_creacion >= fecha_inicio)

    if fecha_fin:
        query = query.filter(models.Actividad.fecha_creacion <= fecha_fin)

    return query.all()


def crear(db: Session, actividad_in: schemas.ActividadCreate, usuario_actual: models.Usuario):
    datos = actividad_in.model_dump()

    if datos.get("lider_tecnico_id"):
        lider = db.query(models.Usuario).filter(models.Usuario.id == datos["lider_tecnico_id"]).first()
        if not lider:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El líder técnico especificado no existe")

    if datos.get("asignado_a_id"):
        asignado = db.query(models.Usuario).filter(models.Usuario.id == datos["asignado_a_id"]).first()
        if not asignado:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario asignado no existe")

    if datos.get("area_id"):
        area = db.query(models.Area).filter(models.Area.id == datos["area_id"]).first()
        if not area:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El área especificada no existe")
        
        if not usuario_actual.es_admin and datos["area_id"] != usuario_actual.area_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para crear actividades en otra área")
    else:
        datos["area_id"] = usuario_actual.area_id

    if datos.get("fecha_inicio") and datos.get("fecha_vencimiento"):
        if datos["fecha_vencimiento"] < datos["fecha_inicio"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La fecha de vencimiento no puede ser anterior a la de inicio")

    min_hrs = datos.get("estimacion_min_hrs")
    max_hrs = datos.get("estimacion_max_hrs")
    if min_hrs is not None and max_hrs is not None:
        if min_hrs < 0 or max_hrs < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Las estimaciones no pueden ser negativas")
        if max_hrs < min_hrs:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La estimación máxima no puede ser menor a la mínima")

    nueva_actividad = models.Actividad(
        **datos,
        creador_id=usuario_actual.id
    )
    
    db.add(nueva_actividad)
    db.commit()
    db.refresh(nueva_actividad)
    return nueva_actividad


def actualizar(db: Session, actividad_id: int, datos_in: schemas.ActividadUpdate, usuario_actual: models.Usuario):
    query = db.query(models.Actividad).filter(models.Actividad.id == actividad_id)
    actividad_db = query.first()

    if not actividad_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actividad no encontrada")

    datos_actualizar = datos_in.model_dump(exclude_unset=True)

    if "asignado_a_id" in datos_actualizar:
        nuevo_asignado = datos_actualizar["asignado_a_id"]
        if nuevo_asignado != actividad_db.asignado_a_id and not usuario_actual.es_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el administrador puede reasignar tareas a otros usuarios"
            )

    query.update(datos_actualizar)
    db.commit()
    return query.first()


def eliminar(db: Session, actividad_id: int, usuario_actual: models.Usuario):
    if not usuario_actual.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede eliminar actividades"
        )
    
    actividad = db.query(models.Actividad).filter(models.Actividad.id == actividad_id).first()
    if not actividad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actividad no encontrada")

    db.delete(actividad)
    db.commit()
    return None