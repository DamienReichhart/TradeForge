import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  MenuItem,
  useTheme,
  Paper,
  IconButton,
  Link,
  Snackbar,
  Alert,
  alpha
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';

const contactInfo = [
  {
    icon: <EmailIcon fontSize="large" />,
    title: 'Email',
    value: 'support@tradeforge.com',
    link: 'mailto:support@tradeforge.com'
  },
  {
    icon: <PhoneIcon fontSize="large" />,
    title: 'Phone',
    value: '+1 (555) 123-4567',
    link: 'tel:+15551234567'
  },
  {
    icon: <LocationOnIcon fontSize="large" />,
    title: 'Office',
    value: '88 Wall Street, New York, NY 10005',
    link: 'https://maps.google.com'
  }
];

const inquiryTypes = [
  'General Question',
  'Technical Support',
  'Billing Inquiry',
  'Partnership Opportunity',
  'Feature Request'
];

const ContactPage: React.FC = () => {
  const theme = useTheme();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    inquiryType: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send the form data to a backend API
    console.log('Form submitted:', formState);
    setSubmitted(true);
    setSnackbarOpen(true);
    // Reset form
    setFormState({
      name: '',
      email: '',
      inquiryType: '',
      message: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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
            Get in Touch
            <Box component="span" sx={{ display: 'block' }} className="gradient-text">
              We'd Love to Hear from You
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
            Have a question, suggestion, or just want to learn more about TradeForge?
            Our team is here to help!
          </Typography>
        </Box>
        
        {/* Contact Info Cards */}
        <Grid container spacing={4} sx={{ mb: { xs: 8, md: 10 } }}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                elevation={0}
                className="animate-on-scroll slide-up"
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      bgcolor: 'rgba(58, 111, 247, 0.1)',
                      color: 'primary.main',
                      mb: 2
                    }}
                  >
                    {info.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {info.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    component={Link}
                    href={info.link}
                    target="_blank"
                    rel="noopener"
                    color="text.secondary"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {info.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Contact Form Section */}
        <Grid 
          container 
          spacing={8} 
          className="animate-on-scroll fade-in"
          sx={{ mb: { xs: 8, md: 10 } }}
        >
          {/* Map */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                minHeight: 400,
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <Box 
                component="iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.344133481088!2d-74.01131042441387!3d40.70584587177193!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a165bedaf05%3A0x2cb2ddf003b5ae01!2sWall+St%2C+New+York%2C+NY!5e0!3m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="TradeForge Office Location"
              />
            </Paper>
          </Grid>
          
          {/* Form */}
          <Grid item xs={12} md={7}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Send Us a Message
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Fill out the form below and we'll get back to you as soon as possible.
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Inquiry Type"
                    name="inquiryType"
                    value={formState.inquiryType}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  >
                    {inquiryTypes.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={6}
                    label="Your Message"
                    name="message"
                    value={formState.message}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                    sx={{ 
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600
                    }}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
        
        {/* Social Media Section */}
        <Box 
          sx={{ 
            textAlign: 'center',
            mb: { xs: 8, md: 10 }
          }}
          className="animate-on-scroll fade-in"
        >
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Connect With Us
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              maxWidth: 600, 
              mx: 'auto',
              mb: 4 
            }}
          >
            Stay updated with our latest news, updates, and trading insights
            by following us on social media.
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 3 
            }}
          >
            {[
              { icon: <TwitterIcon fontSize="large" />, color: '#1DA1F2', url: 'https://twitter.com' },
              { icon: <LinkedInIcon fontSize="large" />, color: '#0077B5', url: 'https://linkedin.com' },
              { icon: <GitHubIcon fontSize="large" />, color: '#333', url: 'https://github.com' }
            ].map((social, index) => (
              <IconButton
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener"
                sx={{ 
                  width: 70,
                  height: 70,
                  color: social.color,
                  bgcolor: alpha(social.color, 0.1),
                  '&:hover': {
                    bgcolor: alpha(social.color, 0.2),
                  }
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>
        </Box>
        
        {/* FAQ Teaser */}
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
              Have More Questions?
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
              Check out our comprehensive FAQ section for quick answers to common questions.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              href="/help/faq"
              sx={{ 
                borderRadius: 2,
                px: 4,
                fontWeight: 600
              }}
            >
              View FAQs
            </Button>
          </Box>
        </Box>
      </Container>
      
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Your message has been sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage; 