from typing import Dict, Any, List, Type
from .base import BaseIndicator

# Import all indicators
from .moving_averages import SMA, EMA
from .oscillators import RSI, MACD, Stochastic
from .volume import OBV, VWAP, MoneyFlowIndex

class IndicatorRegistry:
    """Registry for all available indicators"""
    
    _indicators: Dict[str, Type[BaseIndicator]] = {}
    
    @classmethod
    def register(cls, indicator_class: Type[BaseIndicator]) -> None:
        """Register an indicator class with the registry"""
        indicator_name = indicator_class.get_name()
        cls._indicators[indicator_name] = indicator_class
    
    @classmethod
    def get_indicator(cls, name: str) -> Type[BaseIndicator]:
        """Get indicator class by name"""
        if name not in cls._indicators:
            raise ValueError(f"Indicator '{name}' not found in registry")
        return cls._indicators[name]
    
    @classmethod
    def get_all_indicators(cls) -> List[Dict[str, Any]]:
        """Get information about all registered indicators"""
        return [ind_class.get_indicator_info() for ind_class in cls._indicators.values()]
    
    @classmethod
    def calculate_indicator(cls, name: str, candles: List[Dict[str, Any]], parameters: Dict[str, Any]) -> Dict[str, List[float]]:
        """Calculate indicator values using the registered indicator class"""
        indicator_class = cls.get_indicator(name)
        return indicator_class.calculate(candles, parameters)


# Register all indicators
def register_all_indicators():
    """Register all available indicators with the registry"""
    indicators = [
        SMA,
        EMA,
        RSI,
        MACD,
        Stochastic,
        OBV,
        VWAP,
        MoneyFlowIndex
    ]
    
    for indicator_class in indicators:
        IndicatorRegistry.register(indicator_class)

# Register all indicators on module import
register_all_indicators() 