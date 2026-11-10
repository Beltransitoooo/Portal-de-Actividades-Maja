from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    CORS_ORIGINS: str = "http://localhost,http://localhost:5173"  # separados por coma
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # una jornada (8 h)
    RESET_TOKEN_MINUTES: int = 30  # vigencia del enlace de restablecimiento de contraseña
    # Registro abierto solo para estos dominios de correo (separados por coma)
    DOMINIOS_REGISTRO: str = "majasportswear.com"
    # Bloqueo temporal de la cuenta tras varios intentos fallidos de login
    INTENTOS_LOGIN_MAX: int = 5
    MINUTOS_BLOQUEO_LOGIN: int = 15
    # Swagger/ReDoc/OpenAPI: apagados por defecto; en local se activan con MOSTRAR_DOCS=true
    MOSTRAR_DOCS: bool = False
    GOOGLE_CLIENT_ID: str = "367751508872-rjkgo0i8e8natof9ucvod5ijer936a2e.apps.googleusercontent.com"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()