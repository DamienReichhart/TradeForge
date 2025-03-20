from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

# Shared properties
class BacktestBase(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    results: Optional[Dict[str, Any]] = None
    win_rate: Optional[float] = None
    profit_factor: Optional[float] = None
    total_trades: Optional[int] = None
    average_profit: Optional[float] = None
    max_drawdown: Optional[float] = None
    sharpe_ratio: Optional[float] = None

# Properties to receive on backtest creation
class BacktestCreate(BaseModel):
    bot_id: int
    start_date: datetime
    end_date: datetime

# Properties to receive on backtest update
class BacktestUpdate(BacktestBase):
    pass

# Properties shared by models stored in DB
class BacktestInDBBase(BacktestBase):
    id: int
    bot_id: int
    user_id: int
    pair: str
    timeframe: str
    buy_condition: Optional[str] = None
    sell_condition: Optional[str] = None
    indicators_config: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Properties to return to client
class Backtest(BacktestInDBBase):
    pass 