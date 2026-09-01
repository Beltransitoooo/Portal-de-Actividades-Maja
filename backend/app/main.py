from fastapi import FastAPI, Depends, HTTPException
from app.routes.auth import router as auth_router
from app.routes.actividades import router as actividades_router
from app.routes.usuarios import router as usuarios_router
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Cambiar por el dominio del frontend en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(actividades_router)
app.include_router(usuarios_router)

@app.get("/db-check")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1") 
        return {"status": "ok", "message": "Conexión a PostgreSQL exitosa!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión: {str(e)}")