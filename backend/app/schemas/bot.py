from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.schemas.indicator import BotIndicator, BotIndicatorCreate, BotIndicatorWithDetails

# Shared properties
class BotBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    pair: Optional[str] = None
    timeframe: Optional[str] = None
    buy_condition: Optional[str] = None
    sell_condition: Optional[str] = None
    telegram_channel: Optional[str] = None
    is_active: Optional[bool] = None

# Properties to receive on bot creation
class BotCreate(BotBase):
    name: str
    pair: str
    timeframe: str
    buy_condition: Optional[str] = None
    sell_condition: Optional[str] = None
    indicators: Optional[List[BotIndicatorCreate]] = []

# Properties to receive on bot update
class BotUpdate(BotBase):
    indicators: Optional[List[BotIndicatorCreate]] = None

# Status update
class BotStatusUpdate(BaseModel):
    is_running: bool

# Properties shared by models stored in DB
class BotInDBBase(BotBase):
    id: int
    name: str
    pair: str
    timeframe: str
    user_id: int
    is_active: bool
    is_running: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class Bot(BotInDBBase):
    pass

# Bot with indicators for detailed view
class BotWithIndicators(Bot):
    indicators: List[BotIndicatorWithDetails] = [] 