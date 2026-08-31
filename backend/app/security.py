from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_scheme = HTTPBearer()

def hash_contrasena(contrasena: str) -> str:
    contrasena_bytes = contrasena.encode('utf-8')[:72]
    return pwd_context.hash(contrasena_bytes.decode('utf-8', errors='ignore'))

def verificar_contrasena(contrasena_plana: str, contrasena_hasheada: str) -> bool:
    return pwd_context.verify(contrasena_plana, contrasena_hasheada)

def crear_token_acceso(datos: dict, expires_delta: Optional[timedelta] = None):
    a_codificar = datos.copy()
    expiracion = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    a_codificar.update({"exp": expiracion})
    return jwt.encode(a_codificar, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(security_scheme), 
    db: Session = Depends(get_db)
) -> models.Usuario:
    token = credenciales.credentials
    excepcion_credenciales = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            raise excepcion_credenciales
    except JWTError:
        raise excepcion_credenciales

    usuario_db = db.query(models.Usuario).filter(models.Usuario.id == int(usuario_id)).first()
    if usuario_db is None:
        raise excepcion_credenciales
    return usuario_db