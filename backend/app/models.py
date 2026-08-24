from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String, unique=True, nullable=False, index=True)
    contrasena = Column(String, nullable=False)
    es_admin = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    actividades_creadas = relationship("Actividad", foreign_keys="Actividad.creador_id", back_populates="creador")
    actividades_asignadas = relationship("Actividad", foreign_keys="Actividad.asignado_a_id", back_populates="asignado_a")


class Actividad(Base):
    __tablename__ = "actividades"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    completada = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    horas_estimadas = Column(Float, default=0)
    equipo = Column(String, default="QA")
    
    creador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    creador = relationship("Usuario", foreign_keys=[creador_id], back_populates="actividades_creadas")

    asignado_a_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    asignado_a = relationship("Usuario", foreign_keys=[asignado_a_id], back_populates="actividades_asignadas")