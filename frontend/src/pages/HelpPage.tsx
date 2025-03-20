import React, { useState } from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'How do I create my first trading bot?',
    answer: 'To create your first bot, navigate to the Dashboard and click on "New Bot". Follow the step-by-step wizard to set up your trading pair, timeframe, and conditions.',
  },
  {
    question: 'What exchanges are supported?',
    answer: 'Currently, TradeForge supports Binance, Coinbase Pro, Kraken, and Kucoin. We\'re regularly adding support for more exchanges.',
  },
  {
    question: 'How are the subscription tiers different?',
    answer: 'Each tier offers different features and limits. Starter allows up to 3 bots with basic indicators, Pro increases this to 10 bots with advanced indicators and Telegram notifications, while Expert offers unlimited bots and custom indicators.',
  },
  {
    question: 'Is backtesting data accurate?',
    answer: 'Our backtesting engine uses historical data directly from exchanges. While past performance isn\'t indicative of future results, our backtesting is designed to be as accurate as possible with real market conditions.',
  },
  {
    question: 'How do I connect to Telegram?',
    answer: 'In your account settings, navigate to "Notifications" and click "Connect Telegram". Follow the instructions to link your Telegram account for real-time trade notifications.',
  },
  {
    question: 'Can I export my trading data?',
    answer: 'Yes, you can export your trading history, performance metrics, and backtest results as CSV or JSON from the dashboard.',
  },
];

const tutorials = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of TradeForge and set up your first bot',
    image: 'https://via.placeholder.com/300x160',
    slug: 'getting-started'
  },
  {
    title: 'Creating Advanced Strategies',
    description: 'Master the art of creating complex trading strategies',
    image: 'https://via.placeholder.com/300x160',
    slug: 'advanced-strategies'
  },
  {
    title: 'Backtesting Effectively',
    description: 'Learn how to properly test your strategies against historical data',
    image: 'https://via.placeholder.com/300x160',
    slug: 'backtesting'
  },
];

const HelpPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Help Center
      </Typography>
      
      <Typography variant="h5" component="h2" sx={{ mt: 6, mb: 3 }}>
        Frequently Asked Questions
      </Typography>
      
      <Box sx={{ mb: 6 }}>
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}bh-content`}
              id={`panel${index}bh-header`}
            >
              <Typography variant="subtitle1" fontWeight="500">
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      <Typography variant="h5" component="h2" sx={{ mt: 8, mb: 3 }}>
        Video Tutorials
      </Typography>
      
      <Grid container spacing={4}>
        {tutorials.map((tutorial, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="160"
                image={tutorial.image}
                alt={tutorial.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="h3">
                  {tutorial.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {tutorial.description}
                </Typography>
                <Button
                  component={Link}
                  to={`/help/${tutorial.slug}`}
                  variant="outlined"
                  size="small"
                >
                  Watch Tutorial
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Still need help?
        </Typography>
        <Button variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
          Contact Support
        </Button>
      </Box>
    </Container>
  );
};

export default HelpPage; 