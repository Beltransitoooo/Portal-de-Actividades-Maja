from sqlalchemy import Column, Date, Float, Integer, String, Boolean, DateTime, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    name_users = Column(String, nullable=True)
    usuario = Column(String, unique=True, nullable=False, index=True)
    contrasena = Column(String, nullable=False)
    es_admin = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    # Protección contra fuerza bruta en el login
    intentos_fallidos = Column(Integer, nullable=False, default=0, server_default="0")
    bloqueado_hasta = Column(DateTime, nullable=True)

    actividades_creadas = relationship("Actividad", foreign_keys="Actividad.creador_id", back_populates="creador")
    actividades_asignadas = relationship("Actividad", foreign_keys="Actividad.asignado_a_id", back_populates="asignado_a")

    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)
    area = relationship("Area", back_populates="usuarios")
    

# Estados válidos de una actividad (deben coincidir con el CHECK de la migración y con schemas.EstadoActividad)
ESTADOS_ACTIVIDAD = ("PENDIENTE", "EN_PROGRESO", "EN_REVISION", "COMPLETADA", "BLOQUEADA")


class Actividad(Base):
    __tablename__ = "actividades"
    __table_args__ = (
        CheckConstraint("horas_utilizadas >= 0", name="ck_actividades_horas_utilizadas_no_negativas"),
        CheckConstraint(
            "estado IN ('PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADA', 'BLOQUEADA')",
            name="ck_actividades_estado_valido",
        ),
    )

    id = Column(Integer, primary_key=True, index=True) 
    titulo = Column(String, nullable=False) 
    descripcion = Column(String, nullable=True) 
    completada = Column(Boolean, default=False) 
    fecha_creacion = Column(DateTime, default=datetime.utcnow) 
    tipo_actividad = Column(String, default="Tarea") 
    prioridad = Column(String, default="Media") 
    fecha_inicio = Column(Date, nullable=True) 
    fecha_vencimiento = Column(Date, nullable=True) 
    estimacion_min_hrs = Column(Float, nullable=True) 
    estimacion_max_hrs = Column(Float, nullable=True) 
    # Horas reales registradas en la actividad (antes se guardaban en estimacion_min_hrs)
    horas_utilizadas = Column(Float, nullable=False, default=0, server_default="0")
    # Estado de flujo; "completada" se mantiene sincronizado por compatibilidad
    estado = Column(String(20), nullable=False, default="PENDIENTE", server_default="PENDIENTE")
    
    creador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False) 
    creador = relationship("Usuario", foreign_keys=[creador_id], back_populates="actividades_creadas") 
    
    asignado_a_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True) 
    asignado_a = relationship("Usuario", foreign_keys=[asignado_a_id], back_populates="actividades_asignadas") 
    
    lider_tecnico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True) 
    lider_tecnico = relationship("Usuario", foreign_keys=[lider_tecnico_id]) 

    # Líder técnico del catálogo (personas que no necesariamente tienen cuenta en el portal).
    # lider_tecnico_id (usuario) se conserva por compatibilidad.
    lider_catalogo_id = Column(Integer, ForeignKey("lideres_tecnicos.id"), nullable=True)
    lider_catalogo = relationship("LiderTecnico")

    # Obligatorio al pasar a BLOQUEADA; se limpia al salir de ese estado
    motivo_bloqueo = Column(String(500), nullable=True)
    
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True) 
    area = relationship("Area", back_populates="actividades")


class Area(Base):
    __tablename__ = "areas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False, index=True)
    activa = Column(Boolean, default=True)

    actividades = relationship("Actividad", back_populates="area")
    usuarios = relationship("Usuario", back_populates="area")  



class LiderTecnico(Base):
    """Catálogo de líderes técnicos asignables a una actividad."""
    __tablename__ = "lideres_tecnicos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    activo = Column(Boolean, nullable=False, default=True, server_default="true")


class RegistroHoras(Base):
    """Horas reales trabajadas en una actividad en un día concreto."""
    __tablename__ = "registros_horas"
    __table_args__ = (
        CheckConstraint("horas > 0 AND horas <= 24", name="ck_registros_horas_rango"),
        Index("ix_registros_horas_fecha", "fecha"),
    )

    id = Column(Integer, primary_key=True, index=True)
    actividad_id = Column(Integer, ForeignKey("actividades.id", ondelete="CASCADE"), nullable=False, index=True)
    fecha = Column(Date, nullable=False)
    horas = Column(Float, nullable=False)
    nota = Column(String(300), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    usuario = relationship("Usuario", foreign_keys=[usuario_id])
    creado = Column(DateTime, default=datetime.utcnow, nullable=False)


class Comentario(Base):
    """Comentario o evidencia (enlace) de una actividad."""
    __tablename__ = "comentarios"

    id = Column(Integer, primary_key=True, index=True)
    actividad_id = Column(Integer, ForeignKey("actividades.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    usuario = relationship("Usuario", foreign_keys=[usuario_id])
    texto = Column(String(2000), nullable=False)
    url = Column(String(500), nullable=True)
    creado = Column(DateTime, default=datetime.utcnow, nullable=False)


class HistorialActividad(Base):
    """Bitácora de cambios. actividad_id no es FK a propósito: el historial sobrevive a la eliminación."""
    __tablename__ = "historial_actividades"

    id = Column(Integer, primary_key=True, index=True)
    actividad_id = Column(Integer, nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    usuario = relationship("Usuario", foreign_keys=[usuario_id])
    campo = Column(String(40), nullable=False)
    valor_anterior = Column(String(500), nullable=True)
    valor_nuevo = Column(String(500), nullable=True)
    creado = Column(DateTime, default=datetime.utcnow, nullable=False)


class TokenRestablecimiento(Base):
    """Enlace de un solo uso para restablecer contraseña. Solo se guarda el hash del token."""
    __tablename__ = "tokens_restablecimiento"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    expira = Column(DateTime, nullable=False)
    usado = Column(Boolean, nullable=False, default=False)
    creado_por_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    creado = Column(DateTime, default=datetime.utcnow, nullable=False)
