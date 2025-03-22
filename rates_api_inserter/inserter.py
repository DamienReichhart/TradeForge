import MetaTrader5 as mt5
import requests
import time
import logging
import threading
import os
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

# Configure retry settings
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
RETRY_WAIT_MULTIPLIER = float(os.getenv("RETRY_WAIT_MULTIPLIER", "1.0"))
RETRY_MAX_WAIT = float(os.getenv("RETRY_MAX_WAIT", "10.0"))

TIMEFRAMES = {
    "M1": mt5.TIMEFRAME_M1,
    "M5": mt5.TIMEFRAME_M5,
    "M15": mt5.TIMEFRAME_M15,
    "M30": mt5.TIMEFRAME_M30,
    "H1": mt5.TIMEFRAME_H1,
    "H4": mt5.TIMEFRAME_H4,
    "D1": mt5.TIMEFRAME_D1,
    "W1": mt5.TIMEFRAME_W1,
}

PERIOD_MAPPING = {
    "M1": timedelta(minutes=1),
    "M5": timedelta(minutes=5),
    "M15": timedelta(minutes=15),
    "M30": timedelta(minutes=30),
    "H1": timedelta(hours=1),
    "H4": timedelta(hours=4),
    "D1": timedelta(days=1),
    "W1": timedelta(weeks=1),
}

CHUNK_DAYS = {
    "M1": 7,
    "M5": 7,
    "M15": 7,
    "M30": 14,
    "H1": 30,
    "H4": 60,
    "D1": 365,
    "W1": 365 * 2,
}

# Initialize MetaTrader5
logger.info("Initializing MetaTrader5")
if not mt5.initialize():
    logger.error("MetaTrader5.initialize() failed, error code=%s", mt5.last_error())
    quit()

# Retrieve list of all symbols available in MetaTrader5
symbols = [
    'EURUSD', 'GBPUSD', 'AUDCAD', 'AUDCHF', 'AUDCNH', 'AUDJPY', 'USDJPY', 'NZDUSD', 'USDCAD', 'AUDUSD',
    'AUDSGD', 'AUDNZD', 'CADCHF', 'CADJPY', 'CHFJPY', 'CHFSGD', 'EURAUD', 'EURCAD', 'EURCHF', 'EURGBP',
    'EURJPY', 'EURNOK', 'EURNZD', 'EURPLN', 'EURSEK', 'EURSGD', 'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPJPY',
    'GBPNZD', 'GBPSGD', 'NZDCAD', 'NZDCHF', 'NZDJPY', 'NZDSGD', 'SGDJPY', 'USDCHF', 'USDCNH', 'USDHKD',
    'USDMXN', 'USDNOK', 'USDPLN', 'USDSEK', 'USDSGD', 'CHINA50', 'COPPER-C', 'GAS-C', 'NG-C', 'SPI200',
    'DJ30', 'SP500', 'NAS100', 'EU50', 'USDX', 'XAGUSD', 'XAUUSD', 'CL-OIL', 'XAGAUD', 'XAUAUD', 'Nikkei225',
    'TRUMPUSD', 'HBARUSD', 'ONDOUSD', 'WIFUSD', 'BERAUSD', 'BTCUSD', 'VIX', 'BCHUSD', 'ETHUSD', 'LTCUSD',
    'XRPUSD', 'FRA40', 'USOUSD', 'UKOUSD', 'AAL', 'IMB', 'ULVR', 'VOD', 'AAPL', 'ABBVIE', 'ALIBABA',
    'AMAZON', 'AT&T', 'BAC', 'BAIDU', 'BOEING', 'BUD', 'CISCO','DISNEY', 'GOOG', 'INTEL','MSFT', 'NFLX',
    'NTES', 'NVIDIA', 'NVS', 'ORCL', 'PEP', 'PFIZER', 'PG', 'PM', 'TOYOTA','TSM', 'VISA', 'GASOIL-C','AI',
    'BNP', 'SANOFI', 'TCOM', 'GBXUSD', 'US2000', 'TSLA','EOSUSD', 'XLMUSD', 'XAUEUR', 'BTCBCH', 'BTCETH',
    'BTCEUR', 'BTCLTC', 'ETHBCH', 'ETHEUR', 'ETHLTC', 'USDINR', 'USDBRL', 'CRM', 'SHOP', 'ADAUSD',
    'DOGUSD', 'DOTUSD', 'LNKUSD','SOLUSD', 'UNIUSD', 'HK50ft', 'DJ30ft', 'NAS100ft', 'SP500ft','ALGUSD',
    'AVAUSD', 'BATUSD', 'FILUSD', 'IOTUSD', 'MKRUSD', 'NEOUSD', 'SHBUSD', 'TRXUSD', 'ZECUSD','ATMUSD',
    'AXSUSD', 'BNBUSD', 'CRVUSD', 'ETCUSD', 'INCUSD', 'LRCUSD', 'NERUSD', 'ONEUSD', 'SANUSD', 'SUSUSD',
    'XTZUSD', 'XPDUSD', 'XPTUSD', 'META', 'USDCLP', 'USDCOP', 'USDIDR', 'USDKRW', 'USDTWD', 'USDTHB',
    'GRTUSD', 'EURHUF', 'USDHUF','EURCZK', 'USDCZK', 'EURDKK', 'USDDKK', 'BTCJPY', 'ETHJPY', 'USDTJPY',
    'XAUJPY', 'EURIBOR3M','USTUSD', 'ADAJPY', 'BCHJPY', 'LTCJPY', 'SOLJPY', 'XLMJPY', 'XRPJPY'
]

