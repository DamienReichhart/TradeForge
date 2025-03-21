import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Paper, 
  Switch, 
  Stack, 
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from 'react-router-dom';

const pricingTiers = [
  {
    title: 'Starter',
    subtitle: 'For beginners starting their trading journey',
    price: {
      monthly: '$15',
      annually: '$150',
    },
    priceDetail: 'per month',
    description: 'Perfect for newcomers who want to test algorithmic trading with basic functionality.',
    features: [
      { title: 'Up to 3 active bots', included: true },
      { title: 'Basic indicators', included: true },
      { title: 'Daily trading summary', included: true },
      { title: 'Email notifications', included: true },
      { title: 'Community forum access', included: true },
      { title: 'Telegram notifications', included: false },
      { title: 'Custom indicators', included: false },
      { title: 'Priority support', included: false },
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'outlined',
    highlight: false,
    discount: '20%',
  },
  {
    title: 'Pro',
    subtitle: 'For serious traders looking to scale',
    price: {
      monthly: '$30',
      annually: '$288',
    },
    priceDetail: 'per month',
    description: 'Unlock advanced features to optimize your trading strategies and improve results.',
    features: [
      { title: 'Up to 10 active bots', included: true },
      { title: 'Advanced indicators', included: true },
      { title: 'Real-time performance dashboard', included: true },
      { title: 'Telegram notifications', included: true },
      { title: 'Priority support', included: true },
      { title: 'Strategy templates', included: true },
      { title: 'Custom indicators', included: false },
      { title: 'API access', included: false },
    ],
    buttonText: 'Get Pro',
    buttonVariant: 'contained',
    highlight: true,
    discount: '20%',
    popularBadge: true,
  },
  {
    title: 'Expert',
    subtitle: 'For professional traders and institutions',
    price: {
      monthly: '$100',
      annually: '$960',
    },
    priceDetail: 'per month',
    description: 'Enterprise-level features for professional traders who demand the best tools.',
    features: [
      { title: 'Unlimited bots', included: true },
      { title: 'Custom indicators', included: true },
      { title: 'Advanced backtesting', included: true },
      { title: 'API access', included: true },
      { title: 'White-label options', included: true },
      { title: 'Dedicated account manager', included: true },
      { title: 'Custom integrations', included: true },
      { title: 'VIP support 24/7', included: true },
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outlined',
    highlight: false,
    discount: '20%',
  },
];

const features = [
  { 
    title: 'Advanced Analytics', 
    description: 'Gain insights into your trading performance with detailed analytics and reports',
    icon: <AutoGraphIcon sx={{ fontSize: 40 }} />
  },
  { 
    title: 'Premium Support', 
    description: 'Get priority access to our customer support team for faster resolution',
    icon: <SupportAgentIcon sx={{ fontSize: 40 }} />
  },
  { 
    title: 'Enterprise Security', 
    description: 'Bank-grade encryption and security protocols to protect your assets',
    icon: <SecurityIcon sx={{ fontSize: 40 }} />
  },
];

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate your billing.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, all plans come with a 14-day free trial period with no credit card required. You can test all features before committing.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and cryptocurrency payments including Bitcoin and Ethereum.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from your account settings. Your access will continue until the end of your billing period.'
  }
];

