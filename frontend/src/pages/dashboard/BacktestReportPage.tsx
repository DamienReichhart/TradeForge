import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Grid, Paper, Button,
  CircularProgress, Alert
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  CloudDownload as CloudDownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { Bar, Line } from 'react-chartjs-2';

// Mock backtest data - in a real app, this would come from an API
const mockBacktest = {
  id: '123',
  bot_id: '1',
  bot_name: 'BTC Trend Follower',
  start_date: '2023-01-01T00:00:00Z',
  end_date: '2024-01-01T00:00:00Z',
  timeframe: '1h',
  pair: 'BTC/USDT',
  status: 'completed',
  created_at: '2024-03-19T14:30:00Z',
  completed_at: '2024-03-19T14:32:45Z',
  strategy: {
    entry_conditions: 'EMA(9) > EMA(21) AND RSI(14) > 50',
    exit_conditions: 'EMA(9) < EMA(21) OR RSI(14) < 30',
    risk_per_trade: 2,
    take_profit: 3,
    stop_loss: 2
  },
  metrics: {
    initial_capital: 10000,
    final_capital: 14560,
    total_return_percent: 45.6,
    total_trades: 68,
    winning_trades: 42,
    losing_trades: 26,
    win_rate: 61.8,
    max_drawdown_percent: 12.3,
    profit_factor: 2.1,
    sharpe_ratio: 1.8,
    sortino_ratio: 2.4,
    max_consecutive_wins: 7,
    max_consecutive_losses: 3,
    average_profit_per_winning_trade: 3.8,
    average_loss_per_losing_trade: -2.2,
    risk_reward_ratio: 1.73
  },
  monthly_returns: [
    { month: 'Jan 2023', return: 4.2 },
    { month: 'Feb 2023', return: -1.8 },
    { month: 'Mar 2023', return: 6.5 },
    { month: 'Apr 2023', return: 2.3 },
    { month: 'May 2023', return: -3.4 },
    { month: 'Jun 2023', return: 5.8 },
    { month: 'Jul 2023', return: 7.2 },
    { month: 'Aug 2023', return: 3.1 },
    { month: 'Sep 2023', return: -2.7 },
    { month: 'Oct 2023', return: 8.6 },
    { month: 'Nov 2023', return: 4.9 },
    { month: 'Dec 2023', return: 5.1 }
  ],
  trades: [
    { 
      id: 1, 
      entry_time: '2023-01-15T08:00:00Z', 
      exit_time: '2023-01-17T14:00:00Z', 
      entry_price: 21450, 
      exit_price: 22340, 
      entry_reason: 'EMA9 crossed above EMA21, RSI > 50', 
      exit_reason: 'EMA9 crossed below EMA21', 
      profit_loss_percent: 4.15,
      profit_loss_amount: 415
    },
    { 
      id: 2, 
      entry_time: '2023-02-03T16:00:00Z', 
      exit_time: '2023-02-04T22:00:00Z', 
      entry_price: 23120, 
      exit_price: 22680, 
      entry_reason: 'EMA9 crossed above EMA21, RSI > 50', 
      exit_reason: 'Stop loss hit', 
      profit_loss_percent: -1.9,
      profit_loss_amount: -190
    },
    { 
      id: 3, 
      entry_time: '2023-02-18T10:00:00Z', 
      exit_time: '2023-02-22T20:00:00Z', 
      entry_price: 24560, 
      exit_price: 25340, 
      entry_reason: 'EMA9 crossed above EMA21, RSI > 50', 
      exit_reason: 'Take profit hit', 
      profit_loss_percent: 3.18,
      profit_loss_amount: 318
    }
  ]
};

// Chart data for monthly returns
const monthlyReturnsData = {
  labels: mockBacktest.monthly_returns.map(item => item.month),
  datasets: [
    {
      label: 'Monthly Returns (%)',
      data: mockBacktest.monthly_returns.map(item => item.return),
      backgroundColor: mockBacktest.monthly_returns.map(item => 
        item.return >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
      ),
      borderColor: mockBacktest.monthly_returns.map(item => 
        item.return >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
      ),
      borderWidth: 1
    }
  ]
};

// Chart data for equity curve
const equityCurveData = {
  labels: ['Initial'].concat(mockBacktest.monthly_returns.map(item => item.month)),
  datasets: [
    {
      label: 'Account Balance ($)',
      data: (() => {
        let balance = mockBacktest.metrics.initial_capital;
        const balances = [balance];
        mockBacktest.monthly_returns.forEach(item => {
          balance = balance * (1 + item.return / 100);
          balances.push(balance);
        });
        return balances;
      })(),
      borderColor: 'rgba(54, 162, 235, 1)',
      tension: 0.1,
      fill: false
    }
  ]
};

