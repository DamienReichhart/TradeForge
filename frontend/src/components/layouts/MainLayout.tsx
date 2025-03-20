import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box,
  IconButton,
  useScrollTrigger,
  Slide,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from '../common/Footer';
import MenuIcon from '@mui/icons-material/Menu';

interface HideOnScrollProps {
  children: React.ReactElement;
}

function HideOnScroll(props: HideOnScrollProps) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const MainLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Typography variant="h6" component="div" sx={{ my: 2, ml: 2 }}>
        <span className="gradient-text font-bold">TradeForge</span>
      </Typography>
      <Divider />
      <List>
        <ListItem button component={RouterLink} to="/pricing">
          <ListItemText primary="Pricing" />
        </ListItem>
        <ListItem button component={RouterLink} to="/help">
          <ListItemText primary="Help" />
        </ListItem>
        <ListItem button component={RouterLink} to="/opinions">
          <ListItemText primary="Opinions" />
        </ListItem>
        <Divider />
        {isAuthenticated ? (
          <>
            <ListItem button component={RouterLink} to="/dashboard">
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={logout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={RouterLink} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={RouterLink} to="/register">
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HideOnScroll>
        <AppBar 
          position="fixed" 
          elevation={scrolled ? 2 : 0}
          sx={{ 
            transition: 'all 0.3s ease-in-out',
            background: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            borderBottom: scrolled ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
          }}
          className={scrolled ? 'glass-morphism' : ''}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/" 
              sx={{ 
                flexGrow: 1, 
                textDecoration: 'none', 
                fontWeight: 700
              }}
              className="gradient-text header-underline"
            >
              TradeForge
            </Typography>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/pricing"
                className="btn-hover"
                sx={{ mx: 1 }}
              >
                Pricing
              </Button>
              
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/help"
                className="btn-hover"
                sx={{ mx: 1 }}
              >
                Help
              </Button>
              
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/opinions"
                className="btn-hover"
                sx={{ mx: 1 }}
              >
                Opinions
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/dashboard"
                    className="btn-hover"
                    sx={{ mx: 1 }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    color="inherit" 
                    onClick={logout}
                    className="btn-hover"
                    sx={{ mx: 1 }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/login"
                    className="btn-hover"
                    sx={{ mx: 1 }}
                  >
                    Login
                  </Button>
                  <Button 
                    color="secondary" 
                    variant="contained" 
                    component={RouterLink} 
                    to="/register"
                    className="btn-hover animated-border"
                    sx={{ 
                      ml: 2,
                      px: 3,
                      py: 1,
                      borderRadius: '50px',
                      boxShadow: (theme) => theme.shadows[3]
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
            
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250,
              borderRadius: '0 16px 16px 0'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        className="animate-fade-in"
        sx={{ 
          flexGrow: 1, 
          pt: 10, 
          pb: 4,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Container>
          <Outlet />
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default MainLayout; 