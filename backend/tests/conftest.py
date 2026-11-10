"""Fixtures compartidos. Las pruebas usan SQLite en memoria: nunca tocan la base de desarrollo."""
import os

# Deben definirse antes de importar la app (pydantic-settings las exige al cargar)
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "clave-solo-para-pruebas-no-usar-en-ningun-otro-lado")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models, security
from app.database import Base, get_db
from app.main import app

CONTRASENA = "Prueba123!"


@pytest.fixture()
def engine():
    motor = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)

    @event.listens_for(motor, "connect")
    def _activar_fk(conexion, _):
        conexion.execute("PRAGMA foreign_keys=ON")  # para que ON DELETE CASCADE funcione como en PostgreSQL

    Base.metadata.create_all(motor)
    yield motor
    motor.dispose()


@pytest.fixture()
def db(engine):
    sesion = sessionmaker(bind=engine, autocommit=False, autoflush=False)()
    yield sesion
    sesion.close()


@pytest.fixture()
def client(engine):
    fabrica = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    def _get_db():
        sesion = fabrica()
        try:
            yield sesion
        finally:
            sesion.close()

    app.dependency_overrides[get_db] = _get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


class Fabrica:
    """Crea datos de prueba ficticios y los encabezados de sesión."""

    def __init__(self, db):
        self.db = db

    def area(self, nombre):
        area = models.Area(nombre=nombre, activa=True)
        self.db.add(area)
        self.db.commit()
        return area

    def usuario(self, correo, nombre, admin=False, area=None, contrasena=None):
        usuario = models.Usuario(
            name_users=nombre,
            usuario=correo,
            contrasena=security.hash_contrasena(contrasena) if contrasena else "x",
            es_admin=admin,
            area_id=area.id if area else None,
        )
        self.db.add(usuario)
        self.db.commit()
        return usuario

    def lider(self, nombre, activo=True):
        lider = models.LiderTecnico(nombre=nombre, activo=activo)
        self.db.add(lider)
        self.db.commit()
        return lider

    @staticmethod
    def auth(usuario):
        token = security.crear_token_acceso({"sub": str(usuario.id)})
        return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def f(db):
    return Fabrica(db)


@pytest.fixture()
def mundo(f):
    """Dos áreas, un administrador y dos personas de QA (misma área) más una de DEV."""
    qa, dev = f.area("QA"), f.area("DEV")
    return {
        "qa": qa,
        "dev": dev,
        "admin": f.usuario("admin@example.com", "Admin Prueba", admin=True),
        "ana": f.usuario("ana@example.com", "Ana Prueba", area=qa),
        "beto": f.usuario("beto@example.com", "Beto Prueba", area=qa),
        "dani": f.usuario("dani@example.com", "Dani Prueba", area=dev),
    }


@pytest.fixture()
def crear_actividad(client, f):
    def _crear(usuario, **extra):
        cuerpo = {"titulo": "Actividad de prueba", "estimacion_max_hrs": 8, **extra}
        r = client.post("/actividades/", json=cuerpo, headers=f.auth(usuario))
        assert r.status_code == 201, r.text
        return r.json()
    return _crear
