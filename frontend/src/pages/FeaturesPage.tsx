import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  useTheme,
  alpha
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BarChartIcon from '@mui/icons-material/BarChart';
import BoltIcon from '@mui/icons-material/Bolt';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import LayersIcon from '@mui/icons-material/Layers';
import { Link as RouterLink } from 'react-router-dom';

const features = [
  {
    title: 'AI-Powered Strategy Generation',
    description: 'Our advanced AI models analyze market patterns and generate optimized trading strategies tailored to your specific goals.',
    icon: <AutoAwesomeIcon fontSize="large" />,
    color: '#3a6ff7'
  },
  {
    title: 'Comprehensive Backtesting',
    description: 'Test your strategies against historical data with detailed performance metrics and visualization tools.',
    icon: <BarChartIcon fontSize="large" />,
    color: '#4caf50'
  },
  {
    title: 'Real-Time Trading',
    description: 'Execute your strategies in real-time with millisecond precision across multiple exchanges and markets.',
    icon: <BoltIcon fontSize="large" />,
    color: '#ff9800'
  },
  {
    title: 'Custom Strategy Development',
    description: 'Write and customize your own trading algorithms using our intuitive coding environment.',
    icon: <CodeIcon fontSize="large" />,
    color: '#9c27b0'
  },
  {
    title: 'Advanced Security',
    description: 'Enterprise-grade security with encrypted API connections, two-factor authentication, and regular security audits.',
    icon: <SecurityIcon fontSize="large" />,
    color: '#f44336'
  },
  {
    title: 'Multi-Asset Support',
    description: 'Trade across stocks, forex, cryptocurrencies, and more, all from a single unified platform.',
    icon: <LayersIcon fontSize="large" />,
    color: '#2196f3'
  }
];

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
}> = ({ title, description, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      className="animate-on-scroll slide-up"
      sx={{
        height: '100%',
        borderRadius: 2,
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        border: '1px solid',
        borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: alpha(color, 0.1),
            color: color,
            mb: 2
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const FeaturesPage: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box 
          className="animate-on-scroll fade-in" 
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 6, md: 10 } 
          }}
        >
          <Typography 
            variant="h1" 
            component="h1"
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
              mb: 2
            }}
          >
            Powerful Features for
            <Box component="span" sx={{ display: 'block' }} className="gradient-text">
              Modern Trading
            </Box>
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              mb: 5 
            }}
          >
            Discover all the tools and capabilities that make TradeForge the most advanced 
            trading platform for professionals and beginners alike.
          </Typography>
          <Button 
            component={RouterLink} 
            to="/register" 
            variant="contained" 
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600
            }}
          >
            Start Trading Now
          </Button>
        </Box>
        
        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
        
        {/* Advanced Features Section */}
        <Box sx={{ mt: { xs: 8, md: 12 }, mb: { xs: 8, md: 12 } }}>
          <Typography 
            variant="h2" 
            component="h2" 
            align="center"
            className="animate-on-scroll fade-in"
            sx={{ 
              fontWeight: 700,
              mb: 6
            }}
          >
            Advanced Trading Capabilities
          </Typography>
          
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6} className="animate-on-scroll slide-right">
              <Box 
                component="img"
                src="/advanced-analytics.png"
                alt="Advanced Analytics Dashboard"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)'
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} className="animate-on-scroll slide-left">
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Sophisticated Analytics
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Gain deep insights into market trends and your strategy performance with our comprehensive analytics suite.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Our platform provides real-time data visualization, custom metrics tracking, and performance attribution to help you understand exactly why your strategies succeed or fail.
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {[
                  'Performance comparison across multiple timeframes',
                  'Risk-adjusted return analysis',
                  'Correlation studies between different assets',
                  'Custom metric creation and tracking',
                  'Automated strategy improvement suggestions'
                ].map((item, index) => (
                  <Box 
                    component="li" 
                    key={index}
                    sx={{ 
                      mb: 1,
                      color: 'text.secondary'
                    }}
                  >
                    {item}
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* CTA Section */}
        <Box 
          sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="animate-on-scroll fade-in"
        >
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(58, 111, 247, 0.05) 0%, rgba(200, 80, 192, 0.05) 100%)',
              zIndex: 0
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              component="h2"
              sx={{ 
                fontWeight: 700,
                mb: 2
              }}
            >
              Ready to Revolutionize Your Trading?
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary"
              sx={{ 
                mb: 4,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Join thousands of traders who have taken their strategies to the next level with TradeForge's powerful features.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                size="large"
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600
                }}
              >
                Start Free Trial
              </Button>
              <Button 
                component={RouterLink} 
                to="/pricing" 
                variant="outlined" 
                size="large"
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600
                }}
              >
                View Pricing
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesPage; 