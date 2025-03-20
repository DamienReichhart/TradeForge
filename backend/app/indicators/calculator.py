import pandas as pd
import numpy as np
import ta
from typing import Dict, Any, List

def calculate_indicators(df: pd.DataFrame, indicators_config: Dict[str, Dict[str, Any]]) -> pd.DataFrame:
    """
    Calculate technical indicators based on configuration.
    
    Args:
        df: DataFrame with OHLCV data
        indicators_config: Dictionary of indicator configurations
        
    Returns:
        DataFrame with added indicator columns
    """
    if df.empty:
        return df
    
    # Make a copy to avoid modifying the original
    df = df.copy()
    
    for indicator_name, config in indicators_config.items():
        params = {**config.get("base_parameters", {}), **config.get("parameters", {})}
        
        try:
            if indicator_name == "SMA":
                period = params.get("period", 14)
                df[f'SMA_{period}'] = ta.trend.sma_indicator(df['close'], window=period)
            
            elif indicator_name == "EMA":
                period = params.get("period", 14)
                df[f'EMA_{period}'] = ta.trend.ema_indicator(df['close'], window=period)
            
            elif indicator_name == "RSI":
                period = params.get("period", 14)
                df[f'RSI_{period}'] = ta.momentum.rsi(df['close'], window=period)
            
            elif indicator_name == "MACD":
                fast = params.get("fast_period", 12)
                slow = params.get("slow_period", 26)
                signal = params.get("signal_period", 9)
                
                macd = ta.trend.MACD(
                    close=df['close'],
                    window_fast=fast,
                    window_slow=slow,
                    window_sign=signal
                )
                
                df[f'MACD_line'] = macd.macd()
                df[f'MACD_signal'] = macd.macd_signal()
                df[f'MACD_histogram'] = macd.macd_diff()
            
            elif indicator_name == "Bollinger Bands":
                period = params.get("period", 20)
                std_dev = params.get("std_dev", 2)
                
                bb = ta.volatility.BollingerBands(
                    close=df['close'],
                    window=period,
                    window_dev=std_dev
                )
                
                df[f'BB_upper'] = bb.bollinger_hband()
                df[f'BB_middle'] = bb.bollinger_mavg()
                df[f'BB_lower'] = bb.bollinger_lband()
                df[f'BB_width'] = bb.bollinger_wband()
            
            elif indicator_name == "Stochastic":
                k_period = params.get("k_period", 14)
                d_period = params.get("d_period", 3)
                
                stoch = ta.momentum.StochasticOscillator(
                    high=df['high'],
                    low=df['low'],
                    close=df['close'],
                    window=k_period,
                    smooth_window=d_period
                )
                
                df[f'Stoch_%K'] = stoch.stoch()
                df[f'Stoch_%D'] = stoch.stoch_signal()
            
            elif indicator_name == "ATR":
                period = params.get("period", 14)
                df[f'ATR_{period}'] = ta.volatility.average_true_range(
                    high=df['high'],
                    low=df['low'],
                    close=df['close'],
                    window=period
                )
            
            elif indicator_name == "OBV":
                df['OBV'] = ta.volume.on_balance_volume(
                    close=df['close'],
                    volume=df.get('volume', df.get('tick_volume', df.get('real_volume')))
                )
            
            elif indicator_name == "ADX":
                period = params.get("period", 14)
                adx = ta.trend.ADXIndicator(
                    high=df['high'],
                    low=df['low'],
                    close=df['close'],
                    window=period
                )
                
                df[f'ADX_{period}'] = adx.adx()
                df[f'DI+_{period}'] = adx.adx_pos()
                df[f'DI-_{period}'] = adx.adx_neg()
            
            # Add more indicators as needed
            
        except Exception as e:
            print(f"Error calculating {indicator_name}: {e}")
    
    return df 