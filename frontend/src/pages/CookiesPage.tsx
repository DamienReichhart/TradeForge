import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  Breadcrumbs,
  Link,
  Divider,
  Button,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormGroup,
  FormControlLabel,
  Card,
  CardContent
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CookieIcon from '@mui/icons-material/Cookie';

const cookieTypes = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot disable these cookies.',
    canDisable: false,
    examples: [
      { name: 'session_id', purpose: 'Maintains your session across page requests', expiry: 'Session' },
      { name: 'csrf_token', purpose: 'Helps protect against Cross-Site Request Forgery attacks', expiry: 'Session' },
      { name: 'auth_token', purpose: 'Keeps you logged in to your account', expiry: '30 days' }
    ]
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
    canDisable: true,
    examples: [
      { name: 'preferences', purpose: 'Remembers your settings and preferences', expiry: '1 year' },
      { name: 'language', purpose: 'Remembers your language preference', expiry: '1 year' },
      { name: 'theme', purpose: 'Stores your theme preference (light/dark)', expiry: '1 year' }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They allow us to improve our website based on user behavior.',
    canDisable: true,
    examples: [
      { name: '_ga', purpose: 'Google Analytics - Distinguishes unique users', expiry: '2 years' },
      { name: '_gid', purpose: 'Google Analytics - Identifies unique page views', expiry: '24 hours' },
      { name: '_gat', purpose: 'Google Analytics - Throttles request rate', expiry: '1 minute' }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'These cookies track your online activity to help advertisers deliver more relevant ads or to limit how many times you see an ad. They may be shared with other organizations or advertisers.',
    canDisable: true,
    examples: [
      { name: '_fbp', purpose: 'Facebook Pixel - Tracks conversions', expiry: '3 months' },
      { name: 'ads_id', purpose: 'Used for targeted advertising', expiry: '3 months' },
      { name: 'marketing_session', purpose: 'Tracks marketing campaign performance', expiry: '30 days' }
    ]
  }
];

const sections = [
  {
    id: 'what-are-cookies',
    title: 'What Are Cookies?',
    content: 'Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site. Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device when you go offline, while session cookies are deleted as soon as you close your web browser.'
  },
  {
    id: 'how-we-use-cookies',
    title: 'How We Use Cookies',
    content: 'TradeForge uses cookies for various purposes, including to enhance your experience on our site, analyze how you use our site, and personalize content. We use both first-party cookies (set by us) and third-party cookies (set by others). Some cookies are necessary for the functioning of our site, while others are optional and help us improve our services.'
  },
  {
    id: 'managing-cookies',
    title: 'Managing Your Cookie Preferences',
    content: 'You can manage your cookie preferences using the cookie consent tool on our website. You can also control cookies through your browser settings. Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies, or to alert you when cookies are being sent. However, if you disable or refuse cookies, please note that some parts of our site may not function properly.'
  },
  {
    id: 'updates-to-policy',
    title: 'Updates to This Cookie Policy',
    content: 'We may update this Cookie Policy from time to time to reflect changes to the cookies we use or for operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies. The date at the top of this Cookie Policy indicates when it was last updated.'
  }
];

const CookiesPage: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box 
          className="animate-on-scroll fade-in" 
          sx={{ 
            mb: { xs: 6, md: 8 } 
          }}
        >
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Home
            </Link>
            <Typography color="text.primary">Cookie Policy</Typography>
          </Breadcrumbs>
          
          <Typography 
            variant="h1" 
            component="h1"
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
              mb: 2
            }}
          >
            Cookie Policy
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Last Updated: May 15, 2023
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            This Cookie Policy explains how TradeForge ("we", "us", or "our") uses cookies and similar technologies on our website. By using our website, you consent to the use of cookies as described in this policy.
          </Typography>
        </Box>
        
        {/* Cookie Icon Card */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 6 
          }}
          className="animate-on-scroll fade-in"
        >
          <Card
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: 600
            }}
          >
            <CookieIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Your Privacy Matters to Us
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
              This policy explains how we use cookies and the choices you have regarding their use.
            </Typography>
          </Card>
        </Box>
        
        {/* Sections */}
        <Box className="animate-on-scroll fade-in">
          {sections.map((section, index) => (
            <Box 
              key={section.id} 
              id={section.id}
              sx={{ 
                mb: 6,
                scrollMarginTop: '80px'  // For anchor links to account for fixed header
              }}
            >
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  mb: 3
                }}
              >
                {section.title}
              </Typography>
              <Typography
                variant="body1"
                paragraph
                color="text.secondary"
              >
                {section.content}
              </Typography>
              {index < sections.length - 1 && (
                <Divider sx={{ mt: 4, opacity: 0.5 }} />
              )}
            </Box>
          ))}
        </Box>
        
        {/* Cookie Preferences Table */}
        <Box 
          sx={{ 
            mb: 8
          }}
          className="animate-on-scroll fade-in"
        >
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              mb: 4
            }}
          >
            Cookie Types We Use
          </Typography>
          
          {cookieTypes.map((cookieType, index) => (
            <Paper
              key={cookieType.id}
              elevation={0}
              sx={{ 
                mb: 4, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <Box>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {cookieType.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cookieType.description}
                  </Typography>
                </Box>
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        defaultChecked 
                        disabled={!cookieType.canDisable}
                      />
                    } 
                    label={cookieType.canDisable ? "Allow" : "Required"} 
                  />
                </FormGroup>
              </Box>
              
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label={`${cookieType.name} details`}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Cookie Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Expiry</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cookieType.examples.map((example) => (
                      <TableRow key={example.name}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontFamily="monospace">
                            {example.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{example.purpose}</TableCell>
                        <TableCell>{example.expiry}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                borderRadius: 2,
                px: 4,
                fontWeight: 600,
                mr: 2
              }}
            >
              Save Preferences
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ 
                borderRadius: 2,
                px: 4,
                fontWeight: 600
              }}
            >
              Accept All
            </Button>
          </Box>
        </Box>
        
        {/* Additional Information */}
        <Paper
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 6, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
            background: 'rgba(58, 111, 247, 0.03)'
          }}
          className="animate-on-scroll fade-in"
        >
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Additional Information
          </Typography>
          <Typography variant="body2" paragraph color="text.secondary">
            If you have any questions about our use of cookies, please contact us at privacy@tradeforge.com. For more information about how we protect your privacy, please review our Privacy Policy.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              component={RouterLink} 
              to="/privacy" 
              variant="text"
              sx={{ 
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              Privacy Policy
            </Button>
            <Button 
              component={RouterLink} 
              to="/terms" 
              variant="text"
              sx={{ 
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              Terms of Service
            </Button>
          </Box>
        </Paper>
        
        {/* CTA Section */}
        <Box 
          sx={{ 
            textAlign: 'center',
          }}
          className="animate-on-scroll fade-in"
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Have Questions About Our Cookie Practices?
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            If you have any questions or concerns about our use of cookies, please don't hesitate to contact us.
          </Typography>
          <Button 
            component={RouterLink} 
            to="/contact" 
            variant="contained" 
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              fontWeight: 600
            }}
          >
            Contact Us
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CookiesPage; 