import numpy as np
from typing import Dict, Any, List
from .base import BaseIndicator, IndicatorParameter

class RSI(BaseIndicator):
    """Relative Strength Index Indicator"""
    
    @classmethod
    def get_name(cls) -> str:
        return "Relative Strength Index (RSI)"
    
    @classmethod
    def get_description(cls) -> str:
        return "Measures the speed and change of price movements, indicating overbought or oversold conditions"
    
    @classmethod
    def get_parameters(cls) -> List[IndicatorParameter]:
        return [
            IndicatorParameter(
                name="period",
                type="number",
                description="Number of periods for RSI calculation",
                default=14,
                min_value=1,
                max_value=500
            ),
            IndicatorParameter(
                name="source",
                type="select",
                description="Price source for calculation",
                default="close",
                options=["open", "high", "low", "close"]
            ),
            IndicatorParameter(
                name="overbought",
                type="number",
                description="Overbought threshold",
                default=70,
                min_value=50,
                max_value=100
            ),
            IndicatorParameter(
                name="oversold",
                type="number",
                description="Oversold threshold",
                default=30,
                min_value=0,
                max_value=50
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
        
        # Calculate price changes
        deltas = np.diff(prices_array)
        seed = deltas[:period+1]
        up = seed[seed >= 0].sum() / period
        down = -seed[seed < 0].sum() / period
        rs = up / down if down != 0 else 0
        
        # Calculate RSI
        rsi_values = [None] * (period)
        rsi_values.append(100.0 - (100.0 / (1.0 + rs)))
        
        # Calculate RSI for the rest of the data
        for i in range(period + 1, len(prices_array)):
            delta = deltas[i-1]
            
            if delta > 0:
                upval = delta
                downval = 0
            else:
                upval = 0
                downval = -delta
                
            # Calculate smoothed moving averages
            up = (up * (period - 1) + upval) / period
            down = (down * (period - 1) + downval) / period
            
            rs = up / down if down != 0 else 0
            rsi_values.append(100.0 - (100.0 / (1.0 + rs)))
        
        return {"rsi": rsi_values}


class MACD(BaseIndicator):
    """Moving Average Convergence Divergence Indicator"""
    
    @classmethod
    def get_name(cls) -> str:
        return "Moving Average Convergence Divergence (MACD)"
    
    @classmethod
    def get_description(cls) -> str:
        return "Shows the relationship between two moving averages of a price, used to spot momentum shifts"
    
    @classmethod
    def get_parameters(cls) -> List[IndicatorParameter]:
        return [
            IndicatorParameter(
                name="fast_length",
                type="number",
                description="Fast EMA period",
                default=12,
                min_value=1,
                max_value=500
            ),
            IndicatorParameter(
                name="slow_length",
                type="number",
                description="Slow EMA period",
                default=26,
                min_value=1,
                max_value=500
            ),
            IndicatorParameter(
                name="signal_length",
                type="number",
                description="Signal EMA period",
                default=9,
                min_value=1,
                max_value=500
            ),
            IndicatorParameter(
                name="source",
                type="select",
                description="Price source for calculation",
                default="close",
                options=["open", "high", "low", "close"]
            ),
        ]
    
    @classmethod
    def calculate(cls, candles: List[Dict[str, Any]], parameters: Dict[str, Any]) -> Dict[str, List[float]]:
        fast_length = parameters.get("fast_length", 12)
        slow_length = parameters.get("slow_length", 26)
        signal_length = parameters.get("signal_length", 9)
        source = parameters.get("source", "close")
        
        # Extract price data from candles
        prices = [candle[source] for candle in candles]
        
        # Convert to numpy array for easier calculation
        prices_array = np.array(prices)
        
        # Calculate fast EMA
        fast_ema_values = cls._calculate_ema(prices_array, fast_length)
        
        # Calculate slow EMA
        slow_ema_values = cls._calculate_ema(prices_array, slow_length)
        
        # Calculate MACD line
        macd_line = []
        for i in range(len(prices_array)):
            if fast_ema_values[i] is None or slow_ema_values[i] is None:
                macd_line.append(None)
            else:
                macd_line.append(fast_ema_values[i] - slow_ema_values[i])
        
        # Calculate signal line (EMA of MACD line)
        signal_line = []
        
        # Calculate multiplier for signal EMA
        multiplier = 2 / (signal_length + 1)
        
        for i in range(len(macd_line)):
            if i < slow_length + signal_length - 2:
                signal_line.append(None)
            elif i == slow_length + signal_length - 2:
                # First signal is SMA of MACD line
                valid_macd = [m for m in macd_line[slow_length-1:i+1] if m is not None]
                if valid_macd:
                    signal = sum(valid_macd) / len(valid_macd)
                    signal_line.append(signal)
                else:
                    signal_line.append(None)
            else:
                # EMA calculation for signal line
                if macd_line[i] is not None and signal_line[i-1] is not None:
                    signal = (macd_line[i] * multiplier) + (signal_line[i-1] * (1 - multiplier))
                    signal_line.append(signal)
                else:
                    signal_line.append(None)
        
        # Calculate histogram
        histogram = []
        for i in range(len(macd_line)):
            if macd_line[i] is None or signal_line[i] is None:
                histogram.append(None)
            else:
                histogram.append(macd_line[i] - signal_line[i])
        
        return {
            "macd": macd_line,
            "signal": signal_line,
            "histogram": histogram
        }
    
    @staticmethod
    def _calculate_ema(prices_array, period):
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
        
        return ema_values


class Stochastic(BaseIndicator):
    """Stochastic Oscillator Indicator"""
    
    @classmethod
    def get_name(cls) -> str:
        return "Stochastic Oscillator"
    
    @classmethod
    def get_description(cls) -> str:
        return "Compares a particular closing price to a range of prices over a certain period of time"
    
    @classmethod
    def get_parameters(cls) -> List[IndicatorParameter]:
        return [
            IndicatorParameter(
                name="k_period",
                type="number",
                description="%K period",
                default=14,
                min_value=1,
                max_value=500
            ),
            IndicatorParameter(
                name="d_period",
                type="number",
                description="%D period (signal line)",
                default=3,
                min_value=1,
                max_value=500
            ),
            IndicatorParameter(
                name="smooth",
                type="number",
                description="Smoothing for %K",
                default=1,
                min_value=1,
                max_value=100
            ),
            IndicatorParameter(
                name="overbought",
                type="number",
                description="Overbought threshold",
                default=80,
                min_value=50,
                max_value=100
            ),
            IndicatorParameter(
                name="oversold",
                type="number",
                description="Oversold threshold",
                default=20,
                min_value=0,
                max_value=50
            ),
        ]
    
    @classmethod
    def calculate(cls, candles: List[Dict[str, Any]], parameters: Dict[str, Any]) -> Dict[str, List[float]]:
        k_period = parameters.get("k_period", 14)
        d_period = parameters.get("d_period", 3)
        smooth = parameters.get("smooth", 1)
        
        # Extract price data from candles
        highs = np.array([candle["high"] for candle in candles])
        lows = np.array([candle["low"] for candle in candles])
        closes = np.array([candle["close"] for candle in candles])
        
        # Calculate %K
        k_values = []
        for i in range(len(closes)):
            if i < k_period - 1:
                k_values.append(None)
            else:
                high_val = max(highs[i-(k_period-1):i+1])
                low_val = min(lows[i-(k_period-1):i+1])
                
                if high_val == low_val:
                    k_values.append(50.0)  # Middle value if range is zero
                else:
                    k = 100 * ((closes[i] - low_val) / (high_val - low_val))
                    k_values.append(k)
        
        # Apply smoothing to %K if required
        if smooth > 1:
            smoothed_k = []
            for i in range(len(k_values)):
                if i < smooth - 1 or k_values[i-(smooth-1)] is None:
                    smoothed_k.append(None)
                else:
                    # Simple moving average for smoothing
                    valid_k = [k for k in k_values[i-(smooth-1):i+1] if k is not None]
                    if valid_k:
                        avg_k = sum(valid_k) / len(valid_k)
                        smoothed_k.append(avg_k)
                    else:
                        smoothed_k.append(None)
            k_values = smoothed_k
        
        # Calculate %D (simple moving average of %K)
        d_values = []
        for i in range(len(k_values)):
            if i < d_period - 1 or k_values[i-(d_period-1)] is None:
                d_values.append(None)
            else:
                valid_k = [k for k in k_values[i-(d_period-1):i+1] if k is not None]
                if valid_k:
                    avg_d = sum(valid_k) / len(valid_k)
                    d_values.append(avg_d)
                else:
                    d_values.append(None)
        
        return {
            "k": k_values,
            "d": d_values
        } 