from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Tutorial(Base):
    __tablename__ = "tutorials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True, index=True)
    summary = Column(String)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_published = Column(Boolean, default=True)

class Opinion(Base):
    __tablename__ = "opinions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company = Column(String)
    position = Column(String)
    content = Column(Text, nullable=False)
    rating = Column(Integer)  # e.g., 1-5 stars
    created_at = Column(DateTime, default=datetime.utcnow)
    is_published = Column(Boolean, default=True) 