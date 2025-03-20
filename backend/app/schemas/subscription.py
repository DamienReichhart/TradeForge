from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Shared properties
class SubscriptionBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    bot_limit: Optional[int] = None
    is_active: Optional[bool] = True

# Properties to receive on subscription creation
class SubscriptionCreate(SubscriptionBase):
    name: str
    price: float
    bot_limit: int

# Properties to receive on subscription update
class SubscriptionUpdate(SubscriptionBase):
    pass

# Properties shared by models stored in DB
class SubscriptionInDBBase(SubscriptionBase):
    id: int
    name: str
    price: float
    bot_limit: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class Subscription(SubscriptionInDBBase):
    pass 