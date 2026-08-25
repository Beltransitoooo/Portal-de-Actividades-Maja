from fastapi import FastAPI, Depends, HTTPException
from app.routes.auth import router as auth_router
from app.routes.actividades import router as actividades_router
from app.database import get_db
from sqlalchemy.orm import Session
app = FastAPI()

app.include_router(auth_router)
app.include_router(actividades_router)

@app.get("/db-check")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "message": "Conexión a PostgreSQL exitosa!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error de conexión: {str(e)}")