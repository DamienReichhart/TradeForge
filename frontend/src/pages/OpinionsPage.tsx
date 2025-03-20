import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Avatar, Box, Rating } from '@mui/material';

const testimonials = [
  {
    id: 1,
    name: 'Alex Thompson',
    role: 'Day Trader',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    testimonial: 'TradeForge has completely transformed how I approach the markets. The ability to create and backtest strategies quickly has given me a huge edge. In just three months, my win rate increased from 52% to 68%.',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Crypto Investor',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    testimonial: 'I was skeptical about algorithmic trading, but TradeForge made it so easy to get started. The backtesting tools are impressive and the Telegram notifications keep me informed without having to watch charts all day.',
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    role: 'Forex Trader',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    rating: 4,
    testimonial: 'The Pro plan has been worth every penny. Being able to run 10 different bots across various currency pairs has diversified my trading approach. Customer support is also very responsive.',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    role: 'Swing Trader',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    rating: 5,
    testimonial: 'As someone who works full-time, I needed automation to succeed in trading. TradeForge bots run 24/7, and the dashboard analytics give me clear insights into which strategies are working best.',
  },
  {
    id: 5,
    name: 'David Kim',
    role: 'Quant Analyst',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    rating: 4,
    testimonial: "The mathematical expression builder is incredibly powerful. I've implemented complex strategies that would require custom coding on other platforms. The Expert plan's custom indicators feature is game-changing.",
  },
  {
    id: 6,
    name: 'Sophia Martinez',
    role: 'Stocks & Options Trader',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    rating: 5,
    testimonial: 'TradeForge paid for itself in the first month. The ability to create sophisticated entry and exit conditions without coding has been invaluable. My only regret is not finding this platform sooner!',
  }
];

const OpinionsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          What Our Customers Say
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
          Discover how TradeForge is helping traders of all experience levels automate their trading and improve their results.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {testimonials.map((testimonial) => (
          <Grid item key={testimonial.id} xs={12} md={6}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ flexGrow: 1, p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6" component="h3">
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                    <Rating 
                      value={testimonial.rating} 
                      readOnly 
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <Typography variant="body1" paragraph sx={{ fontStyle: 'italic' }}>
                  "{testimonial.testimonial}"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ textAlign: 'center', mt: 10, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Join thousands of satisfied traders
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}>
          Start automating your trading strategies today and experience the TradeForge difference.
        </Typography>
      </Box>
    </Container>
  );
};

export default OpinionsPage; 