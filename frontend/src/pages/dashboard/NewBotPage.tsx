import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Divider,
  CircularProgress,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { botsApi, indicatorsApi } from '../../services/api';

interface IndicatorParameter {
  name: string;
  type: string;
  description: string;
  default: any;
  min_value?: number;
  max_value?: number;
  options?: string[];
}

interface Indicator {
  name: string;
  description: string;
  parameters: IndicatorParameter[];
  default_parameters: Record<string, any>;
  output_values?: string[];
}

interface SelectedIndicator {
  indicator_id: number;
  indicator_name: string; // Added for UI display
  parameters: Record<string, any>;
}

const NewBotPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pair: 'BTC/USDT',
    timeframe: '1h',
    buy_condition: '', // Added for condition editor
    sell_condition: '', // Added for condition editor
    tp_condition: '', // Take Profit condition for advanced bots
    sl_condition: '', // Stop Loss condition for advanced bots
    bot_type: 'standard', // 'standard' or 'advanced'
    indicators: [] as SelectedIndicator[],
  });
  
  const [availableDbIndicators, setAvailableDbIndicators] = useState<any[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([]);
  const [selectedIndicatorName, setSelectedIndicatorName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConditionField, setActiveConditionField] = useState<'buy_condition' | 'sell_condition' | 'tp_condition' | 'sl_condition'>('buy_condition');
  
  const timeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '1w'];
  const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'SOL/USDT', 'DOGE/USDT'];
  
  // Available variables for condition editor
  const availableVariables = [
    { name: 'current_price', description: 'Current price of the asset' },
    { name: 'previous_price', description: 'Previous price of the asset' },
    { name: 'open', description: 'Opening price of the current candle' },
    { name: 'high', description: 'Highest price of the current candle' },
    { name: 'low', description: 'Lowest price of the current candle' },
    { name: 'close', description: 'Closing price of the current candle' },
    { name: 'volume', description: 'Volume of the current candle' }
  ];
  
  // Available mathematical operators
  const mathOperators = [
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
  const mathFunctions = [
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
    { value: '10', description: 'Ten' },
    { value: '50', description: 'Fifty' },
    { value: '70', description: 'Seventy (common RSI overbought level)' },
    { value: '30', description: 'Thirty (common RSI oversold level)' },
    { value: '100', description: 'One hundred' },
    { value: '200', description: 'Two hundred (common for 200-period MA)' }
  ];
  
  // Function to add a string to the currently focused condition field
  const addToConditionField = (value: string) => {
    const isInsideFunction = value.includes('()') || value.includes('(,)');
    const fieldMap = {
      'buy_condition': formData.buy_condition,
      'sell_condition': formData.sell_condition,
      'tp_condition': formData.tp_condition,
      'sl_condition': formData.sl_condition
    };
    
    const currentValue = fieldMap[activeConditionField];
    
    // Get the field element
    const fieldElement = document.getElementById(activeConditionField) as HTMLTextAreaElement;
    
    // Get cursor position
    const cursorPos = fieldElement?.selectionStart || currentValue.length;
    
    // Create new value with insertion
    let newValue;
    if (isInsideFunction) {
      // For functions, insert value and position cursor inside parentheses
      const beforeCursor = currentValue.substring(0, cursorPos);
      const afterCursor = currentValue.substring(cursorPos);
      
      // Replace parentheses for proper cursor placement
      let adjustedValue = value;
      let cursorAdjustment = 1; // Default - position after first parenthesis
      
      if (value.includes('(,)')) {
        // For functions with multiple arguments, position after first comma
        adjustedValue = value.replace('(,)', '(,)');
        cursorAdjustment = 1; // Position after first (
      }
      
      newValue = beforeCursor + adjustedValue + afterCursor;
      
      // Set the new value in the state
      setFormData({
        ...formData,
        [activeConditionField]: newValue
      });
      
      // Set cursor position inside the parentheses after the state update
      setTimeout(() => {
        if (fieldElement) {
          const newPos = cursorPos + adjustedValue.indexOf('(') + cursorAdjustment;
          fieldElement.focus();
          fieldElement.setSelectionRange(newPos, newPos);
        }
      }, 0);
    } else {
      // For normal operators and variables
      const beforeCursor = currentValue.substring(0, cursorPos);
      const afterCursor = currentValue.substring(cursorPos);
      newValue = beforeCursor + value + afterCursor;
      
      // Set the new value in the state
      setFormData({
        ...formData,
        [activeConditionField]: newValue
      });
      
      // Set cursor position after the inserted text
      setTimeout(() => {
        if (fieldElement) {
          const newPos = cursorPos + value.length;
          fieldElement.focus();
          fieldElement.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch database indicators
        const dbIndicatorsResponse = await indicatorsApi.getAll();
        setAvailableDbIndicators(dbIndicatorsResponse.data);
        
        // Fetch available indicators with parameters
        const indicatorsResponse = await indicatorsApi.getAvailable();
        setAvailableIndicators(indicatorsResponse.data);
      } catch (err) {
        console.error('Error fetching indicators:', err);
        setError('Failed to load indicators. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name as string]: value });
  };
  
  const handleAddIndicator = () => {
    if (!selectedIndicatorName) return;
    
    const indicator = availableIndicators.find(ind => ind.name === selectedIndicatorName);
    if (!indicator) return;
    
    // Find the corresponding database indicator
    const dbIndicator = availableDbIndicators.find(dbInd => dbInd.type === selectedIndicatorName);
    if (!dbIndicator) {
      setError('Indicator not found in database. Please contact administrator.');
      return;
    }
    
    const newIndicator: SelectedIndicator = {
      indicator_id: dbIndicator.id,
      indicator_name: indicator.name,
      parameters: { ...indicator.default_parameters }
    };
    
    setFormData({
      ...formData,
      indicators: [...formData.indicators, newIndicator]
    });
    
    setSelectedIndicatorName('');
  };
  
  const handleRemoveIndicator = (index: number) => {
    const newIndicators = [...formData.indicators];
    newIndicators.splice(index, 1);
    
    setFormData({
      ...formData,
      indicators: newIndicators
    });
  };
  
  const handleParameterChange = (indicatorIndex: number, paramName: string, value: any) => {
    const newIndicators = [...formData.indicators];
    newIndicators[indicatorIndex].parameters[paramName] = value;
    
    setFormData({
      ...formData,
      indicators: newIndicators
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Bot name is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert indicators to the format expected by the API
      const indicators = formData.indicators.map(ind => ({
        indicator_id: ind.indicator_id,
        parameters: ind.parameters
      }));
      
      const data = {
        ...formData,
        indicators
      };
      
      await botsApi.create(data);
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error creating bot:', err);
      setError(err.response?.data?.detail || 'Failed to create bot. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderParameterInput = (parameter: IndicatorParameter, value: any, onChange: (value: any) => void) => {
    switch (parameter.type) {
      case 'number':
        if (parameter.min_value !== undefined && parameter.max_value !== undefined) {
          return (
            <Box sx={{ width: '100%', px: 2 }}>
              <Typography gutterBottom>
                {parameter.name}: {value}
              </Typography>
              <Slider
                value={value}
                onChange={(_, newValue) => onChange(newValue)}
                min={parameter.min_value}
                max={parameter.max_value}
                step={parameter.min_value < 1 ? 0.01 : 1}
                valueLabelDisplay="auto"
              />
            </Box>
          );
        } else {
          return (
            <TextField
              fullWidth
              type="number"
              label={parameter.name}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              sx={{ mb: 2 }}
            />
          );
        }
      
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
              />
            }
            label={parameter.name}
            sx={{ mb: 2 }}
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{parameter.name}</InputLabel>
            <Select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              label={parameter.name}
            >
              {parameter.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      default:
        return (
          <TextField
            fullWidth
            label={parameter.name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            sx={{ mb: 2 }}
          />
        );
    }
  };
  
  const renderVariablesHelp = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Available Variables:
      </Typography>
      <Grid container spacing={1}>
        {availableVariables.map((variable) => (
          <Grid item key={variable.name}>
            <Tooltip title={variable.description}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => addToConditionField(variable.name)}
              >
                {variable.name}
              </Button>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  
  const renderMathOperators = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Mathematical Operators:
      </Typography>
      <Grid container spacing={1}>
        {mathOperators.map((operator) => (
          <Grid item key={operator.symbol}>
            <Tooltip title={operator.description}>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => addToConditionField(' ' + operator.symbol + ' ')}
              >
                {operator.symbol}
              </Button>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  
  const renderMathFunctions = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Mathematical Functions:
      </Typography>
      <Grid container spacing={1}>
        {mathFunctions.map((func) => (
          <Grid item key={func.name}>
            <Tooltip title={func.description}>
              <Button
                size="small"
                variant="outlined"
                color="info"
                onClick={() => addToConditionField(func.insertText)}
              >
                {func.name}
              </Button>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  
  const renderNumericalConstants = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Numerical Constants:
      </Typography>
      <Grid container spacing={1}>
        {numericalConstants.map((constant) => (
          <Grid item key={constant.value}>
            <Tooltip title={constant.description}>
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={() => addToConditionField(constant.value)}
              >
                {constant.value}
              </Button>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  
  const renderIndicatorVariablesHelp = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Indicator Variables:
      </Typography>
      {formData.indicators.length > 0 ? (
        <Grid container spacing={1}>
          {formData.indicators.map((ind, index) => {
            const indicator = availableIndicators.find(i => i.name === ind.indicator_name);
            if (!indicator) return null;
            
            const outputKeys = indicator.output_values || ['value'];
            
            return (
              <React.Fragment key={index}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    {ind.indicator_name}:
                  </Typography>
                </Grid>
                {outputKeys.map((key: string) => (
                  <Grid item key={`${index}-${key}`}>
                    <Tooltip title={`${ind.indicator_name} ${key} value`}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => addToConditionField(`ind_${index}_${key}`)}
                      >
                        ind_{index}_{key}
                      </Button>
                    </Tooltip>
                  </Grid>
                ))}
                
                {/* Add direct indicator name access buttons */}
                {outputKeys.map((key: string) => {
                  // For single-output indicators, use the indicator name directly
                  // For multi-output indicators, use indicator_outputname format
                  const directVarName = outputKeys.length === 1 
                    ? ind.indicator_name.toLowerCase() 
                    : key.toLowerCase();
                  
                  return (
                    <Grid item key={`direct-${index}-${key}`}>
                      <Tooltip title={`Direct access to ${ind.indicator_name} ${key} value (for equations)`}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => addToConditionField(directVarName)}
                        >
                          {directVarName}
                        </Button>
                      </Tooltip>
                    </Grid>
                  );
                })}
              </React.Fragment>
            );
          })}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Add indicators to use their values in conditions
        </Typography>
      )}
    </Box>
  );

  if (loading && availableIndicators.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Trading Bot
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                name="name"
                label="Bot Name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="pair-label">Trading Pair</InputLabel>
                <Select
                  labelId="pair-label"
                  id="pair"
                  name="pair"
                  value={formData.pair}
                  onChange={(e: SelectChangeEvent) => {
                    setFormData({ ...formData, pair: e.target.value });
                  }}
                  label="Trading Pair"
                >
                  {pairs.map((pair) => (
                    <MenuItem key={pair} value={pair}>
                      {pair}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="timeframe-label">Timeframe</InputLabel>
                <Select
                  labelId="timeframe-label"
                  id="timeframe"
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={(e: SelectChangeEvent) => {
                    setFormData({ ...formData, timeframe: e.target.value });
                  }}
                  label="Timeframe"
                >
                  {timeframes.map((timeframe) => (
                    <MenuItem key={timeframe} value={timeframe}>
                      {timeframe}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Bot Type
                </Typography>
              </Divider>
              
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Button 
                  variant={formData.bot_type === 'standard' ? 'contained' : 'outlined'}
                  onClick={() => setFormData({ ...formData, bot_type: 'standard' })}
                  fullWidth
                >
                  Standard Bot
                </Button>
                
                <Button 
                  variant={formData.bot_type === 'advanced' ? 'contained' : 'outlined'}
                  onClick={() => setFormData({ ...formData, bot_type: 'advanced' })}
                  fullWidth
                >
                  Advanced Bot
                </Button>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {formData.bot_type === 'standard' 
                    ? 'Standard bot: Single active trade with simple buy and sell conditions.' 
                    : 'Advanced bot: Adds take profit and stop loss calculation capabilities.'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Technical Indicators
                </Typography>
              </Divider>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <FormControl fullWidth sx={{ mr: 2 }}>
                  <InputLabel id="indicator-label">Select Indicator</InputLabel>
                  <Select
                    labelId="indicator-label"
                    id="indicator"
                    value={selectedIndicatorName}
                    onChange={(e) => setSelectedIndicatorName(e.target.value)}
                    label="Select Indicator"
                  >
                    {availableIndicators.map((indicator) => (
                      <MenuItem key={indicator.name} value={indicator.name}>
                        {indicator.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={handleAddIndicator}
                  disabled={!selectedIndicatorName}
                >
                  Add
                </Button>
              </Box>
              
              {formData.indicators.length > 0 ? (
                <Box>
                  {formData.indicators.map((selectedInd, index) => {
                    const indicator = availableIndicators.find(ind => ind.name === selectedInd.indicator_name);
                    
                    if (!indicator) return null;
                    
                    return (
                      <Accordion key={index} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>{selectedInd.indicator_name}</Typography>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveIndicator(index);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {indicator.description}
                          </Typography>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Parameters:
                          </Typography>
                          
                          {indicator.parameters.map((parameter) => (
                            <Box key={parameter.name} sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {parameter.name}
                                </Typography>
                                <Tooltip title={parameter.description}>
                                  <InfoIcon fontSize="small" color="disabled" />
                                </Tooltip>
                              </Box>
                              
                              {renderParameterInput(
                                parameter,
                                selectedInd.parameters[parameter.name],
                                (value) => handleParameterChange(index, parameter.name, value)
                              )}
                            </Box>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 2 }}>
                  No indicators selected. Add at least one indicator for your bot.
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Trading Conditions
                </Typography>
              </Divider>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You can use both indexed indicator references (e.g., ind_0_sma) and direct indicator names (e.g., sma, rsi) in your conditions and mathematical equations.
              </Typography>
              
              <Box sx={{ mb: 2, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  How to Create Conditions:
                </Typography>
                <Typography variant="body2">
                  1. Click in the Buy or Sell Condition field where you want to insert
                </Typography>
                <Typography variant="body2">
                  2. Click on any variable, operator, function or number below to add it at cursor position
                </Typography>
                <Typography variant="body2">
                  3. For functions like max() or min(), the cursor will be positioned inside the parentheses
                </Typography>
                <Typography variant="body2">
                  Example condition: <strong>close {'>'} sma and rsi {'<'} 30</strong>
                </Typography>
              </Box>
              
              {renderVariablesHelp()}
              {renderMathOperators()}
              {renderMathFunctions()}
              {renderNumericalConstants()}
              {renderIndicatorVariablesHelp()}
              
              <Typography variant="subtitle2" gutterBottom>
                Buy Condition:
              </Typography>
              <TextField
                fullWidth
                id="buy_condition"
                name="buy_condition"
                placeholder="e.g., current_price > sma or close > ema"
                value={formData.buy_condition}
                onChange={handleChange}
                onFocus={() => setActiveConditionField('buy_condition')}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle2" gutterBottom>
                Sell Condition:
              </Typography>
              <TextField
                fullWidth
                id="sell_condition"
                name="sell_condition"
                placeholder="e.g., current_price < sma or close < ema"
                value={formData.sell_condition}
                onChange={handleChange}
                onFocus={() => setActiveConditionField('sell_condition')}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              
              {formData.bot_type === 'advanced' && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Advanced Bot Settings
                    </Typography>
                  </Divider>
                  
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Take Profit & Stop Loss Conditions:
                    </Typography>
                    <Typography variant="body2">
                      1. Enter a numeric calculation that will resolve to a percentage or direct price
                    </Typography>
                    <Typography variant="body2">
                      2. If the result is less than 10, it will be treated as a percentage of entry price
                    </Typography>
                    <Typography variant="body2">
                      3. If the result is 10 or greater, it will be treated as a direct price target
                    </Typography>
                    <Typography variant="body2">
                      Example TP: <strong>5</strong> (5% above entry price) or <strong>50000</strong> (direct price of 50000)
                    </Typography>
                    <Typography variant="body2">
                      Example SL: <strong>3</strong> (3% below entry price) or <strong>45000</strong> (direct price of 45000)
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Take Profit Condition:
                  </Typography>
                  <TextField
                    fullWidth
                    id="tp_condition"
                    name="tp_condition"
                    placeholder="e.g., 5 (for 5% TP) or atr * 2 (dynamic TP based on ATR)"
                    value={formData.tp_condition}
                    onChange={handleChange}
                    onFocus={() => setActiveConditionField('tp_condition')}
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Stop Loss Condition:
                  </Typography>
                  <TextField
                    fullWidth
                    id="sl_condition"
                    name="sl_condition"
                    placeholder="e.g., 3 (for 3% SL) or atr * 1.5 (dynamic SL based on ATR)"
                    value={formData.sl_condition}
                    onChange={handleChange}
                    onFocus={() => setActiveConditionField('sl_condition')}
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              sx={{ mr: 2 }}
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Bot'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default NewBotPage; 