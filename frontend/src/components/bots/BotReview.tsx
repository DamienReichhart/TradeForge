import React from 'react';
import {
  Box,
  Typography,
  styled,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import SyncIcon from '@mui/icons-material/Sync';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CodeIcon from '@mui/icons-material/Code';

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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: '0 5px 20px rgba(0, 0, 0, 0.05)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const DetailText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
}));

const CodeBlock = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  padding: theme.spacing(2),
  borderRadius: '8px',
  fontFamily: 'monospace',
  overflowX: 'auto',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  fontSize: '0.85rem',
  border: `1px solid ${theme.palette.divider}`,
}));

const IndicatorName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
}));

const ParamChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontSize: '0.75rem',
}));

interface BotReviewProps {
  formData: {
    name: string;
    description: string;
    pair: string;
    timeframe: string;
    buy_condition: string;
    sell_condition: string;
    tp_condition: string;
    sl_condition: string;
    bot_type: string;
    indicators: Array<{
      indicator_id: number;
      indicator_name: string;
      simplified_name: string;
      parameters: Record<string, any>;
    }>;
  };
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  availableIndicators: Array<{
    name: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  }>;
}

const BotReview: React.FC<BotReviewProps> = ({
  formData,
  handleSubmit,
  loading,
  availableIndicators
}) => {
  return (
    <StyledSection>
      <StyledSectionTitle variant="h6">
        Review Your Bot Configuration
      </StyledSectionTitle>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Box display="flex" alignItems="center" mb={2}>
              <VerifiedIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Basic Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <List disablePadding>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText 
                  primary="Bot Name" 
                  secondary={formData.name || 'Not specified'}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
              
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText 
                  primary="Bot Type" 
                  secondary={
                    <Chip 
                      label={formData.bot_type === 'standard' ? 'Standard' : 'Advanced'} 
                      size="small" 
                      color={formData.bot_type === 'standard' ? 'primary' : 'secondary'}
                      sx={{ fontWeight: 500 }}
                    />
                  }
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
              
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText 
                  primary="Description" 
                  secondary={formData.description || 'No description provided'}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
            </List>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Box display="flex" alignItems="center" mb={2}>
              <SyncIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Trading Parameters</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DetailText gutterBottom>Trading Pair</DetailText>
                <Typography variant="body1" fontWeight={600}>
                  {formData.pair}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <DetailText gutterBottom>Timeframe</DetailText>
                <Typography variant="body1" fontWeight={600}>
                  {formData.timeframe}
                </Typography>
              </Grid>
            </Grid>

            <Box mt={2}>
              <DetailText gutterBottom>Trading Strategy</DetailText>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip 
                  icon={<ShowChartIcon />} 
                  label={`${formData.indicators.length} Indicators`} 
                  color="primary" 
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  icon={<TrendingUpIcon />} 
                  label="Buy Logic" 
                  color="success" 
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  icon={<TrendingDownIcon />} 
                  label="Sell Logic" 
                  color="error" 
                  variant="outlined"
                  size="small"
                />
                {formData.bot_type === 'advanced' && (
                  <>
                    <Chip 
                      icon={<MonetizationOnIcon />} 
                      label="Take Profit" 
                      color="info" 
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      icon={<MonetizationOnIcon />} 
                      label="Stop Loss" 
                      color="warning" 
                      variant="outlined"
                      size="small"
                    />
                  </>
                )}
              </Box>
            </Box>
          </StyledPaper>
        </Grid>

        <Grid item xs={12}>
          <StyledPaper>
            <Box display="flex" alignItems="center" mb={2}>
              <ShowChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Technical Indicators</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {formData.indicators.length > 0 ? (
              <Grid container spacing={2}>
                {formData.indicators.map((indicator, index) => {
                  const indicatorInfo = availableIndicators.find(i => i.name === indicator.indicator_name);
                  
                  return (
                    <Grid item xs={12} md={6} key={`${indicator.indicator_name}-${index}`}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: 'divider',
                          borderRadius: '12px'
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <IndicatorName variant="subtitle1">
                            {indicator.indicator_name}
                          </IndicatorName>
                          <Chip 
                            label={indicator.simplified_name || `${indicator.indicator_name.replace(/\s+/g, '')}${index + 1}`}
                            size="small" 
                            color="secondary"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                        
                        {indicatorInfo && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {indicatorInfo.description}
                          </Typography>
                        )}
                        
                        <Box mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            Parameters:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" mt={0.5}>
                            {Object.entries(indicator.parameters).map(([key, value]) => (
                              <ParamChip 
                                key={key} 
                                label={`${key}: ${value}`} 
                                variant="outlined" 
                                size="small" 
                              />
                            ))}
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography color="text.secondary" align="center">
                No indicators configured for this bot.
              </Typography>
            )}
          </StyledPaper>
        </Grid>

        <Grid item xs={12}>
          <StyledPaper>
            <Box display="flex" alignItems="center" mb={2}>
              <CodeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Trading Conditions</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Buy Condition
                </Typography>
                <CodeBlock>
                  {formData.buy_condition || 'No buy condition defined'}
                </CodeBlock>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Sell Condition
                </Typography>
                <CodeBlock>
                  {formData.sell_condition || 'No sell condition defined'}
                </CodeBlock>
              </Grid>
              
              {formData.bot_type === 'advanced' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Take Profit Condition
                    </Typography>
                    <CodeBlock>
                      {formData.tp_condition || 'No take profit condition defined'}
                    </CodeBlock>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Stop Loss Condition
                    </Typography>
                    <CodeBlock>
                      {formData.sl_condition || 'No stop loss condition defined'}
                    </CodeBlock>
                  </Grid>
                </>
              )}
            </Grid>

            <Box mt={3} p={2} sx={{ bgcolor: 'background.default', borderRadius: '8px' }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Indicator Reference Guide
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your trading conditions use simplified indicator references. Here's how they map to your indicators:
              </Typography>
              <Grid container spacing={1}>
                {formData.indicators.map((indicator, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ 
                      p: 1, 
                      border: '1px dashed', 
                      borderColor: 'divider', 
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="caption" fontWeight={500}>
                        {indicator.simplified_name || `${indicator.indicator_name.replace(/\s+/g, '')}${index + 1}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        →
                      </Typography>
                      <Typography variant="caption">
                        {indicator.indicator_name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
          sx={{ 
            py: 1.5, 
            px: 5, 
            borderRadius: '12px',
            minWidth: '200px',
            boxShadow: '0 8px 16px rgba(58, 111, 247, 0.2)',
          }}
        >
          {loading ? 'Creating Bot...' : 'Create Trading Bot'}
        </Button>
      </Box>
    </StyledSection>
  );
};

export default BotReview; 