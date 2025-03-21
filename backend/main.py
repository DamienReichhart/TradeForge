import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import logging
from create_tables import create_tables
from app.initial_data import init_indicators
from app.core.database import SessionLocal

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="API for TradeForge - Trading Bot Creation and Automation Platform",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Set up CORS
origins = settings.BACKEND_CORS_ORIGINS
logger.info(f"Setting up CORS with origins: {origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
from app.api.api import api_router
app.include_router(api_router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    # Create database tables on startup if they don't exist
    logger.info("Running database table creation on startup...")
    create_tables()
    
    # Initialize indicators
    logger.info("Initializing indicators...")
    db = SessionLocal()
    try:
        init_indicators(db)
    finally:
        db.close()
    logger.info("Indicator initialization complete!")
