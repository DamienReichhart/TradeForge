from sqlalchemy import Boolean, Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String)
    type = Column(String, nullable=False)  # Reference to the indicator type in the registry
    parameters = Column(JSON)  # Default parameters
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationship with bot_indicators
    bot_indicators = relationship("BotIndicator", back_populates="indicator") 