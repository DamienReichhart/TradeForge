import React from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  Avatar,
  useTheme,
  alpha,
  LinearProgress,
  Chip,
  Stack
} from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { PerformanceData } from '../../types/performance';

interface PerformanceStatsProps {
  performance: PerformanceData | null;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ performance }) => {
  const theme = useTheme();

  if (!performance) {
    return null;
  }
  
  // Calculate metrics
  const winRate = performance.win_rate || 0;
  const totalTrades = performance.total_trades || 0;
  const profitFactor = performance.profit_factor || 0;
  const totalProfitLoss = performance.total_profit_loss || 0;
  const winningTrades = performance.winning_trades || 0;
  const losingTrades = performance.losing_trades || 0;
  
  return (
    <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              transition: 'all 0.3s ease',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.05)'
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
              <Typography color="text.secondary" fontWeight={500}>
                Total Trades
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="medium" sx={{ mb: 2 }}>
              {totalTrades}
            </Typography>
            <Stack direction="row" spacing={1}>
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
        
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              transition: 'all 0.3s ease',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.05)'
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
              <Typography color="text.secondary" fontWeight={500}>
                Win Rate
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="medium" sx={{ mb: 2 }}>
              {winRate.toFixed(1)}%
            </Typography>
            <Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(winRate, 100)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: winRate >= 50 ? theme.palette.success.main : theme.palette.warning.main
                  }
                }}
              />
              <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {winRate >= 60 ? 'Excellent' : winRate >= 50 ? 'Good' : 'Needs improvement'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              transition: 'all 0.3s ease',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.05)'
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
              <Typography color="text.secondary" fontWeight={500}>
                Profit Factor
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="medium" sx={{ mb: 2 }}>
              {profitFactor.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: profitFactor >= 1.5 ? theme.palette.success.main : 
                           profitFactor >= 1 ? theme.palette.warning.main : 
                           theme.palette.error.main,
                  mr: 1
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {profitFactor >= 1.5 ? 'Excellent' : profitFactor >= 1 ? 'Good' : 'Needs improvement'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              transition: 'all 0.3s ease',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.05)'
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
              <Typography color="text.secondary" fontWeight={500}>
                Total P/L
              </Typography>
            </Box>
            <Typography
              variant="h3"
              fontWeight="medium"
              sx={{
                mb: 1,
                color: totalProfitLoss >= 0
                  ? theme.palette.success.main
                  : theme.palette.error.main
              }}
            >
              {totalProfitLoss > 0 ? '+' : ''}{totalProfitLoss.toFixed(2)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg trade: {performance.average_profit_loss?.toFixed(2) || 0}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default PerformanceStats; 