from typing import Any, List, Dict
import threading
from datetime import datetime
import logging
import traceback

from fastapi import APIRouter, Body, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.api.deps import get_db, get_current_user, get_current_active_superuser, get_current_active_user
from app.bots.trading_bot import TradingBot, bot_controller
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
    logger = logging.getLogger(__name__)
    logger.debug(f"Bot creation request received: {bot_in.dict()}")
    
    try:
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
        
        logger.debug(f"User has {bot_count} active bots out of {bot_limit} allowed")
        
        if bot_count >= bot_limit:
            logger.warning(f"Bot limit reached for user {current_user.id}. Limit: {bot_limit}, Count: {bot_count}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bot limit reached. Your subscription allows {bot_limit} active bots.",
            )
        
        # Validate buy/sell conditions
        if not bot_in.buy_condition:
            logger.warning("Missing buy_condition in bot creation request")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Buy condition is required for standard bots",
            )
            
        if not bot_in.sell_condition:
            logger.warning("Missing sell_condition in bot creation request")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sell condition is required for standard bots",
            )
        
        bot = models.Bot(
            name=bot_in.name,
            description=bot_in.description,
            pair=bot_in.pair,
            timeframe=bot_in.timeframe,
            buy_condition=bot_in.buy_condition,
            sell_condition=bot_in.sell_condition,
            telegram_channel=bot_in.telegram_channel,
            bot_type=bot_in.bot_type,
            tp_condition=bot_in.tp_condition if bot_in.bot_type == "advanced" else None,
            sl_condition=bot_in.sl_condition if bot_in.bot_type == "advanced" else None,
            is_active=True,
            is_running=False,
            user_id=current_user.id,
        )
        
        db.add(bot)
        db.commit()
        db.refresh(bot)
        
        # Add indicators if specified
        if bot_in.indicators:
            logger.debug(f"Processing {len(bot_in.indicators)} indicators for bot {bot.id}")
            for indicator_data in bot_in.indicators:
                logger.debug(f"Processing indicator {indicator_data.indicator_id}")
                # Check if the indicator exists in the database
                indicator = db.query(models.Indicator).filter(
                    models.Indicator.id == indicator_data.indicator_id,
                    models.Indicator.is_active == True
                ).first()
                
                if not indicator:
                    logger.warning(f"Indicator {indicator_data.indicator_id} not found. Attempting to sync.")
                    # Try to sync indicator from registry if not found
                    from app.db_init import init_indicators
                    init_indicators(db)
                    
                    # Check again after sync
                    indicator = db.query(models.Indicator).filter(
                        models.Indicator.id == indicator_data.indicator_id,
                        models.Indicator.is_active == True
                    ).first()
                    
                    if not indicator:
                        logger.error(f"Indicator {indicator_data.indicator_id} not found even after sync. Rolling back.")
                        db.delete(bot)
                        db.commit()
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Indicator with id {indicator_data.indicator_id} not found in database. Please contact administrator."
                        )
                
                logger.debug(f"Adding indicator {indicator.name} to bot {bot.id}")
                bot_indicator = models.BotIndicator(
                    bot_id=bot.id,
                    indicator_id=indicator_data.indicator_id,
                    parameters=indicator_data.parameters,
                )
                db.add(bot_indicator)
            
            try:
                db.commit()
            except Exception as e:
                logger.error(f"Error adding indicators: {str(e)}")
                db.rollback()
                db.delete(bot)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error adding indicators: {str(e)}",
                )
        
        logger.info(f"Bot {bot.id} created successfully")
        return bot
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error creating bot: {str(e)}")
        logger.error(f"Exception details: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating bot: {str(e)}",
        )

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

@router.post("/{bot_id}/update", response_model=schemas.Bot)
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

