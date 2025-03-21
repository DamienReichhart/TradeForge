#!/usr/bin/env python

import logging
from sqlalchemy.orm import Session
import asyncio
from sqlalchemy import inspect
from datetime import timedelta, datetime

from app.core.database import Base, engine, SessionLocal
from app.models import User, Subscription, Indicator, Bot, BotIndicator, Backtest, Trade, Tutorial, Opinion
from app.auth.jwt import get_password_hash
from app.indicators.registry import IndicatorRegistry
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Create database tables and initialize with required data."""
    # Get inspector to check for existing tables
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    logger.info(f"Existing tables: {existing_tables}")
    user_table_exists = "users" in existing_tables
    subscription_table_exists = "subscriptions" in existing_tables
    
    # Create all tables that don't exist
    logger.info("Creating database tables from models...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Tables creation process completed!")
    except Exception as e:
        if "UniqueViolation" in str(e) or "DuplicateTable" in str(e):
            # This is expected in concurrent environment - another process already created the tables
            logger.info("Tables already created by another process")
        else:
            # Re-raise unexpected errors
            logger.error(f"Unexpected error creating tables: {e}")
            raise
    
    db = SessionLocal()
    try:
        # Add subscription tiers if the subscriptions table was just created
        if not subscription_table_exists and "subscriptions" in inspector.get_table_names():
            logger.info("Creating subscription tiers...")
            
            # Check if subscriptions already exist
            existing_subscriptions = db.query(Subscription).all()
            if not existing_subscriptions:
                try:
                    subscriptions = [
                        Subscription(
                            name="Starter",
                            description="For beginners starting their trading journey",
                            price=15.0,
                            bot_limit=3
                        ),
                        Subscription(
                            name="Pro",
                            description="For serious traders looking to scale",
                            price=30.0,
                            bot_limit=10
                        ),
                        Subscription(
                            name="Expert",
                            description="For professional traders and institutions",
                            price=100.0,
                            bot_limit=10  # Limited to 10 bots as specified
                        )
                    ]
                    db.add_all(subscriptions)
                    db.commit()
                    logger.info("Subscription tiers created successfully")
                except Exception as e:
                    if "UniqueViolation" in str(e):
                        logger.info("Subscription tiers already created by another process")
                        db.rollback()
                    else:
                        raise
            else:
                logger.info("Subscription tiers already exist")
        
        # Add admin user - always check and create if needed
        logger.info("Checking for admin user...")
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            logger.info("Admin user not found - creating now...")
            try:
                admin_user = User(
                    username="admin",
                    email="admin@example.com",
                    first_name="Admin",
                    last_name="Admin",
                    hashed_password=get_password_hash("admin"),
                    is_active=True,
                    is_superuser=True
                )
                db.add(admin_user)
                db.commit()
                logger.info("Admin user created successfully")
            except Exception as e:
                if "UniqueViolation" in str(e) and "ix_users_email" in str(e):
                    # Another process already created the admin user
                    logger.info("Admin user already created by another process")
                    db.rollback()
                else:
                    logger.error(f"Error creating admin user: {e}")
                    db.rollback()
                    raise
        else:
            logger.info("Admin user already exists")
    except Exception as e:
        logger.error(f"Error in database setup: {e}")
        db.rollback()
    finally:
        db.close()

def init_db():
    """Initialize database if needed"""
    logger.info("Initializing database...")
    create_tables()
    logger.info("Database initialization completed!")

def init_indicators(db: Session) -> None:
    """Initialize indicators in the database"""
    logger.info("Synchronizing indicators with registry")
    
    try:
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
    except Exception as e:
        if "UniqueViolation" in str(e):
            logger.info("Indicators already synchronized by another process")
            db.rollback()
        else:
            logger.error(f"Error synchronizing indicators: {e}")
            db.rollback()
            raise

def main() -> None:
    try:
        logger.info("Creating initial data")
        
        # Initialize database if needed
        init_db()
        
        # Get DB session
        db = SessionLocal()
        
        try:
            # Initialize indicators
            init_indicators(db)
        except Exception as e:
            logger.error(f"Error during indicator initialization: {e}")
        finally:
            db.close()
        
        logger.info("Initial data created")
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {e}")
        # Continue with application startup despite error
        # This ensures that app can start even if DB init has issues

if __name__ == "__main__":
    main() 