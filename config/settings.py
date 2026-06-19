from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    openrouter_api_key: str
    openrouter_model: str = "openai/gpt-oss-20b:free"
    database_url: str = "postgresql://postgres:postgres@localhost/haqq"
    port: int = 8000
    environment: str = "development"
    frontend_url: str = "http://localhost:5173"
    public_url: str = "https://haqq.in"


settings = Settings()
