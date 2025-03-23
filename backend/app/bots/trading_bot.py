import threading
import time
import asyncio
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging
from sqlalchemy.orm import Session
import traceback

from app import models
from app.utils import market_data, telegram
from app.indicators.calculator import calculate_indicators

logger = logging.getLogger(__name__)

class TradingBot:
    """
    Trading bot that runs in a separate thread and executes trades based on conditions.
    """
    
    def __init__(
        self,
        bot_id: int,
        pair: str,
        timeframe: str,
        buy_condition: str,
        sell_condition: str,
        db_session: Session,
        telegram_channel: Optional[str] = None,
        check_interval: int = 60,  # seconds
        bot_type: str = "standard",
        tp_condition: Optional[str] = None,
        sl_condition: Optional[str] = None
    ):
        self.bot_id = bot_id
        self.pair = pair
        self.timeframe = timeframe
        self.buy_condition = buy_condition
        self.sell_condition = sell_condition
        self.db_session = db_session
        self.telegram_channel = telegram_channel
        self.check_interval = check_interval
        self.bot_type = bot_type
        self.tp_condition = tp_condition
        self.sl_condition = sl_condition
        
        self.running = False
        self.thread = None
        self.indicators = {}
        self.last_check = None
        
        # Load indicators from database
        self._load_indicators()
    
    def _load_indicators(self):
        """Load indicators configured for this bot"""
        try:
            bot_indicators = self.db_session.query(models.BotIndicator).filter(
                models.BotIndicator.bot_id == self.bot_id
            ).all()
            
            for bi in bot_indicators:
                indicator = self.db_session.query(models.Indicator).filter(
                    models.Indicator.id == bi.indicator_id
                ).first()
                
                if indicator:
                    self.indicators[indicator.name] = {
                        "parameters": bi.parameters,
                        "base_parameters": indicator.parameters
                    }
        except Exception as e:
            logger.error(f"Error loading indicators: {e}")
            traceback.print_exc()
    
    def start(self):
        """Start the trading bot in a new thread"""
        if self.running:
            logger.info(f"Bot {self.bot_id} is already running")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._run)
        self.thread.daemon = True
        self.thread.start()
        
        logger.info(f"Bot {self.bot_id} started")
    
    def stop(self):
        """Stop the trading bot"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=10)
        
        logger.info(f"Bot {self.bot_id} stopped")
    
    def _run(self):
        """Main loop of the trading bot"""
        while self.running:
            try:
                # Check for new data and execute trading logic
                self._check_and_execute()
                
                # Sleep until next check
                time.sleep(self.check_interval)
            except Exception as e:
                logger.error(f"Error in bot {self.bot_id}: {e}")
                traceback.print_exc()
                time.sleep(self.check_interval)  # Still sleep on error
    
    def _check_and_execute(self):
        """Check for new data and execute trading logic"""
        # Use asyncio to get last price
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Get last price data
            logger.info(f"Bot {self.bot_id}: Checking for new data for {self.pair}/{self.timeframe}")
            
            last_data = None
            retry_count = 0
            max_retries = 3
            
            while last_data is None and retry_count < max_retries:
                last_data = loop.run_until_complete(
                    market_data.get_last_price(self.pair, self.timeframe)
                )
                
                if last_data is None:
                    retry_count += 1
                    logger.warning(f"Bot {self.bot_id}: No data found for {self.pair}/{self.timeframe}, retry {retry_count}/{max_retries}")
                    time.sleep(5)  # Short delay between retries
            
            # If we still don't have data after retries, log error and return
            if not last_data:
                logger.error(f"Bot {self.bot_id}: Failed to get market data for {self.pair}/{self.timeframe} after {max_retries} retries")
                
                # Try to get data with a broader query to see if the data exists at all
                try:
                    logger.info(f"Bot {self.bot_id}: Attempting to get any data for {self.pair}")
                    # Try different timeframes
                    alternate_timeframes = ["1h", "4h", "1d"]
                    for tf in alternate_timeframes:
                        if tf != self.timeframe:
                            alt_data = loop.run_until_complete(
                                market_data.get_last_price(self.pair, tf)
                            )
                            if alt_data:
                                logger.info(f"Bot {self.bot_id}: Found data for {self.pair}/{tf}, but not for {self.timeframe}")
                                break
                except Exception as e:
                    logger.error(f"Bot {self.bot_id}: Error in fallback data check: {e}")
                
                return
            
            logger.info(f"Bot {self.bot_id}: Received data for {self.pair}/{self.timeframe}, time: {last_data['time']}")
            
            # If we've already checked this candle, skip
            if self.last_check and last_data['time'] == self.last_check:
                logger.info(f"Bot {self.bot_id}: Skipping already processed candle at time {self.last_check}")
                return
            
            # Get some historical data for indicators
            end_date = datetime.fromisoformat(last_data['time'].replace('Z', '+00:00'))
            
            # Get data for the last 200 candles (or what's appropriate for your indicators)
            # This is to have enough data to calculate indicators
            if 'h' in self.timeframe:
                start_date = end_date - pd.Timedelta(hours=200)
            else:
                start_date = end_date - pd.Timedelta(days=200)
            
            logger.info(f"Bot {self.bot_id}: Fetching historical data from {start_date} to {end_date}")
            
            historical_data = loop.run_until_complete(
                market_data.get_historical_data(
                    self.pair, 
                    self.timeframe,
                    start_date,
                    end_date
                )
            )
            
            # Verify we have enough historical data
            if not historical_data or len(historical_data) < 10:
                logger.error(f"Bot {self.bot_id}: Insufficient historical data for {self.pair}/{self.timeframe}. Got {len(historical_data) if historical_data else 0} candles.")
                return
            
            logger.info(f"Bot {self.bot_id}: Retrieved {len(historical_data)} candles of historical data")
            
            # Convert to DataFrame
            df = market_data.get_dataframe(historical_data)
            
            # Add frontend format indicators to configuration
            # This ensures both backend and frontend indicator formats work correctly
            updated_indicators = self.indicators.copy() if self.indicators else {}
            
            # Parse the conditions to extract required indicators
            import re
            required_indicator_pattern = r'([A-Za-z]+)\(([A-Za-z]+)\)(\d+)'
            
            # Extract from both buy and sell conditions
            buy_condition_indicators = re.findall(required_indicator_pattern, self.buy_condition)
            sell_condition_indicators = re.findall(required_indicator_pattern, self.sell_condition)
            
            # Add specific indicators found in conditions
            for full_name, abbrev, period in buy_condition_indicators + sell_condition_indicators:
                frontend_format = f"{full_name}({abbrev}){period}"
                period_int = int(period)
                
                # Add to indicators if not already present
                if frontend_format not in updated_indicators:
                    logger.info(f"Bot {self.bot_id}: Adding indicator {frontend_format} from condition")
                    updated_indicators[frontend_format] = {
                        "parameters": {"period": period_int}
                    }
                
                # Also ensure the backend format exists
                if abbrev not in updated_indicators:
                    logger.info(f"Bot {self.bot_id}: Adding indicator {abbrev} with period {period_int}")
                    updated_indicators[abbrev] = {
                        "parameters": {"period": period_int}
                    }
            
            # Explicitly add SMA_1 if needed (common indicator that causes issues)
            if "SMA_1" in self.buy_condition or "SMA_1" in self.sell_condition:
                if "SMA" not in updated_indicators:
                    logger.info(f"Bot {self.bot_id}: Adding explicit SMA with period 1")
                    updated_indicators["SMA"] = {
                        "parameters": {"period": 1}
                    }
            
            # Calculate indicators
            logger.info(f"Bot {self.bot_id}: Calculating indicators with config: {updated_indicators}")
            df = calculate_indicators(df, updated_indicators)
            
            # Make sure we have at least one row after indicators are calculated
            if df.empty:
                logger.error(f"Bot {self.bot_id}: DataFrame is empty after calculating indicators")
                return
            
            # Dump the column names to help with debugging indicator calculations
            logger.debug(f"Bot {self.bot_id}: DataFrame columns after indicator calculation: {list(df.columns)}")
            
            # Ensure SMA_1 exists if needed
            if ("SMA_1" in self.buy_condition or "SMA_1" in self.sell_condition) and "SMA_1" not in df.columns:
                logger.info(f"Bot {self.bot_id}: Creating missing SMA_1 indicator")
                import ta
                df["SMA_1"] = ta.trend.sma_indicator(df['close'], window=1)
            
            # Evaluate conditions on the last row
            last_row = df.iloc[-1].to_dict()
            logger.debug(f"Bot {self.bot_id}: Last row data keys: {list(last_row.keys())}")
            
            # Extract any conditions from the parsed conditions
            parsed_buy_condition = self._parse_condition(self.buy_condition)
            parsed_sell_condition = self._parse_condition(self.sell_condition)
            
            logger.info(f"Bot {self.bot_id}: Parsed buy condition: {parsed_buy_condition}")
            logger.info(f"Bot {self.bot_id}: Parsed sell condition: {parsed_sell_condition}") 
            
            # Check if required indicators exist in the dataframe
            required_columns = set()
            for col_name in re.findall(r'([A-Za-z0-9_]+)(?:\s*[<>=!]+|\s+and|\s+or|\s*\)|\s*$)', parsed_buy_condition + " " + parsed_sell_condition):
                if col_name not in ['and', 'or', 'not', 'True', 'False', 'None'] and not col_name.replace('.', '').isdigit():
                    required_columns.add(col_name)
            
            missing_columns = [col for col in required_columns if col not in last_row]
            if missing_columns:
                logger.warning(f"Bot {self.bot_id}: Missing required columns in dataframe: {missing_columns}")
                
                # Try to create missing indicators with default parameters
                for col in missing_columns:
                    if col.startswith("SMA_") and col not in last_row:
                        try:
                            period = int(col.split("_")[1])
                            logger.info(f"Bot {self.bot_id}: Creating missing SMA indicator with period {period}")
                            df[col] = ta.trend.sma_indicator(df['close'], window=period)
                            last_row[col] = df[col].iloc[-1]
                        except Exception as e:
                            logger.error(f"Bot {self.bot_id}: Could not create {col}: {e}")
                    elif col.startswith("EMA_") and col not in last_row:
                        try:
                            period = int(col.split("_")[1])
                            logger.info(f"Bot {self.bot_id}: Creating missing EMA indicator with period {period}")
                            df[col] = ta.trend.ema_indicator(df['close'], window=period)
                            last_row[col] = df[col].iloc[-1]
                        except Exception as e:
                            logger.error(f"Bot {self.bot_id}: Could not create {col}: {e}")
                    elif col.startswith("RSI_") and col not in last_row:
                        try:
                            period = int(col.split("_")[1])
                            logger.info(f"Bot {self.bot_id}: Creating missing RSI indicator with period {period}")
                            df[col] = ta.momentum.rsi(df['close'], window=period)
                            last_row[col] = df[col].iloc[-1]
                        except Exception as e:
                            logger.error(f"Bot {self.bot_id}: Could not create {col}: {e}")
            
            # Check if there's an open trade for this bot
            open_trade = self.db_session.query(models.Trade).filter(
                models.Trade.bot_id == self.bot_id,
                models.Trade.status == 'open'
            ).first()
            
            if open_trade:
                # We have an open trade
                current_price = last_row.get('close', 0)
                logger.info(f"Bot {self.bot_id}: Have open {open_trade.type} trade, current price: {current_price}")
                
                if self.bot_type == "advanced":
                    # For advanced bots, check TP/SL
                    if open_trade.type == "buy":
                        # Check if TP hit for buy
                        if open_trade.tp_price and current_price >= open_trade.tp_price:
                            logger.info(f"Bot {self.bot_id}: TP hit for buy trade at {current_price} >= {open_trade.tp_price}")
                            self._close_trade(open_trade, last_row, exit_reason="tp")
                            return
                        
                        # Check if SL hit for buy
                        if open_trade.sl_price and current_price <= open_trade.sl_price:
                            logger.info(f"Bot {self.bot_id}: SL hit for buy trade at {current_price} <= {open_trade.sl_price}")
                            self._close_trade(open_trade, last_row, exit_reason="sl")
                            return
                    else:  # Sell
                        # Check if TP hit for sell
                        if open_trade.tp_price and current_price <= open_trade.tp_price:
                            logger.info(f"Bot {self.bot_id}: TP hit for sell trade at {current_price} <= {open_trade.tp_price}")
                            self._close_trade(open_trade, last_row, exit_reason="tp")
                            return
                        
                        # Check if SL hit for sell
                        if open_trade.sl_price and current_price >= open_trade.sl_price:
                            logger.info(f"Bot {self.bot_id}: SL hit for sell trade at {current_price} >= {open_trade.sl_price}")
                            self._close_trade(open_trade, last_row, exit_reason="sl")
                            return
                
                # For standard bots, check if condition is now false
                if self.bot_type == "standard":
                    if open_trade.type == "buy":
                        try:
                            # For buy orders, check if buy condition is now false
                            parsed_buy_condition = self._parse_condition(self.buy_condition)
                            logger.debug(f"Bot {self.bot_id}: Evaluating buy condition: {parsed_buy_condition}")
                            buy_result = eval(parsed_buy_condition, {"np": np, "pd": pd}, last_row)
                            logger.info(f"Bot {self.bot_id}: Buy condition evaluated to: {buy_result}")
                            if not buy_result:
                                logger.info(f"Bot {self.bot_id}: Closing buy trade as condition is now false")
                                self._close_trade(open_trade, last_row, exit_reason="condition_change")
                                return
                        except Exception as e:
                            logger.error(f"Bot {self.bot_id}: Error evaluating buy condition: {e}")
                            traceback.print_exc()
                    else:  # Sell
                        try:
                            # For sell orders, check if sell condition is now false
                            parsed_sell_condition = self._parse_condition(self.sell_condition)
                            logger.debug(f"Bot {self.bot_id}: Evaluating sell condition: {parsed_sell_condition}")
                            sell_result = eval(parsed_sell_condition, {"np": np, "pd": pd}, last_row)
                            logger.info(f"Bot {self.bot_id}: Sell condition evaluated to: {sell_result}")
                            if not sell_result:
                                logger.info(f"Bot {self.bot_id}: Closing sell trade as condition is now false")
                                self._close_trade(open_trade, last_row, exit_reason="condition_change")
                                return
                        except Exception as e:
                            logger.error(f"Bot {self.bot_id}: Error evaluating sell condition: {e}")
                            traceback.print_exc()
            else:
                # No open trade, check if we should open one
                logger.info(f"Bot {self.bot_id}: No open trade, checking conditions")
                
                # Try buy condition first
                try:
                    parsed_buy_condition = self._parse_condition(self.buy_condition)
                    logger.debug(f"Bot {self.bot_id}: Evaluating buy condition: {parsed_buy_condition}")
                    buy_result = eval(parsed_buy_condition, {"np": np, "pd": pd}, last_row)
                    logger.info(f"Bot {self.bot_id}: Buy condition evaluated to: {buy_result}")
                    
                    if buy_result:
                        # Open a new buy trade
                        logger.info(f"Bot {self.bot_id}: Opening new buy trade")
                        self._open_trade(last_row, trade_type="buy")
                        return
                except Exception as e:
                    logger.error(f"Bot {self.bot_id}: Error evaluating buy condition: {e}")
                    traceback.print_exc()
                
                # Try sell condition
                try:
                    parsed_sell_condition = self._parse_condition(self.sell_condition)
                    logger.debug(f"Bot {self.bot_id}: Evaluating sell condition: {parsed_sell_condition}")
                    sell_result = eval(parsed_sell_condition, {"np": np, "pd": pd}, last_row)
                    logger.info(f"Bot {self.bot_id}: Sell condition evaluated to: {sell_result}")
                    
                    if sell_result:
                        # Open a new sell trade
                        logger.info(f"Bot {self.bot_id}: Opening new sell trade")
                        self._open_trade(last_row, trade_type="sell")
                        return
                except Exception as e:
                    logger.error(f"Bot {self.bot_id}: Error evaluating sell condition: {e}")
                    traceback.print_exc()
            
            # Update last check time
            self.last_check = last_data['time']
            logger.info(f"Bot {self.bot_id}: Processing complete, updated last_check to {self.last_check}")
            
        except Exception as e:
            logger.error(f"Error in check_and_execute for bot {self.bot_id}: {e}")
            traceback.print_exc()
        finally:
            loop.close()
    
    def _open_trade(self, data: Dict[str, Any], trade_type: str = "buy"):
        """Open a new trade based on the current data"""
        try:
            # For simplicity, we'll use the close price
            entry_price = data.get('close')
            
            if not entry_price:
                logger.error("No entry price available")
                return

            # Calculate TP and SL values for advanced bots
            tp_price = None
            sl_price = None
            
            if self.bot_type == "advanced" and self.tp_condition:
                try:
                    # Parse and evaluate TP condition
                    parsed_tp_condition = self._parse_condition(self.tp_condition)
                    logger.debug(f"Bot {self.bot_id}: Evaluating TP condition: {parsed_tp_condition}")
                    
                    # Evaluate TP condition to get a multiplier or direct price
                    tp_result = eval(parsed_tp_condition, {"np": np, "pd": pd}, data)
                    
                    # Check if tp_result is a number (percentage/multiplier or direct price)
                    if isinstance(tp_result, (int, float)):
                        # If tp_result > 10, assume it's a direct price
                        if abs(tp_result) > 10:
                            tp_price = tp_result
                        else:
                            # It's a multiplier/percentage
                            if trade_type == "buy":
                                # For buy, TP is above entry price
                                tp_price = entry_price * (1 + tp_result / 100)
                            else:
                                # For sell, TP is below entry price
                                tp_price = entry_price * (1 - tp_result / 100)
                except Exception as e:
                    logger.error(f"Error calculating TP price: {e}")
                    traceback.print_exc()
            
            if self.bot_type == "advanced" and self.sl_condition:
                try:
                    # Parse and evaluate SL condition
                    parsed_sl_condition = self._parse_condition(self.sl_condition)
                    logger.debug(f"Bot {self.bot_id}: Evaluating SL condition: {parsed_sl_condition}")
                    
                    # Evaluate SL condition to get a multiplier or direct price
                    sl_result = eval(parsed_sl_condition, {"np": np, "pd": pd}, data)
                    
                    # Check if sl_result is a number (percentage/multiplier or direct price)
                    if isinstance(sl_result, (int, float)):
                        # If sl_result > 10, assume it's a direct price
                        if abs(sl_result) > 10:
                            sl_price = sl_result
                        else:
                            # It's a multiplier/percentage
                            if trade_type == "buy":
                                # For buy, SL is below entry price
                                sl_price = entry_price * (1 - sl_result / 100)
                            else:
                                # For sell, SL is above entry price
                                sl_price = entry_price * (1 + sl_result / 100)
                except Exception as e:
                    logger.error(f"Error calculating SL price: {e}")
                    traceback.print_exc()
            
            # Create and save the trade
            new_trade = models.Trade(
                bot_id=self.bot_id,
                pair=self.pair,
                timeframe=self.timeframe,
                type=trade_type,
                entry_price=entry_price,
                tp_price=tp_price,
                sl_price=sl_price,
                quantity=1.0,  # Default quantity
                status="open",
                entry_time=datetime.utcnow(),
                indicators_values=data
            )
            
            self.db_session.add(new_trade)
            self.db_session.commit()
            
            # Get the bot to get user information
            bot = self.db_session.query(models.Bot).filter(
                models.Bot.id == self.bot_id
            ).first()
            
            if bot:
                # Get the user associated with this bot
                user = self.db_session.query(models.User).filter(
                    models.User.id == bot.user_id
                ).first()
                
                if user and user.telegram_username:
                    # Send a notification via Telegram
                    if self.bot_type == "standard":
                        # Standard bot message
                        message = f"{trade_type.upper()} {self.pair} NOW"
                    else:
                        # Advanced bot message
                        message = f"{trade_type.upper()} {self.pair} NOW\nENTRY: {entry_price}"
                        if tp_price:
                            message += f"\nTP: {tp_price}"
                        if sl_price:
                            message += f"\nSL: {sl_price}"
                    
                    # Send the message with the telegram service
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    try:
                        loop.run_until_complete(
                            telegram.telegram_bot_service.send_message(
                                user.telegram_username, 
                                message
                            )
                        )
                        logger.info(f"Trade notification sent to {user.telegram_username}")
                    except Exception as e:
                        logger.error(f"Error sending Telegram notification: {e}")
                        traceback.print_exc()
                    finally:
                        loop.close()
            
            logger.info(f"Opened trade for bot {self.bot_id}: {trade_type} {self.pair} at {entry_price}")
        except Exception as e:
            logger.error(f"Error opening trade: {e}")
            traceback.print_exc()
    
    def _close_trade(self, trade: models.Trade, data: Dict[str, Any], exit_reason: str = "sell_condition"):
        """Close an existing trade"""
        try:
            # Get the current price
            exit_price = data.get('close')
            
            if not exit_price:
                logger.error("No exit price available")
                return
            
            # Calculate profit/loss
            if trade.type == "buy":
                profit_loss = exit_price - trade.entry_price
                profit_loss_percent = (profit_loss / trade.entry_price) * 100
            else:  # sell
                profit_loss = trade.entry_price - exit_price
                profit_loss_percent = (profit_loss / trade.entry_price) * 100
            
            # Update the trade
            trade.exit_price = exit_price
            trade.exit_time = datetime.utcnow()
            trade.profit_loss = profit_loss
            trade.profit_loss_percent = profit_loss_percent
            trade.exit_reason = exit_reason
            trade.status = "closed"
            
            self.db_session.add(trade)
            self.db_session.commit()
            
            # Get the bot to get user information
            bot = self.db_session.query(models.Bot).filter(
                models.Bot.id == self.bot_id
            ).first()
            
            if bot:
                # Get the user associated with this bot
                user = self.db_session.query(models.User).filter(
                    models.User.id == bot.user_id
                ).first()
                
                if user and user.telegram_username:
                    # Send a notification via Telegram
                    message = f"CLOSE {self.pair} NOW"
                    
                    # Send the message with the telegram service
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    try:
                        loop.run_until_complete(
                            telegram.telegram_bot_service.send_message(
                                user.telegram_username, 
                                message
                            )
                        )
                        logger.info(f"Trade close notification sent to {user.telegram_username}")
                    except Exception as e:
                        logger.error(f"Error sending Telegram notification: {e}")
                        traceback.print_exc()
                    finally:
                        loop.close()
            
            logger.info(f"Closed trade for bot {self.bot_id}: {trade.type} {self.pair} at {exit_price}")
        except Exception as e:
            logger.error(f"Error closing trade: {e}")
            traceback.print_exc()

    def _parse_condition(self, condition: str) -> str:
        """
        Parse condition text from frontend to handle indicator expressions.
        
        Frontend format examples:
        - "SimpleMovingAverage(SMA)1 < current_price"  -> "SMA_1 < close"
        - "SimpleMovingAverage(SMA)14 > current_price" -> "SMA_14 > close"
        - "RelativeStrengthIndex(RSI)14 < 30"          -> "RSI_14 < 30"
        """
        if not condition:
            return condition
        
        try:
            # Replace common value references
            parsed = condition.replace('current_price', 'close')
            
            # Find all indicator expressions using the frontend format
            import re
            
            # This pattern matches expressions like "SimpleMovingAverage(SMA)14"
            # Groups: 1 = full name (SimpleMovingAverage), 2 = abbrev (SMA), 3 = period (14)
            indicator_pattern = r'([A-Za-z]+)\(([A-Za-z]+)\)(\d+)'
            
            # Replace each indicator with the proper DataFrame column reference
            matches = list(re.finditer(indicator_pattern, parsed))
            
            # Process matches in reverse order to prevent issues with overlapping replacements
            for match in reversed(matches):
                full_name = match.group(1)    # e.g., SimpleMovingAverage
                abbrev = match.group(2)       # e.g., SMA
                period = match.group(3)       # e.g., 14
                
                # Create column name in the format used by the indicator calculator
                # Most indicators are stored as TYPE_PERIOD, e.g., SMA_10, RSI_14
                column_name = f"{abbrev}_{period}"
                
                # Get the start and end positions of the match
                start, end = match.span()
                
                # Replace just this specific match
                parsed = parsed[:start] + column_name + parsed[end:]
            
            logger.debug(f"Parsed condition: '{condition}' -> '{parsed}'")
            return parsed
        except Exception as e:
            logger.error(f"Error parsing condition '{condition}': {e}")
            traceback.print_exc()
            # Return the original if parsing fails
            return condition

class BotController:
    """
    Controller that manages all bots for all users.
    Ensures one thread per user per bot and provides controls for configuration/shutdown/reboot.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BotController, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        self.bots = {}  # Dictionary of {user_id: {bot_id: TradingBot}}
        self.running = True
        self.lock = threading.Lock()
        
        # Start monitoring thread
        self.monitor_thread = threading.Thread(target=self._monitor)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        
        logger.info("Bot controller initialized")
    
    def _monitor(self):
        """Monitor thread to check bot status periodically"""
        while self.running:
            try:
                # Check all bots health
                with self.lock:
                    for user_id, user_bots in self.bots.items():
                        for bot_id, bot in user_bots.items():
                            if not bot.thread or not bot.thread.is_alive():
                                if bot.running:
                                    logger.warning(f"Bot {bot_id} for user {user_id} is marked as running but thread is dead. Restarting...")
                                    bot.start()
            except Exception as e:
                logger.error(f"Error in bot monitor: {e}")
                traceback.print_exc()
            
            # Sleep for a while
            time.sleep(60)  # Check every minute
    
    def start_bot(self, user_id: int, bot_id: int, db_session: Session) -> bool:
        """Start a bot for a user"""
        logger.info(f"Starting bot {bot_id} for user {user_id}")
        
        with self.lock:
            # Get bot information from database
            bot = db_session.query(models.Bot).filter(
                models.Bot.id == bot_id,
                models.Bot.user_id == user_id,
                models.Bot.is_active == True
            ).first()
            
            if not bot:
                logger.error(f"Bot {bot_id} not found or inactive for user {user_id}")
                return False
            
            # Create user's bots dict if not exists
            if user_id not in self.bots:
                self.bots[user_id] = {}
            
            # Check if bot is already running
            if bot_id in self.bots[user_id] and self.bots[user_id][bot_id].running:
                logger.info(f"Bot {bot_id} is already running for user {user_id}")
                return True
            
            # Verify that market data is available for this pair/timeframe
            try:
                logger.info(f"Verifying data availability for {bot.pair}/{bot.timeframe}")
                
                # Use asyncio to run the async function
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                try:
                    from app.utils.market_data import test_market_data_access
                    
                    # Run a test to check if data exists
                    test_result = loop.run_until_complete(
                        test_market_data_access(bot.pair, bot.timeframe)
                    )
                    
                    if not test_result["last_price"] and test_result["historical_data_count"] == 0:
                        logger.error(f"No market data available for {bot.pair}/{bot.timeframe}. Bot cannot be started.")
                        
                        # Log available timeframes if any were found
                        if "connection_test" in test_result and test_result["connection_test"]:
                            conn_test = test_result["connection_test"]
                            if "sample_data" in conn_test and conn_test["sample_data"]:
                                available_pairs = list(conn_test["sample_data"].keys())
                                logger.info(f"Available data combinations: {available_pairs}")
                                
                                # Check for both MT5 and normalized formats
                                # MT5 format: EURUSD/M1, EURUSD/H1
                                # Normalized format: EURUSD/1m, EURUSD/1h
                                mt5_prefix = f"{bot.pair}/M"
                                hour_prefix = f"{bot.pair}/H"
                                day_prefix = f"{bot.pair}/D"
                                minute_suffix = f"{bot.pair}/m"
                                hour_suffix = f"{bot.pair}/h"
                                day_suffix = f"{bot.pair}/d"
                                
                                mt5_matches = [p for p in available_pairs if p.startswith(mt5_prefix) or 
                                                                            p.startswith(hour_prefix) or 
                                                                            p.startswith(day_prefix)]
                                normalized_matches = [p for p in available_pairs if p.endswith(minute_suffix) or 
                                                                                  p.endswith(hour_suffix) or 
                                                                                  p.endswith(day_suffix)]
                                
                                all_matches = sorted(set(mt5_matches + normalized_matches))
                                
                                if all_matches:
                                    logger.info(f"Found data for {bot.pair} in these timeframes: {all_matches}")
                                    logger.info(f"Please configure your bot to use one of these timeframes instead of {bot.timeframe}")
                        
                        return False
                    
                    logger.info(f"Data verified for {bot.pair}/{bot.timeframe}. Historical data points: {test_result['historical_data_count']}")
                finally:
                    loop.close()
            except Exception as e:
                logger.error(f"Error verifying market data for {bot.pair}/{bot.timeframe}: {e}")
                # Continue anyway, the bot will handle data availability
            
            # Create trading bot
            trading_bot = TradingBot(
                bot_id=bot.id,
                pair=bot.pair,
                timeframe=bot.timeframe,
                buy_condition=bot.buy_condition,
                sell_condition=bot.sell_condition,
                db_session=db_session,
                telegram_channel=bot.telegram_channel,
                bot_type=bot.bot_type,
                tp_condition=bot.tp_condition,
                sl_condition=bot.sl_condition
            )
            
            # Start the bot
            trading_bot.start()
            
            # Store the bot
            self.bots[user_id][bot_id] = trading_bot
            
            # Update bot status in database
            bot.is_running = True
            db_session.add(bot)
            db_session.commit()
            
            logger.info(f"Bot {bot_id} started for user {user_id}")
            return True
    
    def stop_bot(self, user_id: int, bot_id: int, db_session: Session) -> bool:
        """Stop a bot for a user"""
        logger.info(f"Stopping bot {bot_id} for user {user_id}")
        
        with self.lock:
            # Check if user has any bots
            if user_id not in self.bots:
                logger.warning(f"User {user_id} has no running bots")
                return False
            
            # Check if the specific bot is running
            if bot_id not in self.bots[user_id]:
                logger.warning(f"Bot {bot_id} not running for user {user_id}")
                return False
            
            # Stop the bot and close all trades
            bot = self.bots[user_id][bot_id]
            bot.stop()
            
            # Close any open trades for this bot
            self._close_bot_trades(bot_id, db_session)
            
            # Remove from running bots
            del self.bots[user_id][bot_id]
            
            # Clean up empty user entries
            if not self.bots[user_id]:
                del self.bots[user_id]
            
            # Update bot status in database
            db_bot = db_session.query(models.Bot).filter(
                models.Bot.id == bot_id
            ).first()
            
            if db_bot:
                db_bot.is_running = False
                db_session.add(db_bot)
                db_session.commit()
            
            logger.info(f"Bot {bot_id} stopped for user {user_id}")
            return True
    
    def update_bot_config(self, user_id: int, bot_id: int, config: Dict[str, Any], db_session: Session) -> bool:
        """Update a bot's configuration"""
        logger.info(f"Updating configuration for bot {bot_id} for user {user_id}")
        
        with self.lock:
            # Get the bot from database
            db_bot = db_session.query(models.Bot).filter(
                models.Bot.id == bot_id,
                models.Bot.user_id == user_id
            ).first()
            
            if not db_bot:
                logger.error(f"Bot {bot_id} not found for user {user_id}")
                return False
            
            # Update configuration in database
            for key, value in config.items():
                if hasattr(db_bot, key):
                    setattr(db_bot, key, value)
            
            db_session.add(db_bot)
            db_session.commit()
            
            # If the bot is running, restart it to apply new configuration
            was_running = False
            if user_id in self.bots and bot_id in self.bots[user_id]:
                was_running = self.bots[user_id][bot_id].running
                if was_running:
                    self.stop_bot(user_id, bot_id, db_session)
            
            if was_running:
                return self.start_bot(user_id, bot_id, db_session)
            
            return True
    
    def restart_bot(self, user_id: int, bot_id: int, db_session: Session) -> bool:
        """Restart a bot for a user"""
        logger.info(f"Restarting bot {bot_id} for user {user_id}")
        
        # First stop the bot
        self.stop_bot(user_id, bot_id, db_session)
        
        # Then start it again
        return self.start_bot(user_id, bot_id, db_session)
    
    def stop_all_bots(self, db_session: Session) -> bool:
        """Stop all running bots"""
        logger.info("Stopping all bots")
        
        with self.lock:
            for user_id in list(self.bots.keys()):
                for bot_id in list(self.bots[user_id].keys()):
                    self.stop_bot(user_id, bot_id, db_session)
            
            return True
    
    def _close_bot_trades(self, bot_id: int, db_session: Session) -> None:
        """Close all open trades for a bot"""
        try:
            # Get all open trades for this bot
            open_trades = db_session.query(models.Trade).filter(
                models.Trade.bot_id == bot_id,
                models.Trade.status == "open"
            ).all()
            
            for trade in open_trades:
                # Close the trade
                trade.exit_price = trade.entry_price  # Use entry price for now
                trade.exit_time = datetime.utcnow()
                trade.profit_loss = 0  # No profit/loss when force closing
                trade.profit_loss_percent = 0
                trade.exit_reason = "bot_shutdown"
                trade.status = "closed"
                
                db_session.add(trade)
            
            db_session.commit()
            logger.info(f"Closed {len(open_trades)} open trades for bot {bot_id}")
        except Exception as e:
            logger.error(f"Error closing trades for bot {bot_id}: {e}")
            traceback.print_exc()
    
    def cleanup(self):
        """Clean up resources before shutdown"""
        logger.info("Cleaning up bot controller")
        
        self.running = False
        
        # Use a new database session for cleanup
        from app.core.database import SessionLocal
        db = SessionLocal()
        
        try:
            # Stop all bots
            self.stop_all_bots(db)
            
            # Wait for monitor thread to finish
            if self.monitor_thread:
                self.monitor_thread.join(timeout=5)
        finally:
            db.close()

