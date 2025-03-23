# Import mt5linux client
import mt5linux.client as mt5
import requests
import time
import logging
import threading
import os
import json
import random  # For generating mock data
from datetime import datetime, timedelta
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ---------------------------
# CONFIGURATION & CONSTANTS
# ---------------------------

# API Configuration
API_URL = os.getenv("API_URL")
API_USERNAME = os.getenv("MARKET_RATES_API_USERNAME")
API_PASSWORD = os.getenv("MARKET_RATES_API_PASSWORD")
MOCK_API = os.getenv("MOCK_API", "true").lower() == "true"  # Default to mock mode

# Start date for historical fill
START_FILL_DATE = datetime(2018, 1, 1)

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(message)s"
LOG_FILE = os.getenv("LOG_FILE", "inserter.log")

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("inserter")

# Connect to MT5 server
try:
    logger.info("Connecting to MT5 server...")
    server_addr = os.getenv("MT5_SERVER_ADDR", "mt5linux")
    server_port = int(os.getenv("MT5_SERVER_PORT", "8222"))
    
    # Connect with retry
    for i in range(5):
        try:
            mt5.connect(server_addr, server_port)
            logger.info(f"Successfully connected to MT5 server at {server_addr}:{server_port}")
            break
        except Exception as e:
            logger.warning(f"Failed to connect to MT5 server (attempt {i+1}/5): {e}")
            time.sleep(5)
    else:
        logger.error("Failed to connect to MT5 server after 5 attempts")
        raise Exception("Failed to connect to MT5 server")
except Exception as e:
    logger.error(f"Failed to connect to MT5 server: {e}")
    raise

# Configure retry settings
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
RETRY_WAIT_MULTIPLIER = float(os.getenv("RETRY_WAIT_MULTIPLIER", "1.0"))
RETRY_MAX_WAIT = float(os.getenv("RETRY_MAX_WAIT", "10.0"))

# ---------------------------
# Time frames
# ---------------------------
TIMEFRAMES = {
    "M1": mt5.TIMEFRAME_M1,
    "M5": mt5.TIMEFRAME_M5,
    "M15": mt5.TIMEFRAME_M15,
    "M30": mt5.TIMEFRAME_M30,
    "H1": mt5.TIMEFRAME_H1,
    "H4": mt5.TIMEFRAME_H4,
    "D1": mt5.TIMEFRAME_D1
}

# Symbols to collect data for
symbols = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD", 
           "EURJPY", "EURGBP", "EURCHF", "AUDJPY", "GBPJPY", "CHFJPY"]

# ---------------------------
# API Authentication
# ---------------------------
def get_auth_token():
    """Get an authentication token from the API."""
    if MOCK_API:
        logger.debug("MOCK MODE: Returning fake auth token")
        return "mock_auth_token"
        
    # Use form data instead of JSON for FastAPI's OAuth2PasswordRequestForm
    auth_data = {
        "username": API_USERNAME,
        "password": API_PASSWORD
    }
    
    # Updated endpoint to match the actual API structure
    logger.debug(f"Getting auth token from {API_URL}/token")
    
    try:
        response = requests.post(
            f"{API_URL}/token",
            data=auth_data,  # Changed from json to data for form submission
            timeout=10  # Add timeout
        )
        
        response.raise_for_status()
        
        token_data = response.json()
        return token_data["access_token"]
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to get auth token: {e}")
        if MOCK_API:
            return "mock_auth_token_after_error"
        raise

# ---------------------------
# Mock rates generation
# ---------------------------
def generate_mock_candle(symbol, timestamp):
    """Generate mock candle data for testing."""
    # Base prices for common forex pairs
    base_prices = {
        "EURUSD": 1.10,
        "GBPUSD": 1.30,
        "USDJPY": 110.0,
        "AUDUSD": 0.70,
        "USDCAD": 1.35,
        "USDCHF": 0.95,
        "NZDUSD": 0.65,
        "EURJPY": 120.0,
        "EURGBP": 0.85,
        "EURCHF": 1.05,
        "AUDJPY": 77.0,
        "GBPJPY": 140.0,
        "CHFJPY": 115.0
    }
    
    # Get base price for the symbol
    base = base_prices.get(symbol, 1.0)
    
    # Add some randomness
    price_change = (random.random() - 0.5) * 0.02 * base
    
    # Calculate OHLC
    open_price = base + price_change
    high_price = open_price + random.random() * 0.01 * base
    low_price = open_price - random.random() * 0.01 * base
    close_price = (high_price + low_price) / 2 + (random.random() - 0.5) * 0.005 * base
    
    # Generate volume
    volume = int(random.random() * 1000) + 100
    
    return {
        "time": timestamp,
        "open": round(open_price, 5),
        "high": round(high_price, 5),
        "low": round(low_price, 5),
        "close": round(close_price, 5),
        "tick_volume": volume,
        "spread": random.randint(1, 10),
        "real_volume": volume
    }

