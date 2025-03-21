import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, Alert, alpha, useTheme } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { botsApi, performanceApi } from '../../services/api';

// Component imports
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import PerformanceStats from '../../components/dashboard/PerformanceStats';
import PerformanceChart from '../../components/dashboard/PerformanceChart';
import BotList from '../../components/dashboard/BotList';

// Type imports
import { Bot } from '../../types/bot';
import { PerformanceData } from '../../types/performance';

const DashboardPage: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const theme = useTheme();

  const fetchBots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user's bots using the API service
      const botsResponse = await botsApi.getAll();
      // Ensure bots is always an array
      setBots(Array.isArray(botsResponse.data) ? botsResponse.data : []);
      
    } catch (err: any) {
      console.error('Error fetching bots:', err);
      setError(err.response?.data?.detail || 'Failed to load bots');
      // Set default values
      setBots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPerformance = useCallback(async () => {
    try {
      // Fetch performance data using the API service
      const performanceResponse = await performanceApi.getSummary();
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
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchBots();
      await fetchPerformance();
    };
    
    fetchData();
  }, [fetchBots, fetchPerformance]);

  const handleBotDeleted = useCallback(() => {
    // Refresh bots list after deletion
    fetchBots();
  }, [fetchBots]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{
            color: theme.palette.primary.main,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
        <Box 
          sx={{ 
            color: alpha(theme.palette.text.primary, 0.7),
            fontWeight: 500,
            mt: 2
          }}
        >
          Loading your dashboard...
        </Box>
      </Box>
    );
  }

  // Calculate performance stats for the header
  const performanceStats = {
    totalTrades: performance?.total_trades || 0,
    winRate: performance?.win_rate || 0,
    totalProfitLoss: performance?.total_profit_loss || 0,
  };

  return (
    <Box sx={{ pb: 6, animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Header section */}
      <DashboardHeader user={user} performanceStats={performanceStats} />
      
      {/* Error alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
          }}
        >
          {error}
        </Alert>
      )}
      
      {/* Performance stats */}
      <PerformanceStats performance={performance} />
      
      {/* Performance chart */}
      <PerformanceChart performance={performance} />
      
      {/* Bot list */}
      <BotList bots={bots} onBotDeleted={handleBotDeleted} />
    </Box>
  );
};

export default DashboardPage; 