const PricingPage: React.FC = () => {
  const [annual, setAnnual] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleChange = () => {
    setAnnual(!annual);
  };

  const handleGetStarted = (tier: string) => {
    navigate('/register', { state: { selectedPlan: tier } });
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          bgcolor: 'primary.main', 
          color: 'white', 
          py: { xs: 6, md: 8 },
          borderRadius: { xs: 0, md: '0 0 20px 20px' },
          mb: 6,
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
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
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <Chip 
              label="PRICING" 
              sx={{ 
                bgcolor: 'secondary.main', 
                color: 'white', 
                fontWeight: 'bold',
                mb: 2,
                fontSize: '0.875rem',
                py: 0.5
              }} 
            />
            <Typography variant="h2" component="h1" align="center" gutterBottom sx={{ 
              fontWeight: 800,
              fontSize: { xs: '2.2rem', md: '3rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              lineHeight: 1.2
            }}>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h5" align="center" paragraph sx={{ 
              opacity: 0.9,
              fontWeight: 400,
              maxWidth: '700px',
              mx: 'auto',
              mb: 4
            }}>
              Choose the plan that fits your trading needs with a 14-day free trial
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Pricing Toggle */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              p: 1, 
              borderRadius: '50px',
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: !annual ? 600 : 400, 
                color: !annual ? 'primary.main' : 'text.secondary',
                px: 2
              }}
            >
              Monthly
            </Typography>
            <Switch 
              checked={annual} 
              onChange={handleChange} 
              color="primary"
            />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: annual ? 600 : 400, 
                color: annual ? 'primary.main' : 'text.secondary',
                px: 2
              }}
            >
              Annually
            </Typography>
            <Chip 
              label="Save 20%" 
              size="small" 
              color="secondary" 
              sx={{ 
                ml: 1,
                display: annual ? 'flex' : 'none'
              }} 
            />
          </Paper>
        </Box>
      
        {/* Pricing Tiers */}
        <Grid container spacing={4} justifyContent="center">
          {pricingTiers.map((tier, index) => (
            <Grid
              item
              key={tier.title}
              xs={12}
              sm={6}
              md={4}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  borderRadius: '16px',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  overflow: 'hidden',
                  ...(tier.highlight ? {
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    transform: 'scale(1.05)',
                    zIndex: 1,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      transform: 'scale(1.07)',
                      boxShadow: '0 15px 50px rgba(0, 0, 0, 0.15)',
                    },
                  } : {
                    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    },
                  }),
                }}
              >
                {tier.popularBadge && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 20, 
                      right: 0,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      py: 0.5,
                      px: 2,
                      borderRadius: '4px 0 0 4px',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      letterSpacing: 1
                    }}
                  >
                    Most Popular
                  </Box>
                )}
                
                <Box sx={{ 
                  height: '8px', 
                  bgcolor: tier.highlight ? 'primary.main' : 'grey.300',
                  width: '100%' 
                }} />
                
                <CardContent sx={{ p: 4, flexGrow: 1 }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                      {tier.title}
                    </Typography>
                    <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                      {tier.subtitle}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 1 }}>
                      <Typography variant="h3" component="span" sx={{ fontWeight: 800 }}>
                        {annual ? tier.price.annually : tier.price.monthly}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ fontStyle: 'italic' }}>
                      {annual ? 'billed annually' : 'billed monthly'}
                      {annual && (
                        <Box component="span" sx={{ ml: 1, color: 'secondary.main', fontWeight: 'bold' }}>
                          (Save {tier.discount})
                        </Box>
                      )}
                    </Typography>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                      {tier.description}
                    </Typography>
                  </Box>
                  
                  <List sx={{ mb: 2 }}>
                    {tier.features.map((feature, featureIdx) => (
                      <ListItem key={featureIdx} sx={{ py: 1, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {feature.included ? (
                            <CheckIcon sx={{ color: tier.highlight ? 'primary.main' : 'success.main' }} />
                          ) : (
                            <CloseIcon sx={{ color: 'text.disabled' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature.title} 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            sx: { 
                              fontWeight: feature.included ? 500 : 400,
                              color: feature.included ? 'text.primary' : 'text.disabled'
                            }
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                
                <CardActions sx={{ p: 4, pt: 0, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    fullWidth
                    variant={tier.buttonVariant as 'outlined' | 'contained'}
                    color={tier.highlight ? 'secondary' : 'primary'}
                    size="large"
                    onClick={() => handleGetStarted(tier.title.toLowerCase())}
                    sx={{ 
                      py: 1.5,
                      borderRadius: '50px',
                      fontWeight: 'bold',
                      ...(tier.highlight ? {
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                        },
                      } : {
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                        },
                      })
                    }}
                  >
                    {tier.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ 
        bgcolor: '#f8f9fd', 
        py: { xs: 6, md: 8 }, 
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
              label="PREMIUM FEATURES" 
              sx={{ 
                bgcolor: 'primary.light', 
                color: 'primary.main', 
                fontWeight: 'bold',
                mb: 2
              }} 
            />
            <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800 }}>
              All Plans Include
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
              Every TradeForge plan comes with these powerful features to enhance your trading experience
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                  elevation={0}
                >
                  <Box sx={{ 
                    color: 'primary.main',
                    mb: 2, 
                    p: 1,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQs */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Box textAlign="center" mb={6}>
          <Chip 
            label="FAQs" 
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.main', 
              fontWeight: 'bold',
              mb: 2
            }} 
          />
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800 }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Have questions about our pricing? Find quick answers below
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {faqs.map((faq, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                }}
                elevation={0}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {faq.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ mb: 10 }}>
        <Paper 
          sx={{ 
            p: { xs: 4, md: 5 }, 
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
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: '600px', mx: 'auto', position: 'relative', zIndex: 1 }}>
            Try any plan free for 14 days. No credit card required. Cancel anytime.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            onClick={() => navigate('/register')}
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
            Start Free Trial
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default PricingPage; 