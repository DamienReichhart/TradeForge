from sqlalchemy import Boolean, Column, Integer, String, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Bot(Base):
    __tablename__ = "bots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    pair = Column(String, nullable=False)
    timeframe = Column(String, nullable=False)
    buy_condition = Column(Text)
    sell_condition = Column(Text)
    tp_condition = Column(Text)  # Take profit calculation for advanced bots
    sl_condition = Column(Text)  # Stop loss calculation for advanced bots
    telegram_channel = Column(String)
    bot_type = Column(String, default="standard")  # "standard" or "advanced"
    is_active = Column(Boolean, default=False)
    is_running = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="bots")
    
    # Relationship with indicators
    indicators = relationship("BotIndicator", back_populates="bot", cascade="all, delete-orphan")
    
    # Relationship with backtests
    backtests = relationship("Backtest", back_populates="bot", cascade="all, delete-orphan")

class BotIndicator(Base):
    __tablename__ = "bot_indicators"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(Integer, ForeignKey("bots.id"))
    indicator_id = Column(Integer, ForeignKey("indicators.id"))
    parameters = Column(JSON)  # Custom parameters for this indicator instance
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    bot = relationship("Bot", back_populates="indicators")
    indicator = relationship("Indicator", back_populates="bot_indicators") 