@router.post("/{bot_id}/delete", response_model=schemas.Bot)
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
    
    bot.is_active = False
    bot.is_running = False
    db.delete(bot)
    db.commit()
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
    
    # Start the bot using the controller
    success = bot_controller.start_bot(current_user.id, bot_id, db)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start bot",
        )
    
    # Refresh bot from database to get updated status
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
    
    # Stop the bot using the controller
    success = bot_controller.stop_bot(current_user.id, bot_id, db)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop bot",
        )
    
    # Refresh bot from database to get updated status
    db.refresh(bot)
    
    return bot

@router.post("/{bot_id}/restart", response_model=schemas.Bot)
def restart_bot(
    *,
    db: Session = Depends(get_db),
    bot_id: int,
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Restart a bot.
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
    
    # Restart the bot using the controller
    success = bot_controller.restart_bot(current_user.id, bot_id, db)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restart bot",
        )
    
    # Refresh bot from database to get updated status
    db.refresh(bot)
    
    return bot

@router.post("/{bot_id}/update_config", response_model=schemas.Bot)
def update_bot_config(
    *,
    db: Session = Depends(get_db),
    bot_id: int,
    config: Dict[str, Any],
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Update a bot's configuration.
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
    
    # Update bot configuration using the controller
    success = bot_controller.update_bot_config(current_user.id, bot_id, config, db)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update bot configuration",
        )
    
    # Refresh bot from database to get updated status
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

