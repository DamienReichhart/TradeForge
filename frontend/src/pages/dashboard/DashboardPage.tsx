import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Stack,
  Chip,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Chart imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface Bot {
  id: number;
  name: string;
  pair: string;
  timeframe: string;
  is_active: boolean;
  is_running: boolean;
  created_at: string;
}

interface PerformanceData {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  total_profit_loss: number;
  average_profit_loss: number;
  time_series: {
    time: string;
    equity: number;
  }[];
}

const DashboardPage: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's bots
        const botsResponse = await axios.get('/api/v1/bots/');
        // Ensure bots is always an array
        setBots(Array.isArray(botsResponse.data) ? botsResponse.data : []);
        
        try {
          // Fetch performance data
          const performanceResponse = await axios.get('/api/v1/performance/');
          setPerformance(performanceResponse.data || {
            total_trades: 0,
            winning_trades: 0,
            losing_trades: 0,
            win_rate: 0,
            profit_factor: 0,
            total_profit_loss: 0,
            average_profit_loss: 0,
            time_series: []
          });
        } catch (perfErr) {
          console.error('Error fetching performance data:', perfErr);
          // Set default performance data
          setPerformance({
            total_trades: 0,
            winning_trades: 0,
            losing_trades: 0,
            win_rate: 0,
            profit_factor: 0,
            total_profit_loss: 0,
            average_profit_loss: 0,
            time_series: []
          });
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.detail || 'Failed to load dashboard data');
        // Set default values
        setBots([]);
        setPerformance({
          total_trades: 0,
          winning_trades: 0,
          losing_trades: 0,
          win_rate: 0,
          profit_factor: 0,
          total_profit_loss: 0,
          average_profit_loss: 0,
          time_series: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreateBot = () => {
    navigate('/dashboard/new');
  };

  const handleBotClick = (botId: number) => {
    navigate(`/dashboard/${botId}`);
  };
  
  // Prepare chart data
  const chartData = {
    labels: performance?.time_series?.map(item => {
      const date = new Date(item.time);
      return date.toLocaleDateString();
    }) || [],
    datasets: [
      {
        label: 'Account Equity',
        data: performance?.time_series?.map(item => item.equity) || [],
        fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: theme.palette.primary.main,
        tension: 0.4
      }
    ]
  };

  // Calculate additional metrics
  const winRate = performance?.win_rate || 0;
  const totalTrades = performance?.total_trades || 0;
  const profitFactor = performance?.profit_factor || 0;
  const totalProfitLoss = performance?.total_profit_loss || 0;
  const winningTrades = performance?.winning_trades || 0;
  const losingTrades = performance?.losing_trades || 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Hero section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(to right, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.primary.main, 0.6)})`,
          color: 'white',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back, {user?.username}!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Your trading dashboard shows {totalTrades} total trades and a {winRate.toFixed(2)}% win rate.
              {totalProfitLoss > 0 
                ? ` You're up ${totalProfitLoss.toFixed(2)}% overall.` 
                : ` Your current performance is ${totalProfitLoss.toFixed(2)}%.`}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateBot}
              sx={{ 
                bgcolor: 'white', 
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.9),
                }
              }}
            >
              Create New Bot
            </Button>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ShowChartIcon sx={{ fontSize: 180, opacity: 0.4 }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Performance overview cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              } 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <ShowChartIcon />
              </Avatar>
              <Typography color="text.secondary">
                Total Trades
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="medium">
              {totalTrades}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Chip 
                size="small" 
                label={`${winningTrades} wins`} 
                sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  fontWeight: 'medium'
                }} 
              />
              <Chip 
                size="small" 
                label={`${losingTrades} losses`} 
                sx={{ 
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  fontWeight: 'medium'
                }} 
              />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <TrendingUpIcon />
              </Avatar>
              <Typography color="text.secondary">
                Win Rate
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="medium">
              {winRate.toFixed(1)}%
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={winRate} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: winRate >= 50 ? theme.palette.success.main : theme.palette.warning.main
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <AccountBalanceWalletIcon />
              </Avatar>
              <Typography color="text.secondary">
                Profit Factor
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="medium">
              {profitFactor.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {profitFactor >= 1.5 ? 'Excellent' : profitFactor >= 1 ? 'Good' : 'Needs improvement'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: totalProfitLoss >= 0 
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.error.main, 0.1),
                  color: totalProfitLoss >= 0 
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  mr: 2,
                }}
              >
                {totalProfitLoss >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              </Avatar>
              <Typography color="text.secondary">
                Total P/L
              </Typography>
            </Box>
            <Typography 
              variant="h3" 
              fontWeight="medium"
              sx={{ 
                color: totalProfitLoss >= 0 
                  ? theme.palette.success.main
                  : theme.palette.error.main
              }}
            >
              {totalProfitLoss > 0 ? '+' : ''}{totalProfitLoss.toFixed(2)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Avg trade: {performance?.average_profit_loss?.toFixed(2) || 0}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Performance chart */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="medium">
            Performance Over Time
          </Typography>
          <Chip 
            label={totalProfitLoss >= 0 ? "Profitable" : "Unprofitable"}
            size="small"
            sx={{ 
              bgcolor: totalProfitLoss >= 0 
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.error.main, 0.1),
              color: totalProfitLoss >= 0 
                ? theme.palette.success.main
                : theme.palette.error.main,
              fontWeight: 'medium'
            }}
          />
        </Box>
        <Box sx={{ height: 350 }}>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  backgroundColor: theme.palette.background.paper,
                  titleColor: theme.palette.text.primary,
                  bodyColor: theme.palette.text.secondary,
                  borderColor: theme.palette.divider,
                  borderWidth: 1,
                  padding: 12,
                  displayColors: false,
                  callbacks: {
                    label: function(context) {
                      return `Equity: ${context.raw}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    maxRotation: 0,
                    maxTicksLimit: 8,
                  }
                },
                y: {
                  beginAtZero: false,
                  grid: {
                    color: alpha(theme.palette.text.secondary, 0.1),
                  },
                  ticks: {
                    callback: function(value) {
                      return value;
                    }
                  }
                }
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
              },
              hover: {
                mode: 'nearest',
                intersect: false
              }
            }} 
          />
        </Box>
      </Paper>
      
      {/* Bot list */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="medium">
          Your Trading Bots
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={handleCreateBot}
          size="small"
        >
          New Bot
        </Button>
      </Box>
      
      {bots.length === 0 ? (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }}
        >
          <ShowChartIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Trading Bots Yet
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Create your first trading bot to start automating your strategies.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleCreateBot}
            size="large"
            sx={{ mt: 2 }}
          >
            Create Your First Bot
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {bots.map((bot) => (
            <Grid item xs={12} sm={6} md={4} key={bot.id}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Box sx={{ 
                    px: 2, 
                    pt: 2, 
                    pb: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}>
                    <Typography variant="h6" fontWeight="medium">
                      {bot.name}
                    </Typography>
                    <Tooltip title="Bot actions">
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label={bot.pair}
                        size="small"
                        sx={{ 
                          mr: 1,
                          fontWeight: 'medium',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Chip 
                        label={bot.timeframe}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        size="small"
                        icon={bot.is_running ? <PlayArrowIcon fontSize="small" /> : <StopIcon fontSize="small" />}
                        label={bot.is_running ? 'Running' : 'Stopped'}
                        color={bot.is_running ? 'success' : 'default'}
                        variant={bot.is_running ? 'filled' : 'outlined'}
                        sx={{ 
                          fontWeight: 'medium',
                          height: 24
                        }}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {new Date(bot.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Button 
                    size="medium" 
                    variant="contained"
                    fullWidth
                    onClick={() => handleBotClick(bot.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    Manage Bot
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DashboardPage; 