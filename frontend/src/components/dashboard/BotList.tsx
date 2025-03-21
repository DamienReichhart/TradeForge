import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Stack,
  Grid,
  Tooltip,
  Paper,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { Bot } from '../../types';
import { botsApi } from '../../services/api';

interface BotListProps {
  bots: Bot[];
  onBotDeleted?: () => void;
}

const BotList: React.FC<BotListProps> = ({ bots, onBotDeleted }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateBot = () => {
    navigate('/dashboard/new');
  };

  const handleBotClick = (botId: number) => {
    navigate(`/dashboard/${botId}`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, bot: Bot) => {
    setAnchorEl(event.currentTarget);
    setSelectedBot(bot);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBot) return;
    
    try {
      setIsDeleting(true);
      console.log(`Attempting to delete bot ${selectedBot.id}`);
      
      const response = await botsApi.delete(selectedBot.id);
      console.log('Delete response:', response);
      
      // Close the dialog
      setDeleteDialogOpen(false);
      
      // Call the callback if provided
      if (onBotDeleted) {
        onBotDeleted();
      } else {
        // Fallback to page reload if no callback provided
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Error deleting bot:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // You could add error handling UI here
      alert(`Failed to delete bot: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  if (bots.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 4,
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <ShowChartIcon sx={{ fontSize: 70, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
        <Typography variant="h5" fontWeight="medium" sx={{ mb: 1 }}>
          No Trading Bots Yet
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
          Create your first trading bot to start automating your strategies and generating profits.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateBot}
          size="large"
          sx={{
            mt: 2,
            textTransform: 'none',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(0,0,0,0.09)',
            '&:hover': {
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Create Your First Bot
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          Your Trading Bots
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateBot}
          size="medium"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          New Bot
        </Button>
      </Box>

      <Grid container spacing={3}>
        {bots.map((bot) => (
          <Grid item xs={12} sm={6} md={4} key={bot.id}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.07)'
                },
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  px: 3, 
                  pt: 3, 
                  pb: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  bgcolor: bot.is_running 
                    ? alpha(theme.palette.success.main, 0.05)
                    : alpha(theme.palette.primary.main, 0.03),
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: bot.is_running ? theme.palette.success.main : theme.palette.grey[400],
                      boxShadow: bot.is_running ? `0 0 10px ${alpha(theme.palette.success.main, 0.5)}` : 'none'
                    }} 
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {bot.name}
                  </Typography>
                </Stack>
                
                <Tooltip title="Bot actions">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, bot)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 0 }}>
                <Box sx={{ p: 3, pt: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                    <Chip
                      label={bot.pair}
                      size="small"
                      sx={{
                        fontWeight: 'medium',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      }}
                    />
                    <Chip
                      label={bot.timeframe}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Stack>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
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

                  <Divider sx={{ my: 2, opacity: 0.6 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Created
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {new Date(bot.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                <Button
                  size="medium"
                  variant="contained"
                  fullWidth
                  onClick={() => handleBotClick(bot.id)}
                  sx={{
                    borderRadius: 8,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Manage Bot
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bot actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          }
        }}
      >
        <MenuItem onClick={handleDeleteClick} sx={{ color: theme.palette.error.main }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Delete Bot</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedBot?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BotList; 