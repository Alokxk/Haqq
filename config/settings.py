from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    openrouter_api_key: str
    openrouter_model: str = "openai/gpt-oss-20b:free"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost/haqq"
    redis_url: str = "redis://localhost:6379/0"
    port: int = 8000
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"
    public_url: str = "https://haqq.in"

    @computed_field
    @property
    def sync_database_url(self) -> str:
        return self.database_url.replace("+asyncpg", "")


settings = Settings()
