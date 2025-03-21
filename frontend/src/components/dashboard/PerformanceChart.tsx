import React from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha,
  Chip,
  ButtonGroup,
  Button
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { PerformanceData } from '../../types/performance';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceChartProps {
  performance: PerformanceData | null;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ performance }) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = React.useState<'all' | '1m' | '3m' | '6m'>('all');

  if (!performance || !performance.time_series || performance.time_series.length === 0) {
    return null;
  }

  // Filter time series data based on selected time range
  let filteredTimeSeries = [...performance.time_series];
  
  if (timeRange !== 'all') {
    const now = new Date();
    let monthsToSubtract = 1;
    
    if (timeRange === '3m') monthsToSubtract = 3;
    if (timeRange === '6m') monthsToSubtract = 6;
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToSubtract);
    
    filteredTimeSeries = performance.time_series.filter(item => {
      const itemDate = new Date(item.time);
      return itemDate >= cutoffDate;
    });
  }

  // Calculate start and end equity values for percentage change
  const startEquity = filteredTimeSeries.length > 0 ? filteredTimeSeries[0].equity : 0;
  const endEquity = filteredTimeSeries.length > 0 ? filteredTimeSeries[filteredTimeSeries.length - 1].equity : 0;
  const percentChange = startEquity ? ((endEquity - startEquity) / startEquity) * 100 : 0;

  // Prepare chart data
  const chartData = {
    labels: filteredTimeSeries.map(item => {
      const date = new Date(item.time);
      return date.toLocaleDateString();
    }),
    datasets: [
      {
        label: 'Account Equity',
        data: filteredTimeSeries.map(item => item.equity),
        fill: true,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: theme.palette.primary.main,
        tension: 0.4,
      }
    ]
  };

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
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
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Performance Over Time
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {timeRange === 'all' ? 'All time' : timeRange === '1m' ? 'Past month' : 
             timeRange === '3m' ? 'Past 3 months' : 'Past 6 months'} performance
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            label={`${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`}
            size="medium"
            sx={{
              mr: 2,
              fontWeight: 'bold',
              bgcolor: percentChange >= 0
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.error.main, 0.1),
              color: percentChange >= 0
                ? theme.palette.success.main
                : theme.palette.error.main,
            }}
          />
          
          <ButtonGroup size="small" aria-label="time range selector" sx={{ border: 0 }}>
            <Button 
              onClick={() => setTimeRange('1m')}
              variant={timeRange === '1m' ? 'contained' : 'outlined'}
              sx={{ 
                borderTopLeftRadius: '16px', 
                borderBottomLeftRadius: '16px',
                minWidth: '40px',
                bgcolor: timeRange === '1m' ? alpha(theme.palette.primary.main, 0.9) : undefined
              }}
            >
              1M
            </Button>
            <Button 
              onClick={() => setTimeRange('3m')}
              variant={timeRange === '3m' ? 'contained' : 'outlined'}
              sx={{ 
                minWidth: '40px',
                bgcolor: timeRange === '3m' ? alpha(theme.palette.primary.main, 0.9) : undefined
              }}
            >
              3M
            </Button>
            <Button 
              onClick={() => setTimeRange('6m')}
              variant={timeRange === '6m' ? 'contained' : 'outlined'} 
              sx={{ 
                minWidth: '40px',
                bgcolor: timeRange === '6m' ? alpha(theme.palette.primary.main, 0.9) : undefined
              }}
            >
              6M
            </Button>
            <Button 
              onClick={() => setTimeRange('all')}
              variant={timeRange === 'all' ? 'contained' : 'outlined'} 
              sx={{ 
                borderTopRightRadius: '16px', 
                borderBottomRightRadius: '16px',
                minWidth: '40px',
                bgcolor: timeRange === 'all' ? alpha(theme.palette.primary.main, 0.9) : undefined
              }}
            >
              ALL
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
      
      <Box sx={{ height: 350, mt: 2 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default PerformanceChart; 