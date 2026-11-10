import os

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.config import settings

# En Vercel (serverless) cada invocación puede abrir conexiones nuevas: sin pool
# propio para no agotar el pooler de Supabase. En local se usa el pool normal.
if os.getenv("VERCEL"):
    engine = create_engine(settings.DATABASE_URL, poolclass=NullPool)
else:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)


# El Transaction pooler de Supabase reparte las mismas conexiones de Postgres entre
# todos los clientes del proyecto. Si alguno deja el search_path cambiado a nivel de
# sesión (p. ej. pg_dump/pg_restore lo vacían), las consultas de la app que caen en esa
# conexión fallan con 'relation "usuarios" does not exist'. Con SET LOCAL se fija el
# schema en cada transacción, sin depender del estado de la conexión que toque.
if engine.dialect.name == "postgresql":
    @event.listens_for(engine, "begin")
    def _fijar_search_path(conexion):
        conexion.exec_driver_sql("SET LOCAL search_path TO public")


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
