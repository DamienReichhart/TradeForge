import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  Divider,
  Snackbar
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
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
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
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
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper elevation={0} sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Profile" {...a11yProps(0)} />
            <Tab label="Telegram" {...a11yProps(1)} />
            <Tab label="Password" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        {/* Profile Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" sx={{ maxWidth: 500 }}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled
              margin="normal"
            />
            <TextField
              fullWidth
              label="Username"
              value={user?.username || ''}
              disabled
              margin="normal"
            />
            
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={handleSaveProfile}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>
        </TabPanel>
        
        {/* Telegram Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Telegram Integration
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ maxWidth: 600 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Connect your Telegram account to receive trading notifications and alerts.
            </Alert>
            
            <Box component="form" sx={{ maxWidth: 500 }}>
              <TextField
                fullWidth
                label="Telegram Username"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                margin="normal"
                placeholder="username (without @)"
                helperText="Enter your Telegram username without the @ symbol"
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                After saving your Telegram username, send the command <code>/start</code> to our bot
                to complete the setup process.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 1 }}
                onClick={handleSaveTelegram}
                disabled={loading}
              >
                Save Telegram Username
              </Button>
            </Box>
          </Box>
        </TabPanel>
        
        {/* Password Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" sx={{ maxWidth: 500 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
            />
            
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={handleChangePassword}
              disabled={loading}
            >
              Update Password
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 