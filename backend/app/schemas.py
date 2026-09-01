from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
from typing import Optional
import re


class UsuarioBase(BaseModel):
    name_users: str | None = None
    usuario: str
    area_id: int | None = None

    @field_validator("usuario")
    @classmethod
    def validar_formato_correo(cls, value: str) -> str:
        patron_correo = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(patron_correo, value):
            raise ValueError("El usuario debe ser un correo electrónico válido")
        return value


class UsuarioCreate(UsuarioBase):
    contrasena: str

    @field_validator("contrasena")
    @classmethod
    def validar_fortaleza_contrasena(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")

        if not re.search(r"[A-Z]", value):
            raise ValueError("La contraseña debe contener al menos una letra mayúscula")

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValueError("La contraseña debe contener al menos un carácter especial (!@#$%^&*)")

        return value
    

class UsuarioResponse(UsuarioBase):
    id: int
    es_admin: bool

    class Config:
        from_attributes = True


class ActividadBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    completada: bool = False
    tipo_actividad: Optional[str] = "Tarea"
    prioridad: Optional[str] = "Media"
    fecha_inicio: Optional[date] = None
    fecha_vencimiento: Optional[date] = None
    estimacion_min_hrs: Optional[float] = None
    estimacion_max_hrs: Optional[float] = None

class ActividadCreate(ActividadBase):
    asignado_a_id: Optional[int] = None
    lider_tecnico_id: Optional[int] = None
    area_id: Optional[int] = None

class ActividadUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    completada: Optional[bool] = None
    tipo_actividad: Optional[str] = None
    prioridad: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_vencimiento: Optional[date] = None
    estimacion_min_hrs: Optional[float] = None
    estimacion_max_hrs: Optional[float] = None
    asignado_a_id: Optional[int] = None
    lider_tecnico_id: Optional[int] = None
    area_id: Optional[int] = None

class ActividadResponse(ActividadBase):
    id: int
    fecha_creacion: datetime
    creador_id: int
    asignado_a_id: Optional[int] = None
    lider_tecnico_id: Optional[int] = None
    area_id: Optional[int] = None

    class Config:
        from_attributes = True


class AreaBase(BaseModel):
    nombre: str


class AreaCreate(AreaBase):
    pass


class AreaResponse(AreaBase):
    id: int
    activa: bool

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    usuario: str
    contrasena: str