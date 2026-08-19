from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return "Prueba de despliegue en FastAPI"