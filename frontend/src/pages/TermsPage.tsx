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
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: `By accessing or using TradeForge's services, including our website, trading platform, APIs, and other services provided by TradeForge (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
    
    These Terms constitute a legally binding agreement between you and TradeForge regarding your use of the Services. You must be at least 18 years old to use our Services.`
  },
  {
    id: 'account',
    title: 'Account Registration and Security',
    content: `To use certain features of our Services, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
    
    You are responsible for safeguarding your account credentials and for any activity that occurs under your account. You agree to notify us immediately of any unauthorized access to or use of your account. TradeForge cannot and will not be liable for any loss or damage arising from your failure to comply with the above requirements.
    
    We reserve the right to disable any user account if, in our opinion, you have violated any provision of these Terms.`
  },
  {
    id: 'services',
    title: 'Services and Limitations',
    content: `TradeForge provides algorithmic trading tools and backtesting services. Our Services are intended to be used as tools for developing and testing trading strategies, but we do not guarantee any financial outcomes.
    
    The Services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Services will be uninterrupted, error-free, or completely secure.
    
    Financial markets are inherently risky, and past performance is not indicative of future results. You acknowledge that trading involves risk of loss and that you alone are responsible for your trading decisions.`
  },
  {
    id: 'data',
    title: 'User Data and Privacy',
    content: `By using our Services, you agree to our Privacy Policy, which describes how we collect, use, and share your personal information.
    
    You retain all rights to any trading strategies, algorithms, or other content you create using our Services. However, you grant TradeForge a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display such content solely for the purpose of providing the Services to you.
    
    TradeForge respects your privacy and will only use your information as described in our Privacy Policy. We implement appropriate security measures to protect your personal information.`
  },
  {
    id: 'payments',
    title: 'Payments and Subscription',
    content: `Certain features of the Services may require payment of fees. You agree to pay all applicable fees as described on our website.
    
    Subscription fees are charged in advance on a monthly or annual basis, depending on your selected plan. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period.
    
    All purchases are final. Refunds may be provided at TradeForge's sole discretion. If you believe you are entitled to a refund, please contact our support team.`
  },
  {
    id: 'restrictions',
    title: 'Prohibited Uses',
    content: `You agree not to use the Services to:
    
    - Violate any applicable laws or regulations
    - Infringe the intellectual property rights of others
    - Engage in market manipulation or other illegal trading activities
    - Attempt to gain unauthorized access to our systems or other users' accounts
    - Transmit malware, viruses, or other harmful code
    - Place excessive load on our infrastructure or interfere with the proper working of the Services
    - Engage in any activity that could damage, disable, or impair the Services
    
    We reserve the right to terminate your access to the Services for any violation of these prohibited uses.`
  },
  {
    id: 'termination',
    title: 'Termination of Service',
    content: `TradeForge may, in its sole discretion, terminate or suspend your access to the Services at any time for any reason, including but not limited to a violation of these Terms.
    
    You may cancel your account at any time by contacting our support team. Upon cancellation, you will not be entitled to a refund of any fees already paid, and you will be responsible for any fees incurred before the cancellation date.
    
    Upon termination, your right to use the Services will immediately cease, but all provisions of these Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, and limitations of liability.`
  },
  {
    id: 'changes',
    title: 'Changes to Terms',
    content: `TradeForge reserves the right to modify these Terms at any time. We will provide notice of material changes by posting the amended Terms on our website and updating the "Last Updated" date above. Your continued use of the Services after such modifications constitutes your acceptance of the revised Terms.
    
    It is your responsibility to review these Terms periodically for changes. If you do not agree to the modified terms, you should discontinue your use of the Services.`
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRADEFORGE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; OR (C) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
    
    OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATED TO THE SERVICES SHALL NOT EXCEED THE GREATER OF $100 OR THE AMOUNT YOU PAID TRADEFORGE IN THE LAST 12 MONTHS.
    
    SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OR ALL OF THE EXCLUSIONS AND LIMITATIONS ABOVE MAY NOT APPLY TO YOU.`
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: `If you have any questions or concerns about these Terms, please contact us at:
    
    TradeForge, Inc.
    88 Wall Street
    New York, NY 10005
    
    Email: legal@tradeforge.com
    Phone: +1 (555) 123-4567`
  }
];

const TermsPage: React.FC = () => {
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
            <Typography color="text.primary">Terms of Service</Typography>
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
            Terms of Service
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Last Updated: May 15, 2023
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Please read these Terms of Service ("Terms") carefully as they contain important information about your legal rights, remedies, and obligations. By accessing or using TradeForge's services, you agree to comply with and be bound by these Terms.
          </Typography>
        </Box>
        
        {/* Table of Contents */}
        <Paper
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 6, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
            background: 'rgba(58, 111, 247, 0.03)'
          }}
          className="animate-on-scroll fade-in"
        >
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Table of Contents
          </Typography>
          <Box component="ul" sx={{ pl: 2, columns: { xs: '1', sm: '2' } }}>
            {sections.map((section) => (
              <Box component="li" key={section.id} sx={{ mb: 1 }}>
                <Link 
                  href={`#${section.id}`}
                  underline="hover"
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  {section.title}
                </Link>
              </Box>
            ))}
          </Box>
        </Paper>
        
        {/* Terms Content */}
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
                {index + 1}. {section.title}
              </Typography>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  mb: 4,
                  '& p': { mb: 2 },
                  whiteSpace: 'pre-line'  // Preserves line breaks in the content
                }}
              >
                {section.content}
              </Typography>
              {index < sections.length - 1 && (
                <Divider sx={{ opacity: 0.5 }} />
              )}
            </Box>
          ))}
        </Box>
        
        {/* CTA Section */}
        <Box 
          sx={{ 
            mt: 8,
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
          }}
          className="animate-on-scroll fade-in"
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Have Questions About Our Terms?
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            If you have any questions or concerns about our Terms of Service, please don't hesitate to contact our support team.
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

export default TermsPage; 