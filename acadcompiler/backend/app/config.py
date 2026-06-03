from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "AcadCompiler"
    engine_version: str = "0.1.0"
    csl_version: str = "1.0"
    max_upload_mb: int = 20
    allowed_extensions: set = {".docx", ".pdf"}

    # Supabase
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # Anthropic
    anthropic_api_key: Optional[str] = None
    llm_enabled: bool = False

    # Auth
    jwt_secret: str = "change-me-in-production"

    class Config:
        env_file = ".env"


settings = Settings()
