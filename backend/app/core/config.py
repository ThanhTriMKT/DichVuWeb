from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://ebook2latex:ebook2latex_pass@localhost:5432/ebook2latex_db"
    secret_key: str = "supersecretkey_change_in_production"
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 50

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
