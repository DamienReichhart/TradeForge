import unittest
from app.indicators.calculator import prepare_variables, evaluate_condition

class TestIndicatorEquations(unittest.TestCase):
    """Test case for indicator calculations and condition evaluations"""
    
    def test_direct_indicator_access(self):
        """Test that indicators can be accessed directly by name in conditions"""
        # Create test data
        candle = {
            "open": 100,
            "high": 110,
            "low": 95,
            "close": 105,
            "volume": 1000
        }
        
        # Simple indicators (SMA, RSI)
        indicator_values = [
            {"sma": [None, None, None, None, 100.0]},  # SMA indicator
            {"rsi": [None, None, None, None, 60.0]}    # RSI indicator
        ]
        
        # Complex indicator (MACD)
        indicator_values.append({
            "macd_line": [None, None, None, None, 2.5],
            "signal_line": [None, None, None, None, 1.5],
            "histogram": [None, None, None, None, 1.0]
        })
        
        index = 4  # Current candle index
        
        # Prepare variables for condition evaluation
        variables = prepare_variables(candle, indicator_values, index)
        
        # Test direct access by name for simple indicators
        self.assertEqual(variables["sma"], 100.0, "Should be able to access SMA directly by name")
        self.assertEqual(variables["rsi"], 60.0, "Should be able to access RSI directly by name")
        
        # Test direct access for complex indicators
        self.assertEqual(variables["macd_line"], 2.5, "Should be able to access MACD line directly")
        self.assertEqual(variables["signal_line"], 1.5, "Should be able to access MACD signal directly")
        
        # Test indexed access still works
        self.assertEqual(variables["ind_0_sma"], 100.0, "Should be able to access SMA using indexed notation")
        self.assertEqual(variables["ind_1_rsi"], 60.0, "Should be able to access RSI using indexed notation")
        
        # Test conditions with direct access
        self.assertTrue(evaluate_condition("sma < close", candle, indicator_values, index),
                      "Direct SMA comparison should work")
        
        self.assertTrue(evaluate_condition("rsi < 70", candle, indicator_values, index),
                      "Direct RSI comparison should work")
        
        # Test mathematical expression with indicators
        self.assertTrue(evaluate_condition("close > sma + 3", candle, indicator_values, index),
                      "Direct indicator use in mathematical expression should work")
        
        # Test complex condition with multiple indicators
        self.assertTrue(evaluate_condition("close > sma and rsi < 70 and macd_line > 0", 
                                        candle, indicator_values, index),
                      "Complex condition with direct indicator names should work")

if __name__ == "__main__":
    unittest.main() 