@router.post("/validate-expression", response_model=Dict[str, Any])
def validate_expression(
    *,
    expression_data: Dict[str, str],
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Validate a mathematical expression for buy/sell conditions or TP/SL calculations.
    Returns validation result and error message if invalid.
    """
    expression = expression_data.get("expression", "")
    expression_type = expression_data.get("type", "condition")  # condition or calculation
    
    if not expression:
        return {
            "valid": False,
            "error": "Expression cannot be empty"
        }
    
    try:
        # Check for balanced parentheses and operators
        parentheses_stack = []
        operators = ["+", "-", "*", "/", ">", "<", ">=", "<=", "==", "!=", "and", "or", "not"]
        tokens = []
        i = 0
        
        while i < len(expression):
            # Skip whitespace
            if expression[i].isspace():
                i += 1
                continue
                
            # Check for numbers
            if expression[i].isdigit() or expression[i] == '.':
                num_start = i
                while i < len(expression) and (expression[i].isdigit() or expression[i] == '.'):
                    i += 1
                tokens.append(expression[num_start:i])
                continue
                
            # Check for parentheses
            if expression[i] == '(':
                parentheses_stack.append('(')
                tokens.append('(')
                i += 1
                continue
                
            if expression[i] == ')':
                if not parentheses_stack:
                    return {
                        "valid": False,
                        "error": "Unbalanced parentheses: extra closing parenthesis"
                    }
                parentheses_stack.pop()
                tokens.append(')')
                i += 1
                continue
                
            # Check for operators
            for op in sorted(operators, key=len, reverse=True):
                if expression[i:i+len(op)] == op:
                    tokens.append(op)
                    i += len(op)
                    break
            else:
                # Check for variables/functions
                if expression[i].isalpha() or expression[i] == '_':
                    var_start = i
                    while i < len(expression) and (expression[i].isalnum() or expression[i] == '_'):
                        i += 1
                    tokens.append(expression[var_start:i])
                else:
                    # Unknown character
                    return {
                        "valid": False,
                        "error": f"Invalid character: {expression[i]}"
                    }
        
        # Check for unbalanced parentheses
        if parentheses_stack:
            return {
                "valid": False,
                "error": "Unbalanced parentheses: missing closing parenthesis"
            }
            
        # Check for empty expression
        if not tokens:
            return {
                "valid": False,
                "error": "Expression is empty"
            }
            
        # Check for operator at start or end (except 'not' at start)
        if tokens[0] in operators and tokens[0] != "not":
            return {
                "valid": False,
                "error": f"Expression cannot start with operator: {tokens[0]}"
            }
            
        if tokens[-1] in operators:
            return {
                "valid": False,
                "error": f"Expression cannot end with operator: {tokens[-1]}"
            }
            
        # Check for consecutive operators
        for i in range(len(tokens) - 1):
            if tokens[i] in operators and tokens[i+1] in operators and tokens[i+1] != "not":
                return {
                    "valid": False, 
                    "error": f"Consecutive operators not allowed: {tokens[i]} {tokens[i+1]}"
                }
        
        # Pass validation!
        return {
            "valid": True,
            "error": None
        }
        
    except Exception as e:
        return {
            "valid": False,
            "error": f"Validation error: {str(e)}"
        }

@router.get("/status", response_model=List[Dict[str, Any]])
def get_bots_status(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get the status of all running bots for the current user.
    """
    # Get all bots for the current user
    bots = db.query(models.Bot).filter(
        models.Bot.user_id == current_user.id
    ).all()
    
    result = []
    for bot in bots:
        # Get open trades for this bot
        open_trade = db.query(models.Trade).filter(
            models.Trade.bot_id == bot.id,
            models.Trade.status == "open"
        ).first()
        
        # Get recent closed trades (last 5)
        closed_trades = db.query(models.Trade).filter(
            models.Trade.bot_id == bot.id,
            models.Trade.status == "closed"
        ).order_by(models.Trade.exit_time.desc()).limit(5).all()
        
        # Format trades
        trade_info = None
        if open_trade:
            trade_info = {
                "id": open_trade.id,
                "type": open_trade.type,
                "entry_price": open_trade.entry_price,
                "entry_time": open_trade.entry_time.isoformat(),
                "tp_price": open_trade.tp_price,
                "sl_price": open_trade.sl_price,
            }
        
        recent_trades = []
        for trade in closed_trades:
            recent_trades.append({
                "id": trade.id,
                "type": trade.type,
                "entry_price": trade.entry_price,
                "exit_price": trade.exit_price,
                "entry_time": trade.entry_time.isoformat(),
                "exit_time": trade.exit_time.isoformat() if trade.exit_time else None,
                "profit_loss": trade.profit_loss,
                "profit_loss_percent": trade.profit_loss_percent,
                "exit_reason": trade.exit_reason,
            })
        
        result.append({
            "id": bot.id,
            "name": bot.name,
            "pair": bot.pair,
            "timeframe": bot.timeframe,
            "is_active": bot.is_active,
            "is_running": bot.is_running,
            "bot_type": bot.bot_type,
            "current_trade": trade_info,
            "recent_trades": recent_trades
        })
    
    return result

@router.get("/test-market-data", response_model=Dict[str, Any])
async def test_market_data_connection(
    symbol: str = "EURUSD",
    timeframe: str = "1h",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser),  # Only superusers can run diagnostics
) -> Any:
    """
    Test connection to market data service and diagnose potential issues.
    Only available to admin users for security reasons.
    """
    try:
        from app.utils.market_data import test_market_data_access, check_influxdb_connection
        
        # Run a complete test
        result = await test_market_data_access(symbol, timeframe)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error testing market data connection: {e}")
        traceback.print_exc()
        
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/available-data", response_model=Dict[str, Any])
async def get_available_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Any:
    """
    Get available symbol/timeframe combinations for bot configuration.
    This helps users select symbols and timeframes that actually have data.
    Returns both MT5 format (M1, H1, D1) and normalized format (1m, 1h, 1d).
    """
    try:
        from app.utils.market_data import check_influxdb_connection
        
        # Check connection and get available data
        connection_data = check_influxdb_connection()
        
        # Extract available symbol/timeframe combinations
        available_combinations = []
        
        if connection_data.get("sample_data"):
            available_combinations = list(connection_data["sample_data"].keys())
            available_combinations.sort()
        
        # Group by symbol with both timeframe formats
        symbols_data = {}
        for combo in available_combinations:
            if "/" in combo:
                symbol, timeframe = combo.split("/", 1)
                
                if symbol not in symbols_data:
                    symbols_data[symbol] = {
                        "mt5_timeframes": [],
                        "normalized_timeframes": []
                    }
                
                # Store the original timeframe
                if timeframe.startswith(('M', 'H', 'D')):
                    if timeframe not in symbols_data[symbol]["mt5_timeframes"]:
                        symbols_data[symbol]["mt5_timeframes"].append(timeframe)
                    
                    # Add normalized version
                    normalized = None
                    if timeframe.startswith('M') and timeframe[1:].isdigit():
                        normalized = f"{timeframe[1:]}m"
                    elif timeframe.startswith('H') and timeframe[1:].isdigit():
                        normalized = f"{timeframe[1:]}h"
                    elif timeframe.startswith('D') and timeframe[1:].isdigit():
                        normalized = f"{timeframe[1:]}d"
                    
                    if normalized and normalized not in symbols_data[symbol]["normalized_timeframes"]:
                        symbols_data[symbol]["normalized_timeframes"].append(normalized)
                else:
                    # It's already in normalized format
                    if timeframe not in symbols_data[symbol]["normalized_timeframes"]:
                        symbols_data[symbol]["normalized_timeframes"].append(timeframe)
                    
                    # Add MT5 version
                    mt5_format = None
                    if timeframe.endswith('m') and timeframe[:-1].isdigit():
                        mt5_format = f"M{timeframe[:-1]}"
                    elif timeframe.endswith('h') and timeframe[:-1].isdigit():
                        mt5_format = f"H{timeframe[:-1]}"
                    elif timeframe.endswith('d') and timeframe[:-1].isdigit():
                        mt5_format = f"D{timeframe[:-1]}"
                    
                    if mt5_format and mt5_format not in symbols_data[symbol]["mt5_timeframes"]:
                        symbols_data[symbol]["mt5_timeframes"].append(mt5_format)
        
        # Sort timeframes for each symbol
        for symbol in symbols_data:
            symbols_data[symbol]["mt5_timeframes"].sort()
            symbols_data[symbol]["normalized_timeframes"].sort()
        
        return {
            "status": "success",
            "connection_status": connection_data.get("connection_status", "unknown"),
            "symbols": symbols_data,
            "combinations": available_combinations,
            "example_usage": "When configuring your bot, use the MT5 timeframe format (M1, H1, D1, etc.) as shown in your InfluxDB."
        }
    except Exception as e:
        logger.error(f"Error getting available data: {e}")
        traceback.print_exc()
        
        return {
            "status": "error",
            "error": str(e)
        }

