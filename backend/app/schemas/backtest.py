from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

# Shared properties
class BacktestBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    bot_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    initial_capital: Optional[float] = None
    status: Optional[str] = None
    results: Optional[Dict[str, Any]] = None
    win_rate: Optional[float] = None
    profit_factor: Optional[float] = None
    total_trades: Optional[int] = None
    average_profit: Optional[float] = None
    max_drawdown: Optional[float] = None
    sharpe_ratio: Optional[float] = None

# Properties to receive on backtest creation
class BacktestCreate(BacktestBase):
    name: str
    bot_id: int
    start_date: datetime
    end_date: datetime
    initial_capital: float

# Properties to receive on backtest update
class BacktestUpdate(BacktestBase):
    pass

# Properties shared by models stored in DB
class BacktestInDBBase(BacktestBase):
    id: int
    name: str
    bot_id: int
    user_id: int
    start_date: datetime
    end_date: datetime
    initial_capital: float
    status: str
    created_at: datetime
    updated_at: datetime
    pair: str
    timeframe: str
    buy_condition: Optional[str] = None
    sell_condition: Optional[str] = None
    indicators_config: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# Properties to return to client
class Backtest(BacktestInDBBase):
    pass 