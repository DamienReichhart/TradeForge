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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome, {user?.username}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateBot}
        >
          Create New Bot
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Performance overview cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Trades
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
              {performance?.total_trades || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="text.secondary" gutterBottom>
              Win Rate
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
              {performance?.win_rate ? performance.win_rate.toFixed(2) : 0}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="text.secondary" gutterBottom>
              Profit Factor
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
              {performance?.profit_factor ? performance.profit_factor.toFixed(2) : 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Profit/Loss
            </Typography>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                color: (performance?.total_profit_loss || 0) >= 0 ? 'success.main' : 'error.main'
              }}
            >
              {performance?.total_profit_loss ? performance.total_profit_loss.toFixed(2) : 0}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Performance chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Performance Over Time
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false,
                }
              }
            }} 
          />
        </Box>
      </Paper>
      
      {/* Bot list */}
      <Typography variant="h5" gutterBottom>
        Your Trading Bots
      </Typography>
      {bots.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            You don't have any trading bots yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleCreateBot}
          >
            Create Your First Bot
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {bots.map((bot) => (
            <Grid item xs={12} sm={6} md={4} key={bot.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {bot.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {bot.pair} ({bot.timeframe})
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: bot.is_running ? 'success.main' : 'text.secondary',
                        fontWeight: 'bold'
                      }}
                    >
                      {bot.is_running ? 'Running' : 'Stopped'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Created:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(bot.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleBotClick(bot.id)}>
                    Manage
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