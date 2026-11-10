from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas, security
from app.services import lideres as lideres_service

router = APIRouter(prefix="/lideres-tecnicos", tags=["Líderes técnicos"])


@router.get("/", response_model=List[schemas.LiderTecnicoResponse])
def listar_lideres(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return lideres_service.listar(db)


@router.post("/", response_model=schemas.LiderTecnicoResponse, status_code=status.HTTP_201_CREATED)
def crear_lider(
    datos: schemas.LiderTecnicoCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return lideres_service.crear(db, datos, usuario_actual)


@router.put("/{lider_id}", response_model=schemas.LiderTecnicoResponse)
def actualizar_lider(
    lider_id: int,
    datos: schemas.LiderTecnicoUpdate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    return lideres_service.actualizar(db, lider_id, datos, usuario_actual)
