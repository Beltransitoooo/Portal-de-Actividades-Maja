from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
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
    

class Actividad(Base):
    __tablename__ = "actividades"

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

