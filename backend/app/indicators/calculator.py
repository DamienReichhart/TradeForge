import pandas as pd
import numpy as np
import ta
from typing import Dict, Any, List, Union, Callable
import re
import ast
import operator as op
import logging

logger = logging.getLogger(__name__)

# Supported operators
operators = {
    ast.Add: op.add,
    ast.Sub: op.sub,
    ast.Mult: op.mul,
    ast.Div: op.truediv,
    ast.FloorDiv: op.floordiv,
    ast.Pow: op.pow,
    ast.USub: op.neg,
    ast.UAdd: op.pos,
    ast.Gt: op.gt,
    ast.Lt: op.lt,
    ast.GtE: op.ge,
    ast.LtE: op.le,
    ast.Eq: op.eq,
    ast.NotEq: op.ne,
    ast.And: lambda x, y: x and y,
    ast.Or: lambda x, y: x or y,
    ast.Not: op.not_,
    ast.Mod: op.mod,
}

class ConditionEvaluator:
    """Evaluates trading conditions with indicator values"""
    
    def __init__(self, variables: Dict[str, Any]):
        self.variables = variables
    
    def eval(self, expression: str) -> bool:
        """
        Evaluate a string expression safely.
        
        Args:
            expression: String expression to evaluate
            
        Returns:
            Result of the expression evaluation
        """
        try:
            return self._eval(ast.parse(expression, mode='eval').body)
        except (SyntaxError, TypeError, KeyError, ValueError, AttributeError) as e:
            logger.error(f"Error evaluating condition: {expression}, error: {str(e)}")
            return False
    
    def _eval(self, node: ast.AST) -> Any:
        """
        Recursive evaluation of AST nodes.
        
        Args:
            node: AST node to evaluate
            
        Returns:
            Result of the node evaluation
        """
        # Constants
        if isinstance(node, ast.Num):
            return node.n
        elif isinstance(node, ast.Str):
            return node.s
        elif isinstance(node, ast.NameConstant):
            return node.value
        
        # Names
        elif isinstance(node, ast.Name):
            if node.id in self.variables:
                return self.variables[node.id]
            raise KeyError(f"Variable '{node.id}' not found")
        
        # Binary operations
        elif isinstance(node, ast.BinOp):
            return operators[type(node.op)](
                self._eval(node.left), 
                self._eval(node.right)
            )
        
        # Boolean operations
        elif isinstance(node, ast.BoolOp):
            if isinstance(node.op, ast.And):
                return all(self._eval(value) for value in node.values)
            elif isinstance(node.op, ast.Or):
                return any(self._eval(value) for value in node.values)
            raise TypeError(f"Unsupported boolean operation: {type(node.op)}")
        
        # Comparisons
        elif isinstance(node, ast.Compare):
            left = self._eval(node.left)
            for op, comp in zip(node.ops, node.comparators):
                right = self._eval(comp)
                if not operators[type(op)](left, right):
                    return False
                left = right
            return True
        
        # Unary operations
        elif isinstance(node, ast.UnaryOp):
            return operators[type(node.op)](self._eval(node.operand))
        
        # Expressions (root node)
        elif isinstance(node, ast.Expr):
            return self._eval(node.value)
        
        else:
            raise TypeError(f"Unsupported node type: {node.__class__.__name__}")

def prepare_variables(candle: Dict[str, Any], indicator_values: List[Dict[str, Any]], index: int) -> Dict[str, Any]:
    """
    Prepare variables for condition evaluation.
    
    Args:
        candle: Current candle data
        indicator_values: List of indicator values
        index: Current candle index
        
    Returns:
        Dictionary of variables for condition evaluation
    """
    variables = {
        # Candle data
        'open': candle['open'],
        'high': candle['high'],
        'low': candle['low'],
        'close': candle['close'],
        'volume': candle['volume'],
        'current_price': candle['close'],
        'previous_price': candle['previous_close'] if 'previous_close' in candle else None,
        'time': candle['time'] if 'time' in candle else None,
    }
    
    # Add indicator values - both with index prefix and direct name
    for i, indicator in enumerate(indicator_values):
        for key, values in indicator.items():
            if values and index < len(values) and values[index] is not None:
                # Original indexed format
                variables[f'ind_{i}_{key}'] = values[index]
                
                # Direct indicator name access - this allows using the indicator name in equations
                # For example, if the indicator is SMA, it can be accessed as "sma" in equations
                # For multi-value indicators, we use indicator_valuename format (e.g., macd_line)
                if len(indicator.keys()) == 1:
                    # Simple indicators with single value (like SMA, RSI)
                    indicator_name = list(indicator.keys())[0]
                    variables[indicator_name.lower()] = values[index]
                else:
                    # Complex indicators with multiple values (like MACD with line, signal, histogram)
                    variables[key.lower()] = values[index]
    
    return variables

def evaluate_condition(condition: str, candle: Dict[str, Any], indicator_values: List[Dict[str, Any]], index: int) -> bool:
    """
    Evaluate a trading condition.
    
    Args:
        condition: Condition string to evaluate
        candle: Current candle data
        indicator_values: List of indicator values
        index: Current candle index
        
    Returns:
        True if condition is met, False otherwise
    """
    if not condition or condition.strip() == '':
        return False
    
    variables = prepare_variables(candle, indicator_values, index)
    evaluator = ConditionEvaluator(variables)
    
    try:
        return evaluator.eval(condition)
    except Exception as e:
        logger.error(f"Error evaluating condition: {condition}, error: {str(e)}")
        return False

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