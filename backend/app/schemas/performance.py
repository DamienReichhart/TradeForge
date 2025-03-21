from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

# Shared properties
class TradeBase(BaseModel):
    bot_id: int
    pair: str
    timeframe: str
    type: str  # buy, sell
    entry_price: float
    quantity: float
    tp_price: Optional[float] = None
    sl_price: Optional[float] = None

# Properties to receive on trade creation
class TradeCreate(TradeBase):
    entry_time: datetime
    indicators_values: Optional[Dict[str, Any]] = None

# Properties to receive on trade update (closing a trade)
class TradeUpdate(BaseModel):
    exit_price: float
    exit_time: datetime
    status: str = "closed"
    exit_reason: Optional[str] = None  # "tp", "sl", "manual", "sell_condition"
    profit_loss: Optional[float] = None
    profit_loss_percent: Optional[float] = None

# Properties shared by models stored in DB
class TradeInDBBase(TradeBase):
    id: int
    exit_price: Optional[float] = None
    exit_reason: Optional[str] = None
    profit_loss: Optional[float] = None
    profit_loss_percent: Optional[float] = None
    status: str
    entry_time: datetime
    exit_time: Optional[datetime] = None
    indicators_values: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Properties to return to client
class Trade(TradeInDBBase):
    pass

# Performance Summary
class PerformanceSummary(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    profit_factor: Optional[float] = None
    total_profit_loss: float
    average_profit_loss: float
    max_drawdown: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    
    # Time series data for charts
    time_series: Optional[List[Dict[str, Any]]] = None 