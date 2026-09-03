from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GOOGLE_CLIENT_ID: str = "367751508872-rjkgo0i8e8natof9ucvod5ijer936a2e.apps.googleusercontent.com"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()