const BacktestReportPage: React.FC = () => {
  const { backtestId } = useParams<{ backtestId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [backtest, setBacktest] = useState<any>(null);
  
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBacktest(mockBacktest);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [backtestId]);
  
  const handleDownloadCSV = () => {
    alert('Downloading CSV report...');
    // In a real app, this would trigger a download
  };
  
  const handleShareReport = () => {
    alert('Copying shareable link to clipboard...');
    // In a real app, this would copy a link or open a share dialog
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading backtest report...</Typography>
      </Container>
    );
  }
  
  if (!backtest) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Backtest report not found</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/dashboard')} 
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(`/dashboard/${backtest.bot_id}`)} 
          sx={{ mr: 2 }}
        >
          Back to Bot
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Backtest Report
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<CloudDownloadIcon />} 
            onClick={handleDownloadCSV}
            sx={{ mr: 1 }}
          >
            Export CSV
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ShareIcon />} 
            onClick={handleShareReport}
          >
            Share
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {backtest.bot_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Backtest Period: {new Date(backtest.start_date).toLocaleDateString()} to {new Date(backtest.end_date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {backtest.pair} • {backtest.timeframe} timeframe
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
            <Box>
              <Typography variant="h4" color="primary.main" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                {backtest.metrics.total_return_percent > 0 ? '+' : ''}{backtest.metrics.total_return_percent}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                Total Return
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Initial Capital</Typography>
                <Typography variant="body1">${backtest.metrics.initial_capital.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Final Capital</Typography>
                <Typography variant="body1">${Math.round(backtest.metrics.final_capital).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Total Trades</Typography>
                <Typography variant="body1">{backtest.metrics.total_trades}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Win Rate</Typography>
                <Typography variant="body1">{backtest.metrics.win_rate}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Profit Factor</Typography>
                <Typography variant="body1">{backtest.metrics.profit_factor}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Max Drawdown</Typography>
                <Typography variant="body1" color="error.main">-{backtest.metrics.max_drawdown_percent}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Sharpe Ratio</Typography>
                <Typography variant="body1">{backtest.metrics.sharpe_ratio}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Sortino Ratio</Typography>
                <Typography variant="body1">{backtest.metrics.sortino_ratio}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Avg Profit (Winners)</Typography>
                <Typography variant="body1" color="success.main">+{backtest.metrics.average_profit_per_winning_trade}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Avg Loss (Losers)</Typography>
                <Typography variant="body1" color="error.main">{backtest.metrics.average_loss_per_losing_trade}%</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Strategy Parameters</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Entry Conditions</Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                <Typography variant="body2" fontFamily="monospace">
                  {backtest.strategy.entry_conditions}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Exit Conditions</Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                <Typography variant="body2" fontFamily="monospace">
                  {backtest.strategy.exit_conditions}
                </Typography>
              </Paper>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Risk Per Trade</Typography>
                <Typography variant="body1">{backtest.strategy.risk_per_trade}%</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Take Profit</Typography>
                <Typography variant="body1">{backtest.strategy.take_profit}%</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Stop Loss</Typography>
                <Typography variant="body1">{backtest.strategy.stop_loss}%</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Equity Curve</Typography>
            <Box sx={{ height: 400 }}>
              <Line 
                data={equityCurveData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: false
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Monthly Returns</Typography>
            <Box sx={{ height: 400 }}>
              <Bar 
                data={monthlyReturnsData} 
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
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Trade History</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Entry Date</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Exit Date</th>
                    <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Entry Price</th>
                    <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Exit Price</th>
                    <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>P/L %</th>
                    <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>P/L $</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Exit Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {backtest.trades.map((trade: any) => (
                    <tr key={trade.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        {trade.id}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        {new Date(trade.entry_time).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        {new Date(trade.exit_time).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        ${trade.entry_price.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        ${trade.exit_price.toLocaleString()}
                      </td>
                      <td style={{ 
                        textAlign: 'right', 
                        padding: '8px', 
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        color: trade.profit_loss_percent > 0 ? 'green' : 'red'
                      }}>
                        {trade.profit_loss_percent > 0 ? '+' : ''}{trade.profit_loss_percent}%
                      </td>
                      <td style={{ 
                        textAlign: 'right', 
                        padding: '8px', 
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        color: trade.profit_loss_amount > 0 ? 'green' : 'red'
                      }}>
                        {trade.profit_loss_amount > 0 ? '+' : ''}${trade.profit_loss_amount}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        {trade.exit_reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BacktestReportPage; 