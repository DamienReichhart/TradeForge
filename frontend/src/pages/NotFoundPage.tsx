import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '600px', mx: 'auto' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          component={Link} 
          to="/"
          variant="contained" 
          color="primary"
          size="large"
        >
          Back to Home
        </Button>
        <Button 
          component={Link} 
          to="/help"
          variant="outlined" 
          color="primary"
          size="large"
        >
          Help Center
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 