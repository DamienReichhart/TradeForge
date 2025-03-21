import logging
import os
from typing import Dict, Optional
import asyncio
from telegram import Update, Bot
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

from sqlalchemy.orm import Session
from app.models.user import User

logger = logging.getLogger(__name__)

class TelegramBotService:
    _instance = None
    _bot = None
    _application = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TelegramBotService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        self.token = os.getenv("TELEGRAM_BOT_TOKEN")
        if not self.token:
            logger.error("TELEGRAM_BOT_TOKEN environment variable not set")
            return
        
        try:
            self._bot = Bot(token=self.token)
            self._application = ApplicationBuilder().token(self.token).build()
            
            # Register command handlers
            self._application.add_handler(CommandHandler("start", self._start_command))
            
            # Start the bot in a separate thread
            asyncio.create_task(self._run_bot())
            logger.info("Telegram bot initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Telegram bot: {e}")
    
    async def _run_bot(self):
        """Run the Telegram bot in the background"""
        if self._application:
            await self._application.initialize()
            await self._application.start()
            await self._application.updater.start_polling()
            logger.info("Telegram bot started polling for updates")
    
    async def _start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle the /start command"""
        if not update.effective_user:
            return
        
        # Get username from the Telegram user
        telegram_username = update.effective_user.username
        
        if not telegram_username:
            await update.message.reply_text(
                "Please set a username in your Telegram settings first, then try again."
            )
            return
        
        # Check if the username exists in the database
        from app.core.database import SessionLocal
        db = SessionLocal()
        
        try:
            user = db.query(User).filter(User.telegram_username == telegram_username).first()
            
            if user:
                await update.message.reply_text(
                    f"Hi {telegram_username}! Your Telegram account is now successfully connected to TradeForge. " 
                    f"You will receive notifications about your trading activities."
                )
            else:
                await update.message.reply_text(
                    f"Hi {telegram_username}! It looks like your Telegram username hasn't been registered in TradeForge yet. "
                    f"Please go to Settings in your TradeForge account and set up your Telegram username to match: {telegram_username}"
                )
        except Exception as e:
            logger.error(f"Error verifying Telegram username: {e}")
            await update.message.reply_text(
                "An error occurred while verifying your account. Please try again later."
            )
        finally:
            db.close()
    
    async def send_message(self, telegram_username: str, message: str) -> bool:
        """Send a message to a user by their Telegram username"""
        if not self._bot or not telegram_username:
            return False
        
        try:
            # In a real implementation, you would need to store chat_ids mapped to usernames
            # For now, we'll just use the username and send a message to that username
            await self._bot.send_message(chat_id=f"@{telegram_username}", text=message)
            return True
        except Exception as e:
            logger.error(f"Failed to send message to {telegram_username}: {e}")
            return False

# Create a singleton instance
telegram_bot_service = TelegramBotService() 