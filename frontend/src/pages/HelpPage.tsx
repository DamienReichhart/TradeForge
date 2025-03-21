import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Paper,
  TextField,
  InputAdornment,
  Chip,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'How do I create my first trading bot?',
    answer: 'To create your first bot, navigate to the Dashboard and click on "New Bot". Follow the step-by-step wizard to set up your trading pair, timeframe, and conditions. Our intuitive interface will guide you through each step of the process. You can preview your strategy before deploying it to ensure it meets your requirements.',
  },
  {
    question: 'What exchanges are supported?',
    answer: 'Currently, TradeForge supports Binance, Coinbase Pro, Kraken, and Kucoin. We\'re regularly adding support for more exchanges based on user demand. Each exchange has specific API requirements that are explained in our documentation when connecting your account.',
  },
  {
    question: 'How are the subscription tiers different?',
    answer: 'Each tier offers different features and limits. Starter allows up to 3 active bots with basic indicators, Pro increases this to 10 bots with advanced indicators and Telegram notifications, while Expert offers unlimited bots and custom indicators. You can upgrade or downgrade your plan at any time from your account settings.',
  },
  {
    question: 'Is backtesting data accurate?',
    answer: 'Our backtesting engine uses historical data directly from exchanges. While past performance isn\'t indicative of future results, our backtesting is designed to be as accurate as possible with real market conditions. We include factors like slippage, fees, and latency to provide realistic performance metrics.',
  },
  {
    question: 'How do I connect to Telegram?',
    answer: 'In your account settings, navigate to "Notifications" and click "Connect Telegram". Follow the instructions to link your Telegram account for real-time trade notifications. You\'ll receive a custom bot token that ensures your trading alerts are delivered securely and instantly.',
  },
  {
    question: 'Can I export my trading data?',
    answer: 'Yes, you can export your trading history, performance metrics, and backtest results as CSV or JSON from the dashboard. This data can be imported into spreadsheet applications or third-party analytics tools for further analysis.',
  },
  {
    question: 'How do I set up risk management rules?',
    answer: 'In the bot configuration page, navigate to the "Risk Management" section. Here you can set stop-loss levels, take-profit targets, maximum position sizes, and daily loss limits. These settings help protect your capital and enforce disciplined trading.',
  },
  {
    question: 'Can I run multiple strategies simultaneously?',
    answer: 'Yes, depending on your subscription plan. Pro users can run up to 10 concurrent strategies, while Expert users have no limits. Each strategy can be configured independently with different parameters, timeframes, and trading pairs.',
  },
];

const tutorials = [
  {
    title: 'Getting Started with TradeForge',
    description: 'Learn the basics of TradeForge and set up your first bot in under 15 minutes',
    image: 'https://via.placeholder.com/600x320',
    duration: '15 min',
    slug: 'getting-started'
  },
  {
    title: 'Creating Advanced Strategies',
    description: 'Master the art of creating complex trading strategies using multiple indicators',
    image: 'https://via.placeholder.com/600x320',
    duration: '22 min',
    slug: 'advanced-strategies'
  },
  {
    title: 'Backtesting Effectively',
    description: 'Learn how to properly test your strategies against historical data for optimal results',
    image: 'https://via.placeholder.com/600x320',
    duration: '18 min',
    slug: 'backtesting'
  },
  {
    title: 'Technical Analysis Basics',
    description: 'Understand key technical indicators and how to use them in your trading strategies',
    image: 'https://via.placeholder.com/600x320',
    duration: '25 min',
    slug: 'technical-analysis'
  },
];

const resourceCategories = [
  {
    title: 'Documentation',
    description: 'Detailed guides and API references',
    icon: <ArticleOutlinedIcon sx={{ fontSize: 40 }} />,
    color: '#4CAF50'
  },
  {
    title: 'Video Tutorials',
    description: 'Visual learning resources',
    icon: <PlayCircleOutlineIcon sx={{ fontSize: 40 }} />,
    color: '#FFC107'
  },
  {
    title: 'Community Forum',
    description: 'Connect with other traders',
    icon: <ChatOutlinedIcon sx={{ fontSize: 40 }} />,
    color: '#2196F3'
  },
  {
    title: 'Support Center',
    description: 'Get help from our team',
    icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 40 }} />,
    color: '#9C27B0'
  },
];

const HelpPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box>
      {/* Hero section */}
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
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h2" component="h1" gutterBottom sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.2rem', md: '3rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  lineHeight: 1.2
                }}>
                  Help Center
                </Typography>
                <Typography variant="h5" paragraph sx={{ 
                  opacity: 0.9,
                  fontWeight: 400,
                  maxWidth: '600px',
                  mb: 4
                }}>
                  Find answers, tutorials, and resources to help you succeed with TradeForge
                </Typography>
                <Paper
                  sx={{
                    p: 0.5,
                    display: 'flex',
                    maxWidth: 500,
                    borderRadius: '50px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Search for help articles, tutorials, and FAQs..."
                    variant="standard"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ mx: 1.5, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      sx: { px: 1 }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    color="secondary"
                    sx={{ 
                      borderRadius: '50px',
                      px: 3,
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 'none',
                      }
                    }}
                  >
                    Search
                  </Button>
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '300px',
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HelpOutlineIcon sx={{ fontSize: 260, opacity: 0.2, position: 'absolute' }} />
                <SupportAgentIcon sx={{ fontSize: 120, position: 'relative', zIndex: 1 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Resource Categories */}
      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {resourceCategories.map((category, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: '12px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                },
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer'
              }}>
                <Box sx={{ height: '8px', bgcolor: category.color }} />
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    justifyContent: 'center',
                    '& svg': {
                      color: category.color
                    }
                  }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                    {category.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* FAQ section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 8 }}>
          <Box textAlign="center" mb={5}>
            <Chip 
              label="FAQ" 
              sx={{ 
                bgcolor: 'primary.light', 
                color: 'primary.main', 
                fontWeight: 'bold',
                mb: 2
              }} 
            />
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
              Find quick answers to the most common questions about TradeForge
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={10} sx={{ mx: 'auto' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, md: 4 }, 
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  bgcolor: '#fff'
                }}
              >
                {faqs.map((faq, index) => (
                  <Accordion
                    key={index}
                    expanded={expanded === `panel${index}`}
                    onChange={handleChange(`panel${index}`)}
                    disableGutters
                    elevation={0}
                    sx={{ 
                      mb: 1.5, 
                      border: '1px solid',
                      borderColor: expanded === `panel${index}` ? 'primary.main' : 'rgba(0, 0, 0, 0.08)',
                      borderRadius: '8px !important',
                      overflow: 'hidden',
                      '&:before': {
                        display: 'none',
                      },
                      transition: 'border-color 0.3s ease'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: expanded === `panel${index}` ? 'primary.main' : 'text.secondary' }} />}
                      aria-controls={`panel${index}bh-content`}
                      id={`panel${index}bh-header`}
                      sx={{ 
                        bgcolor: expanded === `panel${index}` ? 'rgba(63, 81, 181, 0.05)' : 'transparent',
                        transition: 'background-color 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(63, 81, 181, 0.05)',
                        }
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="600" color={expanded === `panel${index}` ? 'primary.main' : 'text.primary'}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 3, pt: 1 }}>
                      <Typography variant="body1" color="text.secondary">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
      
      {/* Video Tutorials */}
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
          <Box textAlign="center" mb={5}>
            <Chip 
              label="TUTORIALS" 
              sx={{ 
                bgcolor: 'primary.light', 
                color: 'primary.main', 
                fontWeight: 'bold',
                mb: 2
              }} 
            />
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
              Video Tutorials
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
              Learn how to get the most out of TradeForge with our step-by-step video guides
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {tutorials.map((tutorial, index) => (
              <Grid item key={index} xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                    '& .MuiCardMedia-root': {
                      transform: 'scale(1.05)'
                    }
                  },
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height={180}
                      image={tutorial.image}
                      alt={tutorial.title}
                      sx={{ 
                        transition: 'transform 0.5s ease',
                      }}
                    />
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      bottom: 0, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      '&:hover': {
                        opacity: 1
                      }
                    }}>
                      <PlayCircleOutlineIcon sx={{ fontSize: 60, color: 'white' }} />
                    </Box>
                    <Chip 
                      label={tutorial.duration} 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 12, 
                        right: 12, 
                        bgcolor: 'rgba(0,0,0,0.7)', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      {tutorial.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tutorial.description}
                    </Typography>
                    <Button
                      component={Link}
                      to={`/tutorial/${tutorial.slug}`}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        borderRadius: '50px',
                        px: 2
                      }}
                      startIcon={<PlayCircleOutlineIcon />}
                    >
                      Watch Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Contact section */}
      <Container maxWidth="md" sx={{ mb: 10 }}>
        <Paper 
          sx={{ 
            p: { xs: 4, md: 5 }, 
            textAlign: 'center', 
            borderRadius: '16px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'linear-gradient(135deg, #f5f7ff 0%, #eef1f9 100%)',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main', 
                mx: 'auto', 
                mb: 3,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
              Still Need Help?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}>
              Our support team is available 24/7 to assist you with any questions or issues you might have with TradeForge.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ 
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                Contact Support
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
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
                Browse Documentation
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HelpPage; 