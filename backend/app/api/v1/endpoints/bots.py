from typing import Any, List, Dict
import threading
from datetime import datetime

from fastapi import APIRouter, Body, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.api.deps import get_db, get_current_user, get_current_active_superuser
from app.bots.trading_bot import TradingBot
from app.utils import telegram

router = APIRouter()

# Dictionary to store bot thread instances
active_bots = {}

@router.get("/", response_model=List[schemas.Bot])
def read_bots(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Retrieve all user's bots.
    """
    # Check the bot limit based on user's subscription
    if current_user.subscription:
        bot_limit = current_user.subscription.bot_limit
    else:
        # Default limit for users without a subscription
        bot_limit = 1
    
    # Get the count of user's active bots
    bot_count = db.query(func.count(models.Bot.id)).filter(
        models.Bot.user_id == current_user.id,
        models.Bot.is_active == True
    ).scalar()
    
    bots = db.query(models.Bot).filter(
        models.Bot.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return bots

@router.post("/", response_model=schemas.Bot)
def create_bot(
    *,
    db: Session = Depends(get_db),
    bot_in: schemas.BotCreate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Create new trading bot.
    """
    # Check the bot limit based on user's subscription
    if current_user.subscription:
        bot_limit = current_user.subscription.bot_limit
    else:
        # Default limit for users without a subscription
        bot_limit = 1
    
    # Get the count of user's active bots
    bot_count = db.query(func.count(models.Bot.id)).filter(
        models.Bot.user_id == current_user.id,
        models.Bot.is_active == True
    ).scalar()
    
    if bot_count >= bot_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bot limit reached. Your subscription allows {bot_limit} active bots.",
        )
    
    bot = models.Bot(
        name=bot_in.name,
        description=bot_in.description,
        pair=bot_in.pair,
        timeframe=bot_in.timeframe,
        buy_condition=bot_in.buy_condition,
        sell_condition=bot_in.sell_condition,
        telegram_channel=bot_in.telegram_channel,
        is_active=True,
        is_running=False,
        user_id=current_user.id,
    )
    db.add(bot)
    db.commit()
    db.refresh(bot)
    
    # Add indicators if specified
    if bot_in.indicators:
        for indicator_data in bot_in.indicators:
            # Check if the indicator exists in the database
            indicator = db.query(models.Indicator).filter(
                models.Indicator.id == indicator_data.indicator_id,
                models.Indicator.is_active == True
            ).first()
            
            if not indicator:
                # Try to sync indicator from registry if not found
                from app.db_init import init_indicators
                init_indicators(db)
                
                # Check again after sync
                indicator = db.query(models.Indicator).filter(
                    models.Indicator.id == indicator_data.indicator_id,
                    models.Indicator.is_active == True
                ).first()
                
                if not indicator:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Indicator with id {indicator_data.indicator_id} not found in database. Please contact administrator."
                    )
            
            bot_indicator = models.BotIndicator(
                bot_id=bot.id,
                indicator_id=indicator_data.indicator_id,
                parameters=indicator_data.parameters,
            )
            db.add(bot_indicator)
        db.commit()
    
    return bot

@router.get("/{bot_id}", response_model=schemas.BotWithIndicators)
def read_bot(
    *,
    db: Session = Depends(get_db),
    bot_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get a specific bot by ID.
    """
    bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found",
        )
    
    return bot

@router.put("/{bot_id}", response_model=schemas.Bot)
def update_bot(
    *,
    db: Session = Depends(get_db),
    bot_id: int,
    bot_in: schemas.BotUpdate,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Update a bot.
    """
    bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found",
        )
    
    # Check if bot is running
    if bot.is_running:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a running bot. Stop it first.",
        )
    
    update_data = bot_in.dict(exclude_unset=True)
    
    # Update indicators if specified
    if "indicators" in update_data and update_data["indicators"] is not None:
        # Remove old indicators
        db.query(models.BotIndicator).filter(models.BotIndicator.bot_id == bot.id).delete()
        
        # Add new indicators
        for indicator_data in update_data["indicators"]:
            # Check if the indicator exists in the database
            indicator = db.query(models.Indicator).filter(
                models.Indicator.id == indicator_data.indicator_id,
                models.Indicator.is_active == True
            ).first()
            
            if not indicator:
                # Try to sync indicator from registry if not found
                from app.db_init import init_indicators
                init_indicators(db)
                
                # Check again after sync
                indicator = db.query(models.Indicator).filter(
                    models.Indicator.id == indicator_data.indicator_id,
                    models.Indicator.is_active == True
                ).first()
                
                if not indicator:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Indicator with id {indicator_data.indicator_id} not found in database. Please contact administrator."
                    )
            
            bot_indicator = models.BotIndicator(
                bot_id=bot.id,
                indicator_id=indicator_data.indicator_id,
                parameters=indicator_data.parameters,
            )
            db.add(bot_indicator)
        
        del update_data["indicators"]
    
    # Update other fields
    for field in update_data:
        setattr(bot, field, update_data[field])
    
    db.add(bot)
    db.commit()
    db.refresh(bot)
    return bot