@router.post("/test-condition-parser", response_model=Dict[str, Any])
async def test_condition_parser(
    condition: str = Body(..., embed=True),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Test the parser for trading conditions.
    This endpoint helps validate that the condition parsing logic works correctly.
    """
    from app.bots.trading_bot import TradingBot
    
    try:
        # Create a dummy bot instance for testing
        dummy_bot = TradingBot(
            bot_id=0,
            pair="EURUSD",
            timeframe="M1",
            buy_condition="",
            sell_condition="",
            db_session=None  # No need for DB session for this test
        )
        
        # Parse the condition
        parsed_condition = dummy_bot._parse_condition(condition)
        
        # Analyze the condition to extract indicators
        import re
        indicator_pattern = r'([A-Za-z]+)\(([A-Za-z]+)\)(\d+)'
        indicators_found = []
        
        for match in re.finditer(indicator_pattern, condition):
            indicators_found.append({
                "full_name": match.group(1),
                "abbreviation": match.group(2),
                "period": match.group(3),
                "parsed_as": f"{match.group(2)}_{match.group(3)}"
            })
        
        return {
            "status": "success",
            "original_condition": condition,
            "parsed_condition": parsed_condition,
            "indicators_found": indicators_found
        }
    except Exception as e:
        logger.error(f"Error testing condition parser: {e}")
        traceback.print_exc()
        return {
            "status": "error",
            "error": str(e),
            "original_condition": condition
        } 