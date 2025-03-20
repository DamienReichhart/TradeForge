import httpx
from typing import Dict, List, Any, Optional
from datetime import datetime
import pandas as pd
import asyncio

from app.core.config import settings

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
    Get historical market data for a specific symbol and timeframe.
    
    Args:
        symbol: Trading pair symbol (e.g., "BTCUSD")
        timeframe: Timeframe (e.g., "1h", "4h", "1d")
        start_date: Start date for historical data
        end_date: End date for historical data
        
    Returns:
        List of dictionaries with OHLCV data
    """
    token = await get_token()
    
    params = {
        "symbol": symbol,
        "timeframe": timeframe,
        "start": start_date.isoformat(),
        "end": end_date.isoformat()
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.MARKET_DATA_API}/api/v1/data",
            params=params,
            headers=headers,
        )
        response.raise_for_status()
        return response.json()

async def get_last_price(symbol: str, timeframe: str) -> Dict[str, Any]:
    """
    Get the last price for a specific symbol and timeframe.
    
    Args:
        symbol: Trading pair symbol (e.g., "BTCUSD")
        timeframe: Timeframe (e.g., "1h", "4h", "1d")
        
    Returns:
        Dictionary with the last price data
    """
    token = await get_token()
    
    params = {
        "symbol": symbol,
        "timeframe": timeframe,
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.MARKET_DATA_API}/api/v1/data/last",
            params=params,
            headers=headers,
        )
        response.raise_for_status()
        return response.json()

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
    
    df = pd.DataFrame(data)
    df['time'] = pd.to_datetime(df['time'])
    df.set_index('time', inplace=True)
    return df 