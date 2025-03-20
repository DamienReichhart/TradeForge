import asyncio
from typing import Optional
from datetime import datetime

from telegram import Bot
from app.core.config import settings

async def send_message(chat_id: str, message: str) -> bool:
    """
    Send a message to a Telegram chat.
    
    Args:
        chat_id: The chat ID where to send the message
        message: The message to send
        
    Returns:
        bool: True if the message was sent successfully
    """
    try:
        bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
        await bot.send_message(chat_id=chat_id, text=message, parse_mode="Markdown")
        return True
    except Exception as e:
        print(f"Error sending Telegram message: {e}")
        return False

def send_trade_signal(
    chat_id: str,
    bot_name: str,
    action: str,
    pair: str,
    price: float,
    indicators_values: Optional[dict] = None
) -> bool:
    """
    Send a trade signal notification.
    
    Args:
        chat_id: The chat ID where to send the message
        bot_name: The name of the bot that generated the signal
        action: 'BUY' or 'SELL'
        pair: The trading pair (e.g., 'BTC/USD')
        price: The entry or exit price
        indicators_values: Dictionary with indicator values
        
    Returns:
        bool: True if the message was sent successfully
    """
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    message = f"*{action.upper()} SIGNAL - {bot_name}*\n\n"
    message += f"📊 Pair: *{pair}*\n"
    message += f"💰 Price: *{price}*\n"
    message += f"⏰ Time: *{now}*\n\n"
    
    if indicators_values:
        message += "*Indicator Values:*\n"
        for name, value in indicators_values.items():
            if isinstance(value, float):
                formatted_value = f"{value:.6f}"
            else:
                formatted_value = str(value)
            message += f"- {name}: *{formatted_value}*\n"
    
    # Run in a separate thread to avoid blocking
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(send_message(chat_id, message))
    loop.close()
    
    return result 