import numpy as np
from typing import Dict, Any, List
from .base import BaseIndicator, IndicatorParameter

class SMA(BaseIndicator):
    """Simple Moving Average Indicator"""
    
    @classmethod
    def get_name(cls) -> str:
        return "Simple Moving Average (SMA)"
    
    @classmethod
    def get_description(cls) -> str:
        return "Calculates the arithmetic mean of a given set of prices over a specified number of periods"
    
    @classmethod
    def get_parameters(cls) -> List[IndicatorParameter]:
        return [
            IndicatorParameter(
                name="period",
                type="number",
                description="Number of periods for the moving average",
                default=14,
                min_value=1,
                max_value=500
            ),
            IndicatorParameter(
                name="source",
                type="select",
                description="Price source for calculation",
                default="close",
                options=["open", "high", "low", "close", "volume"]
            ),
        ]
    
    @classmethod
    def calculate(cls, candles: List[Dict[str, Any]], parameters: Dict[str, Any]) -> Dict[str, List[float]]:
        period = parameters.get("period", 14)
        source = parameters.get("source", "close")
        
        # Extract price data from candles
        prices = [candle[source] for candle in candles]
        
        # Convert to numpy array for easier calculation
        prices_array = np.array(prices)
        
        # Calculate SMA
        sma_values = []
        for i in range(len(prices_array)):
            if i < period - 1:
                sma_values.append(None)  # Not enough data yet
            else:
                sma = np.mean(prices_array[i-(period-1):i+1])
                sma_values.append(float(sma))
        
        return {"sma": sma_values}

class EMA(BaseIndicator):
    """Exponential Moving Average Indicator"""
    
    @classmethod
    def get_name(cls) -> str:
        return "Exponential Moving Average (EMA)"
    
    @classmethod
    def get_description(cls) -> str:
        return "A type of moving average that places a greater weight on recent data points"
    
    @classmethod
    def get_parameters(cls) -> List[IndicatorParameter]:
        return [
            IndicatorParameter(
                name="period",
                type="number",
                description="Number of periods for the moving average",
                default=20,
                min_value=1,
                max_value=500
            ),
            IndicatorParameter(
                name="source",
                type="select",
                description="Price source for calculation",
                default="close",
                options=["open", "high", "low", "close", "volume"]
            ),
        ]
    
    @classmethod
    def calculate(cls, candles: List[Dict[str, Any]], parameters: Dict[str, Any]) -> Dict[str, List[float]]:
        period = parameters.get("period", 20)
        source = parameters.get("source", "close")
        
        # Extract price data from candles
        prices = [candle[source] for candle in candles]
        
        # Convert to numpy array for easier calculation
        prices_array = np.array(prices)
        
        # Calculate multiplier
        multiplier = 2 / (period + 1)
        
        # Calculate EMA
        ema_values = []
        for i in range(len(prices_array)):
            if i < period - 1:
                ema_values.append(None)  # Not enough data yet
            elif i == period - 1:
                # First EMA is SMA
                ema = np.mean(prices_array[:period])
                ema_values.append(float(ema))
            else:
                # EMA calculation
                ema = (prices_array[i] * multiplier) + (ema_values[i-1] * (1 - multiplier))
                ema_values.append(float(ema))
        
        return {"ema": ema_values} 