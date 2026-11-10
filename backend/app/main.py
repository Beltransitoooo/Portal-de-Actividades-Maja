from fastapi import FastAPI, Depends, HTTPException
from app.routes.auth import router as auth_router
from app.routes.actividades import router as actividades_router
from app.routes.usuarios import router as usuarios_router
from app.routes.lideres import router as lideres_router
from app.routes.horas import router as horas_router
from app.routes.areas import router as areas_router
from app.database import get_db
from app.config import settings
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("portal")
# La documentación interactiva expone todos los endpoints: solo se publica si MOSTRAR_DOCS=true
app = FastAPI(
    docs_url="/docs" if settings.MOSTRAR_DOCS else None,
    redoc_url="/redoc" if settings.MOSTRAR_DOCS else None,
    openapi_url="/openapi.json" if settings.MOSTRAR_DOCS else None,
)


# Errores no controlados: se registran en el log y se responde JSON. Se declara antes que
# CORS para que quede por dentro y la respuesta 500 también lleve los encabezados CORS;
# sin ellos el navegador la bloquea y el frontend solo ve "No se pudo conectar".
@app.middleware("http")
async def capturar_errores(request, call_next):
    try:
        return await call_next(request)
    except Exception:
        logger.exception("Error no controlado en %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Ocurrió un error en el servidor. Inténtalo de nuevo."},
        )


@app.middleware("http")
async def encabezados_seguridad(request, call_next):
    respuesta = await call_next(request)
    respuesta.headers.setdefault("X-Content-Type-Options", "nosniff")
    respuesta.headers.setdefault("X-Frame-Options", "DENY")
    respuesta.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    return respuesta


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
app.include_router(areas_router)

@app.get("/db-check")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception:
        # No exponer detalles de la conexión en la respuesta pública
        raise HTTPException(status_code=503, detail="Base de datos no disponible")
