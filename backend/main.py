import uvicorn
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
import logging
from app.db_init import main as db_init
from app.core.database import SessionLocal, engine, Base
import traceback
from fastapi.responses import JSONResponse
import os
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_fastapi_instrumentator.metrics import request_size, response_size, latency

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

# Setup Prometheus metrics - must be before other middleware
instrumentator = Instrumentator(
    should_group_status_codes=False,
    should_ignore_untemplated=True,
    should_respect_env_var=True,
    should_instrument_requests_inprogress=True,
    excluded_handlers=[".*admin.*", "/metrics"],
    env_var_name="ENABLE_METRICS",
)

# Add additional metrics
instrumentator.add(request_size())
instrumentator.add(response_size())
instrumentator.add(latency())

# Instrument app and expose metrics at /metrics endpoint
instrumentator.instrument(app).expose(app)
logger.info("Prometheus metrics instrumentation initialized at /metrics endpoint")

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    logger.info(f"Setting up CORS with origins: {settings.BACKEND_CORS_ORIGINS}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add this after creating the app instance
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handler for detailed logging
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(f"Request path: {request.url.path}")
    logger.error(f"Request method: {request.method}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)},
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
    """Initialize services on startup"""
    logger.info("Application startup")
    
    # Initialize the Telegram bot
    from app.bots.telegram_bot import telegram_bot_service
    logger.info("Telegram bot service initialized")

    # Create database tables on startup if they don't exist
    logger.info("Running database table creation on startup...")
    db_init()
    logger.info("Indicator initialization complete!")
    
    # Prometheus metrics are already initialized before middleware

@app.get("/")
async def root():
    return {"message": "Welcome to TradeForge API"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 11101)),
        reload=True,
    )