@router.delete("/{bot_id}", response_model=schemas.Bot)
def delete_bot(
    *,
    db: Session = Depends(get_db),
    bot_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Delete a bot.
    """
    bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found",
        )
    
    # Stop bot if running
    if bot.is_running and bot_id in active_bots:
        active_bots[bot_id].stop()
        del active_bots[bot_id]
    
    # Don't actually delete, just mark as inactive
    bot.is_active = False
    bot.is_running = False
    db.add(bot)
    db.commit()
    db.refresh(bot)
    return bot

@router.post("/{bot_id}/start", response_model=schemas.Bot)
def start_bot(
    *,
    db: Session = Depends(get_db),
    bot_id: int,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Start a bot.
    """
    bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id,
        models.Bot.is_active == True
    ).first()
    
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found or inactive",
        )
    
    if bot.is_running:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot is already running",
        )
    
    # Check if required fields are set
    if not bot.pair or not bot.timeframe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot pair and timeframe must be set",
        )
    
    # Check if buy/sell conditions are set
    if not bot.buy_condition or not bot.sell_condition:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Buy and sell conditions must be set",
        )
    
    # Initialize the trading bot
    trading_bot = TradingBot(
        bot_id=bot.id,
        pair=bot.pair,
        timeframe=bot.timeframe,
        buy_condition=bot.buy_condition,
        sell_condition=bot.sell_condition,
        db_session=db,
        telegram_channel=bot.telegram_channel
    )
    
    # Start the bot in a background thread
    background_tasks.add_task(trading_bot.start)
    
    # Store the bot instance
    active_bots[bot.id] = trading_bot
    
    # Update the bot status
    bot.is_running = True
    db.add(bot)
    db.commit()
    db.refresh(bot)
    
    return bot

@router.post("/{bot_id}/stop", response_model=schemas.Bot)
def stop_bot(
    *,
    db: Session = Depends(get_db),
    bot_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Stop a bot.
    """
    bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found",
        )
    
    if not bot.is_running:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bot is not running",
        )
    
    # Stop the bot if it's in the active bots dictionary
    if bot_id in active_bots:
        active_bots[bot_id].stop()
        del active_bots[bot_id]
    
    # Update the bot status
    bot.is_running = False
    db.add(bot)
    db.commit()
    db.refresh(bot)
    
    return bot

@router.get("/performance", response_model=Dict[str, Any])
def get_global_performance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get global performance statistics for all user's bots.
    """
    # Get all user's trades
    trades = db.query(models.Trade).join(
        models.Bot, models.Trade.bot_id == models.Bot.id
    ).filter(
        models.Bot.user_id == current_user.id,
        models.Trade.status == "closed"
    ).all()
    
    if not trades:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "total_profit_loss": 0,
            "average_profit_loss": 0,
        }
    
    total_trades = len(trades)
    winning_trades = sum(1 for trade in trades if trade.profit_loss and trade.profit_loss > 0)
    losing_trades = sum(1 for trade in trades if trade.profit_loss and trade.profit_loss < 0)
    
    win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
    
    total_profit_loss = sum(trade.profit_loss for trade in trades if trade.profit_loss is not None)
    average_profit_loss = total_profit_loss / total_trades if total_trades > 0 else 0
    
    # Get time series data for performance chart
    # (This is a simplified version)
    time_series = []
    current_value = 0
    
    for trade in sorted(trades, key=lambda x: x.exit_time if x.exit_time else datetime.min):
        if trade.profit_loss is not None:
            current_value += trade.profit_loss
            time_series.append({
                "time": trade.exit_time.isoformat() if trade.exit_time else None,
                "value": current_value
            })
    
    return {
        "total_trades": total_trades,
        "winning_trades": winning_trades,
        "losing_trades": losing_trades,
        "win_rate": win_rate,
        "total_profit_loss": total_profit_loss,
        "average_profit_loss": average_profit_loss,
        "time_series": time_series,
    }

@router.get("/{bot_id}/performance", response_model=Dict[str, Any])
def get_bot_performance(
    *,
    db: Session = Depends(get_db),
    bot_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get performance statistics for a specific bot.
    """
    # Check if bot exists and belongs to user
    bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found",
        )
    
    # Get bot trades
    trades = db.query(models.Trade).filter(
        models.Trade.bot_id == bot_id,
        models.Trade.status == "closed"
    ).all()
    
    if not trades:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "total_profit_loss": 0,
            "average_profit_loss": 0,
        }
    
    total_trades = len(trades)
    winning_trades = sum(1 for trade in trades if trade.profit_loss and trade.profit_loss > 0)
    losing_trades = sum(1 for trade in trades if trade.profit_loss and trade.profit_loss < 0)
    
    win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
    
    total_profit_loss = sum(trade.profit_loss for trade in trades if trade.profit_loss is not None)
    average_profit_loss = total_profit_loss / total_trades if total_trades > 0 else 0
    
    # Get time series data for performance chart
    time_series = []
    current_value = 0
    
    for trade in sorted(trades, key=lambda x: x.exit_time if x.exit_time else datetime.min):
        if trade.profit_loss is not None:
            current_value += trade.profit_loss
            time_series.append({
                "time": trade.exit_time.isoformat() if trade.exit_time else None,
                "value": current_value
            })
    
    return {
        "total_trades": total_trades,
        "winning_trades": winning_trades,
        "losing_trades": losing_trades,
        "win_rate": win_rate,
        "total_profit_loss": total_profit_loss,
        "average_profit_loss": average_profit_loss,
        "time_series": time_series,
    } 