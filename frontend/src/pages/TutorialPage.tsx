import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Paper, Breadcrumbs, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock tutorial data - in a real app, this would come from an API
const tutorialsData = {
  'getting-started': {
    title: 'Getting Started with TradeForge',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Example video URL
    description: 'Learn how to set up your TradeForge account and create your first trading bot.',
    content: `
      <h2>Welcome to TradeForge</h2>
      <p>This tutorial will guide you through the basics of setting up your account and creating your first trading bot.</p>
      
      <h3>1. Setting Up Your Account</h3>
      <p>After registering and logging in, you'll need to connect to your preferred exchange. Navigate to Account Settings and select "Connect Exchange". Follow the API key generation instructions for your chosen exchange.</p>
      
      <h3>2. Creating Your First Bot</h3>
      <p>From your dashboard, click "Create New Bot". You'll be guided through the setup process:</p>
      <ul>
        <li>Select your exchange and trading pair (e.g., BTC/USDT)</li>
        <li>Choose your timeframe (e.g., 15m, 1h, 4h)</li>
        <li>Set your risk parameters and position sizing</li>
      </ul>
      
      <h3>3. Defining Trading Conditions</h3>
      <p>Use our condition builder to create entry and exit rules. For example, you might want to buy when the 50 EMA crosses above the 200 EMA, and sell when price drops below a certain level.</p>
      
      <h3>4. Testing Your Strategy</h3>
      <p>Before deploying your bot, use our backtesting feature to see how it would have performed historically. This will help you refine your strategy before risking real capital.</p>
    `,
    relatedTutorials: ['advanced-strategies', 'backtesting']
  },
  'advanced-strategies': {
    title: 'Creating Advanced Trading Strategies',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    description: 'Take your trading to the next level with advanced strategy techniques.',
    content: `
      <h2>Advanced Trading Strategies</h2>
      <p>This tutorial covers more sophisticated trading techniques for experienced users.</p>
      
      <h3>1. Multi-indicator Strategies</h3>
      <p>Learn how to combine multiple indicators to create more robust trading signals. We'll cover:</p>
      <ul>
        <li>Trend confirmation with multiple timeframes</li>
        <li>Volume-based confirmation signals</li>
        <li>Oscillator divergence detection</li>
      </ul>
      
      <h3>2. Custom Indicators</h3>
      <p>Discover how to create and use custom indicators specific to your trading style.</p>
      
      <h3>3. Risk Management Techniques</h3>
      <p>Advanced position sizing, dynamic stop-loss placement, and equity curve-based filtering.</p>
    `,
    relatedTutorials: ['getting-started', 'backtesting']
  },
  'backtesting': {
    title: 'Effective Backtesting Techniques',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Learn how to properly test your strategies against historical data.',
    content: `
      <h2>Backtesting Your Trading Strategies</h2>
      <p>This tutorial will show you how to effectively backtest your trading strategies to evaluate their potential performance.</p>
      
      <h3>1. Understanding Backtest Metrics</h3>
      <p>We'll cover the key performance indicators you should analyze:</p>
      <ul>
        <li>Total return and average return per trade</li>
        <li>Win rate and risk-reward ratio</li>
        <li>Maximum drawdown and recovery factor</li>
        <li>Sharpe ratio and Sortino ratio</li>
      </ul>
      
      <h3>2. Avoiding Backtest Pitfalls</h3>
      <p>Learn about common mistakes like overfitting, look-ahead bias, and survivorship bias.</p>
      
      <h3>3. Monte Carlo Analysis</h3>
      <p>Discover how to use statistical methods to estimate the range of possible outcomes for your strategy.</p>
    `,
    relatedTutorials: ['getting-started', 'advanced-strategies']
  }
};

const TutorialPage: React.FC = () => {
  const { tutorialSlug } = useParams<{ tutorialSlug: string }>();
  const [tutorial, setTutorial] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      if (tutorialSlug && tutorialsData[tutorialSlug as keyof typeof tutorialsData]) {
        setTutorial(tutorialsData[tutorialSlug as keyof typeof tutorialsData]);
        setLoading(false);
      } else {
        setError('Tutorial not found');
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [tutorialSlug]);
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading tutorial...</Typography>
      </Container>
    );
  }
  
  if (error || !tutorial) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error || 'Tutorial not found'}</Typography>
        <Button 
          component={Link} 
          to="/help" 
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Help Center
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link to="/">Home</Link>
        <Link to="/help">Help Center</Link>
        <Typography color="text.primary">{tutorial.title}</Typography>
      </Breadcrumbs>
      
      <Button 
        component={Link} 
        to="/help" 
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 4 }}
      >
        Back to Help Center
      </Button>
      
      <Typography variant="h3" component="h1" gutterBottom>
        {tutorial.title}
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        {tutorial.description}
      </Typography>
      
      <Box sx={{ my: 4, position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
        <iframe 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          src={tutorial.videoUrl}
          title={tutorial.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
      
      <Paper sx={{ p: 4, mt: 4 }}>
        <div dangerouslySetInnerHTML={{ __html: tutorial.content }} />
      </Paper>
      
      {tutorial.relatedTutorials && tutorial.relatedTutorials.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            Related Tutorials
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {tutorial.relatedTutorials.map((slug: string) => {
              const relatedTutorial = tutorialsData[slug as keyof typeof tutorialsData];
              return (
                <Button 
                  key={slug}
                  component={Link}
                  to={`/help/${slug}`}
                  variant="outlined"
                  sx={{ mb: 2 }}
                >
                  {relatedTutorial.title}
                </Button>
              );
            })}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default TutorialPage; 