logger.info(f"Found {len(symbols)} symbols.")

# ---------------------------
# JWT Authentication
# ---------------------------

class AuthManager:
    def __init__(self, api_url, username, password):
        self.api_url = api_url
        self.username = username
        self.password = password
        self.token = None
        self.expires_at = None
        self.session = requests.Session()
        
    def is_token_valid(self):
        """Check if the current token is still valid."""
        if not self.token or not self.expires_at:
            return False
        # Allow for a 5-minute buffer before expiration
        return datetime.now() + timedelta(minutes=5) < self.expires_at
    
    @retry(
        stop=stop_after_attempt(MAX_RETRIES),
        wait=wait_exponential(multiplier=RETRY_WAIT_MULTIPLIER, max=RETRY_MAX_WAIT),
        retry=retry_if_exception_type((requests.RequestException, ConnectionError))
    )
    def get_token(self):
        """Obtain a new JWT token."""
        if self.is_token_valid():
            return self.token
            
        try:
            response = self.session.post(
                f"{self.api_url}/token",
                data={"username": self.username, "password": self.password}
            )
            response.raise_for_status()
            data = response.json()
            self.token = data["access_token"]
            # Default to 8 hours if we can't determine from token
            self.expires_at = datetime.now() + timedelta(hours=8)
            logger.info("Successfully obtained new auth token")
            return self.token
        except requests.RequestException as e:
            logger.error(f"Error obtaining authentication token: {str(e)}")
            raise
    
    def get_headers(self):
        """Return headers with authorization token."""
        token = self.get_token()
        return {"Authorization": f"Bearer {token}"}

# Initialize authentication
auth_manager = AuthManager(API_URL, API_USERNAME, API_PASSWORD)

# ---------------------------
# HELPER FUNCTIONS
# ---------------------------

@retry(
    stop=stop_after_attempt(MAX_RETRIES),
    wait=wait_exponential(multiplier=RETRY_WAIT_MULTIPLIER, max=RETRY_MAX_WAIT),
    retry=retry_if_exception_type((requests.RequestException, ConnectionError))
)
def write_rates_to_api(symbol, timeframe_label, rates):
    """
    Convert the list of rate dictionaries into a JSON payload and
    send them to the FastAPI service for insertion into InfluxDB.
    """
    points_payload = []
    for rate in rates:
        dt = datetime.fromtimestamp(rate['time'])
        points_payload.append({
            "symbol": symbol,
            "timeframe": timeframe_label,
            "time": dt.isoformat(),
            "open": float(rate["open"]),
            "high": float(rate["high"]),
            "low": float(rate["low"]),
            "close": float(rate["close"]),
            "tick_volume": int(rate["tick_volume"]),
            "spread": int(rate["spread"]),
            "real_volume": int(rate["real_volume"])
        })
    
    try:
        headers = auth_manager.get_headers()
        response = requests.post(f"{API_URL}/data", json=points_payload, headers=headers)
        
        if response.status_code == 200:
            logger.info(f"Wrote {len(points_payload)} points for {symbol} ({timeframe_label}) via API")
            return True
        else:
            logger.error(
                f"Failed to write points for {symbol} ({timeframe_label}). "
                f"Status code: {response.status_code}, {response.text}"
            )
            return False
    except Exception as e:
        logger.error(f"Exception while writing points for {symbol} ({timeframe_label}) via API: {e}")
        raise

