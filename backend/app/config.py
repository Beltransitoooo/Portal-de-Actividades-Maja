from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    CORS_ORIGINS: str = "http://localhost,http://localhost:5173"  # separados por coma
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    RESET_TOKEN_MINUTES: int = 30  # vigencia del enlace de restablecimiento de contraseña
    GOOGLE_CLIENT_ID: str = "367751508872-rjkgo0i8e8natof9ucvod5ijer936a2e.apps.googleusercontent.com"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()