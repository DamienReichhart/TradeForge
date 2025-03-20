import logging
from sqlalchemy.orm import Session
import asyncio
from datetime import timedelta, datetime

from app import schemas
from app.core.config import settings
# from app.db.init_db import init_db # Comment out missing import
from app.indicators.registry import IndicatorRegistry
from app.models.indicator import Indicator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add our own init_db function since the original can't be found
def init_db():
    """Initialize database if needed"""
    logger.info("Database initialization skipped - no initialization needed")
    pass

def init_indicators(db: Session) -> None:
    """Initialize indicators in the database"""
    logger.info("Synchronizing indicators with registry")
    
    # Get all available indicators from registry
    available_indicators = IndicatorRegistry.get_all_indicators()
    
    # Get all indicators from database
    db_indicators = db.query(Indicator).all()
    db_indicator_types = {ind.type: ind for ind in db_indicators}
    
    # Create or update indicators
    for indicator_info in available_indicators:
        indicator_name = indicator_info["name"]
        
        if indicator_name in db_indicator_types:
            # Update existing indicator
            indicator = db_indicator_types[indicator_name]
            indicator.description = indicator_info["description"]
            indicator.parameters = indicator_info["default_parameters"]
            indicator.is_active = True
        else:
            # Create new indicator
            indicator = Indicator(
                name=indicator_name,
                type=indicator_name,  # Use name as type
                description=indicator_info["description"],
                parameters=indicator_info["default_parameters"],
                is_active=True
            )
            db.add(indicator)
    
    db.commit()
    logger.info(f"Synchronized {len(available_indicators)} indicators")

def main() -> None:
    logger.info("Creating initial data")
    
    # Initialize database if needed
    init_db()
    
    # Get DB session
    from app.core.database import SessionLocal
    db = SessionLocal()
    
    # Initialize indicators
    init_indicators(db)
    
    db.close()
    
    logger.info("Initial data created")

if __name__ == "__main__":
    main() 