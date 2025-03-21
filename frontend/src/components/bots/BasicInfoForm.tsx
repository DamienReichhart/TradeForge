import React from 'react';
import { Grid, TextField, MenuItem, Box, styled, Button, Typography, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
    },
  },
}));

const StyledInfoIconButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  padding: 2,
}));

const HelpText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginTop: theme.spacing(0.5),
}));

interface BasicInfoFormProps {
  formData: {
    name: string;
    description: string;
    pair: string;
    timeframe: string;
    bot_type: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
  timeframes: string[];
  pairs: string[];
  onNext: () => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  handleChange,
  timeframes,
  pairs,
  onNext
}) => {
  return (
    <form>
      <StyledSection>
        <StyledSectionTitle variant="h6">
          Basic Information
          <Tooltip title="Provide the fundamental details for your trading bot">
            <StyledInfoIconButton size="small">
              <InfoIcon fontSize="small" />
            </StyledInfoIconButton>
          </Tooltip>
        </StyledSectionTitle>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledTextField
              fullWidth
              label="Bot Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              required
              placeholder="My Trading Bot"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Choose a distinctive name to easily identify your bot">
                    <IconButton edge="end">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
            <HelpText>Choose a unique name to identify your bot</HelpText>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StyledTextField
              select
              fullWidth
              label="Bot Type"
              name="bot_type"
              value={formData.bot_type}
              onChange={handleChange}
              variant="outlined"
              required
              InputProps={{
                endAdornment: (
                  <Tooltip title="Standard bots use predefined strategies. Advanced bots offer complete customization.">
                    <IconButton edge="end">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            >
              <MenuItem value="standard">Standard</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </StyledTextField>
            <HelpText>Select the type of bot you want to create</HelpText>
          </Grid>
          
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
              placeholder="Describe the purpose and strategy of your bot..."
              InputProps={{
                endAdornment: (
                  <Tooltip title="Add details about what this bot does and when to use it">
                    <IconButton edge="end">
                      <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
            <HelpText>Briefly describe what your bot does</HelpText>
          </Grid>
        </Grid>
      </StyledSection>
      
      <StyledSection>
        <StyledSectionTitle variant="h6">
          Market Parameters
          <Tooltip title="Define which market and timeframe your bot will trade on">
            <StyledInfoIconButton size="small">
              <InfoIcon fontSize="small" />
            </StyledInfoIconButton>
          </Tooltip>
        </StyledSectionTitle>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledTextField
              select
              fullWidth
              label="Trading Pair"
              name="pair"
              value={formData.pair}
              onChange={handleChange}
              variant="outlined"
              required
            >
              {pairs.map((pair) => (
                <MenuItem key={pair} value={pair}>
                  {pair}
                </MenuItem>
              ))}
            </StyledTextField>
            <HelpText>Select the cryptocurrency pair for trading</HelpText>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StyledTextField
              select
              fullWidth
              label="Timeframe"
              name="timeframe"
              value={formData.timeframe}
              onChange={handleChange}
              variant="outlined"
              required
            >
              {timeframes.map((timeframe) => (
                <MenuItem key={timeframe} value={timeframe}>
                  {timeframe}
                </MenuItem>
              ))}
            </StyledTextField>
            <HelpText>Choose how often your strategy evaluates the market</HelpText>
          </Grid>
        </Grid>
      </StyledSection>
      
      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={onNext}
          sx={{ 
            borderRadius: '10px', 
            padding: '10px 24px',
            boxShadow: '0 4px 14px 0 rgba(58, 111, 247, 0.25)',
            '&:hover': {
              boxShadow: '0 6px 20px 0 rgba(58, 111, 247, 0.35)',
            }
          }}
        >
          Continue to Strategy
        </Button>
      </Box>
    </form>
  );
};

export default BasicInfoForm; 