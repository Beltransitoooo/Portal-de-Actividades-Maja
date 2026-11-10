from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app import models, schemas, security
from app.services import actividades as actividades_service

router = APIRouter(prefix="/horas", tags=["Horas"])


@router.get("/", response_model=List[schemas.RegistroHorasResponse])
def listar_horas(
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(security.obtener_usuario_actual)
):
    """Horas registradas en las actividades que el usuario puede ver, opcionalmente en un rango de fechas."""
    return actividades_service.listar_horas(db, usuario_actual, desde, hasta)
