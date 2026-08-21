from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, security

router = APIRouter(prefix="/actividades", tags=["Actividades"],)

@router.get("/", response_model=List[schemas.ActividadResponse])



@router.get("/", response_model=List[schemas.ActividadResponse])
def listar_actividades(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return db.query(models.Actividad).all()


@router.post("/", response_model=schemas.ActividadResponse, status_code=status.HTTP_201_CREATED)
def crear_actividad(
    actividad: schemas.ActividadCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    if actividad.asignado_a_id is not None and not usuario_actual.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede asignar tareas a otros usuarios"
        )

    nueva = models.Actividad(
        titulo=actividad.titulo,
        descripcion=actividad.descripcion,
        completada=actividad.completada,
        creador_id=usuario_actual.id,
        asignado_a_id=actividad.asignado_a_id
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


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
        # Si el valor cambió y el usuario NO es admin, se rechaza
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
    actividad = db.query(models.Actividad).filter(models.Actividad.id == actividad_id).first()
    if not actividad:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    db.delete(actividad)
    db.commit()
    return None