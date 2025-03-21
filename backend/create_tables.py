#!/usr/bin/env python

from app.core.database import Base, engine
from app.models import User, Subscription, Indicator, Bot, BotIndicator, Backtest, Trade, Tutorial, Opinion
import logging
from sqlalchemy import inspect

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    # Get inspector to check for existing tables
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    logger.info(f"Existing tables: {existing_tables}")
    
    # Create all tables that don't exist
    logger.info("Creating database tables from models...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables creation process completed!")

if __name__ == "__main__":
    create_tables() 