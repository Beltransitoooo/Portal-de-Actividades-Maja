from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
from typing import Optional, Literal
import re


class UsuarioBase(BaseModel):
    name_users: Optional[str] = None
    usuario: str
    area_id: Optional[int] = None

    @field_validator("usuario")
    @classmethod
    def validar_formato_correo(cls, value: str) -> str:
        patron_correo = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(patron_correo, value):
            raise ValueError("El usuario debe ser un correo electrónico válido")
        return value


def validar_fortaleza_contrasena(value: str) -> str:
    """Reglas de contraseña compartidas por el registro y el restablecimiento."""
    if len(value) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")

    if not re.search(r"[A-Z]", value):
        raise ValueError("La contraseña debe contener al menos una letra mayúscula")

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        raise ValueError("La contraseña debe contener al menos un carácter especial (!@#$%^&*)")

    return value


class UsuarioCreate(UsuarioBase):
    contrasena: str

    @field_validator("contrasena")
    @classmethod
    def validar_fortaleza(cls, value: str) -> str:
        return validar_fortaleza_contrasena(value)


class UsuarioUpdate(BaseModel):
    """Edición de un usuario por el administrador. area_id = null lo deja sin área."""
    name_users: Optional[str] = Field(default=None, max_length=120)
    area_id: Optional[int] = None


class UsuarioResponse(UsuarioBase):
    id: int
    es_admin: bool

    class Config:
        from_attributes = True


# Estados válidos de una actividad (deben coincidir con models.ESTADOS_ACTIVIDAD)
EstadoActividad = Literal["PENDIENTE", "EN_PROGRESO", "EN_REVISION", "COMPLETADA", "BLOQUEADA"]


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
    horas_utilizadas: float = Field(default=0, ge=0)
    estado: Optional[EstadoActividad] = None
    motivo_bloqueo: Optional[str] = Field(default=None, max_length=500)

class ActividadCreate(ActividadBase):
    asignado_a_id: Optional[int] = None
    lider_tecnico_id: Optional[int] = None
    lider_catalogo_id: Optional[int] = None
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
    estado: Optional[EstadoActividad] = None
    motivo_bloqueo: Optional[str] = Field(default=None, max_length=500)
    asignado_a_id: Optional[int] = None
    lider_tecnico_id: Optional[int] = None
    lider_catalogo_id: Optional[int] = None
    area_id: Optional[int] = None

class ActividadResponse(ActividadBase):
    id: int
    estado: EstadoActividad
    fecha_creacion: datetime
    creador_id: int
    asignado_a_id: Optional[int] = None
    lider_tecnico_id: Optional[int] = None
    lider_catalogo_id: Optional[int] = None
    area_id: Optional[int] = None

    class Config:
        from_attributes = True


class AreaBase(BaseModel):
    nombre: str


class AreaCreate(AreaBase):
    nombre: str = Field(min_length=2, max_length=60)

    @field_validator("nombre")
    @classmethod
    def limpiar_nombre(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("El nombre es demasiado corto")
        return value


class AreaResponse(AreaBase):
    id: int
    activa: bool

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    usuario: str
    contrasena: str



class GoogleLoginRequest(BaseModel):
    token: str


# ---------- Líderes técnicos (catálogo) ----------
class LiderTecnicoCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)

    @field_validator("nombre")
    @classmethod
    def limpiar_nombre(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("El nombre es demasiado corto")
        return value


class LiderTecnicoUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    activo: Optional[bool] = None


class LiderTecnicoResponse(BaseModel):
    id: int
    nombre: str
    activo: bool

    class Config:
        from_attributes = True


# ---------- Horas por día ----------
class RegistroHorasCreate(BaseModel):
    fecha: date
    horas: float = Field(gt=0, le=24)
    nota: Optional[str] = Field(default=None, max_length=300)


class RegistroHorasResponse(BaseModel):
    id: int
    actividad_id: int
    fecha: date
    horas: float
    nota: Optional[str] = None
    usuario_id: Optional[int] = None
    usuario_nombre: Optional[str] = None
    creado: datetime


# ---------- Comentarios y evidencias ----------
class ComentarioCreate(BaseModel):
    texto: str = Field(min_length=1, max_length=2000)
    url: Optional[str] = Field(default=None, max_length=500)

    @field_validator("texto")
    @classmethod
    def texto_no_vacio(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El comentario no puede estar vacío")
        return value

    @field_validator("url")
    @classmethod
    def validar_url(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        if not value:
            return None
        # Solo http/https: evita enlaces javascript: o data: que se ejecutarían al abrirlos
        if not re.match(r"^https?://[^\s]+$", value, flags=re.IGNORECASE):
            raise ValueError("El enlace debe empezar con http:// o https://")
        return value


class ComentarioResponse(BaseModel):
    id: int
    actividad_id: int
    usuario_id: Optional[int] = None
    usuario_nombre: Optional[str] = None
    texto: str
    url: Optional[str] = None
    creado: datetime


# ---------- Historial ----------
class HistorialResponse(BaseModel):
    id: int
    actividad_id: int
    usuario_id: Optional[int] = None
    usuario_nombre: Optional[str] = None
    campo: str
    valor_anterior: Optional[str] = None
    valor_nuevo: Optional[str] = None
    creado: datetime


# ---------- Restablecimiento de contraseña ----------
class RestablecerContrasenaRequest(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    contrasena: str

    @field_validator("contrasena")
    @classmethod
    def validar_fortaleza(cls, value: str) -> str:
        return validar_fortaleza_contrasena(value)


class EnlaceRestablecimientoResponse(BaseModel):
    token: str
    expira: datetime
    usuario_id: int
    usuario_nombre: Optional[str] = None
