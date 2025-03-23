import httpx
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import asyncio
import logging
from influxdb_client import InfluxDBClient
from influxdb_client.client.query_api import QueryApi
import traceback

from app.core.config import settings

logger = logging.getLogger(__name__)

# InfluxDB connection details (from user requirements)
INFLUXDB_URL = "http://10.10.0.6:8086"
INFLUXDB_ORG = "apextradelogicorg"
INFLUXDB_BUCKET = "market_rates"
INFLUXDB_TOKEN = "fyaCjL2VBFWqhGpHEb4xRMAPrmet3gJcSD8NXZU5s6QzwTdu9n"

# Cache for flux clients to avoid creating new connections for each request
_client_cache = None
_query_api_cache = None

def get_client() -> InfluxDBClient:
    """Get or create an InfluxDB client"""
    global _client_cache
    
    if _client_cache is None:
        _client_cache = InfluxDBClient(
            url=INFLUXDB_URL,
            token=INFLUXDB_TOKEN,
            org=INFLUXDB_ORG
        )
    
    return _client_cache

def get_query_api() -> QueryApi:
    """Get or create a query API"""
    global _query_api_cache
    
    if _query_api_cache is None:
        _query_api_cache = get_client().query_api()
    
    return _query_api_cache

async def get_token() -> str:
    """Get authentication token from the market data API"""
    async with httpx.AsyncClient() as client:
        form_data = {
            "username": settings.MARKET_DATA_API_USERNAME,
            "password": settings.MARKET_DATA_API_PASSWORD,
        }
        response = await client.post(
            f"{settings.MARKET_DATA_API}/api/v1/token",
            data=form_data,
        )
        response.raise_for_status()
        data = response.json()
        return data["access_token"]

