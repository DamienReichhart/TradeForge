import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  styled,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { botsApi } from '../../services/api';
import { debounce } from 'lodash';

// Styled components
const StyledSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const StyledSectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  overflow: 'visible',
}));

const EditorWrapper = styled(Box)(({ theme }) => ({
  '& .MuiTextField-root': {
    fontFamily: 'monospace',
    '& .MuiInputBase-input': {
      fontFamily: 'monospace',
    },
  },
}));

const ElementTab = styled(Tab)(({ theme }) => ({
  minWidth: 'unset',
  padding: theme.spacing(1, 1.5),
}));

const ElementChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  cursor: 'pointer',
  fontFamily: 'monospace',
  borderRadius: '6px',
  fontWeight: 500,
  '&:hover': {
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },
}));

const ElementsWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '10px',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
}));

interface AvailableVariable {
  name: string;
  description: string;
}

interface MathOperator {
  symbol: string;
  description: string;
}

interface MathFunction {
  name: string;
  description: string;
  insertText: string;
}

interface ConditionEditorProps {
  formData: {
    buy_condition: string;
    sell_condition: string;
    tp_condition: string;
    sl_condition: string;
    bot_type: string;
  };
  activeConditionField: 'buy_condition' | 'sell_condition' | 'tp_condition' | 'sl_condition';
  setActiveConditionField: (field: 'buy_condition' | 'sell_condition' | 'tp_condition' | 'sl_condition') => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedIndicators: any[];
  addToConditionField: (value: string) => void;
  validationStatus?: {
    buy_condition: boolean | null;
    sell_condition: boolean | null;
    tp_condition: boolean | null;
    sl_condition: boolean | null;
  };
  setValidationStatus?: (field: 'buy_condition' | 'sell_condition' | 'tp_condition' | 'sl_condition', status: boolean | null) => void;
}

