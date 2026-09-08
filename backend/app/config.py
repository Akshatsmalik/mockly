from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Mockly API"
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    database_url: str = "sqlite:///./.data/mockly.db"
    max_resume_bytes: int = 5 * 1024 * 1024
    code_execution_url: str | None = None
    cookie_secure: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
