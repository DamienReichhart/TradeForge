from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from app import models, schemas
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.get("/", response_model=schemas.PerformanceSummary)
def get_performance_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    timeframe: str = "all",  # all, week, month, year
) -> Any:
    """
    Get performance summary for all bots.
    """
    # Filter by time period if specified
    trades_query = db.query(models.Trade).join(
        models.Bot, models.Trade.bot_id == models.Bot.id
    ).filter(
        models.Bot.user_id == current_user.id,
        models.Trade.status == "closed"
    )
    
    if timeframe != "all":
        now = datetime.utcnow()
        if timeframe == "week":
            start_date = now - timedelta(days=7)
        elif timeframe == "month":
            start_date = now - timedelta(days=30)
        elif timeframe == "year":
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=30)  # Default to month
        
        trades_query = trades_query.filter(models.Trade.exit_time >= start_date)
    
    trades = trades_query.order_by(models.Trade.exit_time).all()
    
    # Calculate performance metrics
    total_trades = len(trades)
    
    if total_trades == 0:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "profit_factor": 0,
            "total_profit_loss": 0,
            "average_profit_loss": 0,
            "max_drawdown": 0,
            "sharpe_ratio": 0,
            "time_series": []
        }
    
    winning_trades = sum(1 for trade in trades if trade.profit_loss and trade.profit_loss > 0)
    losing_trades = sum(1 for trade in trades if trade.profit_loss and trade.profit_loss <= 0)
    
    win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
    
    # Calculate profit factor
    gross_profit = sum(trade.profit_loss for trade in trades if trade.profit_loss and trade.profit_loss > 0)
    gross_loss = abs(sum(trade.profit_loss for trade in trades if trade.profit_loss and trade.profit_loss <= 0))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else None
    
    total_profit_loss = sum(trade.profit_loss for trade in trades if trade.profit_loss is not None)
    average_profit_loss = total_profit_loss / total_trades if total_trades > 0 else 0
    
    # Calculate equity curve for time series
    time_series = []
    equity = 1000  # Start with 1000 units
    max_equity = equity
    max_drawdown = 0
    
    for trade in sorted(trades, key=lambda x: x.exit_time):
        if trade.profit_loss:
            equity *= (1 + trade.profit_loss / 100)
            
            # Calculate drawdown
            if equity > max_equity:
                max_equity = equity
            drawdown = (max_equity - equity) / max_equity * 100
            max_drawdown = max(max_drawdown, drawdown)
            
            time_series.append({
                "time": trade.exit_time.isoformat(),
                "equity": equity,
                "drawdown": drawdown
            })
    
    # Calculate Sharpe ratio (simplified)
    returns = [trade.profit_loss for trade in trades if trade.profit_loss is not None]
    if returns:
        import numpy as np
        mean_return = np.mean(returns)
        std_return = np.std(returns)
        sharpe_ratio = mean_return / std_return if std_return > 0 else None
    else:
        sharpe_ratio = None
    
    return {
        "total_trades": total_trades,
        "winning_trades": winning_trades,
        "losing_trades": losing_trades,
        "win_rate": win_rate,
        "profit_factor": profit_factor,
        "total_profit_loss": total_profit_loss,
        "average_profit_loss": average_profit_loss,
        "max_drawdown": max_drawdown,
        "sharpe_ratio": sharpe_ratio,
        "time_series": time_series
    }

@router.get("/trades", response_model=List[schemas.Trade])
def get_trades(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all trades for the user.
    """
    trades = db.query(models.Trade).join(
        models.Bot, models.Trade.bot_id == models.Bot.id
    ).filter(
        models.Bot.user_id == current_user.id
    ).order_by(desc(models.Trade.exit_time)).offset(skip).limit(limit).all()
    
    return trades

@router.get("/bots/comparison", response_model=List[Dict[str, Any]])
def get_bot_performance_comparison(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get performance comparison for all bots.
    """
    bot_performances = []
    
    # Get all user's bots
    bots = db.query(models.Bot).filter(
        models.Bot.user_id == current_user.id
    ).all()
    
    for bot in bots:
        # Get closed trades for this bot
        trades = db.query(models.Trade).filter(
            models.Trade.bot_id == bot.id,
            models.Trade.status == "closed"
        ).all()
        
        total_trades = len(trades)
        
        if total_trades == 0:
            bot_performances.append({
                "bot_id": bot.id,
                "bot_name": bot.name,
                "pair": bot.pair,
                "timeframe": bot.timeframe,
                "total_trades": 0,
                "win_rate": 0,
                "profit_loss": 0,
                "is_active": bot.is_active,
                "is_running": bot.is_running
            })
            continue
        
        winning_trades = sum(1 for trade in trades if trade.profit_loss and trade.profit_loss > 0)
        win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
        total_profit_loss = sum(trade.profit_loss for trade in trades if trade.profit_loss is not None)
        
        bot_performances.append({
            "bot_id": bot.id,
            "bot_name": bot.name,
            "pair": bot.pair,
            "timeframe": bot.timeframe,
            "total_trades": total_trades,
            "win_rate": win_rate,
            "profit_loss": total_profit_loss,
            "is_active": bot.is_active,
            "is_running": bot.is_running
        })
    
    # Sort by profit_loss (best performing first)
    bot_performances.sort(key=lambda x: x["profit_loss"], reverse=True)
    
    return bot_performances 