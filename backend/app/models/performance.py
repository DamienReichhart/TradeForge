from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(Integer, ForeignKey("bots.id"), nullable=False)
    pair = Column(String, nullable=False)
    timeframe = Column(String, nullable=False)
    type = Column(String, nullable=False)  # buy, sell
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float)
    tp_price = Column(Float)  # Take profit target price
    sl_price = Column(Float)  # Stop loss target price
    exit_reason = Column(String)  # Can be "tp", "sl", "manual", "sell_condition", "buy_condition"
    quantity = Column(Float, nullable=False)
    profit_loss = Column(Float)
    profit_loss_percent = Column(Float)
    status = Column(String, nullable=False, default="open")  # open, closed
    entry_time = Column(DateTime, nullable=False)
    exit_time = Column(DateTime)
    indicators_values = Column(JSON)  # Store indicator values at entry
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with bot (not bi-directional to avoid circular imports)
    bot = relationship("Bot") 