# ---------------------------
# MT5 DATA COLLECTION
# ---------------------------
def get_candles(symbol, timeframe, from_date, to_date):
    """
    Get candles from MT5. This is a mock implementation.
    """
    logger.debug(f"Getting {symbol} {timeframe} candles from {from_date} to {to_date}")
    
    # Calculate the number of candles to generate
    if timeframe == mt5.TIMEFRAME_M1:
        interval_minutes = 1
    elif timeframe == mt5.TIMEFRAME_M5:
        interval_minutes = 5
    elif timeframe == mt5.TIMEFRAME_M15:
        interval_minutes = 15
    elif timeframe == mt5.TIMEFRAME_M30:
        interval_minutes = 30
    elif timeframe == mt5.TIMEFRAME_H1:
        interval_minutes = 60
    elif timeframe == mt5.TIMEFRAME_H4:
        interval_minutes = 240
    elif timeframe == mt5.TIMEFRAME_D1:
        interval_minutes = 1440
    else:
        interval_minutes = 60  # Default to 1 hour
        
    delta = to_date - from_date
    total_minutes = delta.total_seconds() / 60
    num_candles = int(total_minutes / interval_minutes) + 1
    
    # Generate candles
    candles = []
    current_time = from_date
    for _ in range(num_candles):
        candle = generate_mock_candle(symbol, current_time)
        candles.append(candle)
        current_time += timedelta(minutes=interval_minutes)
        
        # Don't exceed the to_date
        if current_time > to_date:
            break
            
    return candles

# ---------------------------
# API OPERATIONS
# ---------------------------
def insert_rates(symbol, timeframe_label, rates):
    """Insert rates into the API."""
    if not rates:
        logger.warning(f"No rates to insert for {symbol} {timeframe_label}")
        return
    
    # In mock mode, just log and return success
    if MOCK_API:
        logger.info(f"MOCK MODE: Successfully inserted {len(rates)} {symbol} {timeframe_label} rates")
        return {"status": "success", "inserted": len(rates)}
        
    try:
        token = get_auth_token()
        
        # Prepare data in the format expected by the API
        rates_data = []
        for rate in rates:
            # Convert datetime to string format
            if isinstance(rate["time"], datetime):
                time_str = rate["time"].strftime("%Y-%m-%dT%H:%M:%S")
            else:
                time_str = rate["time"]
                
            rates_data.append({
                "symbol": symbol,
                "timeframe": timeframe_label,
                "time": time_str,
                "open": rate["open"],
                "high": rate["high"],
                "low": rate["low"],
                "close": rate["close"],
                "tick_volume": rate["tick_volume"],
                "spread": rate["spread"],
                "real_volume": rate["real_volume"]
            })
        
        logger.debug(f"Inserting {len(rates_data)} {symbol} {timeframe_label} rates into API")
        
        # Updated endpoint to match the actual API structure and format
        response = requests.post(
            f"{API_URL}/data",
            headers={"Authorization": f"Bearer {token}"},
            json=rates_data,
            timeout=30  # Longer timeout for potentially large data
        )
        
        response.raise_for_status()
        result = response.json()
        
        logger.info(f"Inserted {len(rates_data)} {symbol} {timeframe_label} rates. Result: {result}")
        return result
    except requests.exceptions.RequestException as e:
        logger.error(f"Error inserting rates for {symbol} {timeframe_label}: {e}")
        # In case of error in non-mock mode, we'll still return a result to prevent crashes
        return {"status": "error", "message": str(e)}

