from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with subscription
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)
    subscription = relationship("Subscription", back_populates="users")
    
    # Relationship with bots
    bots = relationship("Bot", back_populates="user", cascade="all, delete-orphan")
    
    # Relationship with backtests
    backtests = relationship("Backtest", back_populates="user", cascade="all, delete-orphan") 