const ConditionEditor: React.FC<ConditionEditorProps> = ({
  formData,
  activeConditionField,
  setActiveConditionField,
  handleChange,
  selectedIndicators,
  addToConditionField,
  validationStatus,
  setValidationStatus
}) => {
  const theme = useTheme();
  const [elementTab, setElementTab] = useState(0);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Available variables for condition editor
  const availableVariables: AvailableVariable[] = [
    { name: 'current_price', description: 'Current price of the asset' },
    { name: 'previous_price', description: 'Previous price of the asset' },
    { name: 'open', description: 'Opening price of the current candle' },
    { name: 'high', description: 'Highest price of the current candle' },
    { name: 'low', description: 'Lowest price of the current candle' },
    { name: 'close', description: 'Closing price of the current candle' },
    { name: 'volume', description: 'Volume of the current candle' },
    { name: 'entry_price', description: 'Price at which the position was opened' }
  ];
  
  // Available mathematical operators
  const mathOperators: MathOperator[] = [
    { symbol: '+', description: 'Addition' },
    { symbol: '-', description: 'Subtraction' },
    { symbol: '*', description: 'Multiplication' },
    { symbol: '/', description: 'Division' },
    { symbol: '>', description: 'Greater than' },
    { symbol: '<', description: 'Less than' },
    { symbol: '>=', description: 'Greater than or equal to' },
    { symbol: '<=', description: 'Less than or equal to' },
    { symbol: '==', description: 'Equal to' },
    { symbol: '!=', description: 'Not equal to' },
    { symbol: 'and', description: 'Logical AND' },
    { symbol: 'or', description: 'Logical OR' },
    { symbol: 'not', description: 'Logical NOT' },
    { symbol: '(', description: 'Opening parenthesis' },
    { symbol: ')', description: 'Closing parenthesis' },
    { symbol: '%', description: 'Modulo (remainder)' },
    { symbol: '**', description: 'Exponentiation (power)' }
  ];
  
  // Available mathematical functions
  const mathFunctions: MathFunction[] = [
    { name: 'abs(x)', description: 'Absolute value', insertText: 'abs()' },
    { name: 'max(x,y)', description: 'Maximum of two values', insertText: 'max(,)' },
    { name: 'min(x,y)', description: 'Minimum of two values', insertText: 'min(,)' },
    { name: 'round(x)', description: 'Round to nearest integer', insertText: 'round()' },
    { name: 'floor(x)', description: 'Round down to nearest integer', insertText: 'floor()' },
    { name: 'ceil(x)', description: 'Round up to nearest integer', insertText: 'ceil()' },
    { name: 'sqrt(x)', description: 'Square root', insertText: 'sqrt()' },
    { name: 'pow(x,y)', description: 'x raised to power y', insertText: 'pow(,)' }
  ];
  
  // Common numerical constants
  const numericalConstants = [
    { value: '0', description: 'Zero' },
    { value: '1', description: 'One' },
    { value: '1.05', description: '1.05 (common for 5% take profit)' },
    { value: '0.95', description: '0.95 (common for 5% stop loss)' },
    { value: '10', description: 'Ten' },
    { value: '50', description: 'Fifty' },
    { value: '70', description: 'Seventy (common RSI overbought level)' },
    { value: '30', description: 'Thirty (common RSI oversold level)' },
    { value: '100', description: 'One hundred' },
    { value: '200', description: 'Two hundred (common for 200-period MA)' }
  ];

  // Handle tab change
  const handleElementTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setElementTab(newValue);
  };

  // Debounced server-side validation function
  const validateWithServer = useCallback(
    debounce(async (condition: string, type: string) => {
      if (!condition.trim()) {
        setIsValid(null);
        setValidationMessage('');
        // Also update parent component's validation status
        if (setValidationStatus) {
          setValidationStatus(activeConditionField, null);
        }
        return;
      }

      setIsValidating(true);
      try {
        const expType = activeConditionField.includes('condition') ? 'condition' : 'calculation';
        const response = await botsApi.validateExpression(condition, expType);
        setIsValid(response.data.valid);
        setValidationMessage(response.data.error || '');
        
        // Update parent component's validation status
        if (setValidationStatus) {
          setValidationStatus(activeConditionField, response.data.valid);
        }
      } catch (error) {
        console.error('Validation error:', error);
        setIsValid(false);
        setValidationMessage('Failed to validate expression');
        
        // Update parent component's validation status
        if (setValidationStatus) {
          setValidationStatus(activeConditionField, false);
        }
      } finally {
        setIsValidating(false);
      }
    }, 500),
    [activeConditionField, setValidationStatus]
  );

  // Enhanced validation that does basic check locally and full validation on server
  const validateCondition = (condition: string) => {
    if (!condition.trim()) {
      setIsValid(null);
      setValidationMessage('');
      // Update parent component's validation status
      if (setValidationStatus) {
        setValidationStatus(activeConditionField, null);
      }
      return;
    }

    try {
      // Simple local validation for immediate feedback - check balanced parentheses
      const stack: string[] = [];
      const pairs: Record<string, string> = { '(': ')' };
      
      for (let i = 0; i < condition.length; i++) {
        const char = condition[i];
        if (char in pairs) {
          stack.push(char);
        } else if (Object.values(pairs).includes(char)) {
          if (stack.length === 0 || pairs[stack.pop()!] !== char) {
            setIsValid(false);
            setValidationMessage('Unbalanced parentheses');
            // Update parent component's validation status
            if (setValidationStatus) {
              setValidationStatus(activeConditionField, false);
            }
            break;
          }
        }
      }
      
      if (stack.length === 0) {
        // Basic validation passes, but we'll let the server decide final validity
        validateWithServer(condition, activeConditionField);
      } else {
        setIsValid(false);
        setValidationMessage('Unbalanced parentheses');
        // Update parent component's validation status
        if (setValidationStatus) {
          setValidationStatus(activeConditionField, false);
        }
      }
    } catch (error) {
      setIsValid(false);
      setValidationMessage('Invalid expression syntax');
      // Update parent component's validation status
      if (setValidationStatus) {
        setValidationStatus(activeConditionField, false);
      }
    }
  };

  // Add useEffect to validate on mount and when fields change
  useEffect(() => {
    // If we have external validation status, use that first
    if (validationStatus && validationStatus[activeConditionField] !== null) {
      setIsValid(validationStatus[activeConditionField]);
    } else {
      // Otherwise, validate locally
      validateCondition(formData[activeConditionField]);
    }
  }, [formData[activeConditionField], activeConditionField, validationStatus]);

  // Custom onChange handler to perform validation
  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    validateCondition(e.target.value);
  };

  // Copy current condition to clipboard
  const copyToClipboard = () => {
    const condition = formData[activeConditionField];
    navigator.clipboard.writeText(condition);
  };

  // Generate example conditions based on selected indicators
  const getExampleCondition = (type: 'buy' | 'sell' | 'tp' | 'sl'): string => {
    if (selectedIndicators.length === 0) {
      return type === 'buy' ? 'current_price > previous_price' :
             type === 'sell' ? 'current_price < previous_price' :
             type === 'tp' ? 'current_price >= entry_price * 1.05' :
             'current_price <= entry_price * 0.95';
    }
    
    if (type === 'buy') {
      // Look for RSI or other momentum indicators first
      const rsiIndicator = selectedIndicators.find(ind => ind.indicator_name.includes('RSI'));
      if (rsiIndicator) {
        const rsiName = rsiIndicator.simplified_name || `RSI${selectedIndicators.indexOf(rsiIndicator) + 1}`;
        return `${rsiName} < 30 and close > open`;
      }
      
      // Look for Moving Average
      const maIndicator = selectedIndicators.find(ind => 
        ind.indicator_name.includes('Moving Average') || ind.indicator_name.includes('SMA') || ind.indicator_name.includes('EMA')
      );
      if (maIndicator) {
        const maName = maIndicator.simplified_name || `MA${selectedIndicators.indexOf(maIndicator) + 1}`;
        return `close > ${maName} and current_price > previous_price`;
      }
      
      // Default with the first indicator
      const firstInd = selectedIndicators[0];
      const firstName = firstInd.simplified_name || firstInd.indicator_name.replace(/\s+/g, '') + '1';
      return `${firstName} > 0 and current_price > previous_price`;
    }
    
    if (type === 'sell') {
      // Look for RSI or other momentum indicators first
      const rsiIndicator = selectedIndicators.find(ind => ind.indicator_name.includes('RSI'));
      if (rsiIndicator) {
        const rsiName = rsiIndicator.simplified_name || `RSI${selectedIndicators.indexOf(rsiIndicator) + 1}`;
        return `${rsiName} > 70 or close < open`;
      }
      
      // Look for Moving Average
      const maIndicator = selectedIndicators.find(ind => 
        ind.indicator_name.includes('Moving Average') || ind.indicator_name.includes('SMA') || ind.indicator_name.includes('EMA')
      );
      if (maIndicator) {
        const maName = maIndicator.simplified_name || `MA${selectedIndicators.indexOf(maIndicator) + 1}`;
        return `close < ${maName} or current_price < previous_price`;
      }
      
      // Default with the first indicator
      const firstInd = selectedIndicators[0];
      const firstName = firstInd.simplified_name || firstInd.indicator_name.replace(/\s+/g, '') + '1';
      return `${firstName} < 0 or current_price < previous_price`;
    }
    
    // For TP and SL, always use price-based conditions
    return type === 'tp' ? 'current_price >= entry_price * 1.05' : 'current_price <= entry_price * 0.95';
  };

  return (
    <StyledSection>
      <StyledSectionTitle variant="h6">
        Trading Conditions
        <Tooltip title="Define when your bot should buy, sell, take profit, or stop loss">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </StyledSectionTitle>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Tabs
            value={
              activeConditionField === 'buy_condition' ? 0 :
              activeConditionField === 'sell_condition' ? 1 :
              activeConditionField === 'tp_condition' ? 2 : 3
            }
            onChange={(_, newValue) => {
              const fields: Array<'buy_condition' | 'sell_condition' | 'tp_condition' | 'sl_condition'> = [
                'buy_condition', 'sell_condition', 'tp_condition', 'sl_condition'
              ];
              setActiveConditionField(fields[newValue]);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              mb: 2,
              '& .MuiTab-root': { 
                borderRadius: '8px 8px 0 0',
                mx: 0.5
              },
              '& .Mui-selected': {
                bgcolor: theme.palette.action.hover
              }
            }}
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-block', 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: 'success.main',
                      mr: 1 
                    }} 
                  />
                  Buy Condition
                </Box>
              } 
              id="condition-tab-0"
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-block', 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: 'error.main',
                      mr: 1 
                    }} 
                  />
                  Sell Condition
                </Box>
              } 
              id="condition-tab-1"
            />
            {formData.bot_type === 'advanced' && (
              <Tab 
                label={
                  <Box display="flex" alignItems="center">
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-block', 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: 'info.main',
                        mr: 1 
                      }} 
                    />
                    Take Profit
                  </Box>
                } 
                id="condition-tab-2"
              />
            )}
            {formData.bot_type === 'advanced' && (
              <Tab 
                label={
                  <Box display="flex" alignItems="center">
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-block', 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        bgcolor: 'warning.main',
                        mr: 1 
                      }} 
                    />
                    Stop Loss
                  </Box>
                } 
                id="condition-tab-3"
              />
            )}
          </Tabs>
        </Grid>

        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <CodeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {activeConditionField === 'buy_condition' ? 'Buy Condition' :
                     activeConditionField === 'sell_condition' ? 'Sell Condition' :
                     activeConditionField === 'tp_condition' ? 'Take Profit Calculation' :
                     'Stop Loss Calculation'}
                  </Typography>
                </Box>
                <Box>
                  {isValid !== null && (
                    <Tooltip title={isValid ? 'Syntax is valid' : 'Syntax error detected'}>
                      <Box component="span" display="inline-flex" mr={1}>
                        {isValid ? 
                          <CheckCircleIcon color="success" /> : 
                          <ErrorIcon color="error" />
                        }
                      </Box>
                    </Tooltip>
                  )}
                  <Tooltip title="Copy condition">
                    <IconButton size="small" onClick={copyToClipboard}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <EditorWrapper>
                <TextField
                  fullWidth
                  multiline
                  id={activeConditionField}
                  name={activeConditionField}
                  value={formData[activeConditionField]}
                  onChange={handleConditionChange}
                  placeholder={getExampleCondition(
                    activeConditionField === 'buy_condition' ? 'buy' :
                    activeConditionField === 'sell_condition' ? 'sell' :
                    activeConditionField === 'tp_condition' ? 'tp' : 'sl'
                  )}
                  minRows={3}
                  maxRows={6}
                  variant="outlined"
                  sx={{
                    fontFamily: 'monospace',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(0, 0, 0, 0.02)',
                      '& fieldset': {
                        borderColor: 
                          isValid === true ? theme.palette.success.main : 
                          isValid === false ? theme.palette.error.main : 
                          theme.palette.divider,
                      },
                      '&:hover fieldset': {
                        borderColor: 
                          isValid === true ? theme.palette.success.main : 
                          isValid === false ? theme.palette.error.main : 
                          theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 
                          isValid === true ? theme.palette.success.main : 
                          isValid === false ? theme.palette.error.main : 
                          theme.palette.primary.main,
                      },
                    },
                  }}
                  FormHelperTextProps={{
                    sx: { 
                      color: isValid ? theme.palette.success.main : 
                             isValid === false ? theme.palette.error.main : 
                             theme.palette.text.secondary
                    }
                  }}
                  helperText={
                    isValidating ? "Validating..." :
                    isValid === null ? "Enter a condition" :
                    isValid ? "Valid expression ✓" : 
                    `Invalid expression: ${validationMessage}`
                  }
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isValid === true && (
                          <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                        )}
                        {isValid === false && (
                          <ErrorIcon color="error" sx={{ ml: 1 }} />
                        )}
                        <Tooltip title="Copy to clipboard">
                          <IconButton 
                            size="small" 
                            onClick={copyToClipboard}
                            sx={{ ml: 1 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ),
                  }}
                  error={isValid === false}
                />
              </EditorWrapper>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Condition Elements
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Tabs
              value={elementTab}
              onChange={handleElementTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              <ElementTab label="Variables" />
              <ElementTab label="Operators" />
              <ElementTab label="Functions" />
              <ElementTab label="Constants" />
              <ElementTab label="Indicators" />
            </Tabs>

            <ElementsWrapper>
              {elementTab === 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Market Data Variables:
                  </Typography>
                  <Box display="flex" flexWrap="wrap">
                    {availableVariables.map((variable) => (
                      <Tooltip key={variable.name} title={variable.description}>
                        <ElementChip
                          label={variable.name}
                          onClick={() => addToConditionField(variable.name)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              )}

              {elementTab === 1 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Mathematical & Logical Operators:
                  </Typography>
                  <Box display="flex" flexWrap="wrap">
                    {mathOperators.map((operator) => (
                      <Tooltip key={operator.symbol} title={operator.description}>
                        <ElementChip
                          label={operator.symbol}
                          onClick={() => addToConditionField(` ${operator.symbol} `)}
                          color="secondary"
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              )}

              {elementTab === 2 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Mathematical Functions:
                  </Typography>
                  <Box display="flex" flexWrap="wrap">
                    {mathFunctions.map((func) => (
                      <Tooltip key={func.name} title={func.description}>
                        <ElementChip
                          label={func.name}
                          onClick={() => addToConditionField(func.insertText)}
                          color="info"
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              )}

              {elementTab === 3 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Common Values:
                  </Typography>
                  <Box display="flex" flexWrap="wrap">
                    {numericalConstants.map((constant) => (
                      <Tooltip key={constant.value} title={constant.description}>
                        <ElementChip
                          label={constant.value}
                          onClick={() => addToConditionField(constant.value)}
                          color="default"
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              )}

              {elementTab === 4 && (
                <Box>
                  {selectedIndicators.length > 0 ? (
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Indicator Outputs:
                      </Typography>
                      <Box display="flex" flexWrap="wrap">
                        {selectedIndicators.map((selectedInd, idx) => {
                          const outputValues = selectedInd.output_values || ['value'];
                          const simplifiedName = selectedInd.simplified_name || 
                            `${selectedInd.indicator_name.replace(/\s+/g, '')}${idx + 1}`;
                          
                          return outputValues.map((value: string) => (
                            <Tooltip 
                              key={`${simplifiedName}${value !== 'value' ? `_${value}` : ''}`} 
                              title={`Output from ${selectedInd.indicator_name}`}
                            >
                              <ElementChip
                                label={`${simplifiedName}${value !== 'value' ? `_${value}` : ''}`}
                                onClick={() => addToConditionField(`${simplifiedName}${value !== 'value' ? `_${value}` : ''}`)}
                                color="success"
                                variant="outlined"
                                size="small"
                              />
                            </Tooltip>
                          ));
                        })}
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No indicators added yet. Add indicators from the previous section to use them in conditions.
                    </Typography>
                  )}
                </Box>
              )}
            </ElementsWrapper>

            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                Click on elements to add them to your condition. Use operators to combine variables and values.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </StyledSection>
  );
};

export default ConditionEditor; 