@retry(
    stop=stop_after_attempt(MAX_RETRIES),
    wait=wait_exponential(multiplier=RETRY_WAIT_MULTIPLIER, max=RETRY_MAX_WAIT),
    retry=retry_if_exception_type((requests.RequestException, ConnectionError))
)
def get_last_time(symbol, timeframe_label):
    """
    Query the API service for the last stored time for a given symbol and timeframe.
    Returns a naive datetime object if found, otherwise None.
    """
    try:
        headers = auth_manager.get_headers()
        response = requests.get(
            f"{API_URL}/data/last",
            params={"symbol": symbol, "timeframe": timeframe_label},
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            last_time = data.get("last_time")
            if last_time:
                dt = datetime.fromisoformat(last_time.replace("Z", "+00:00"))
                # Convert to naive datetime (strip timezone info)
                return dt.replace(tzinfo=None)
            return None
        else:
            logger.error(
                f"Failed to get last time for {symbol} ({timeframe_label}). "
                f"Status code: {response.status_code}"
            )
            return None
    except Exception as e:
        logger.error(f"Error querying last time for {symbol} ({timeframe_label}): {e}")
        raise

def fetch_and_write_rates(symbol, timeframe_label, tf_constant, start_time, end_time):
    """
    Fetch rates from MetaTrader5 for a given symbol and timeframe between start_time and end_time,
    and then send them to API.
    Returns the next expected start time if new data was written,
    or returns end_time if no data was retrieved (so we skip that chunk).
    Returns None only if there's an exception or a failure writing to the API.
    """
    try:
        rates = mt5.copy_rates_range(symbol, tf_constant, start_time, end_time)
        if rates is None:
            logger.error(
                f"Error retrieving data for {symbol} ({timeframe_label}) "
                f"from {start_time} to {end_time}"
            )
            return None
        
        if len(rates) == 0:
            logger.info(
                f"No new data for {symbol} ({timeframe_label}) "
                f"from {start_time} to {end_time}"
            )
            # Advance the start time so we don't get stuck
            return end_time

        success = write_rates_to_api(symbol, timeframe_label, rates)
        if success:
            last_rate_time = datetime.fromtimestamp(rates[-1]["time"])
            return last_rate_time + PERIOD_MAPPING[timeframe_label]
        return None
    except Exception as e:
        logger.error(f"Exception in fetch_and_write_rates for {symbol} ({timeframe_label}): {e}")
        return None

# ---------------------------
# HISTORICAL FILL
# ---------------------------

def historical_fill():
    now = datetime.now()
    for symbol in symbols:
        for timeframe_label, tf_constant in TIMEFRAMES.items():
            logger.info(f"Historical fill for {symbol} ({timeframe_label})")
            last_time = get_last_time(symbol, timeframe_label)
            start_time = (
                (last_time + PERIOD_MAPPING[timeframe_label])
                if last_time
                else START_FILL_DATE
            )

            chunk = timedelta(days=CHUNK_DAYS[timeframe_label])
            while start_time < now:
                end_time = start_time + chunk
                if end_time > now:
                    end_time = now

                next_start = fetch_and_write_rates(
                    symbol, timeframe_label, tf_constant, start_time, end_time
                )

                if next_start is None:
                    # If fetch failed, add a small delay before retrying
                    time.sleep(5)
                    continue

                start_time = next_start
                time.sleep(0.1)

            logger.info(f"Completed historical fill for {symbol} ({timeframe_label})")

# ---------------------------
# LIVE UPDATE WORKER (with threading)
# ---------------------------

def live_update_worker(symbol, timeframe_label, tf_constant):
    logger.info(f"Starting live update thread for {symbol} ({timeframe_label})")
    
    consecutive_failures = 0
    
    while True:
        try:
            now = datetime.now()
            last_time = get_last_time(symbol, timeframe_label)
            next_expected = (
                (last_time + PERIOD_MAPPING[timeframe_label])
                if last_time
                else START_FILL_DATE
            )

            # If we haven't reached next_expected yet, wait until then
            if now < next_expected:
                sleep_time = (next_expected - now).total_seconds()
                time.sleep(sleep_time)
                continue

            result = fetch_and_write_rates(symbol, timeframe_label, tf_constant, next_expected, now)
            if result:
                # If we got a valid next_start or end_time, reset failures
                consecutive_failures = 0
            else:
                # Could be an error or zero data from the chunk
                consecutive_failures += 1
                backoff_time = min(30, 2 ** consecutive_failures)
                logger.warning(f"Backing off for {backoff_time} seconds due to repeated failures")
                time.sleep(backoff_time)
            
            # Add a small delay between fetches
            time.sleep(1)
        except Exception as e:
            consecutive_failures += 1
            backoff_time = min(60, 2 ** consecutive_failures)
            logger.error(f"Exception in live update for {symbol} ({timeframe_label}): {e}")
            logger.warning(f"Backing off for {backoff_time} seconds due to error")
            time.sleep(backoff_time)

# ---------------------------
# MAIN EXECUTION
# ---------------------------

if __name__ == "__main__":
    try:
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
        mt5.shutdown()
