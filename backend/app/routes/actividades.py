from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, security
from typing import Optional
from datetime import date

router = APIRouter(prefix="/actividades", tags=["Actividades"],)

@router.get("/", response_model=List[schemas.ActividadResponse])


@router.get("/", response_model=List[schemas.ActividadResponse])
def listar_actividades(
    equipo: Optional[str] = None,
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    query = db.query(models.Actividad)

    if equipo:
        query = query.filter(models.Actividad.equipo == equipo)

    if fecha_inicio:
        query = query.filter(models.Actividad.fecha_creacion >= fecha_inicio)

    if fecha_fin:
        query = query.filter(models.Actividad.fecha_creacion <= fecha_fin)

    return query.all()


@router.post("/", response_model=schemas.ActividadResponse)
def crear_actividad(
    actividad: schemas.ActividadCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    datos_actividad = actividad.model_dump()
    
    if not datos_actividad.get("area_id"):
        datos_actividad["area_id"] = usuario_actual.area_id

    nueva_actividad = models.Actividad(
        **datos_actividad,
        creador_id=usuario_actual.id
    )
    
    db.add(nueva_actividad)
    db.commit()
    db.refresh(nueva_actividad)
    return nueva_actividad


@router.put("/{actividad_id}", response_model=schemas.ActividadResponse)
def actualizar_actividad(
    actividad_id: int,
    datos: schemas.ActividadUpdate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    query = db.query(models.Actividad).filter(models.Actividad.id == actividad_id)
    actividad_db = query.first()

    if not actividad_db:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    datos_actualizar = datos.model_dump(exclude_unset=True)

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


@router.delete("/{actividad_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_actividad(
    actividad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):

    if not usuario_actual.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede eliminar actividades"
        )
    
    actividad = db.query(models.Actividad).filter(models.Actividad.id == actividad_id).first()
    if not actividad:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    db.delete(actividad)
    db.commit()
    return None