async def get_historical_data(
    symbol: str,
    timeframe: str,
    start_date: datetime,
    end_date: datetime
) -> List[Dict[str, Any]]:
    """
    Get historical price data for a symbol and timeframe.
    
    Args:
        symbol: Trading pair symbol (e.g., "EURUSD")
        timeframe: Timeframe (e.g., "M1", "M5", "H1", "D1") or (e.g., "1m", "5m", "1h", "1d")
        start_date: Start date for historical data
        end_date: End date for historical data
        
    Returns:
        List of dictionaries with OHLC data
    """
    try:
        logger.info(f"Fetching historical data for {symbol}/{timeframe} from {start_date} to {end_date}")
        
        # Check if we need to normalize the timeframe format
        # MT5 formats: M1, M5, H1, D1, etc.
        # Normalized formats: 1m, 5m, 1h, 1d, etc.
        normalized_timeframe = timeframe
        mt5_timeframe = timeframe
        
        # If timeframe is already in MT5 format (starts with M, H, or D followed by a number)
        if timeframe.startswith(('M', 'H', 'D')) and len(timeframe) > 1 and timeframe[1:].isdigit():
            # Convert MT5 format to normalized format
            if timeframe.startswith('M'):
                normalized_timeframe = f"{timeframe[1:]}m"  # M1 -> 1m
            elif timeframe.startswith('H'):
                normalized_timeframe = f"{timeframe[1:]}h"  # H1 -> 1h
            elif timeframe.startswith('D'):
                normalized_timeframe = f"{timeframe[1:]}d"  # D1 -> 1d
            
            mt5_timeframe = timeframe  # Already in MT5 format
            logger.debug(f"Input timeframe is in MT5 format: {timeframe} -> normalized: {normalized_timeframe}")
        
        # If timeframe is in normalized format (ends with m, h, or d preceded by a number)
        elif any(timeframe.endswith(suffix) for suffix in ('m', 'h', 'd')) and timeframe[:-1].isdigit():
            # Convert normalized format to MT5 format
            if timeframe.endswith('m'):
                mt5_timeframe = f"M{timeframe[:-1]}"  # 1m -> M1
            elif timeframe.endswith('h'):
                mt5_timeframe = f"H{timeframe[:-1]}"  # 1h -> H1
            elif timeframe.endswith('d'):
                mt5_timeframe = f"D{timeframe[:-1]}"  # 1d -> D1
            
            normalized_timeframe = timeframe  # Already in normalized format
            logger.debug(f"Input timeframe is in normalized format: {timeframe} -> MT5: {mt5_timeframe}")
        
        # Format dates for InfluxDB - RFC3339 format without the 'Z' suffix
        start_str = start_date.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        end_str = end_date.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        
        # Try different timeframe formats
        timeframes_to_try = [timeframe]
        if mt5_timeframe != timeframe:
            timeframes_to_try.append(mt5_timeframe)
        if normalized_timeframe != timeframe and normalized_timeframe != mt5_timeframe:
            timeframes_to_try.append(normalized_timeframe)
        
        result = None
        query_api = get_query_api()
        
        for i, tf in enumerate(timeframes_to_try):
            # Replace the query with a version that uses quoted timestamp literals
            query = f'''
            from(bucket:"{INFLUXDB_BUCKET}")
              |> range(start: {start_str}, stop: {end_str})
              |> filter(fn: (r) => r["_measurement"] == "mt5_data")
              |> filter(fn: (r) => r["symbol"] == "{symbol}" and r["timeframe"] == "{tf}")
            '''
            
            logger.debug(f"InfluxDB query #{i+1} with timeframe {tf}: {query}")
            
            try:
                query_result = query_api.query(org=INFLUXDB_ORG, query=query)
                data_by_time = {}
                record_count = 0
                
                for table in query_result:
                    for record in table.records:
                        record_count += 1
                        time_key = record.get_time().isoformat()
                        
                        if time_key not in data_by_time:
                            data_by_time[time_key] = {
                                'time': time_key,
                                'symbol': symbol,
                                'timeframe': tf
                            }
                        
                        field = record.get_field()
                        value = record.get_value()
                        data_by_time[time_key][field] = value
                
                logger.info(f"Query #{i+1} with timeframe {tf} returned {record_count} records")
                
                if record_count > 0:
                    # Convert to list and sort by time
                    data_list = list(data_by_time.values())
                    data_list.sort(key=lambda x: x['time'])
                    
                    logger.info(f"Processed {len(data_list)} candles for {symbol}/{tf}")
                    return data_list
            except Exception as e:
                logger.error(f"Error executing query #{i+1} with timeframe {tf}: {e}")
                
                # Try an alternative format with quotes around timestamps
                try:
                    start_str_alt = f'"{start_date.strftime("%Y-%m-%dT%H:%M:%S.%f")}Z"'
                    end_str_alt = f'"{end_date.strftime("%Y-%m-%dT%H:%M:%S.%f")}Z"'
                    
                    query_alt = f'''
                    from(bucket:"{INFLUXDB_BUCKET}")
                      |> range(start: {start_str_alt}, stop: {end_str_alt})
                      |> filter(fn: (r) => r["_measurement"] == "mt5_data")
                      |> filter(fn: (r) => r["symbol"] == "{symbol}" and r["timeframe"] == "{tf}")
                    '''
                    
                    logger.debug(f"Alternative InfluxDB query with timeframe {tf}: {query_alt}")
                    
                    query_result = query_api.query(org=INFLUXDB_ORG, query=query_alt)
                    data_by_time = {}
                    record_count = 0
                    
                    for table in query_result:
                        for record in table.records:
                            record_count += 1
                            time_key = record.get_time().isoformat()
                            
                            if time_key not in data_by_time:
                                data_by_time[time_key] = {
                                    'time': time_key,
                                    'symbol': symbol,
                                    'timeframe': tf
                                }
                            
                            field = record.get_field()
                            value = record.get_value()
                            data_by_time[time_key][field] = value
                    
                    logger.info(f"Alternative query with timeframe {tf} returned {record_count} records")
                    
                    if record_count > 0:
                        # Convert to list and sort by time
                        data_list = list(data_by_time.values())
                        data_list.sort(key=lambda x: x['time'])
                        
                        logger.info(f"Processed {len(data_list)} candles for {symbol}/{tf}")
                        return data_list
                except Exception as nested_e:
                    logger.error(f"Error executing alternative query with timeframe {tf}: {nested_e}")
        
        # If we got here, none of the queries returned data
        logger.warning(f"No historical data found for {symbol} with any timeframe format")
        return []
        
    except Exception as e:
        logger.error(f"Error getting historical data for {symbol}/{timeframe}: {e}")
        traceback.print_exc()
        return []

