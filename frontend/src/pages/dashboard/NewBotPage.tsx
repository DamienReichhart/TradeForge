import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Snackbar, SelectChangeEvent } from '@mui/material';
import BotFormLayout from '../../components/bots/BotFormLayout';
import BasicInfoForm from '../../components/bots/BasicInfoForm';
import IndicatorSelector from '../../components/bots/IndicatorSelector';
import ConditionEditor from '../../components/bots/ConditionEditor';
import BotReview from '../../components/bots/BotReview';
import { botsApi, indicatorsApi } from '../../services/api';

// Types
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
  indicator_name: string;
  simplified_name: string;
  parameters: Record<string, any>;
  output_values?: string[];
}

const NewBotPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State variables
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pair: 'BTC/USDT',
    timeframe: '1h',
    buy_condition: '',
    sell_condition: '',
    tp_condition: '',
    sl_condition: '',
    bot_type: 'standard',
    indicators: [] as SelectedIndicator[],
  });
  
  const [activeStep, setActiveStep] = useState(0);
  const [availableDbIndicators, setAvailableDbIndicators] = useState<any[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([]);
  const [selectedIndicatorName, setSelectedIndicatorName] = useState<string>('');
  const [activeConditionField, setActiveConditionField] = useState<'buy_condition' | 'sell_condition' | 'tp_condition' | 'sl_condition'>('buy_condition');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Constants
  const timeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '1w'];
  const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'SOL/USDT', 'DOGE/USDT'];
  const steps = ['Basic Information', 'Indicators', 'Trading Conditions', 'Review'];
  
  // Fetch data on component mount
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
  
  // Event handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name as string]: value });
  };
  
  // Generate a simplified name for an indicator (e.g., SMA1, RSI2)
  const generateSimplifiedName = (indicatorName: string) => {
    // Remove spaces and replace with camelCase or abbreviation
    let simpleName = indicatorName.replace(/\s+/g, '');
    
    // Count how many indicators of this type already exist
    const count = formData.indicators.filter(ind => 
      ind.indicator_name === indicatorName
    ).length + 1;
    
    return `${simpleName}${count}`;
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
    
    // Generate a simplified name for the indicator
    const simplifiedName = generateSimplifiedName(selectedIndicatorName);
    
    // Create new selected indicator with default parameters
    const newIndicator: SelectedIndicator = {
      indicator_id: dbIndicator.id,
      indicator_name: indicator.name,
      simplified_name: simplifiedName,
      parameters: { ...indicator.default_parameters },
      output_values: indicator.output_values
    };
    
    setFormData({
      ...formData,
      indicators: [...formData.indicators, newIndicator]
    });
    
    // Clear selection
    setSelectedIndicatorName('');
    
    // Show success message
    setSuccessMessage(`Added ${indicator.name} indicator`);
  };
  
  const handleRemoveIndicator = (index: number) => {
    const newIndicators = [...formData.indicators];
    newIndicators.splice(index, 1);
    setFormData({ ...formData, indicators: newIndicators });
  };
  
  const handleParameterChange = (indicatorIndex: number, paramName: string, value: any) => {
    const newIndicators = [...formData.indicators];
    newIndicators[indicatorIndex].parameters[paramName] = value;
    setFormData({ ...formData, indicators: newIndicators });
  };
  
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
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Format data for API
      const botData = {
        name: formData.name,
        description: formData.description,
        pair: formData.pair,
        timeframe: formData.timeframe,
        bot_type: formData.bot_type,
        buy_condition: formData.buy_condition,
        sell_condition: formData.sell_condition,
        indicators: formData.indicators.map(ind => ({
          indicator_id: ind.indicator_id,
          parameters: ind.parameters
        }))
      };
      
      // Add advanced options if available
      if (formData.bot_type === 'advanced') {
        Object.assign(botData, {
          tp_condition: formData.tp_condition,
          sl_condition: formData.sl_condition
        });
      }
      
      console.log('Submitting bot data:', botData);
      
      // Create the bot
      const response = await botsApi.create(botData);
      
      // Navigate to dashboard or bot detail page
      navigate(`/dashboard/${response.data.id}`);
    } catch (err: any) {
      console.error('Error creating bot:', err);
      let errorMessage = 'Failed to create bot. Please check your input and try again.';
      
      // If there's an error response from the API, use that message
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = `API Error: ${err.response.data.detail}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  // Render step content based on active step
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <BasicInfoForm
            formData={formData}
            handleChange={handleChange}
            timeframes={timeframes}
            pairs={pairs}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <Box>
            <IndicatorSelector
              availableIndicators={availableIndicators}
              availableDbIndicators={availableDbIndicators}
              selectedIndicators={formData.indicators}
              handleAddIndicator={handleAddIndicator}
              handleRemoveIndicator={handleRemoveIndicator}
              handleParameterChange={handleParameterChange}
              selectedIndicatorName={selectedIndicatorName}
              setSelectedIndicatorName={setSelectedIndicatorName}
              loading={loading}
              error={error}
            />
            <Box display="flex" justifyContent="flex-end" mt={4}>
              <Box display="flex" gap={2}>
                <button
                  onClick={handleBack}
                  className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium shadow-btn-primary"
                >
                  Continue
                </button>
              </Box>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <ConditionEditor
              formData={formData}
              activeConditionField={activeConditionField}
              setActiveConditionField={setActiveConditionField}
              handleChange={handleChange}
              selectedIndicators={formData.indicators}
              addToConditionField={addToConditionField}
            />
            <Box display="flex" justifyContent="flex-end" mt={4}>
              <Box display="flex" gap={2}>
                <button
                  onClick={handleBack}
                  className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors font-medium shadow-btn-primary"
                >
                  Continue to Review
                </button>
              </Box>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box>
            <BotReview
              formData={formData}
              handleSubmit={handleSubmit}
              loading={loading}
              availableIndicators={availableIndicators}
            />
            <Box display="flex" justifyContent="center" mt={4}>
              <button
                onClick={handleBack}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                Back to Edit
              </button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <BotFormLayout
        title="Create a New Trading Bot"
        subtitle="Configure your bot step by step to automate your cryptocurrency trading strategy"
        activeStep={activeStep}
        steps={steps}
      >
        {getStepContent()}
      </BotFormLayout>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NewBotPage; 