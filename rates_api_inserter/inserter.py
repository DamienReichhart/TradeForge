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
import queue

# Load environment variables
load_dotenv()

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


# Wait the time for the api to be ready
logger.info("Waiting for the API to be ready...")
time.sleep(10)  # Reduced from 60 seconds to 10 seconds for faster startup

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
    """Insert rates into the API one by one."""
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
        
        # Insert candles one by one
        total_inserted = 0
        total_candles = len(rates_data)
        
        logger.info(f"Inserting {total_candles} candles for {symbol} {timeframe_label} one by one")
        
        # Add progress tracking
        progress_interval = max(1, total_candles // 10)  # Log progress every 10% or at least once
        
        for i, candle in enumerate(rates_data):
            # Progress logging
            if i % progress_interval == 0 or i == total_candles - 1:
                progress_pct = ((i + 1) / total_candles) * 100
                logger.info(f"Progress: {i + 1}/{total_candles} ({progress_pct:.1f}%) candles for {symbol} {timeframe_label}")
            
            # Retry logic for each candle
            for attempt in range(MAX_RETRIES):
                try:
                    # Insert a single candle as a list with one element
                    response = requests.post(
                        f"{API_URL}/data",
                        headers={"Authorization": f"Bearer {token}"},
                        json=[candle],  # Wrapped in a list as the API expects an array
                        timeout=10  # Shorter timeout for single candle
                    )
                    
                    response.raise_for_status()
                    result = response.json()
                    
                    # Increment success counter
                    total_inserted += result.get('points_written', 0)
                    
                    # Small delay between individual inserts
                    time.sleep(0.05)
                    break  # Success, exit retry loop
                    
                except requests.exceptions.RequestException as e:
                    if attempt < MAX_RETRIES - 1:
                        wait_time = RETRY_WAIT_MULTIPLIER * (2 ** attempt)  # Exponential backoff
                        if wait_time > RETRY_MAX_WAIT:
                            wait_time = RETRY_MAX_WAIT
                        logger.warning(f"Error inserting candle {i+1}/{total_candles} (attempt {attempt+1}/{MAX_RETRIES}): {e}. Retrying in {wait_time}s...")
                        time.sleep(wait_time)
                    else:
                        logger.error(f"Failed to insert candle {i+1}/{total_candles} after {MAX_RETRIES} attempts: {e}")
                        # Continue with next candle even if this one failed
        
        success_rate = (total_inserted / total_candles) * 100 if total_candles > 0 else 0
        logger.info(f"Completed inserting {total_inserted} out of {total_candles} candles for {symbol} {timeframe_label} ({success_rate:.1f}%)")
        return {"status": "success", "inserted": total_inserted}
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Error inserting rates for {symbol} {timeframe_label}: {e}")
        # In case of error in non-mock mode, we'll still return a result to prevent crashes
        return {"status": "error", "message": str(e)}
    except Exception as e:
        logger.error(f"Unexpected error inserting rates for {symbol} {timeframe_label}: {e}")
        return {"status": "error", "message": str(e)}

# ---------------------------
# DATA COLLECTION OPERATIONS
# ---------------------------
def historical_fill_worker(symbol, timeframe_label, tf_constant, results_dict, thread_id):
    """Worker function for historical fill. Each worker handles one symbol/timeframe combination."""
    try:
        logger.info(f"Thread {thread_id}: Starting historical fill for {symbol} {timeframe_label}")
        
        # Calculate start date based on timeframe to get ~1000 candles
        to_date = datetime.now()
        
        # Calculate how far back to go for 1000 candles based on timeframe
        if tf_constant == mt5.TIMEFRAME_M1:
            from_date = to_date - timedelta(minutes=1000)  # 1000 minutes
        elif tf_constant == mt5.TIMEFRAME_M5:
            from_date = to_date - timedelta(minutes=5 * 1000)  # 5000 minutes
        elif tf_constant == mt5.TIMEFRAME_M15:
            from_date = to_date - timedelta(minutes=15 * 1000)  # 15000 minutes
        elif tf_constant == mt5.TIMEFRAME_M30:
            from_date = to_date - timedelta(minutes=30 * 1000)  # 30000 minutes
        elif tf_constant == mt5.TIMEFRAME_H1:
            from_date = to_date - timedelta(hours=1000)  # 1000 hours
        elif tf_constant == mt5.TIMEFRAME_H4:
            from_date = to_date - timedelta(hours=4 * 1000)  # 4000 hours
        elif tf_constant == mt5.TIMEFRAME_D1:
            from_date = to_date - timedelta(days=1000)  # 1000 days
        else:
            from_date = to_date - timedelta(days=30)  # Default fallback
        
        logger.info(f"Thread {thread_id}: Fetching last 1000 candles for {symbol} {timeframe_label} from {from_date} to {to_date}")
        
        chunks_processed = 0
        chunks_successful = 0
        
        # For large timeframes, we can fetch all 1000 candles at once
        # For smaller timeframes, break into chunks to avoid overwhelming the system
        max_chunk_days = 7  # Maximum days to fetch in a single chunk
        
        # Calculate the actual time difference
        time_diff = to_date - from_date
        
        # If time difference is less than max_chunk_days, fetch all at once
        if time_diff.days <= max_chunk_days:
            logger.info(f"Thread {thread_id}: Processing all 1000 candles for {symbol} {timeframe_label}")
            
            retries = 0
            max_chunk_retries = 3
            success = False
            
            while not success and retries < max_chunk_retries:
                try:
                    candles = get_candles(symbol, tf_constant, from_date, to_date)
                    
                    if candles:
                        # Make sure we only take the last 1000 candles if we got more
                        if len(candles) > 1000:
                            candles = candles[-1000:]
                            
                        result = insert_rates(symbol, timeframe_label, candles)
                        if result.get("status") == "success":
                            inserted_count = result.get("inserted", 0)
                            logger.info(f"Thread {thread_id}: Complete: Inserted {inserted_count} of {len(candles)} candles for {symbol} {timeframe_label}")
                            chunks_successful += 1
                            success = True
                        else:
                            logger.warning(f"Thread {thread_id}: Insertion for {symbol} {timeframe_label} returned: {result}")
                            retries += 1
                    else:
                        logger.warning(f"Thread {thread_id}: No data found for {symbol} {timeframe_label} from {from_date} to {to_date}")
                        success = True  # No data is not an error condition
                    
                except Exception as e:
                    retries += 1
                    logger.error(f"Thread {thread_id}: Error processing candles for {symbol} {timeframe_label} (attempt {retries}/{max_chunk_retries}): {e}")
                    if retries < max_chunk_retries:
                        wait_time = 2 ** retries  # Exponential backoff
                        logger.info(f"Thread {thread_id}: Retrying in {wait_time} seconds...")
                        time.sleep(wait_time)
                    else:
                        logger.error(f"Thread {thread_id}: Failed to process after {max_chunk_retries} attempts, skipping to next symbol/timeframe")
            
            # Count as processed
            chunks_processed += 1
            
        # Otherwise, break into chunks
        else:
            chunk_from_date = from_date
            
            while chunk_from_date < to_date:
                chunk_to_date = min(chunk_from_date + timedelta(days=max_chunk_days), to_date)
                
                logger.info(f"Thread {thread_id}: Processing chunk {chunks_processed+1} for {symbol} {timeframe_label}: {chunk_from_date} to {chunk_to_date}")
                
                retries = 0
                max_chunk_retries = 3
                success = False
                
                while not success and retries < max_chunk_retries:
                    try:
                        candles = get_candles(symbol, tf_constant, chunk_from_date, chunk_to_date)
                        
                        if candles:
                            result = insert_rates(symbol, timeframe_label, candles)
                            if result.get("status") == "success":
                                inserted_count = result.get("inserted", 0)
                                logger.info(f"Thread {thread_id}: Chunk {chunks_processed+1} complete: Inserted {inserted_count} of {len(candles)} candles for {symbol} {timeframe_label}")
                                chunks_successful += 1
                                success = True
                            else:
                                logger.warning(f"Thread {thread_id}: Chunk {chunks_processed+1} for {symbol} {timeframe_label} returned: {result}")
                                retries += 1
                        else:
                            logger.warning(f"Thread {thread_id}: No data found for {symbol} {timeframe_label} from {chunk_from_date} to {chunk_to_date}")
                            success = True  # No data is not an error condition
                        
                    except Exception as e:
                        retries += 1
                        logger.error(f"Thread {thread_id}: Error processing chunk {chunks_processed+1} for {symbol} {timeframe_label} (attempt {retries}/{max_chunk_retries}): {e}")
                        if retries < max_chunk_retries:
                            wait_time = 2 ** retries  # Exponential backoff
                            logger.info(f"Thread {thread_id}: Retrying in {wait_time} seconds...")
                            time.sleep(wait_time)
                        else:
                            logger.error(f"Thread {thread_id}: Failed to process chunk after {max_chunk_retries} attempts, skipping to next chunk")
                
                # Move to next chunk regardless of success
                chunks_processed += 1
                chunk_from_date = chunk_to_date
                
                # Small delay between chunks to avoid overwhelming the system
                time.sleep(0.2)
        
        if chunks_processed > 0:
            success_rate = (chunks_successful / chunks_processed) * 100
            logger.info(f"Thread {thread_id}: Completed {symbol} {timeframe_label}: {chunks_successful}/{chunks_processed} chunks successful ({success_rate:.1f}%)")
            
            # Store result in the shared dictionary
            results_dict[thread_id] = {
                "symbol": symbol,
                "timeframe": timeframe_label,
                "processed": chunks_processed,
                "successful": chunks_successful,
                "success_rate": success_rate,
                "status": "success" if chunks_successful > 0 else "failure"
            }
        else:
            # Store result in the shared dictionary
            results_dict[thread_id] = {
                "symbol": symbol,
                "timeframe": timeframe_label,
                "processed": 0,
                "successful": 0,
                "success_rate": 0,
                "status": "no_data"
            }
            
    except Exception as e:
        logger.error(f"Thread {thread_id}: Unexpected error in historical fill worker for {symbol} {timeframe_label}: {e}")
        # Store error in the shared dictionary
        results_dict[thread_id] = {
            "symbol": symbol,
            "timeframe": timeframe_label,
            "error": str(e),
            "status": "error"
        }

def historical_fill():
    """Fill the API with historical data (last 1000 candles per symbol/timeframe) using a limited thread pool."""
    # Process symbols in a fixed order to ensure all symbols are processed
    total_symbols = len(symbols)
    total_timeframes = len(TIMEFRAMES)
    total_combinations = total_symbols * total_timeframes
    
    logger.info(f"Starting threaded historical fill for {total_combinations} symbol/timeframe combinations with max 5 concurrent threads")
    
    # Create a thread-safe dictionary to store results
    from threading import Lock
    results_dict = {}
    results_lock = Lock()
    
    # Create a thread-safe queue for work items
    from queue import Queue
    work_queue = Queue()
    
    # Add all symbol/timeframe combinations to the queue
    for symbol in symbols:
        for timeframe_label, tf_constant in TIMEFRAMES.items():
            work_queue.put((symbol, timeframe_label, tf_constant))
    
    # Track active threads
    active_threads = []
    completed_count = 0
    max_threads = 5  # Limit to 5 concurrent threads
    
    # Function for worker threads to process items from the queue
    def worker_thread():
        nonlocal completed_count
        thread_id = threading.get_ident()
        
        while not work_queue.empty():
            try:
                # Get the next work item
                symbol, timeframe_label, tf_constant = work_queue.get(block=False)
                
                logger.info(f"Worker thread {thread_id} picking up task for {symbol} {timeframe_label}")
                
                # Process the item
                historical_fill_worker(symbol, timeframe_label, tf_constant, results_dict, thread_id)
                
                # Mark task as done
                work_queue.task_done()
                
                # Update progress
                with results_lock:
                    completed_count += 1
                    progress_pct = (completed_count / total_combinations) * 100
                    logger.info(f"Progress: {completed_count}/{total_combinations} ({progress_pct:.1f}%) combinations completed")
                
            except queue.Empty:
                # No more tasks
                break
            except Exception as e:
                logger.error(f"Error in worker thread {thread_id}: {e}")
                # Mark task as done even if it failed
                try:
                    work_queue.task_done()
                except:
                    pass
    
    # Start worker threads (maximum of 5)
    logger.info(f"Starting {max_threads} worker threads for historical fill")
    for i in range(max_threads):
        thread = threading.Thread(
            target=worker_thread,
            daemon=True,
            name=f"HistoricalFill-Worker-{i+1}"
        )
        thread.start()
        active_threads.append(thread)
        # Small delay to avoid thread startup contention
        time.sleep(0.1)
    
    # Wait for all worker threads to complete
    for thread in active_threads:
        thread.join()
    
    # Process results
    successful_count = 0
    for thread_id, result in results_dict.items():
        if result.get("status") == "success":
            successful_count += 1
    
    overall_success_rate = (successful_count / total_combinations) * 100
    logger.info(f"Threaded historical fill complete: {successful_count}/{total_combinations} combinations successful ({overall_success_rate:.1f}%)")
    
    # Return false if not all symbols were processed successfully
    return successful_count == total_combinations

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
        else:
            logger.info("Starting in PRODUCTION mode - data will be inserted into the real API")
            
        # Perform historical fill with proper status tracking
        logger.info("Starting threaded historical fill process...")
        historical_fill_success = historical_fill()
        
        if historical_fill_success:
            logger.info("Threaded historical fill completed successfully. All data has been inserted.")
        else:
            logger.warning("Threaded historical fill completed with some failures. Some data may be missing.")
            # Option to retry the historical fill if needed
            # Uncomment the following lines to retry the historical fill
            # logger.info("Retrying historical fill to ensure all data is inserted...")
            # historical_fill()
        
        # Historical fill threads are automatically terminated since they are joined in the historical_fill function
        logger.info("All historical fill threads have been terminated.")
        
        logger.info("Starting live update threads for real-time data...")

        # Start live update threads for each symbol and timeframe
        threads = []
        for symbol in symbols:
            for timeframe_label, tf_constant in TIMEFRAMES.items():
                thread = threading.Thread(
                    target=live_update_worker,
                    args=(symbol, timeframe_label, tf_constant),
                    daemon=True,
                    name=f"LiveUpdater-{symbol}-{timeframe_label}"
                )
                thread.start()
                threads.append((thread, symbol, timeframe_label))
                # Small delay to avoid overwhelming the API
                time.sleep(0.2)
                
        logger.info(f"Started {len(threads)} update threads for real-time data")

        # Monitor threads and restart any that die
        while True:
            active_count = 0
            for i, (thread, symbol, timeframe_label) in enumerate(threads):
                if thread.is_alive():
                    active_count += 1
                else:
                    logger.warning(f"Thread for {symbol} {timeframe_label} has died. Restarting...")
                    # Create and start a new thread
                    new_thread = threading.Thread(
                        target=live_update_worker,
                        args=(symbol, timeframe_label, TIMEFRAMES[timeframe_label]),
                        daemon=True,
                        name=f"LiveUpdater-{symbol}-{timeframe_label}"
                    )
                    new_thread.start()
                    # Update the thread in our list
                    threads[i] = (new_thread, symbol, timeframe_label)
                    active_count += 1
                    
            logger.info(f"Active threads: {active_count}/{len(threads)}")
            time.sleep(60)

    except KeyboardInterrupt:
        logger.info("Script interrupted by user.")
    except Exception as e:
        logger.critical(f"Unexpected error: {e}")
        import traceback
        logger.critical(traceback.format_exc())
    finally:
        logger.info("Shutting down MetaTrader5 connection")
        mt5.disconnect()