async def get_last_price(symbol: str, timeframe: str) -> Optional[Dict[str, Any]]:
    """
    Get the last price for a specific symbol and timeframe.
    
    Args:
        symbol: Trading pair symbol (e.g., "EURUSD")
        timeframe: Timeframe (e.g., "M1", "M5", "H1", "D1") or (e.g., "1m", "5m", "1h", "1d")
        
    Returns:
        Dictionary with the last price data
    """
    try:
        logger.info(f"Fetching last price for {symbol}/{timeframe} from InfluxDB")
        
        # Check if we need to normalize the timeframe format
        # MT5 formats: M1, M5, H1, D1, etc.
        # Normalized formats: 1m, 5m, 1h, 1d, etc.
        normalized_timeframe = timeframe
        mt5_timeframe = timeframe
        
        # If timeframe is already in MT5 format (starts with M, H, or D followed by a number)
        if timeframe.startswith(('M', 'H', 'D')) and len(timeframe) > 1 and timeframe[1:].isdigit():
            # Convert MT5 format to normalized format
            if timeframe.startswith('M'):
                normalized_timeframe = f"{timeframe[1:]}m"  # M1 -> 1m
            elif timeframe.startswith('H'):
                normalized_timeframe = f"{timeframe[1:]}h"  # H1 -> 1h
            elif timeframe.startswith('D'):
                normalized_timeframe = f"{timeframe[1:]}d"  # D1 -> 1d
            
            mt5_timeframe = timeframe  # Already in MT5 format
            logger.debug(f"Input timeframe is in MT5 format: {timeframe} -> normalized: {normalized_timeframe}")
        
        # If timeframe is in normalized format (ends with m, h, or d preceded by a number)
        elif any(timeframe.endswith(suffix) for suffix in ('m', 'h', 'd')) and timeframe[:-1].isdigit():
            # Convert normalized format to MT5 format
            if timeframe.endswith('m'):
                mt5_timeframe = f"M{timeframe[:-1]}"  # 1m -> M1
            elif timeframe.endswith('h'):
                mt5_timeframe = f"H{timeframe[:-1]}"  # 1h -> H1
            elif timeframe.endswith('d'):
                mt5_timeframe = f"D{timeframe[:-1]}"  # 1d -> D1
            
            normalized_timeframe = timeframe  # Already in normalized format
            logger.debug(f"Input timeframe is in normalized format: {timeframe} -> MT5: {mt5_timeframe}")
        
        # Extend the time range to 14 days to ensure we catch recent data
        # We'll try both the original, MT5, and normalized timeframe formats
        queries = []
        
        # 1. Try with the original timeframe (whatever was passed in)
        queries.append(f'''
        from(bucket:"{INFLUXDB_BUCKET}")
          |> range(start: -14d)
          |> filter(fn: (r) => r["_measurement"] == "mt5_data")
          |> filter(fn: (r) => r["symbol"] == "{symbol}" and r["timeframe"] == "{timeframe}")
          |> last()
        ''')
        
        # 2. Try with the MT5 format if it's different from original
        if mt5_timeframe != timeframe:
            queries.append(f'''
            from(bucket:"{INFLUXDB_BUCKET}")
              |> range(start: -14d)
              |> filter(fn: (r) => r["_measurement"] == "mt5_data")
              |> filter(fn: (r) => r["symbol"] == "{symbol}" and r["timeframe"] == "{mt5_timeframe}")
              |> last()
            ''')
        
        # 3. Try with the normalized format if it's different from original and MT5
        if normalized_timeframe != timeframe and normalized_timeframe != mt5_timeframe:
            queries.append(f'''
            from(bucket:"{INFLUXDB_BUCKET}")
              |> range(start: -14d)
              |> filter(fn: (r) => r["_measurement"] == "mt5_data")
              |> filter(fn: (r) => r["symbol"] == "{symbol}" and r["timeframe"] == "{normalized_timeframe}")
              |> last()
            ''')
        
        # Try all queries
        result = None
        query_api = get_query_api()
        
        for i, query in enumerate(queries):
            logger.debug(f"Trying InfluxDB query #{i+1}: {query}")
            
            try:
                query_result = query_api.query(org=INFLUXDB_ORG, query=query)
                record_count = 0
                data = {}
                record_time = None
                
                for table in query_result:
                    for record in table.records:
                        record_count += 1
                        if not record_time:
                            record_time = record.get_time().isoformat()
                        
                        field = record.get_field()
                        value = record.get_value()
                        data[field] = value
                
                logger.info(f"Query #{i+1} returned {record_count} records for {symbol}/{timeframe}")
                
                if data and record_time:
                    result = {
                        'time': record_time,
                        **data
                    }
                    logger.info(f"Found data with query #{i+1}")
                    break  # Exit the loop if we found data
            except Exception as e:
                logger.error(f"Error executing query #{i+1}: {e}")
        
        if result:
            logger.info(f"Successfully fetched last price for {symbol}/{timeframe}, time: {result['time']}")
            return result
        
        logger.warning(f"No data found for {symbol}/{timeframe} in InfluxDB")
        
        # Try a broad query to find what symbol/timeframe combinations exist
        try:
            logger.debug("Attempting broader query for debugging")
            debug_query = f'''
            from(bucket:"{INFLUXDB_BUCKET}")
              |> range(start: -30d)
              |> filter(fn: (r) => r["_measurement"] == "mt5_data")
              |> group(columns: ["symbol", "timeframe"])
              |> last()
              |> limit(n:50)
            '''
            
            debug_result = query_api.query(org=INFLUXDB_ORG, query=debug_query)
            symbol_timeframes = set()
            
            for table in debug_result:
                for record in table.records:
                    if 'symbol' in record.values and 'timeframe' in record.values:
                        symbol_timeframes.add(f"{record.values['symbol']}/{record.values['timeframe']}")
            
            if symbol_timeframes:
                logger.debug(f"Available symbol/timeframe combinations: {', '.join(sorted(symbol_timeframes))}")
        except Exception as e:
            logger.error(f"Error running debug query: {e}")
        
        return None
    except Exception as e:
        logger.error(f"Error getting last price for {symbol}/{timeframe}: {e}")
        logger.error(f"Connection details: URL={INFLUXDB_URL}, ORG={INFLUXDB_ORG}, BUCKET={INFLUXDB_BUCKET}")
        traceback.print_exc()
        return None

