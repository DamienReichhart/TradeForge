import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  alpha, 
  Paper, 
  Grid,
  Avatar,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { UserInfo } from '../../types/user';

interface DashboardHeaderProps {
  user: UserInfo | null;
  performanceStats: {
    totalTrades: number;
    winRate: number;
    totalProfitLoss: number;
  };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, performanceStats }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { totalTrades, winRate, totalProfitLoss } = performanceStats;

  const handleCreateBot = () => {
    navigate('/dashboard/new');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        mb: 4,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.primary.main, 0.7)})`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          right: -50, 
          top: -50, 
          width: 300, 
          height: 300, 
          borderRadius: '50%', 
          background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, ${alpha('#fff', 0.05)} 50%, transparent 70%)` 
        }}
      />
      
      <Box 
        sx={{ 
          position: 'absolute', 
          left: 20, 
          bottom: -100, 
          width: 200, 
          height: 200, 
          borderRadius: '50%', 
          background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, ${alpha('#fff', 0.05)} 50%, transparent 70%)` 
        }}
      />
      
      <Grid container spacing={3} alignItems="center" position="relative" zIndex={1}>
        <Grid item xs={12} md={7}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: alpha(theme.palette.common.white, 0.2),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back, {user?.username || 'Trader'}!
            </Typography>
          </Stack>
          
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, fontSize: '1.1rem', lineHeight: 1.6 }}>
            Your trading activity shows <strong>{totalTrades} total trades</strong> with a <strong>{winRate.toFixed(2)}% win rate</strong>.
            {totalProfitLoss > 0 
              ? <> You're up <strong>{totalProfitLoss.toFixed(2)}%</strong> overall. Great work!</> 
              : <> Your current performance is <strong>{totalProfitLoss.toFixed(2)}%</strong>. Keep improving!</>}
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateBot}
            sx={{ 
              bgcolor: 'white', 
              color: theme.palette.primary.main,
              fontWeight: 600,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.9),
                boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Create New Bot
          </Button>
        </Grid>
        
        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <ShowChartIcon 
              sx={{ 
                fontSize: 240, 
                opacity: 0.3,
                filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.2))'
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: alpha('#fff', 0.15),
                filter: 'blur(15px)'
              }} 
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DashboardHeader; 