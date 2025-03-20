import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Grid, Paper, Button, 
  Tabs, Tab, CircularProgress, Chip, 
  Switch, FormControlLabel, TextField, Select, MenuItem,
  FormControl, InputLabel, Alert, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import BacktestIcon from '@mui/icons-material/Assessment';
import TelegramIcon from '@mui/icons-material/Telegram';
import { Line } from 'react-chartjs-2';

// Mock data - in a real app, this would come from an API
const mockBot = {
  id: '1',
  name: 'BTC Trend Follower',
  description: 'Follows BTC trends using EMA crossover strategy',
  status: 'active',
  exchange: 'Binance',
  pair: 'BTC/USDT',
  timeframe: '1h',
  created_at: '2024-02-15T10:30:00Z',
  last_run: '2024-03-19T18:45:00Z',
  notifications: {
    telegram: true,
    email: false
  },
  performance: {
    total_trades: 48,
    win_rate: 62.5,
    profit_loss: 27.8,
    avg_profit_per_trade: 0.58,
    max_drawdown: 8.2,
    sharpe_ratio: 1.4
  },
  strategy: {
    entry_conditions: 'EMA(9) > EMA(21) AND RSI(14) > 50',
    exit_conditions: 'EMA(9) < EMA(21) OR RSI(14) < 30',
    risk_per_trade: 2,
    take_profit: 3,
    stop_loss: 2
  },
  trade_history: [
    { time: '2024-03-19T10:00:00Z', type: 'buy', price: 68452, amount: 0.015, status: 'executed' },
    { time: '2024-03-18T14:30:00Z', type: 'sell', price: 67850, amount: 0.015, status: 'executed' },
    { time: '2024-03-16T08:15:00Z', type: 'buy', price: 65234, amount: 0.016, status: 'executed' },
    { time: '2024-03-15T21:45:00Z', type: 'sell', price: 66125, amount: 0.016, status: 'executed' },
  ]
};

// Simplified chart data
const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Bot Performance (%)',
      data: [0, 5.2, 8.7, 7.3, 12.5, 18.2, 27.8],
      borderColor: 'rgba(75, 192, 192, 1)',
      tension: 0.1,
      fill: false
    },
    {
      label: 'Market (%)',
      data: [0, 3.8, 5.2, 2.1, 8.3, 12.5, 15.4],
      borderColor: 'rgba(153, 102, 255, 1)',
      tension: 0.1,
      fill: false
    }
  ]
};

