import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Avatar,
  Snackbar,
  Alert,
  LinearProgress,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import TelegramIcon from '@mui/icons-material/Telegram';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Styled components
const SettingsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(4),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.08)',
  }
}));

const SettingSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  position: 'relative',
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const GradientDivider = styled(Divider)(({ theme }) => ({
  height: 3,
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  marginBottom: theme.spacing(4),
  borderRadius: 3,
}));

const SectionIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '120%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.3)}, transparent)`,
    transition: 'all 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    '&:after': {
      left: '-120%',
    },
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontSize: 40,
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  border: `3px solid ${theme.palette.background.paper}`,
}));

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Profile settings
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Telegram settings
  const [telegramUsername, setTelegramUsername] = useState('');
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setTelegramUsername(user.telegram_username || '');
    }
  }, [user]);
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await api.put('/users/me', { first_name: firstName, last_name: lastName });
      await refreshUser();
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveTelegram = async () => {
    try {
      setLoading(true);
      await api.put('/users/me/telegram', { telegram_username: telegramUsername });
      await refreshUser();
      setSnackbar({ 
        open: true, 
        message: 'Telegram username saved! Now send /start to the TradeForge bot to complete setup.', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error updating Telegram username:', error);
      setSnackbar({ open: true, message: 'Failed to update Telegram username', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      await api.put('/users/me', { password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSnackbar({ open: true, message: 'Password updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating password:', error);
      setSnackbar({ open: true, message: 'Failed to update password', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Gets initials from user's name for avatar
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, position: 'sticky', top: 0, zIndex: 10 }} />}
      
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
        mb: 1,
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block'
      }}>
        Account Settings
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account preferences and personal information
      </Typography>
      
      <GradientDivider />
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box sx={{ 
            textAlign: 'center', 
            position: 'sticky',
            top: theme.spacing(4),
          }}>
            <ProfileAvatar>
              {getInitials()}
            </ProfileAvatar>
            <Typography variant="h5" fontWeight="600">
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.email || 'user@example.com'}
            </Typography>
            <Box sx={{ mt: 2, px: 2 }}>
              <Paper sx={{ 
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <Typography variant="body2">
                  Complete your profile to get the most out of TradeForge
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={8}>
          {/* Profile Section */}
          <SettingsCard>
            <CardContent sx={{ p: 0 }}>
              <SettingSection>
                <SectionHeader>
                  <SectionIcon>
                    <PersonIcon fontSize="medium" />
                  </SectionIcon>
                  <Typography variant="h6">Personal Information</Typography>
                </SectionHeader>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email || ''}
                      disabled
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-root.Mui-disabled": {
                          backgroundColor: alpha(theme.palette.action.disabledBackground, 0.3)
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={user?.username || ''}
                      disabled
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-root.Mui-disabled": {
                          backgroundColor: alpha(theme.palette.action.disabledBackground, 0.3)
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AnimatedButton
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={loading}
                      size="large"
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Save Profile
                    </AnimatedButton>
                  </Grid>
                </Grid>
              </SettingSection>
            </CardContent>
          </SettingsCard>

          {/* Telegram Section */}
          <SettingsCard>
            <CardContent sx={{ p: 0 }}>
              <SettingSection>
                <SectionHeader>
                  <SectionIcon sx={{ backgroundColor: alpha('#0088cc', 0.1), color: '#0088cc' }}>
                    <TelegramIcon fontSize="medium" />
                  </SectionIcon>
                  <Typography variant="h6">Telegram Integration</Typography>
                </SectionHeader>
                
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.info.main, 0.08)
                  }}
                >
                  Receive real-time alerts and trading notifications directly to your Telegram account.
                </Alert>
                
                <TextField
                  fullWidth
                  label="Telegram Username"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  variant="outlined"
                  placeholder="username (without @)"
                  helperText="Enter your Telegram username without the @ symbol"
                  InputProps={{
                    startAdornment: <TelegramIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 3
                }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    How to connect:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="ol" sx={{ pl: 2 }}>
                    <li>Save your Telegram username below</li>
                    <li>Open Telegram and search for "@TradeForgeBot"</li>
                    <li>Send the command <code>/start</code> to our bot</li>
                    <li>You'll receive a confirmation message when connected</li>
                  </Typography>
                </Box>
                
                <AnimatedButton
                  variant="contained"
                  sx={{ 
                    backgroundColor: '#0088cc',
                    '&:hover': {
                      backgroundColor: '#0077b5',
                    }
                  }}
                  startIcon={<TelegramIcon />}
                  onClick={handleSaveTelegram}
                  disabled={loading}
                  size="large"
                  fullWidth
                >
                  Connect Telegram
                </AnimatedButton>
              </SettingSection>
            </CardContent>
          </SettingsCard>

          {/* Password Section */}
          <SettingsCard>
            <CardContent sx={{ p: 0 }}>
              <SettingSection>
                <SectionHeader>
                  <SectionIcon>
                    <LockIcon fontSize="medium" />
                  </SectionIcon>
                  <Typography variant="h6">Security</Typography>
                </SectionHeader>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <AnimatedButton
                      variant="contained"
                      color="primary"
                      startIcon={<LockIcon />}
                      onClick={handleChangePassword}
                      disabled={loading}
                      size="large"
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Update Password
                    </AnimatedButton>
                  </Grid>
                </Grid>
              </SettingSection>
            </CardContent>
          </SettingsCard>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 