import React from 'react';
import { Typography, Button, Container, Grid, Box, Paper, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

const HomePage: React.FC = () => {
  return (
    <Box>
      {/* Hero section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          borderRadius: 2,
          mb: 6,
          backgroundImage: 'linear-gradient(135deg, #2E3B55 0%, #4D5B83 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" component="h1" gutterBottom>
                Automate Your Trading Strategy with TradeForge
              </Typography>
              <Typography variant="h5" paragraph>
                Create, test, and deploy your custom trading bots without coding. Maximize your profits with algorithmic precision.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  component={RouterLink} 
                  to="/register"
                  sx={{ mr: 2, mb: 2 }}
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large" 
                  component={RouterLink} 
                  to="/pricing"
                  sx={{ mb: 2 }}
                >
                  View Pricing
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: '250px',
                  borderRadius: 2,
                  boxShadow: 5,
                  display: { xs: 'none', md: 'flex' },
                  bgcolor: 'secondary.light',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" color="text.secondary">Trading Dashboard Preview</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Everything you need to succeed in algorithmic trading
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <CodeIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h2" align="center" gutterBottom>
                  No-Code Bot Creation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Design sophisticated trading strategies using our intuitive interface. No programming skills required.
                  Simply select indicators, define conditions, and launch your bot.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <AutoGraphIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h2" align="center" gutterBottom>
                  Advanced Backtesting
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Test your strategies against historical data. Analyze performance metrics and fine-tune your approach
                  before risking real capital. Generate detailed reports to guide your decisions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <TrendingUpIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h2" align="center" gutterBottom>
                  Real-Time Automation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Set your trading bots to work 24/7. Receive instant notifications via Telegram when trades are executed.
                  Monitor performance in real-time through our comprehensive dashboard.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials preview */}
      <Box sx={{ bgcolor: 'grey.100', py: 6, mb: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            What Our Users Say
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 3 }} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                elevation={2}
              >
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "TradeForge has completely transformed how I approach trading. The ability to automate my strategies and backtest them has saved me countless hours and improved my results dramatically."
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 'auto' }}>
                  - John Smith, Professional Trader
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                elevation={2}
              >
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "As someone who deals with algorithmic trading professionally, I'm impressed by the simplicity and power of TradeForge. It makes creating complex trading strategies accessible even to those without a technical background."
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 'auto' }}>
                  - Sarah Johnson, Investment Analyst
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              color="primary"
              component={RouterLink}
              to="/opinions"
            >
              View All Testimonials
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA section */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} elevation={3}>
          <Typography variant="h4" gutterBottom>
            Ready to Transform Your Trading?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Join thousands of traders who have improved their results with TradeForge.
            Get started today with our free Starter plan.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            component={RouterLink}
            to="/register"
            sx={{ mt: 2 }}
          >
            Start Trading Now
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage; 