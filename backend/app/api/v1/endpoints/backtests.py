from typing import Any, List, Dict
import asyncio
import pandas as pd
import numpy as np
import json
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app import models, schemas
from app.api.deps import get_db, get_current_user
from app.bots.trading_bot import TradingBot
from app.utils import market_data
from app.indicators.calculator import calculate_indicators

router = APIRouter()

@router.get("/", response_model=List[schemas.Backtest])
def read_backtests(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve all user's backtests.
    """
    backtests = db.query(models.Backtest).filter(
        models.Backtest.user_id == current_user.id
    ).order_by(models.Backtest.created_at.desc()).offset(skip).limit(limit).all()
    
    return backtests

@router.post("/", response_model=schemas.Backtest)
async def create_backtest(
    *,
    db: Session = Depends(get_db),
    backtest_in: schemas.BacktestCreate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Create a new backtest.
    """
    # Check if bot exists and belongs to user
    bot = db.query(models.Bot).filter(
        models.Bot.id == backtest_in.bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found",
        )
    
    # Get bot indicators
    bot_indicators = db.query(models.BotIndicator).filter(
        models.BotIndicator.bot_id == bot.id
    ).all()
    
    indicators_config = {}
    for bi in bot_indicators:
        indicator = db.query(models.Indicator).filter(
            models.Indicator.id == bi.indicator_id
        ).first()
        
        if indicator:
            indicators_config[indicator.name] = {
                "parameters": bi.parameters,
                "base_parameters": indicator.parameters
            }
    
    # Create backtest record
    backtest = models.Backtest(
        bot_id=bot.id,
        user_id=current_user.id,
        start_date=backtest_in.start_date,
        end_date=backtest_in.end_date,
        status="pending",
        pair=bot.pair,
        timeframe=bot.timeframe,
        buy_condition=bot.buy_condition,
        sell_condition=bot.sell_condition,
        indicators_config=indicators_config
    )
    
    db.add(backtest)
    db.commit()
    db.refresh(backtest)
    
    # Run backtest in background
    background_tasks.add_task(
        run_backtest, 
        backtest_id=backtest.id, 
        db=db
    )
    
    return backtest

@router.get("/{backtest_id}", response_model=schemas.Backtest)
def read_backtest(
    *,
    db: Session = Depends(get_db),
    backtest_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get a specific backtest by ID.
    """
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backtest not found",
        )
    
    return backtest

@router.delete("/{backtest_id}", response_model=schemas.Backtest)
def delete_backtest(
    *,
    db: Session = Depends(get_db),
    backtest_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Delete a backtest.
    """
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backtest not found",
        )
    
    db.delete(backtest)
    db.commit()
    
    return backtest

async def run_backtest(backtest_id: int, db: Session) -> None:
    """
    Run a backtest and update the results.
    """
    # Get the db session in this task context
    backtest = db.query(models.Backtest).filter(models.Backtest.id == backtest_id).first()
    
    if not backtest or backtest.status == "completed":
        return
    
    try:
        # Update status to running
        backtest.status = "running"
        db.add(backtest)
        db.commit()
        
        # Get historical data
        historical_data = await market_data.get_historical_data(
            backtest.pair,
            backtest.timeframe,
            backtest.start_date,
            backtest.end_date
        )
        
        # Convert to DataFrame
        df = market_data.get_dataframe(historical_data)
        
        if df.empty:
            backtest.status = "failed"
            backtest.results = {"error": "No data available for the selected period"}
            db.add(backtest)
            db.commit()
            return
        
        # Calculate indicators
        df = calculate_indicators(df, backtest.indicators_config)
        
        # Run backtest
        results = simulate_trades(
            df, 
            backtest.buy_condition, 
            backtest.sell_condition
        )
        
        # Update backtest with results
        backtest.status = "completed"
        backtest.results = results
        backtest.win_rate = results.get("win_rate")
        backtest.profit_factor = results.get("profit_factor")
        backtest.total_trades = results.get("total_trades")
        backtest.average_profit = results.get("average_profit")
        backtest.max_drawdown = results.get("max_drawdown")
        backtest.sharpe_ratio = results.get("sharpe_ratio")
        
        db.add(backtest)
        db.commit()
        
    except Exception as e:
        # Update status to failed
        backtest.status = "failed"
        backtest.results = {"error": str(e)}
        db.add(backtest)
        db.commit()
        print(f"Error running backtest {backtest_id}: {e}")

def simulate_trades(df: pd.DataFrame, buy_condition: str, sell_condition: str) -> Dict[str, Any]:
    """
    Simulate trades based on buy and sell conditions.
    
    Args:
        df: DataFrame with OHLCV and indicator data
        buy_condition: String with the buy condition
        sell_condition: String with the sell condition
        
    Returns:
        Dictionary with backtest results
    """
    trades = []
    positions = []
    
    in_position = False
    entry_price = 0
    entry_time = None
    
    # Loop through each candle
    for i, row in df.iterrows():
        row_dict = row.to_dict()
        row_dict['time'] = i  # Add time to the dict for condition evaluation
        
        if not in_position:
            # Check buy condition
            try:
                buy_result = eval(buy_condition, {"np": np, "pd": pd}, row_dict)
                
                if buy_result:
                    # Enter position
                    in_position = True
                    entry_price = row['close']
                    entry_time = i
                    
                    positions.append({
                        'type': 'buy',
                        'price': entry_price,
                        'time': entry_time
                    })
            except Exception as e:
                print(f"Error evaluating buy condition: {e}")
        else:
            # Check sell condition
            try:
                sell_result = eval(sell_condition, {"np": np, "pd": pd}, row_dict)
                
                if sell_result:
                    # Exit position
                    exit_price = row['close']
                    exit_time = i
                    
                    # Calculate profit/loss
                    profit_loss = (exit_price - entry_price) / entry_price * 100
                    
                    trades.append({
                        'entry_price': entry_price,
                        'exit_price': exit_price,
                        'entry_time': entry_time,
                        'exit_time': exit_time,
                        'profit_loss': profit_loss,
                        'profit_loss_amount': exit_price - entry_price
                    })
                    
                    positions.append({
                        'type': 'sell',
                        'price': exit_price,
                        'time': exit_time
                    })
                    
                    in_position = False
            except Exception as e:
                print(f"Error evaluating sell condition: {e}")
    
    # Close any open position at the end
    if in_position:
        exit_price = df.iloc[-1]['close']
        exit_time = df.index[-1]
        
        # Calculate profit/loss
        profit_loss = (exit_price - entry_price) / entry_price * 100
        
        trades.append({
            'entry_price': entry_price,
            'exit_price': exit_price,
            'entry_time': entry_time,
            'exit_time': exit_time,
            'profit_loss': profit_loss,
            'profit_loss_amount': exit_price - entry_price
        })
        
        positions.append({
            'type': 'sell',
            'price': exit_price,
            'time': exit_time
        })
    
    # Calculate statistics
    total_trades = len(trades)
    
    if total_trades == 0:
        return {
            'total_trades': 0,
            'winning_trades': 0,
            'losing_trades': 0,
            'win_rate': 0,
            'profit_factor': 0,
            'total_profit': 0,
            'average_profit': 0,
            'max_drawdown': 0,
            'sharpe_ratio': 0,
            'trades': [],
            'positions': [],
            'equity_curve': []
        }
    
    winning_trades = sum(1 for trade in trades if trade['profit_loss'] > 0)
    losing_trades = sum(1 for trade in trades if trade['profit_loss'] <= 0)
    
    win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
    
    # Calculate profit factor
    gross_profit = sum(trade['profit_loss_amount'] for trade in trades if trade['profit_loss'] > 0)
    gross_loss = abs(sum(trade['profit_loss_amount'] for trade in trades if trade['profit_loss'] <= 0))
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
    
    total_profit = sum(trade['profit_loss'] for trade in trades)
    average_profit = total_profit / total_trades if total_trades > 0 else 0
    
    # Calculate equity curve
    equity_curve = []
    current_equity = 100  # Start with 100 units
    
    for trade in trades:
        current_equity *= (1 + trade['profit_loss'] / 100)
        equity_curve.append({
            'time': trade['exit_time'].isoformat(),
            'equity': current_equity
        })
    
    # Calculate drawdown
    max_drawdown = 0
    peak = 100
    
    for point in equity_curve:
        equity = point['equity']
        if equity > peak:
            peak = equity
        
        drawdown = (peak - equity) / peak * 100
        max_drawdown = max(max_drawdown, drawdown)
    
    # Calculate Sharpe ratio (simplified)
    returns = [trade['profit_loss'] for trade in trades]
    mean_return = np.mean(returns)
    std_return = np.std(returns)
    sharpe_ratio = mean_return / std_return if std_return > 0 else 0
    
    # Convert times to ISO format for JSON serialization
    for trade in trades:
        trade['entry_time'] = trade['entry_time'].isoformat()
        trade['exit_time'] = trade['exit_time'].isoformat()
    
    for position in positions:
        position['time'] = position['time'].isoformat()
    
    return {
        'total_trades': total_trades,
        'winning_trades': winning_trades,
        'losing_trades': losing_trades,
        'win_rate': win_rate,
        'profit_factor': profit_factor,
        'total_profit': total_profit,
        'average_profit': average_profit,
        'max_drawdown': max_drawdown,
        'sharpe_ratio': sharpe_ratio,
        'trades': trades,
        'positions': positions,
        'equity_curve': equity_curve
    } 