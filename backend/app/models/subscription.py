from sqlalchemy import Boolean, Column, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    bot_limit = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    is_active = Column(Boolean, default=True)
    
    # Relationship with users
    users = relationship("User", back_populates="subscription") 