# ---------------------------
# DATA COLLECTION OPERATIONS
# ---------------------------
def historical_fill():
    """Fill the API with historical data."""
    for symbol in symbols:
        for timeframe_label, tf_constant in TIMEFRAMES.items():
            logger.info(f"Starting historical fill for {symbol} {timeframe_label}")
            
            from_date = START_FILL_DATE
            to_date = datetime.now()
            
            # Break up into smaller chunks (e.g., monthly)
            while from_date < to_date:
                chunk_to_date = min(from_date + timedelta(days=30), to_date)
                
                logger.info(f"Getting historical data for {symbol} {timeframe_label} from {from_date} to {chunk_to_date}")
                
                try:
                    candles = get_candles(symbol, tf_constant, from_date, chunk_to_date)
                    
                    if candles:
                        insert_rates(symbol, timeframe_label, candles)
                        logger.info(f"Inserted {len(candles)} historical candles for {symbol} {timeframe_label}")
                    else:
                        logger.warning(f"No historical data available for {symbol} {timeframe_label} from {from_date} to {chunk_to_date}")
                    
                    from_date = chunk_to_date
                    time.sleep(0.5)  # Small delay to avoid overwhelming the API
                except Exception as e:
                    logger.error(f"Error processing historical data for {symbol} {timeframe_label}: {e}")
                    # Continue with next chunk instead of failing completely
                    from_date = chunk_to_date
                    time.sleep(1)  # Slightly longer delay after error

def live_update_worker(symbol, timeframe_label, timeframe):
    """Worker function for live updates."""
    while True:
        try:
            # Get the current time
            now = datetime.now()
            
            # Calculate the start time based on the timeframe
            if timeframe == mt5.TIMEFRAME_M1:
                from_date = now - timedelta(minutes=10)
            elif timeframe == mt5.TIMEFRAME_M5:
                from_date = now - timedelta(minutes=50)
            elif timeframe == mt5.TIMEFRAME_M15:
                from_date = now - timedelta(minutes=150)
            elif timeframe == mt5.TIMEFRAME_M30:
                from_date = now - timedelta(minutes=300)
            elif timeframe == mt5.TIMEFRAME_H1:
                from_date = now - timedelta(hours=10)
            elif timeframe == mt5.TIMEFRAME_H4:
                from_date = now - timedelta(hours=40)
            elif timeframe == mt5.TIMEFRAME_D1:
                from_date = now - timedelta(days=10)
            else:
                from_date = now - timedelta(hours=24)
                
            logger.debug(f"Getting recent data for {symbol} {timeframe_label}")
            
            candles = get_candles(symbol, timeframe, from_date, now)
            
            if candles:
                insert_rates(symbol, timeframe_label, candles)
                logger.debug(f"Inserted {len(candles)} recent candles for {symbol} {timeframe_label}")
            else:
                logger.warning(f"No recent data available for {symbol} {timeframe_label}")
            
            # Sleep based on the timeframe
            if timeframe == mt5.TIMEFRAME_M1:
                sleep_time = 60  # 1 minute
            elif timeframe == mt5.TIMEFRAME_M5:
                sleep_time = 300  # 5 minutes
            elif timeframe == mt5.TIMEFRAME_M15:
                sleep_time = 900  # 15 minutes
            elif timeframe == mt5.TIMEFRAME_M30:
                sleep_time = 1800  # 30 minutes
            elif timeframe == mt5.TIMEFRAME_H1:
                sleep_time = 3600  # 1 hour
            elif timeframe == mt5.TIMEFRAME_H4:
                sleep_time = 14400  # 4 hours
            elif timeframe == mt5.TIMEFRAME_D1:
                sleep_time = 86400  # 1 day
            else:
                sleep_time = 3600  # Default to 1 hour
                
            time.sleep(sleep_time)
            
        except Exception as e:
            logger.error(f"Error in live update worker for {symbol} {timeframe_label}: {e}")
            time.sleep(60)  # Sleep for a minute before retrying

# ---------------------------
# MAIN EXECUTION
# ---------------------------

if __name__ == "__main__":
    try:
        if MOCK_API:
            logger.info("Starting in MOCK API mode - no actual API calls will be made")
            
        logger.info("Starting historical fill...")
        historical_fill()
        logger.info("Historical fill complete. Starting live update threads...")

        threads = []
        for symbol in symbols:
            for timeframe_label, tf_constant in TIMEFRAMES.items():
                thread = threading.Thread(
                    target=live_update_worker,
                    args=(symbol, timeframe_label, tf_constant),
                    daemon=True
                )
                thread.start()
                threads.append(thread)
                # Small delay to avoid overwhelming the API
                time.sleep(0.2)
                
        logger.info(f"Started {len(threads)} update threads")

        # Keep the main thread alive
        while True:
            active_count = sum(1 for t in threads if t.is_alive())
            logger.info(f"Active threads: {active_count}/{len(threads)}")
            time.sleep(60)

    except KeyboardInterrupt:
        logger.info("Script interrupted by user.")
    except Exception as e:
        logger.critical(f"Unexpected error: {e}")
    finally:
        logger.info("Shutting down MetaTrader5 connection")
        mt5.disconnect()
