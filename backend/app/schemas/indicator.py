from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

# Shared properties
class IndicatorBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = True

# Properties to receive on indicator creation
class IndicatorCreate(IndicatorBase):
    name: str
    type: str
    parameters: Dict[str, Any]

# Properties to receive on indicator update
class IndicatorUpdate(IndicatorBase):
    pass

# Properties shared by models stored in DB
class IndicatorInDBBase(IndicatorBase):
    id: int
    name: str
    type: str
    parameters: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class Indicator(IndicatorInDBBase):
    pass

# Parameter definition for indicators
class IndicatorParameterDefinition(BaseModel):
    name: str
    type: str
    description: str
    default: Any
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    options: Optional[List[str]] = None

# Full indicator definition with parameter details
class IndicatorDefinition(BaseModel):
    name: str
    description: str
    parameters: List[IndicatorParameterDefinition]
    default_parameters: Dict[str, Any]

# For use with bots
class BotIndicatorBase(BaseModel):
    indicator_id: int
    parameters: Dict[str, Any]

class BotIndicatorCreate(BotIndicatorBase):
    pass

class BotIndicatorUpdate(BotIndicatorBase):
    pass

class BotIndicatorInDBBase(BotIndicatorBase):
    id: int
    bot_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class BotIndicator(BotIndicatorInDBBase):
    pass

class BotIndicatorWithDetails(BotIndicator):
    indicator: Indicator 