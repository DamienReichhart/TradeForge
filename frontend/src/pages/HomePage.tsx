import React from 'react';
import { Typography, Button, Container, Grid, Box, Paper, Card, CardContent, useTheme, useMediaQuery, Chip, Divider, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
import SpeedIcon from '@mui/icons-material/Speed';
import StarIcon from '@mui/icons-material/Star';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box>
      {/* Hero section */}
      <Box 
        sx={{ 
          position: 'relative',
          bgcolor: 'primary.main', 
          color: 'white', 
          py: { xs: 8, md: 12 },
          borderRadius: { xs: 0, md: '0 0 20px 20px' },
          mb: 8,
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #3f51b5 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
            opacity: 0.6,
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Chip 
                  label="Next-Gen Trading Platform" 
                  sx={{ 
                    bgcolor: 'secondary.main', 
                    color: 'white', 
                    fontWeight: 'bold',
                    mb: 2,
                    fontSize: '0.875rem',
                    py: 0.5
                  }} 
                />
                <Typography variant="h2" component="h1" gutterBottom sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  lineHeight: 1.2
                }}>
                  Automate Your Trading Strategy with TradeForge
                </Typography>
                <Typography variant="h5" paragraph sx={{ 
                  opacity: 0.9,
                  fontWeight: 400,
                  maxWidth: '600px',
                  mb: 4
                }}>
                  Create, test, and deploy custom trading bots without writing a single line of code. Maximize profits with algorithmic precision.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large" 
                    component={RouterLink} 
                    to="/register"
                    sx={{ 
                      borderRadius: '50px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    size="large" 
                    component={RouterLink} 
                    to="/pricing"
                    sx={{ 
                      borderRadius: '50px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 'bold',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    View Pricing
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                    <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} />
                    <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} />
                    <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} />
                    <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} />
                    <StarIcon sx={{ color: '#FFD700' }} />
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Trusted by 10,000+ traders worldwide
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  position: 'relative',
                  width: '100%',
                  height: { xs: '300px', md: '400px' },
                  borderRadius: '12px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                  overflow: 'hidden',
                  transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateY(-2deg) rotateX(2deg)',
                  },
                  background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Trading Dashboard Preview
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Bar */}
      <Container maxWidth="lg">
        <Paper 
          elevation={4} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 8, 
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
          }}
        >
          <Grid container spacing={3} textAlign="center">
            <Grid item xs={12} md={4} sx={{ 
              borderRight: !isMobile ? '1px solid rgba(0, 0, 0, 0.12)' : 'none'
            }}>
              <Typography variant="h2" component="div" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>10k+</Typography>
              <Typography variant="body1" color="text.secondary">Active Users</Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ 
              borderRight: !isMobile ? '1px solid rgba(0, 0, 0, 0.12)' : 'none'
            }}>
              <Typography variant="h2" component="div" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>$250M+</Typography>
              <Typography variant="body1" color="text.secondary">Trading Volume</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h2" component="div" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>98%</Typography>
              <Typography variant="body1" color="text.secondary">Uptime</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Features section */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box textAlign="center" mb={6}>
          <Chip 
            label="FEATURES" 
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.main', 
              fontWeight: 'bold',
              mb: 2
            }} 
          />
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800 }}>
            Everything You Need to Succeed
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ maxWidth: '700px', mx: 'auto' }}>
            Our platform offers a comprehensive suite of tools for algorithmic trading success
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: '12px', 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
              },
            }}>
              <Box sx={{ bgcolor: 'primary.main', height: '8px' }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.light', mb: 2 }}>
                    <CodeIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                  No-Code Bot Creation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Design sophisticated trading strategies using our intuitive drag-and-drop interface. No programming skills required.
                  Simply select indicators, define conditions, and launch your bot.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: '12px', 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
              },
            }}>
              <Box sx={{ bgcolor: 'secondary.main', height: '8px' }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.light', mb: 2 }}>
                    <AutoGraphIcon sx={{ fontSize: 36, color: 'secondary.main' }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                  Advanced Backtesting
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Test your strategies against historical data with precision. Analyze performance metrics and fine-tune your approach
                  before risking real capital. Generate detailed reports to guide your decisions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: '12px', 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
              },
            }}>
              <Box sx={{ bgcolor: 'info.main', height: '8px' }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'info.light', mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 36, color: 'info.main' }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                  Real-Time Automation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Set your trading bots to work 24/7. Receive instant notifications via Telegram when trades are executed.
                  Monitor performance in real-time through our comprehensive dashboard.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: '12px', 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
              },
            }}>
              <Box sx={{ bgcolor: 'success.main', height: '8px' }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'success.light', mb: 2 }}>
                    <SecurityIcon sx={{ fontSize: 36, color: 'success.main' }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                  Enterprise Security
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Rest easy with bank-grade encryption, two-factor authentication, and regular security audits.
                  Your funds and trading strategies are always protected.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: '12px', 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
              },
            }}>
              <Box sx={{ bgcolor: 'warning.main', height: '8px' }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'warning.light', mb: 2 }}>
                    <DevicesIcon sx={{ fontSize: 36, color: 'warning.main' }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                  Multi-Platform Access
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Control your trading strategy from anywhere. Access TradeForge from desktop, tablet, or mobile
                  with a fully responsive interface optimized for all devices.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: '12px', 
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
              },
            }}>
              <Box sx={{ bgcolor: 'error.main', height: '8px' }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'error.light', mb: 2 }}>
                    <SpeedIcon sx={{ fontSize: 36, color: 'error.main' }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                  Low Latency Execution
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Execute trades with lightning speed. Our optimized infrastructure ensures your orders are processed
                  with minimal latency, even during high market volatility.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials preview */}
      <Box sx={{ 
        bgcolor: '#f8f9fd', 
        py: { xs: 8, md: 10 }, 
        mb: 8,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 50%, rgba(63, 81, 181, 0.05) 0%, rgba(63, 81, 181, 0) 70%)'
        }
      }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Chip 
              label="TESTIMONIALS" 
              sx={{ 
                bgcolor: 'primary.light', 
                color: 'primary.main', 
                fontWeight: 'bold',
                mb: 2
              }} 
            />
            <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800 }}>
              What Our Users Say
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ maxWidth: '700px', mx: 'auto' }}>
              Join thousands of satisfied traders using TradeForge to automate their trading
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  position: 'relative',
                  '&::before': {
                    content: '"""',
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    fontSize: '4rem',
                    lineHeight: 1,
                    color: 'rgba(63, 81, 181, 0.1)',
                    fontFamily: 'serif',
                    fontWeight: 'bold'
                  }
                }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <StarIcon sx={{ color: '#FFD700' }} />
                </Box>
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 3, pt: 2 }}>
                  "TradeForge has completely transformed how I approach trading. The ability to automate my strategies and backtest them has saved me countless hours and improved my results dramatically."
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>JS</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      John Smith
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Professional Trader
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  position: 'relative',
                  '&::before': {
                    content: '"""',
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    fontSize: '4rem',
                    lineHeight: 1,
                    color: 'rgba(63, 81, 181, 0.1)',
                    fontFamily: 'serif',
                    fontWeight: 'bold'
                  }
                }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <StarIcon sx={{ color: '#FFD700' }} />
                  <StarIcon sx={{ color: '#FFD700' }} />
                </Box>
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 3, pt: 2 }}>
                  "As someone who deals with algorithmic trading professionally, I'm impressed by the simplicity and power of TradeForge. It makes creating complex trading strategies accessible even to those without a technical background."
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>SJ</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Sarah Johnson
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Investment Analyst
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Button 
              variant="outlined" 
              color="primary"
              component={RouterLink}
              to="/opinions"
              sx={{ 
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(63, 81, 181, 0.05)'
                }
              }}
            >
              View All Testimonials
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA section */}
      <Container maxWidth="md" sx={{ mb: 10 }}>
        <Paper 
          sx={{ 
            p: { xs: 4, md: 6 }, 
            textAlign: 'center', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
              opacity: 0.6,
            }
          }} 
          elevation={0}
        >
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, position: 'relative', zIndex: 1 }}>
            Ready to Transform Your Trading?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: '600px', mx: 'auto', position: 'relative', zIndex: 1 }}>
            Join thousands of traders who have improved their results with TradeForge.
            Get started today with our free Starter plan.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            component={RouterLink}
            to="/register"
            sx={{ 
              mt: 2,
              borderRadius: '50px',
              px: 5,
              py: 1.5,
              fontWeight: 'bold',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              zIndex: 1,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Start Trading Now
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage; 