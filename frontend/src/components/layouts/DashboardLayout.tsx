import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Button,
  Avatar,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NightlightIcon from '@mui/icons-material/Nightlight';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

const drawerWidth = 260;

const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  const drawer = (
    <Box 
      className={mounted ? 'animate-slide-right' : ''}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        pt: 1
      }}
    >
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" noWrap component="div" className="gradient-text font-bold">
          TradeForge
        </Typography>
      </Box>
      
      <Box sx={{ px: 2, py: 2 }}>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }}
          className="card-hover"
        >
          <Avatar 
            src=""
            alt={user?.username || 'User'}
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ mx: 2, opacity: 0.5 }} />
      
      <Box sx={{ flexGrow: 1, px: 1, py: 2 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigate('/dashboard')}
              selected={isCurrentPath('/dashboard')}
              sx={{ 
                borderRadius: 2,
                mb: 1,
                transition: 'all 0.2s ease-in-out',
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: isCurrentPath('/dashboard') ? theme.palette.primary.main : 'inherit' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{ 
                  fontWeight: isCurrentPath('/dashboard') ? 600 : 400,
                  color: isCurrentPath('/dashboard') ? theme.palette.primary.main : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigate('/dashboard/new')}
              selected={isCurrentPath('/dashboard/new')}
              sx={{ 
                borderRadius: 2,
                mb: 1,
                transition: 'all 0.2s ease-in-out',
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: isCurrentPath('/dashboard/new') ? theme.palette.primary.main : 'inherit' }}>
                <AddCircleIcon />
              </ListItemIcon>
              <ListItemText 
                primary="New Bot" 
                primaryTypographyProps={{ 
                  fontWeight: isCurrentPath('/dashboard/new') ? 600 : 400,
                  color: isCurrentPath('/dashboard/new') ? theme.palette.primary.main : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              sx={{ 
                borderRadius: 2,
                mb: 1,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Performance" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      
      <Divider sx={{ mx: 2, opacity: 0.5 }} />
      
      <List sx={{ px: 1, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton 
            sx={{ 
              borderRadius: 2,
              mb: 1,
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => navigate('/dashboard/settings')}
            selected={isCurrentPath('/dashboard/settings')}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              transition: 'all 0.2s ease-in-out',
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: isCurrentPath('/dashboard/settings') ? theme.palette.primary.main : 'inherit' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              primaryTypographyProps={{ 
                fontWeight: isCurrentPath('/dashboard/settings') ? 600 : 400,
                color: isCurrentPath('/dashboard/settings') ? theme.palette.primary.main : 'inherit'
              }}
            />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2,
              color: theme.palette.error.main,
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.error.main }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }} className={mounted ? 'animate-fade-in' : ''}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: theme.palette.text.primary
        }}
        className="glass-morphism"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Help">
              <IconButton 
                color="inherit"
                className="btn-hover"
                sx={{ mx: 0.5 }}
              >
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit"
                className="btn-hover"
                sx={{ mx: 0.5 }}
              >
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            
            <ThemeToggle />
            
            <Avatar 
              src=""
              alt={user?.username || 'User'}
              sx={{ 
                width: 36, 
                height: 36,
                ml: 1.5,
                cursor: 'pointer',
                bgcolor: theme.palette.primary.main
              }}
              className="btn-hover"
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '5px 0 20px rgba(0, 0, 0, 0.05)'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '5px 0 20px rgba(0, 0, 0, 0.05)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column'
        }}
        className="animate-slide-up"
      >
        <Toolbar />
        <Box sx={{ pb: 5, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 