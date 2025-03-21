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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import StorageIcon from '@mui/icons-material/Storage';

const sections = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    content: `TradeForge collects several types of information from and about users of our Services:

Personal Information: This includes information that can identify you as an individual, such as your name, email address, telephone number, and postal address.

Financial Information: When you subscribe to our paid services, we collect payment information, which may include credit card details, bank account information, and billing address.

User-Generated Content: We collect the trading strategies, algorithms, and other content you create using our Services.

Usage Information: We automatically collect information about your interactions with our Services, including IP address, browser type, pages viewed, time spent on pages, links clicked, and the page you visited before navigating to our website.

Device Information: We collect information about the device you use to access our Services, including hardware model, operating system, unique device identifiers, and mobile network information.

Cookies and Similar Technologies: We use cookies and similar technologies to collect information about your browsing behavior and preferences.`
  },
  {
    id: 'how-we-use-information',
    title: 'How We Use Your Information',
    content: `We use the information we collect to:

Provide, maintain, and improve our Services.

Process and complete transactions, and send you related information, including purchase confirmations and invoices.

Send you technical notices, updates, security alerts, and support and administrative messages.

Respond to your comments, questions, and requests, and provide customer service.

Communicate with you about products, services, offers, promotions, and events, and provide other news or information about TradeForge and our partners.

Monitor and analyze trends, usage, and activities in connection with our Services.

Detect, prevent, and address technical issues.

Protect the safety, rights, property, or security of TradeForge, our users, or the general public.`
  },
  {
    id: 'information-sharing',
    title: 'Information Sharing',
    content: `We may share your information with:

Service Providers: Companies that perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.

Business Partners: Third parties with whom we partner to offer products or services to you.

Legal Purposes: When we believe in good faith that disclosure is necessary to comply with applicable law, regulation, or legal process, protect the safety, rights, or property of TradeForge, users, or the public, or detect, prevent, or otherwise address fraud, security, or technical issues.

Business Transfers: In connection with a sale, merger, acquisition, or other transfer of all or part of our business.

With Consent: With your consent or at your direction.

We do not sell your personal information to third parties.`
  },
  {
    id: 'data-security',
    title: 'Data Security',
    content: `We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security of our systems.

We implement a variety of security measures when a user enters, submits, or accesses their information to maintain the safety of your personal information, including:

- Encryption of sensitive information using secure SSL protocols
- Regular security assessments and penetration testing
- Access controls and authentication requirements for our staff
- Monitoring for suspicious activities and unauthorized access attempts`
  },
  {
    id: 'your-choices',
    title: 'Your Rights and Choices',
    content: `Account Information: You may update, correct, or delete your account information at any time by logging into your account. If you wish to delete your account, please contact us, but note that we may retain certain information as required by law or for legitimate business purposes.

Cookies: Most web browsers are set to accept cookies by default. If you prefer, you can usually set your browser to remove or reject cookies. Please note that removing or rejecting cookies could affect the availability and functionality of our Services.

Promotional Communications: You may opt out of receiving promotional emails from us by following the instructions in those emails. If you opt out, we may still send you non-promotional communications, such as those about your account or our ongoing business relations.

Depending on your location, you may have certain rights regarding your personal information, such as:

- The right to access personal information we hold about you
- The right to request that we delete your personal information
- The right to object to processing of your personal information
- The right to data portability`
  },
  {
    id: 'international-transfers',
    title: 'International Data Transfers',
    content: `TradeForge is based in the United States and the information we collect is governed by U.S. law. If you are accessing our Services from outside the United States, please be aware that information collected through the Services may be transferred to, processed, stored, and used in the United States and other jurisdictions. Your use of our Services or provision of any information constitutes your consent to the transfer, processing, usage, sharing, and storage of your information in the United States and other jurisdictions, where privacy laws may be different or less protective than those in your jurisdiction.`
  },
  {
    id: 'children',
    title: 'Children\'s Privacy',
    content: `Our Services are not directed to children under the age of 18. We do not knowingly collect personal information from children under 18. If we learn that we have collected personal information of a child under 18, we will take steps to delete such information from our files as soon as possible. If you believe we might have any information from or about a child under 18, please contact us.`
  },
  {
    id: 'changes',
    title: 'Changes to Our Privacy Policy',
    content: `We may modify or update this Privacy Policy from time to time to reflect changes in our business practices or legal requirements. When we make changes to this Privacy Policy, we will update the "Last Updated" date at the top of this Privacy Policy and, in some cases, we may provide you with additional notice (such as sending you an email notification). We encourage you to periodically review this page for the latest information on our privacy practices.`
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us at:

TradeForge, Inc.
88 Wall Street
New York, NY 10005

Email: privacy@tradeforge.com
Phone: +1 (555) 123-4567`
  }
];

const faqs = [
  {
    question: "How does TradeForge protect my data?",
    answer: "We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your data. All sensitive information is encrypted using secure SSL protocols, and we continuously monitor for unauthorized access attempts."
  },
  {
    question: "Does TradeForge sell my trading strategies or personal data?",
    answer: "No, we do not sell your personal information or trading strategies to third parties. Your trading strategies and algorithms remain your intellectual property. We only use your data as described in our Privacy Policy to provide and improve our services."
  },
  {
    question: "Can I request deletion of my data?",
    answer: "Yes, you can request deletion of your personal data by contacting our support team. We will delete your personal information unless we are required to retain it for legal reasons. Note that some anonymized data may be retained for analytical purposes."
  },
  {
    question: "How long does TradeForge keep my data?",
    answer: "We retain your personal information for as long as your account is active or as needed to provide you services. We may also retain certain information to comply with legal obligations, resolve disputes, and enforce our agreements."
  }
];

const PrivacyPage: React.FC = () => {
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
            <Typography color="text.primary">Privacy Policy</Typography>
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
            Privacy Policy
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Last Updated: May 15, 2023
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            At TradeForge, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services. Please read this policy carefully to understand our practices regarding your personal information.
          </Typography>
        </Box>
        
        {/* Data Protection Highlights */}
        <Grid 
          container 
          spacing={4} 
          sx={{ mb: 6 }}
          className="animate-on-scroll fade-in"
        >
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                height: '100%',
                textAlign: 'center'
              }}
            >
              <SecurityIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Secure & Protected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your data is protected with industry-standard encryption and security practices. We implement strict access controls and regular security audits.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                height: '100%',
                textAlign: 'center'
              }}
            >
              <PrivacyTipIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Your Data Control
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You maintain control over your personal information. We provide tools to access, update, or delete your data according to applicable privacy laws.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                height: '100%',
                textAlign: 'center'
              }}
            >
              <StorageIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                No Selling of Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We do not sell your personal information or trading strategies to third parties. Your data is used only to provide and improve our services.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
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
        
        {/* Privacy Content */}
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
        
        {/* FAQ Section */}
        <Box 
          sx={{ 
            mb: 8, 
            mt: 6 
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
            Frequently Asked Privacy Questions
          </Typography>
          
          {faqs.map((faq, index) => (
            <Accordion 
              key={index}
              elevation={0}
              disableGutters
              sx={{ 
                mb: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px !important',
                '&:before': {
                  display: 'none',
                },
                overflow: 'hidden'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  px: 3,
                  '&.Mui-expanded': {
                    borderBottom: '1px solid',
                    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pt: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        
        {/* CTA Section */}
        <Box 
          sx={{ 
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
            Have Privacy Concerns or Questions?
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            If you have any questions or concerns about our Privacy Policy or how we handle your data, our privacy team is here to help.
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
            Contact Our Privacy Team
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPage; 