from fastapi import FastAPI, Depends, HTTPException
from app.routes.auth import router as auth_router
from app.routes.actividades import router as actividades_router
from app.routes.usuarios import router as usuarios_router
from app.routes.lideres import router as lideres_router
from app.routes.horas import router as horas_router
from app.database import get_db
from app.config import settings
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(actividades_router)
app.include_router(usuarios_router)
app.include_router(lideres_router)
app.include_router(horas_router)

@app.get("/db-check")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception:
        # No exponer detalles de la conexión en la respuesta pública
        raise HTTPException(status_code=503, detail="Base de datos no disponible")