# Create a singleton instance
bot_controller = BotController()

# Add a unit test to validate the condition parser 
def test_condition_parser():
    """
    Simple test function to validate the condition parser logic.
    This can be run manually to check if the parser is working correctly.
    
    Example usage:
        from app.bots.trading_bot import test_condition_parser
        test_condition_parser()
    """
    # Create a dummy bot instance for testing
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        dummy_bot = TradingBot(
            bot_id=0,
            pair="EURUSD",
            timeframe="M1",
            buy_condition="",
            sell_condition="",
            db_session=db
        )
        
        # Test cases
        test_cases = [
            # Simple indicator with current price
            ("SimpleMovingAverage(SMA)1 < current_price", "SMA_1 < close"),
            # Multiple indicators
            ("SimpleMovingAverage(SMA)14 > SimpleMovingAverage(SMA)50", "SMA_14 > SMA_50"),
            # RSI conditions
            ("RelativeStrengthIndex(RSI)14 < 30", "RSI_14 < 30"),
            # Complex conditions with multiple indicators and operators
            ("SimpleMovingAverage(SMA)5 > SimpleMovingAverage(SMA)20 and RelativeStrengthIndex(RSI)14 < 50", 
             "SMA_5 > SMA_20 and RSI_14 < 50"),
            # With open, high, low, close references
            ("SimpleMovingAverage(SMA)9 > open and RelativeStrengthIndex(RSI)14 < 40", 
             "SMA_9 > open and RSI_14 < 40"),
            # With current_price
            ("current_price > SimpleMovingAverage(SMA)200", "close > SMA_200"),
            # With both current_price and another price reference
            ("current_price > SimpleMovingAverage(SMA)200 and close < high", 
             "close > SMA_200 and close < high"),
            # MACD conditions
            ("MovingAverageConvergenceDivergence(MACD)12 > 0", "MACD_12 > 0")
        ]
        
        # Run tests
        for input_condition, expected_output in test_cases:
            actual_output = dummy_bot._parse_condition(input_condition)
            success = actual_output == expected_output
            
            print(f"Input:    {input_condition}")
            print(f"Expected: {expected_output}")
            print(f"Actual:   {actual_output}")
            print(f"Result:   {'✓ PASS' if success else '✗ FAIL'}")
            print("-" * 80)
            
            if not success:
                logger.error(f"Test failed for condition: {input_condition}")
                logger.error(f"Expected: {expected_output}, but got: {actual_output}")
                
    finally:
        db.close() 