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
            last_data = loop.run_until_complete(
                market_data.get_last_price(self.pair, self.timeframe)
            )
            
            # If no data or if we've already checked this candle, skip
            if not last_data or (self.last_check and last_data['time'] == self.last_check):
                return
            
            # Get some historical data for indicators
            end_date = datetime.fromisoformat(last_data['time'].replace('Z', '+00:00'))
            
            # Get data for the last 200 candles (or what's appropriate for your indicators)
            # This is to have enough data to calculate indicators
            if 'h' in self.timeframe:
                start_date = end_date - pd.Timedelta(hours=200)
            else:
                start_date = end_date - pd.Timedelta(days=200)
            
            historical_data = loop.run_until_complete(
                market_data.get_historical_data(
                    self.pair, 
                    self.timeframe,
                    start_date,
                    end_date
                )
            )
            
            # Convert to DataFrame
            df = market_data.get_dataframe(historical_data)
            
            # Calculate indicators
            df = calculate_indicators(df, self.indicators)
            
            # Evaluate conditions on the last row
            last_row = df.iloc[-1].to_dict()
            
            # Check if there's an open trade for this bot
            open_trade = self.db_session.query(models.Trade).filter(
                models.Trade.bot_id == self.bot_id,
                models.Trade.status == 'open'
            ).first()
            
            if open_trade:
                # We have an open trade, check sell condition
                try:
                    # For advanced bots, also check TP/SL levels
                    if self.bot_type == "advanced" and (open_trade.tp_price or open_trade.sl_price):
                        current_price = last_row.get('close', 0)
                        
                        # Check if TP hit
                        if open_trade.tp_price and current_price >= open_trade.tp_price:
                            # Close trade at TP
                            self._close_trade(open_trade, last_row, exit_reason="tp")
                            return
                        
                        # Check if SL hit
                        if open_trade.sl_price and current_price <= open_trade.sl_price:
                            # Close trade at SL
                            self._close_trade(open_trade, last_row, exit_reason="sl")
                            return
                    
                    # Check sell condition for both standard and advanced bots
                    sell_result = eval(self.sell_condition, {"np": np, "pd": pd}, last_row)
                    
                    if sell_result:
                        # Close the trade
                        self._close_trade(open_trade, last_row, exit_reason="sell_condition")
                except Exception as e:
                    logger.error(f"Error evaluating sell condition: {e}")
                    traceback.print_exc()
            else:
                # No open trade, check buy condition
                try:
                    buy_result = eval(self.buy_condition, {"np": np, "pd": pd}, last_row)
                    
                    if buy_result:
                        # Open a new trade
                        self._open_trade(last_row)
                except Exception as e:
                    logger.error(f"Error evaluating buy condition: {e}")
                    traceback.print_exc()
            
            # Update last check time
            self.last_check = last_data['time']
            
        except Exception as e:
            logger.error(f"Error in check_and_execute: {e}")
            traceback.print_exc()
        finally:
            loop.close()
    
    def _open_trade(self, data: Dict[str, Any]):
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
                    # Evaluate TP condition to get a multiplier or direct price
                    tp_result = eval(self.tp_condition, {"np": np, "pd": pd}, data)
                    
                    # Check if tp_result is a number (percentage/multiplier or direct price)
                    if isinstance(tp_result, (int, float)):
                        # If tp_result > 10, assume it's a direct price
                        if abs(tp_result) > 10:
                            tp_price = tp_result
                        else:
                            # It's a multiplier/percentage
                            tp_price = entry_price * (1 + tp_result / 100)
                except Exception as e:
                    logger.error(f"Error calculating TP price: {e}")
                    traceback.print_exc()
            
            if self.bot_type == "advanced" and self.sl_condition:
                try:
                    # Evaluate SL condition to get a multiplier or direct price
                    sl_result = eval(self.sl_condition, {"np": np, "pd": pd}, data)
                    
                    # Check if sl_result is a number (percentage/multiplier or direct price)
                    if isinstance(sl_result, (int, float)):
                        # If sl_result > 10, assume it's a direct price
                        if abs(sl_result) > 10:
                            sl_price = sl_result
                        else:
                            # It's a multiplier/percentage
                            sl_price = entry_price * (1 - sl_result / 100)
                except Exception as e:
                    logger.error(f"Error calculating SL price: {e}")
                    traceback.print_exc()
            
            # Create a new trade
            trade = models.Trade(
                bot_id=self.bot_id,
                pair=self.pair,
                timeframe=self.timeframe,
                type="buy",
                entry_price=entry_price,
                tp_price=tp_price,
                sl_price=sl_price,
                quantity=1.0,  # Fixed quantity for simplicity
                status="open",
                entry_time=pd.to_datetime(data.name),  # Use index as timestamp
                indicators_values={
                    k: v for k, v in data.items() 
                    if k not in ['open', 'high', 'low', 'close', 'volume', 'tick_volume', 'spread', 'real_volume']
                }
            )
            
            self.db_session.add(trade)
            self.db_session.commit()
            
            logger.info(f"Opened trade {trade.id} at price {entry_price}")
            
            # Send Telegram notification if configured
            if self.telegram_channel:
                bot = self.db_session.query(models.Bot).filter(models.Bot.id == self.bot_id).first()
                bot_name = bot.name if bot else f"Bot {self.bot_id}"
                
                message_parts = [
                    f"BUY SIGNAL - {bot_name}",
                    f"Pair: {self.pair}",
                    f"Price: {entry_price}"
                ]
                
                if tp_price:
                    message_parts.append(f"Take Profit: {tp_price}")
                
                if sl_price:
                    message_parts.append(f"Stop Loss: {sl_price}")
                
                message = "\n\n".join(message_parts)
                
                telegram.send_trade_signal(
                    chat_id=self.telegram_channel,
                    bot_name=bot_name,
                    action="BUY",
                    pair=self.pair,
                    price=entry_price,
                    indicators_values=trade.indicators_values
                )
        
        except Exception as e:
            logger.error(f"Error opening trade: {e}")
            traceback.print_exc()
    
    def _close_trade(self, trade: models.Trade, data: Dict[str, Any], exit_reason: str = "sell_condition"):
        """Close an existing trade based on the current data"""
        try:
            # For simplicity, we'll use the close price
            exit_price = data.get('close')
            
            if not exit_price:
                logger.error("No exit price available")
                return
            
            # Calculate profit/loss
            profit_loss = (exit_price - trade.entry_price) * trade.quantity
            profit_loss_percent = (profit_loss / (trade.entry_price * trade.quantity)) * 100
            
            # Update the trade
            trade.exit_price = exit_price
            trade.exit_time = pd.to_datetime(data.name)  # Use index as timestamp
            trade.profit_loss = profit_loss
            trade.profit_loss_percent = profit_loss_percent
            trade.status = "closed"
            trade.exit_reason = exit_reason
            
            self.db_session.add(trade)
            self.db_session.commit()
            
            logger.info(f"Closed trade {trade.id} at price {exit_price} with P/L: {profit_loss:.2f} ({profit_loss_percent:.2f}%) - Exit Reason: {exit_reason}")
            
            # Send Telegram notification if configured
            if self.telegram_channel:
                bot = self.db_session.query(models.Bot).filter(models.Bot.id == self.bot_id).first()
                bot_name = bot.name if bot else f"Bot {self.bot_id}"
                
                message = f"SELL SIGNAL - {bot_name}\n\n"
                message += f"Pair: {self.pair}\n"
                message += f"Price: {exit_price}\n"
                message += f"P/L: {profit_loss:.2f} ({profit_loss_percent:.2f}%)\n"
                message += f"Time: {trade.exit_time.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
                message += f"Exit Reason: {exit_reason}"
                
                # Adding indicators values would require storing both the entry and exit indicators
                # For simplicity, we're just using the basic trade info
                
                telegram.send_trade_signal(
                    chat_id=self.telegram_channel,
                    bot_name=bot_name,
                    action="SELL",
                    pair=self.pair,
                    price=exit_price,
                    indicators_values={"profit_loss": profit_loss, "profit_loss_percent": profit_loss_percent}
                )
        
        except Exception as e:
            logger.error(f"Error closing trade: {e}")
            traceback.print_exc() 