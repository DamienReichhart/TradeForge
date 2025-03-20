from sqlalchemy import Boolean, Column, Integer, String, DateTime, JSON, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Backtest(Base):
    __tablename__ = "backtests"

    id = Column(Integer, primary_key=True, index=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, running, completed, failed
    results = Column(JSON)  # JSON field to store backtest results
    win_rate = Column(Float)
    profit_factor = Column(Float)
    total_trades = Column(Integer)
    average_profit = Column(Float)
    max_drawdown = Column(Float)
    sharpe_ratio = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="backtests")
    
    # Relationship with bot
    bot_id = Column(Integer, ForeignKey("bots.id"), nullable=False)
    bot = relationship("Bot", back_populates="backtests")
    
    # Store the bot configuration at the time of backtest
    pair = Column(String, nullable=False)
    timeframe = Column(String, nullable=False)
    buy_condition = Column(Text)
    sell_condition = Column(Text)
    indicators_config = Column(JSON) 