import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import TelegramIcon from '@mui/icons-material/Telegram';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer"
      sx={{ 
        py: 6,
        bgcolor: theme.palette.background.default,
        borderTop: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.05)'
      }}
      className="animate-on-scroll"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              gutterBottom 
              className="gradient-text header-underline"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              TradeForge
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 2, maxWidth: 300 }}
            >
              The most advanced platform for creating, testing, and deploying 
              automated trading strategies using cutting-edge AI techniques.
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <IconButton 
                size="small"
                color="primary"
                aria-label="Twitter"
                className="btn-hover"
                sx={{ 
                  bgcolor: 'rgba(58, 111, 247, 0.1)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                size="small"
                color="primary"
                aria-label="LinkedIn"
                className="btn-hover"
                sx={{ 
                  bgcolor: 'rgba(58, 111, 247, 0.1)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton 
                size="small"
                color="primary"
                aria-label="GitHub"
                className="btn-hover"
                sx={{ 
                  bgcolor: 'rgba(58, 111, 247, 0.1)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton 
                size="small"
                color="primary"
                aria-label="Telegram"
                className="btn-hover"
                sx={{ 
                  bgcolor: 'rgba(58, 111, 247, 0.1)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <TelegramIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Product
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/features" 
                  color="text.secondary"
                  underline="hover"
                  className="btn-hover"
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  Features
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/pricing" 
                  color="text.secondary"
                  underline="hover"
                  className="btn-hover"
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  Pricing
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/help" 
                  color="text.secondary"
                  underline="hover"
                  className="btn-hover"
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  Documentation
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Company
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/about" 
                  color="text.secondary"
                  underline="hover"
                  className="btn-hover"
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  About Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/contact" 
                  color="text.secondary"
                  underline="hover"
                  className="btn-hover"
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  Contact
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/careers" 
                  color="text.secondary"
                  underline="hover"
                  className="btn-hover"
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  Careers
                </Link>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Legal
            </Typography>
            <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/terms" 
                  color="text.secondary"
                  underline="hover"
                  className="btn-hover"
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  Terms
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/privacy" 
                  color="text.secondary"
                  underline="hover"
                  className="btn-hover"
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  Privacy
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/cookies" 
                  color="text.secondary"
                  underline="hover"
                  className="btn-hover"
                  sx={{ 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  Cookies
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, opacity: 0.2 }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} TradeForge. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link 
              component={RouterLink} 
              to="/terms" 
              color="text.secondary"
              underline="hover"
              variant="body2"
              className="btn-hover"
              sx={{ 
                transition: 'all 0.2s ease-in-out',
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Terms
            </Link>
            <Link 
              component={RouterLink} 
              to="/privacy" 
              color="text.secondary"
              underline="hover"
              variant="body2"
              className="btn-hover"
              sx={{ 
                transition: 'all 0.2s ease-in-out',
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Privacy
            </Link>
            <Link 
              component={RouterLink} 
              to="/cookies" 
              color="text.secondary"
              underline="hover"
              variant="body2"
              className="btn-hover"
              sx={{ 
                transition: 'all 0.2s ease-in-out',
                '&:hover': { color: theme.palette.primary.main }
              }}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 