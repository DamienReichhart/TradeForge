from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Tradeforge Market Rates TradingDB API"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # InfluxDB Settings
    INFLUXDB_URL: str = os.getenv("INFLUXDB_URL")
    INFLUXDB_ORG: str = os.getenv("INFLUXDB_ORG")
    INFLUXDB_BUCKET: str = os.getenv("INFLUXDB_BUCKET")
    INFLUXDB_TOKEN: str = os.getenv("INFLUXDB_TOKEN")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100000
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list = ["*"]
    
    class Config:
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings() 