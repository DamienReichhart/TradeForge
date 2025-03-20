import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Grid, Link as MuiLink, Divider, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Username must be at most 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      await register(formData.email, formData.username, formData.password, formData.first_name, formData.last_name);
      navigate('/dashboard');
    } catch (error: any) {
      setServerError(error.message || 'Registration failed. Please try again later.');
      console.error('Registration error:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create an Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start automating your trading strategies today
          </Typography>
        </Box>
        
        {serverError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {serverError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="first_name"
                label="First Name"
                name="first_name"
                autoComplete="given-name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="last_name"
                label="Last Name"
                name="last_name"
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Register'}
          </Button>
          
          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2">
                Already have an account?{' '}
                <MuiLink component={Link} to="/login" variant="body2">
                  Sign in
                </MuiLink>
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            By registering, you agree to our{' '}
            <MuiLink component={Link} to="/terms" variant="body2">
              Terms of Service
            </MuiLink>
            {' '}and{' '}
            <MuiLink component={Link} to="/privacy" variant="body2">
              Privacy Policy
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 