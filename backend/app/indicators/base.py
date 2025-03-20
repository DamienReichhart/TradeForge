from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class IndicatorParameter(BaseModel):
    name: str
    type: str  # 'number', 'boolean', 'string', 'select'
    description: str
    default: Any
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    options: Optional[List[str]] = None  # For 'select' type

class BaseIndicator(ABC):
    """Base class for all trading indicators"""
    
    @classmethod
    @abstractmethod
    def get_name(cls) -> str:
        """Return the name of the indicator"""
        pass
    
    @classmethod
    @abstractmethod
    def get_description(cls) -> str:
        """Return the description of the indicator"""
        pass
    
    @classmethod
    @abstractmethod
    def get_parameters(cls) -> List[IndicatorParameter]:
        """Return the list of parameters for this indicator"""
        pass
    
    @classmethod
    def get_default_parameters(cls) -> Dict[str, Any]:
        """Return default parameters as a dictionary"""
        return {param.name: param.default for param in cls.get_parameters()}
    
    @classmethod
    def get_indicator_info(cls) -> Dict[str, Any]:
        """Return all indicator information in a structured format"""
        return {
            "name": cls.get_name(),
            "description": cls.get_description(),
            "parameters": [param.dict() for param in cls.get_parameters()],
            "default_parameters": cls.get_default_parameters()
        }
    
    @classmethod
    @abstractmethod
    def calculate(cls, candles: List[Dict[str, Any]], parameters: Dict[str, Any]) -> Dict[str, List[float]]:
        """
        Calculate indicator values based on candles and parameters
        
        Args:
            candles: List of candle data (OHLCV)
            parameters: Dictionary of parameters for the indicator
            
        Returns:
            Dictionary with indicator values as lists
        """
        pass 