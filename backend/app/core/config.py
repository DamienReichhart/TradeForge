import os
import json
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # PostgreSQL
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str
    
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        
        return PostgresDsn.build(
            scheme="postgresql",
            username=values.data.get("POSTGRES_USER"),
            password=values.data.get("POSTGRES_PASSWORD"),
            host=values.data.get("POSTGRES_SERVER"),
            port=int(values.data.get("POSTGRES_PORT")),
            path=f"{values.data.get('POSTGRES_DB') or ''}",
        )
    
    # External APIs
    MARKET_DATA_API: str
    MARKET_DATA_API_USERNAME: str
    MARKET_DATA_API_PASSWORD: str
    
    # Telegram
    TELEGRAM_BOT_TOKEN: str
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 