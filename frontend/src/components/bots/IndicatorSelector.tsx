import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  styled, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  IconButton, 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  Grid, 
  TextField, 
  Slider, 
  Chip, 
  Tooltip,
  Divider,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import TuneIcon from '@mui/icons-material/Tune';

// Types
interface IndicatorParameter {
  name: string;
  type: string;  // 'number', 'boolean', 'string', 'select'
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
}

// Styled Components
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
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  },
  overflow: 'visible'
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  '& .MuiCardHeader-title': {
    fontWeight: 600,
  },
  padding: theme.spacing(2),
  paddingBottom: 0,
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingTop: 0,
  justifyContent: 'flex-end',
}));

const IndicatorChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '6px',
  fontWeight: 500,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
}));

interface IndicatorSelectorProps {
  availableIndicators: Indicator[];
  availableDbIndicators: any[];
  selectedIndicators: SelectedIndicator[];
  handleAddIndicator: (indicatorName: string) => void;
  handleRemoveIndicator: (index: number) => void;
  handleParameterChange: (indicatorIndex: number, paramName: string, value: any) => void;
  selectedIndicatorName: string;
  setSelectedIndicatorName: (name: string) => void;
  loading: boolean;
  error: string | null;
}

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
  availableIndicators,
  availableDbIndicators,
  selectedIndicators,
  handleAddIndicator,
  handleRemoveIndicator,
  handleParameterChange,
  selectedIndicatorName,
  setSelectedIndicatorName,
  loading,
  error
}) => {
  // Group indicators by category for better organization
  const indicatorCategories: Record<string, string[]> = {
    'Trend': ['Moving Average', 'MACD', 'ADX', 'Parabolic SAR'],
    'Momentum': ['RSI', 'Stochastic', 'CCI', 'Williams %R'],
    'Volatility': ['Bollinger Bands', 'ATR', 'Standard Deviation'],
    'Volume': ['OBV', 'Volume', 'MFI'],
    'Other': [] // For indicators that don't fit in other categories
  };

  // Categorize available indicators
  const categorizedIndicators: Record<string, Indicator[]> = 
    Object.keys(indicatorCategories).reduce((acc, category) => {
      acc[category] = availableIndicators.filter(i => 
        indicatorCategories[category].includes(i.name)
      );
      return acc;
    }, {} as Record<string, Indicator[]>);
  
  // Add any uncategorized indicators to "Other"
  categorizedIndicators['Other'] = availableIndicators.filter(i => 
    !Object.values(indicatorCategories).flat().includes(i.name)
  );

  // Common input sources for indicators
  const commonSources = ['open', 'high', 'low', 'close', 'volume', 'hl2', 'hlc3', 'ohlc4'];

  const renderParameterInput = (parameter: IndicatorParameter, value: any, onChange: (value: any) => void) => {
    switch (parameter.type) {
      case 'integer':
      case 'number':
        if (parameter.min_value !== undefined && parameter.max_value !== undefined) {
          return (
            <Box sx={{ width: '100%', my: 1 }}>
              <Typography variant="body2" gutterBottom>
                {parameter.name}: {value}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs>
                  <Slider
                    min={parameter.min_value}
                    max={parameter.max_value}
                    value={Number(value)}
                    onChange={(_, newValue) => onChange(newValue)}
                    valueLabelDisplay="auto"
                    step={parameter.type === 'integer' ? 1 : (parameter.max_value - parameter.min_value) / 100}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    size="small"
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parameter.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))}
                    InputProps={{ inputProps: { min: parameter.min_value, max: parameter.max_value } }}
                  />
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary">
                {parameter.description}
              </Typography>
            </Box>
          );
        } else {
          return (
            <TextField
              fullWidth
              label={parameter.name}
              type="number"
              value={value}
              onChange={(e) => onChange(parameter.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))}
              helperText={parameter.description}
              margin="normal"
              size="small"
            />
          );
        }
      
      case 'string':
        // Use dropdown for any parameter with options or if name is 'source'
        if (parameter.options) {
          const options = parameter.options || [];
          return (
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>{parameter.name}</InputLabel>
              <Select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label={parameter.name}
              >
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary">
                {parameter.description}
              </Typography>
            </FormControl>
          );
        } else if (parameter.name.toLowerCase() === 'source') {
          // Special case for source parameters - use dropdown with common sources
          return (
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>{parameter.name}</InputLabel>
              <Select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label={parameter.name}
              >
                {commonSources.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary">
                {parameter.description}
              </Typography>
            </FormControl>
          );
        } else {
          return (
            <TextField
              fullWidth
              label={parameter.name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              helperText={parameter.description}
              margin="normal"
              size="small"
            />
          );
        }
      
      case 'boolean':
        return (
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>{parameter.name}</InputLabel>
            <Select
              value={value ? 'true' : 'false'}
              onChange={(e) => onChange(e.target.value === 'true')}
              label={parameter.name}
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary">
              {parameter.description}
            </Typography>
          </FormControl>
        );
      
      case 'select':
        return (
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>{parameter.name}</InputLabel>
            <Select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              label={parameter.name}
            >
              {(parameter.options || []).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary">
              {parameter.description}
            </Typography>
          </FormControl>
        );
      
      default:
        return (
          <TextField
            fullWidth
            label={parameter.name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            helperText={parameter.description}
            margin="normal"
            size="small"
          />
        );
    }
  };

  // Function to get the count of each indicator type for simplified naming
  const getIndicatorTypeCount = (indicatorName: string) => {
    return selectedIndicators.filter(ind => ind.indicator_name === indicatorName).length + 1;
  };

  return (
    <StyledSection>
      <StyledSectionTitle variant="h6">
        Technical Indicators
        <Tooltip title="Add technical indicators to define your trading logic">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </StyledSectionTitle>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth size="small">
            <InputLabel id="indicator-select-label">Select Indicator</InputLabel>
            <Select
              labelId="indicator-select-label"
              id="indicator-select"
              value={selectedIndicatorName}
              label="Select Indicator"
              onChange={(e) => setSelectedIndicatorName(e.target.value as string)}
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="" disabled>
                Select an indicator to add
              </MenuItem>
              
              {Object.entries(categorizedIndicators).map(([category, indicators]) => 
                indicators.length > 0 && [
                  <MenuItem 
                    key={category} 
                    disabled 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: 'action.hover', 
                      color: 'primary.main',
                      pointerEvents: 'none' 
                    }}
                  >
                    {category}
                  </MenuItem>,
                  ...indicators.map(indicator => (
                    <MenuItem key={indicator.name} value={indicator.name}>
                      {indicator.name}
                    </MenuItem>
                  ))
                ]
              ).flat()}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleAddIndicator(selectedIndicatorName)}
            disabled={!selectedIndicatorName || loading}
            sx={{ 
              height: '40px', 
              borderRadius: '10px',
              boxShadow: '0 4px 14px 0 rgba(58, 111, 247, 0.2)',
            }}
          >
            Add Indicator
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, mb: 2 }}>
        {selectedIndicators.length > 0 ? (
          <Typography variant="subtitle2" color="text.secondary">
            Active Indicators ({selectedIndicators.length}):
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, mb: 2 }}>
            No indicators added yet. Select and add indicators to define your trading strategy.
          </Typography>
        )}
      </Box>

      {/* List of selected indicators with parameters */}
      {selectedIndicators.map((selectedInd, index) => {
        const indicatorInfo = availableIndicators.find(
          (ind) => ind.name === selectedInd.indicator_name
        );

        if (!indicatorInfo) return null;

        return (
          <StyledCard key={`${selectedInd.indicator_name}-${index}`}>
            <StyledCardHeader
              title={
                <Box display="flex" alignItems="center">
                  <TuneIcon color="primary" sx={{ mr: 1 }} />
                  {selectedInd.indicator_name}
                  <Chip 
                    label={selectedInd.simplified_name || `${selectedInd.indicator_name.replace(/\s+/g, '')}${index + 1}`} 
                    size="small" 
                    color="secondary" 
                    sx={{ ml: 1, fontSize: '0.75rem' }}
                  />
                </Box>
              }
              subheader={indicatorInfo.description}
              action={
                <Tooltip title="Remove indicator">
                  <IconButton
                    onClick={() => handleRemoveIndicator(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            
            <Divider />
            
            <StyledCardContent>
              <Grid container spacing={2}>
                {indicatorInfo.parameters.map((param) => (
                  <Grid item xs={12} sm={6} key={param.name}>
                    {renderParameterInput(
                      param,
                      selectedInd.parameters[param.name],
                      (value) =>
                        handleParameterChange(index, param.name, value)
                    )}
                  </Grid>
                ))}
              </Grid>
              
              {indicatorInfo.output_values && indicatorInfo.output_values.length > 0 && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    Reference in conditions as:
                  </Typography>
                  <Box mt={1}>
                    {indicatorInfo.output_values.map((value) => (
                      <IndicatorChip
                        key={value}
                        label={`${selectedInd.simplified_name || `${selectedInd.indicator_name.replace(/\s+/g, '')}${index + 1}`}${value !== 'value' ? `_${value}` : ''}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </StyledCardContent>
          </StyledCard>
        );
      })}
    </StyledSection>
  );
};

export default IndicatorSelector; 