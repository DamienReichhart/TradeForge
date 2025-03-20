import numpy as np
from typing import Dict, Any, List
from .base import BaseIndicator, IndicatorParameter

class OBV(BaseIndicator):
    """On-Balance Volume Indicator"""
    
    @classmethod
    def get_name(cls) -> str:
        return "On-Balance Volume (OBV)"
    
    @classmethod
    def get_description(cls) -> str:
        return "Technical indicator that uses volume flow to predict changes in price"
    
    @classmethod
    def get_parameters(cls) -> List[IndicatorParameter]:
        return [
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
        source = parameters.get("source", "close")
        
        # Extract price and volume data from candles
        prices = [candle[source] for candle in candles]
        volumes = [candle["volume"] for candle in candles]
        
        # Convert to numpy arrays for easier calculation
        prices_array = np.array(prices)
        volumes_array = np.array(volumes)
        
        # Calculate OBV
        obv_values = [float(volumes_array[0])]  # Start with first volume
        
        for i in range(1, len(prices_array)):
            if prices_array[i] > prices_array[i-1]:
                # If price increased, add volume
                obv_values.append(obv_values[-1] + volumes_array[i])
            elif prices_array[i] < prices_array[i-1]:
                # If price decreased, subtract volume
                obv_values.append(obv_values[-1] - volumes_array[i])
            else:
                # If price unchanged, keep OBV the same
                obv_values.append(obv_values[-1])
        
        return {"obv": obv_values}


class VWAP(BaseIndicator):
    """Volume Weighted Average Price Indicator"""
    
    @classmethod
    def get_name(cls) -> str:
        return "Volume Weighted Average Price (VWAP)"
    
    @classmethod
    def get_description(cls) -> str:
        return "Calculates the average price weighted by volume, showing the true average price"
    
    @classmethod
    def get_parameters(cls) -> List[IndicatorParameter]:
        return [
            IndicatorParameter(
                name="anchor",
                type="select",
                description="Anchor point for calculation",
                default="session",
                options=["session", "daily", "weekly", "monthly"]
            ),
        ]
    
    @classmethod
    def calculate(cls, candles: List[Dict[str, Any]], parameters: Dict[str, Any]) -> Dict[str, List[float]]:
        anchor = parameters.get("anchor", "session")
        
        # Extract price and volume data from candles
        # For VWAP, we use typical price: (high + low + close) / 3
        typical_prices = [(candle["high"] + candle["low"] + candle["close"]) / 3 for candle in candles]
        volumes = [candle["volume"] for candle in candles]
        
        # Convert to numpy arrays for easier calculation
        tp_array = np.array(typical_prices)
        volumes_array = np.array(volumes)
        
        # Initialize lists for cumulative values
        cum_tp_vol = []
        cum_vol = []
        vwap_values = []
        
        # Calculate VWAP based on anchor point
        if anchor == "session":
            # For session, calculate from the beginning of the data
            cum_tp_vol_sum = 0
            cum_vol_sum = 0
            
            for i in range(len(tp_array)):
                cum_tp_vol_sum += tp_array[i] * volumes_array[i]
                cum_vol_sum += volumes_array[i]
                
                cum_tp_vol.append(cum_tp_vol_sum)
                cum_vol.append(cum_vol_sum)
                
                if cum_vol_sum == 0:
                    vwap_values.append(None)
                else:
                    vwap_values.append(cum_tp_vol_sum / cum_vol_sum)
        
        else:
            # Implementation for daily, weekly, monthly would go here
            # For simplicity, we'll just use session calculation for now
            cum_tp_vol_sum = 0
            cum_vol_sum = 0
            
            for i in range(len(tp_array)):
                cum_tp_vol_sum += tp_array[i] * volumes_array[i]
                cum_vol_sum += volumes_array[i]
                
                cum_tp_vol.append(cum_tp_vol_sum)
                cum_vol.append(cum_vol_sum)
                
                if cum_vol_sum == 0:
                    vwap_values.append(None)
                else:
                    vwap_values.append(cum_tp_vol_sum / cum_vol_sum)
        
        return {"vwap": vwap_values}


class MoneyFlowIndex(BaseIndicator):
    """Money Flow Index Indicator"""
    
    @classmethod
    def get_name(cls) -> str:
        return "Money Flow Index (MFI)"
    
    @classmethod
    def get_description(cls) -> str:
        return "Measures the flow of money into and out of an asset over time, combining price and volume"
    
    @classmethod
    def get_parameters(cls) -> List[IndicatorParameter]:
        return [
            IndicatorParameter(
                name="period",
                type="number",
                description="Number of periods for MFI calculation",
                default=14,
                min_value=1,
                max_value=500
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
        period = parameters.get("period", 14)
        
        # Extract price and volume data from candles
        typical_prices = [(candle["high"] + candle["low"] + candle["close"]) / 3 for candle in candles]
        volumes = [candle["volume"] for candle in candles]
        
        # Calculate raw money flow
        raw_money_flow = [tp * vol for tp, vol in zip(typical_prices, volumes)]
        
        # Initialize MFI values
        mfi_values = [None] * period
        
        for i in range(period, len(typical_prices)):
            pos_flow = 0
            neg_flow = 0
            
            # Calculate positive and negative money flow
            for j in range(i-period+1, i+1):
                if j > 0:
                    if typical_prices[j] > typical_prices[j-1]:
                        pos_flow += raw_money_flow[j]
                    elif typical_prices[j] < typical_prices[j-1]:
                        neg_flow += raw_money_flow[j]
            
            # Calculate money flow ratio and MFI
            if neg_flow == 0:
                mfi = 100.0
            else:
                money_ratio = pos_flow / neg_flow
                mfi = 100.0 - (100.0 / (1.0 + money_ratio))
            
            mfi_values.append(mfi)
        
        return {"mfi": mfi_values} 