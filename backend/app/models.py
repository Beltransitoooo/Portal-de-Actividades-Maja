from sqlalchemy import Column, Date, Float, Integer, String, Boolean, DateTime, ForeignKey, CheckConstraint
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
    
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True) 
    area = relationship("Area", back_populates="actividades")


class Area(Base):
    __tablename__ = "areas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False, index=True)
    activa = Column(Boolean, default=True)

    actividades = relationship("Actividad", back_populates="area")
    usuarios = relationship("Usuario", back_populates="area")  