def get_dataframe(data: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Convert market data to pandas DataFrame.
    
    Args:
        data: List of dictionaries with OHLCV data
        
    Returns:
        pandas DataFrame with OHLCV data
    """
    if not data:
        return pd.DataFrame()
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Set time as index
    if 'time' in df.columns:
        df['time'] = pd.to_datetime(df['time'])
        df.set_index('time', inplace=True)
    
    # Ensure OHLC columns exist with proper types
    for col in ['open', 'high', 'low', 'close']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col])
    
    # Ensure volume columns exist with proper types
    for col in ['tick_volume', 'real_volume']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col])
    
    return df

def close_client():
    """Close the InfluxDB client connection"""
    global _client_cache, _query_api_cache
    
    if _client_cache is not None:
        _client_cache.close()
        _client_cache = None
        _query_api_cache = None 

def check_influxdb_connection() -> Dict[str, Any]:
    """
    Check the InfluxDB connection and run a test query.
    Returns a dictionary with connection status and diagnostics.
    """
    result = {
        "connection_status": "unknown",
        "error": None,
        "available_measurements": [],
        "sample_data": None,
        "bucket_exists": False,
        "org_exists": False
    }
    
    try:
        logger.info(f"Testing InfluxDB connection to {INFLUXDB_URL}")
        
        # Try to create client
        client = get_client()
        if not client:
            result["connection_status"] = "failed"
            result["error"] = "Could not create InfluxDB client"
            return result
        
        # Check health
        try:
            health = client.health()
            logger.info(f"InfluxDB health: {health}")
            result["connection_status"] = "healthy" if health.status == "pass" else "unhealthy"
            result["health"] = {
                "status": health.status,
                "name": health.name,
                "version": health.version
            }
        except Exception as e:
            logger.error(f"Failed to check InfluxDB health: {e}")
            result["connection_status"] = "unhealthy"
            result["error"] = str(e)
            return result
        
        # Check for bucket
        try:
            buckets_api = client.buckets_api()
            buckets = buckets_api.find_buckets().buckets
            bucket_names = [b.name for b in buckets]
            result["available_buckets"] = bucket_names
            result["bucket_exists"] = INFLUXDB_BUCKET in bucket_names
            logger.info(f"Available buckets: {bucket_names}")
        except Exception as e:
            logger.error(f"Failed to list buckets: {e}")
            result["error"] = f"Failed to list buckets: {str(e)}"
        
        # Check for organization
        try:
            org_api = client.organizations_api()
            orgs = org_api.find_organizations()
            org_names = [o.name for o in orgs.orgs]
            result["available_orgs"] = org_names
            result["org_exists"] = any(o.id == INFLUXDB_ORG or o.name == INFLUXDB_ORG for o in orgs.orgs)
            logger.info(f"Available orgs: {org_names}")
        except Exception as e:
            logger.error(f"Failed to list organizations: {e}")
            result["error"] = f"Failed to list organizations: {str(e)}"
        
        # Try a simple query to get available measurements
        try:
            query_api = get_query_api()
            query = f'''
            import "influxdata/influxdb/schema"

            schema.measurements(bucket: "{INFLUXDB_BUCKET}")
            '''
            
            query_result = query_api.query(org=INFLUXDB_ORG, query=query)
            measurements = []
            
            for table in query_result:
                for record in table.records:
                    if '_value' in record.values:
                        measurements.append(record.values['_value'])
            
            result["available_measurements"] = measurements
            logger.info(f"Available measurements: {measurements}")
            
            # If we have measurements, try to get a sample of data
            if "mt5_data" in measurements:
                sample_query = f'''
                from(bucket:"{INFLUXDB_BUCKET}")
                  |> range(start: -30d)
                  |> filter(fn: (r) => r["_measurement"] == "mt5_data")
                  |> limit(n:5)
                '''
                
                sample_result = query_api.query(org=INFLUXDB_ORG, query=sample_query)
                sample_data = {}
                
                for table in sample_result:
                    for record in table.records:
                        symbol = record.values.get('symbol', 'unknown')
                        timeframe = record.values.get('timeframe', 'unknown')
                        key = f"{symbol}/{timeframe}"
                        
                        if key not in sample_data:
                            sample_data[key] = []
                        
                        sample_data[key].append({
                            'time': record.get_time().isoformat(),
                            'field': record.get_field(),
                            'value': record.get_value()
                        })
                
                result["sample_data"] = sample_data
                logger.info(f"Sample data retrieved: {len(sample_data)} symbol/timeframe combinations")
        except Exception as e:
            logger.error(f"Failed to query measurements: {e}")
            result["error"] = f"Failed to query measurements: {str(e)}"
        
        return result
    except Exception as e:
        logger.error(f"Error checking InfluxDB connection: {e}")
        traceback.print_exc()
        result["connection_status"] = "failed"
        result["error"] = str(e)
        return result

async def test_market_data_access(symbol: str, timeframe: str) -> Dict[str, Any]:
    """
    Test access to market data for a specific symbol and timeframe.
    This function can be called to diagnose issues with market data access.
    
    Args:
        symbol: Trading pair symbol (e.g., "EURUSD")
        timeframe: Timeframe in either MT5 format (e.g., "M1", "H1", "D1") or 
                   normalized format (e.g., "1m", "1h", "1d")
    
    Returns:
        Dictionary with test results
    """
    result = {
        "symbol": symbol,
        "timeframe": timeframe,
        "input_format": "unknown",
        "normalized_timeframe": None,
        "mt5_timeframe": None,
        "connection_test": None,
        "last_price": None,
        "historical_data_count": 0,
        "error": None
    }
    
    try:
        # Determine the timeframe format
        if timeframe.startswith(('M', 'H', 'D')) and len(timeframe) > 1 and timeframe[1:].isdigit():
            result["input_format"] = "MT5"
            result["mt5_timeframe"] = timeframe
            
            # Generate normalized version
            if timeframe.startswith('M'):
                result["normalized_timeframe"] = f"{timeframe[1:]}m"
            elif timeframe.startswith('H'):
                result["normalized_timeframe"] = f"{timeframe[1:]}h"
            elif timeframe.startswith('D'):
                result["normalized_timeframe"] = f"{timeframe[1:]}d"
        elif any(timeframe.endswith(suffix) for suffix in ('m', 'h', 'd')) and timeframe[:-1].isdigit():
            result["input_format"] = "normalized"
            result["normalized_timeframe"] = timeframe
            
            # Generate MT5 version
            if timeframe.endswith('m'):
                result["mt5_timeframe"] = f"M{timeframe[:-1]}"
            elif timeframe.endswith('h'):
                result["mt5_timeframe"] = f"H{timeframe[:-1]}"
            elif timeframe.endswith('d'):
                result["mt5_timeframe"] = f"D{timeframe[:-1]}"
        
        # First check the connection
        result["connection_test"] = check_influxdb_connection()
        
        # Try to get the last price
        last_price = await get_last_price(symbol, timeframe)
        result["last_price"] = last_price
        
        if last_price:
            result["found_with_format"] = "original"
        else:
            # Try with the alternative formats if the first attempt failed
            if result["normalized_timeframe"] and result["normalized_timeframe"] != timeframe:
                alternative_last_price = await get_last_price(symbol, result["normalized_timeframe"])
                if alternative_last_price:
                    result["last_price"] = alternative_last_price
                    result["found_with_format"] = "normalized"
            
            if not result["last_price"] and result["mt5_timeframe"] and result["mt5_timeframe"] != timeframe:
                alternative_last_price = await get_last_price(symbol, result["mt5_timeframe"])
                if alternative_last_price:
                    result["last_price"] = alternative_last_price
                    result["found_with_format"] = "MT5"
        
        # Try to get some historical data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        historical_data = await get_historical_data(symbol, timeframe, start_date, end_date)
        result["historical_data_count"] = len(historical_data)
        
        if historical_data and len(historical_data) > 0:
            # Get some sample data points
            result["historical_data_samples"] = historical_data[:3]
            result["historical_found_with_format"] = "original"
        else:
            # Try with alternative formats
            if result["normalized_timeframe"] and result["normalized_timeframe"] != timeframe:
                alternative_hist_data = await get_historical_data(
                    symbol, result["normalized_timeframe"], start_date, end_date
                )
                if alternative_hist_data and len(alternative_hist_data) > 0:
                    result["historical_data_count"] = len(alternative_hist_data)
                    result["historical_data_samples"] = alternative_hist_data[:3]
                    result["historical_found_with_format"] = "normalized"
            
            if result["historical_data_count"] == 0 and result["mt5_timeframe"] and result["mt5_timeframe"] != timeframe:
                alternative_hist_data = await get_historical_data(
                    symbol, result["mt5_timeframe"], start_date, end_date
                )
                if alternative_hist_data and len(alternative_hist_data) > 0:
                    result["historical_data_count"] = len(alternative_hist_data)
                    result["historical_data_samples"] = alternative_hist_data[:3]
                    result["historical_found_with_format"] = "MT5"
        
        # Check available symbol/timeframe combinations
        if "connection_test" in result and result["connection_test"]:
            conn_test = result["connection_test"]
            if "sample_data" in conn_test and conn_test["sample_data"]:
                available_pairs = list(conn_test["sample_data"].keys())
                result["available_combinations"] = available_pairs
                
                # Check for both MT5 and normalized formats
                mt5_prefix = f"{symbol}/M"
                hour_prefix = f"{symbol}/H"
                day_prefix = f"{symbol}/D"
                
                mt5_matches = [p for p in available_pairs if 
                              p.startswith(mt5_prefix) or 
                              p.startswith(hour_prefix) or 
                              p.startswith(day_prefix)]
                
                if mt5_matches:
                    result["available_mt5_timeframes"] = sorted([p.split('/')[1] for p in mt5_matches])
        
        # Add recommendation for user
        if not result["last_price"] and not result["historical_data_count"]:
            if "available_mt5_timeframes" in result and result["available_mt5_timeframes"]:
                result["recommendation"] = f"No data found for {symbol}/{timeframe}. Try using one of these timeframes instead: {', '.join(result['available_mt5_timeframes'])}"
            else:
                result["recommendation"] = f"No data found for {symbol}/{timeframe}. Check if the symbol exists in your database or if you need to use a different timeframe format."
        
        return result
    except Exception as e:
        logger.error(f"Error testing market data access: {e}")
        traceback.print_exc()
        result["error"] = str(e)
        return result 