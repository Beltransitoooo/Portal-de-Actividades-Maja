from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UsuarioBase(BaseModel):
    name_users: str | None = None
    usuario: str

class UsuarioCreate(UsuarioBase):
    name_users: str
    usuario: str
    contrasena: str

class UsuarioResponse(UsuarioBase):
    id: int
    es_admin: bool

    class Config:
        from_attributes = True


class ActividadBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    completada: bool = False

class ActividadCreate(ActividadBase):
    asignado_a_id: Optional[int] = None

class ActividadUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    completada: Optional[bool] = None
    asignado_a_id: Optional[int] = None

class ActividadResponse(ActividadBase):
    id: int
    fecha_creacion: datetime
    creador_id: int
    asignado_a_id: Optional[int] = None

    class Config:
        from_attributes = True