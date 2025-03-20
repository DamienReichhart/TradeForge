import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const pricingTiers = [
  {
    title: 'Starter',
    price: '$15',
    description: 'For beginners starting their trading journey',
    features: [
      'Up to 3 active bots',
      'Basic indicators',
      'Daily trading summary',
      'Email notifications',
      'Community forum access'
    ],
    buttonText: 'Start Now',
    buttonVariant: 'outlined',
  },
  {
    title: 'Pro',
    price: '$30',
    description: 'For serious traders looking to scale',
    features: [
      'Up to 10 active bots',
      'Advanced indicators',
      'Real-time performance dashboard',
      'Telegram notifications',
      'Priority support',
      'Strategy templates'
    ],
    buttonText: 'Get Pro',
    buttonVariant: 'contained',
    highlighted: true,
  },
  {
    title: 'Expert',
    price: '$100',
    description: 'For professional traders and institutions',
    features: [
      'Unlimited bots',
      'Custom indicators',
      'Advanced backtesting',
      'API access',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations'
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outlined',
  },
];

const PricingPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Pricing Plans
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Choose the plan that fits your trading needs
      </Typography>
      
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
        {pricingTiers.map((tier) => (
          <Grid
            item
            key={tier.title}
            xs={12}
            sm={tier.title === 'Pro' ? 12 : 6}
            md={4}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                ...(tier.highlighted && {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                  borderStyle: 'solid',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                }),
              }}
            >
              <CardContent sx={{ pt: 4, px: 4, flexGrow: 1 }}>
                <Typography variant="h4" component="h2" align="center" gutterBottom>
                  {tier.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 2 }}>
                  <Typography variant="h3" component="span">
                    {tier.price}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" component="span">
                    /mo
                  </Typography>
                </Box>
                <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                  {tier.description}
                </Typography>
                <List>
                  {tier.features.map((feature) => (
                    <ListItem key={feature} sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant={tier.buttonVariant as 'outlined' | 'contained'}
                  color="primary"
                  size="large"
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PricingPage; 