const BotDetailPage: React.FC = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bot, setBot] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBot(mockBot);
      setFormData({
        name: mockBot.name,
        description: mockBot.description,
        exchange: mockBot.exchange,
        pair: mockBot.pair,
        timeframe: mockBot.timeframe,
        entry_conditions: mockBot.strategy.entry_conditions,
        exit_conditions: mockBot.strategy.exit_conditions,
        risk_per_trade: mockBot.strategy.risk_per_trade,
        take_profit: mockBot.strategy.take_profit,
        stop_loss: mockBot.strategy.stop_loss,
        telegram_notifications: mockBot.notifications.telegram,
        email_notifications: mockBot.notifications.email
      });
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [botId]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    // Simulate API call to save the bot
    setEditMode(false);
    // In a real app, we would update the bot data here
    alert('Bot settings saved successfully!');
  };
  
  const handleRunBacktest = () => {
    navigate(`/dashboard/backtest/report/${botId}`);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading bot details...</Typography>
      </Container>
    );
  }
  
  if (!bot) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Bot not found</Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {editMode ? 'Edit Bot' : bot.name}
        </Typography>
        <Box>
          {!editMode ? (
            <>
              <IconButton 
                color={bot.status === 'active' ? 'error' : 'success'}
                aria-label={bot.status === 'active' ? 'Stop bot' : 'Start bot'}
                sx={{ mr: 1 }}
              >
                {bot.status === 'active' ? <StopIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton onClick={handleToggleEditMode} color="primary" aria-label="edit bot" sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" aria-label="delete bot">
                <DeleteIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SaveIcon />} 
                onClick={handleSave}
                sx={{ mr: 2 }}
              >
                Save Changes
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleToggleEditMode}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>
      
      {!editMode && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Typography variant="body1">
                <Chip 
                  label={bot.status === 'active' ? 'Active' : 'Inactive'} 
                  color={bot.status === 'active' ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Created</Typography>
              <Typography variant="body1">
                {new Date(bot.created_at).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Exchange & Pair</Typography>
              <Typography variant="body1">{bot.exchange} - {bot.pair}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Timeframe</Typography>
              <Typography variant="body1">{bot.timeframe}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Description</Typography>
              <Typography variant="body1">{bot.description}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {editMode && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>General Settings</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bot Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Exchange</InputLabel>
                <Select
                  name="exchange"
                  value={formData.exchange}
                  label="Exchange"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Binance">Binance</MenuItem>
                  <MenuItem value="Coinbase">Coinbase</MenuItem>
                  <MenuItem value="Kraken">Kraken</MenuItem>
                  <MenuItem value="Kucoin">Kucoin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Trading Pair"
                name="pair"
                value={formData.pair}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Timeframe</InputLabel>
                <Select
                  name="timeframe"
                  value={formData.timeframe}
                  label="Timeframe"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="1m">1 minute</MenuItem>
                  <MenuItem value="5m">5 minutes</MenuItem>
                  <MenuItem value="15m">15 minutes</MenuItem>
                  <MenuItem value="1h">1 hour</MenuItem>
                  <MenuItem value="4h">4 hours</MenuItem>
                  <MenuItem value="1d">1 day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Trading Strategy</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Entry Conditions"
                name="entry_conditions"
                value={formData.entry_conditions}
                onChange={handleFormChange}
                margin="normal"
                helperText="Use mathematical expressions to define when to buy"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Exit Conditions"
                name="exit_conditions"
                value={formData.exit_conditions}
                onChange={handleFormChange}
                margin="normal"
                helperText="Use mathematical expressions to define when to sell"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Risk % Per Trade"
                name="risk_per_trade"
                type="number"
                value={formData.risk_per_trade}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Take Profit %"
                name="take_profit"
                type="number"
                value={formData.take_profit}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stop Loss %"
                name="stop_loss"
                type="number"
                value={formData.stop_loss}
                onChange={handleFormChange}
                margin="normal"
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Notifications</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.telegram_notifications}
                    onChange={handleFormChange}
                    name="telegram_notifications"
                  />
                }
                label="Telegram Notifications"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.email_notifications}
                    onChange={handleFormChange}
                    name="email_notifications"
                  />
                }
                label="Email Notifications"
              />
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {!editMode && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="bot details tabs">
              <Tab label="Performance" />
              <Tab label="Strategy" />
              <Tab label="Trade History" />
            </Tabs>
          </Box>
          
          {activeTab === 0 && (
            <Box>
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography variant="body2" color="text.secondary">Total Trades</Typography>
                    <Typography variant="h6">{bot.performance.total_trades}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography variant="body2" color="text.secondary">Win Rate</Typography>
                    <Typography variant="h6">{bot.performance.win_rate}%</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography variant="body2" color="text.secondary">Profit/Loss</Typography>
                    <Typography variant="h6" color={bot.performance.profit_loss > 0 ? 'success.main' : 'error.main'}>
                      {bot.performance.profit_loss > 0 ? '+' : ''}{bot.performance.profit_loss}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography variant="body2" color="text.secondary">Avg Profit/Trade</Typography>
                    <Typography variant="h6" color={bot.performance.avg_profit_per_trade > 0 ? 'success.main' : 'error.main'}>
                      {bot.performance.avg_profit_per_trade > 0 ? '+' : ''}{bot.performance.avg_profit_per_trade}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography variant="body2" color="text.secondary">Max Drawdown</Typography>
                    <Typography variant="h6" color="error.main">
                      {bot.performance.max_drawdown}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Typography variant="body2" color="text.secondary">Sharpe Ratio</Typography>
                    <Typography variant="h6">{bot.performance.sharpe_ratio}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Performance Chart</Typography>
                <Box sx={{ height: 400 }}>
                  <Line 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value + '%';
                            }
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<BacktestIcon />} 
                  onClick={handleRunBacktest}
                  sx={{ mr: 2 }}
                >
                  Run Backtest
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<TelegramIcon />}
                >
                  Connect Telegram
                </Button>
              </Box>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Trading Strategy</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Entry Conditions</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {bot.strategy.entry_conditions}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Exit Conditions</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {bot.strategy.exit_conditions}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Risk Per Trade</Typography>
                    <Typography variant="body1">{bot.strategy.risk_per_trade}%</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Take Profit</Typography>
                    <Typography variant="body1">{bot.strategy.take_profit}%</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Stop Loss</Typography>
                    <Typography variant="body1">{bot.strategy.stop_loss}%</Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Notifications</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TelegramIcon color={bot.notifications.telegram ? 'primary' : 'disabled'} sx={{ mr: 1 }} />
                      <Typography>
                        Telegram Notifications: 
                        <Chip 
                          label={bot.notifications.telegram ? 'Enabled' : 'Disabled'} 
                          color={bot.notifications.telegram ? 'primary' : 'default'}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Recent Trades</Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Type</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Price</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Amount</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Total</th>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bot.trade_history.map((trade: any, index: number) => (
                        <tr key={index}>
                          <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {new Date(trade.time).toLocaleString()}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            <Chip 
                              label={trade.type.toUpperCase()} 
                              color={trade.type === 'buy' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            ${trade.price.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {trade.amount}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            ${(trade.price * trade.amount).toLocaleString()}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {trade.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default BotDetailPage; 