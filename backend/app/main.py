from fastapi import FastAPI
from app.routes.auth import router as auth_router
from app.routes.actividades import router as actividades_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(actividades_router)

@app.get("/")
async def root():
    return "Primera prueba de despliegue en FastAPI"