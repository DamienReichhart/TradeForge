import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Avatar, 
  Card, 
  CardContent,
  Divider,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Link as RouterLink } from 'react-router-dom';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import GroupsIcon from '@mui/icons-material/Groups';

const team = [
  {
    name: 'Alex Morgan',
    role: 'Founder & CEO',
    bio: 'Former quantitative analyst with over 10 years of experience in algorithmic trading at major investment banks.',
    avatar: '/team-member-1.png',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com'
  },
  {
    name: 'Elena Chen',
    role: 'Chief Technology Officer',
    bio: 'AI researcher and engineer with expertise in machine learning models for financial forecasting.',
    avatar: '/team-member-2.png',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com'
  },
  {
    name: 'Marcus Kim',
    role: 'Head of Product',
    bio: 'Experienced product leader who has built trading platforms for institutional clients worldwide.',
    avatar: '/team-member-3.png',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com'
  },
  {
    name: 'Sophia Patel',
    role: 'Lead Developer',
    bio: 'Full-stack developer specialized in creating high-performance financial applications.',
    avatar: '/team-member-4.png',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com'
  }
];

const companyHistory = [
  {
    year: '2017',
    title: 'The Beginning',
    description: 'TradeForge was founded with a mission to democratize algorithmic trading for retail investors.'
  },
  {
    year: '2019',
    title: 'First Major Release',
    description: 'Launched the first version of our algorithmic trading platform with backtesting capabilities.'
  },
  {
    year: '2020',
    title: 'AI Integration',
    description: 'Integrated advanced machine learning algorithms for strategy optimization and pattern recognition.'
  },
  {
    year: '2021',
    title: 'Global Expansion',
    description: 'Expanded to international markets, supporting multiple exchanges and currencies.'
  },
  {
    year: '2023',
    title: 'TradeForge Cloud',
    description: 'Launched our cloud-based solution allowing traders to run strategies 24/7 without local hardware.'
  }
];

const values = [
  {
    title: 'Innovation',
    description: 'We constantly push the boundaries of what\'s possible in trading technology.',
    icon: <WorkspacePremiumIcon fontSize="large" />,
    color: '#3a6ff7'
  },
  {
    title: 'Transparency',
    description: 'We believe in clear, honest communication with our customers and partners.',
    icon: <VerifiedIcon fontSize="large" />,
    color: '#4caf50'
  },
  {
    title: 'User-Centric',
    description: 'Everything we build is designed with our users\' needs and goals in mind.',
    icon: <SentimentSatisfiedAltIcon fontSize="large" />,
    color: '#ff9800'
  },
  {
    title: 'Community',
    description: 'We foster a supportive community of traders who learn and grow together.',
    icon: <GroupsIcon fontSize="large" />,
    color: '#9c27b0'
  }
];

const AboutUsPage: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box 
          className="animate-on-scroll fade-in" 
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 8, md: 12 } 
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
            Our Mission is to
            <Box component="span" sx={{ display: 'block' }} className="gradient-text">
              Revolutionize Trading
            </Box>
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              mb: 6 
            }}
          >
            We're building the most advanced AI-powered trading platform to make
            sophisticated algorithmic trading accessible to everyone.
          </Typography>
          
          <Box 
            component="img"
            src="/about-hero.png"
            alt="TradeForge Team"
            sx={{
              width: '100%',
              maxWidth: 900,
              height: 'auto',
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}
          />
        </Box>
        
        {/* Our Story Section */}
        <Box 
          sx={{ 
            mb: { xs: 8, md: 12 },
            position: 'relative'
          }}
          className="animate-on-scroll fade-in"
        >
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Our Story
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                TradeForge was born out of frustration with existing trading tools that were either too simplistic for serious traders or too complex and expensive for most individuals.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Founded by a team of quantitative analysts, developers, and traders, we set out to build the platform we always wished existed: powerful enough for professionals but accessible to everyone.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Today, TradeForge powers trading strategies for thousands of users worldwide, from individual retail traders to professional fund managers.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Timeline position="right">
                {companyHistory.map((event, index) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent color="text.secondary">
                      {event.year}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {index < companyHistory.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="h6" component="span" fontWeight={600}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Grid>
          </Grid>
        </Box>
        
        {/* Core Values Section */}
        <Box 
          sx={{ 
            mb: { xs: 8, md: 12 } 
          }}
          className="animate-on-scroll fade-in"
        >
          <Typography 
            variant="h2" 
            align="center" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              mb: 6
            }}
          >
            Our Core Values
          </Typography>
          
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                    textAlign: 'center',
                    p: 2
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        bgcolor: alpha(value.color, 0.1),
                        color: value.color,
                        mb: 2
                      }}
                    >
                      {value.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Team Section */}
        <Box 
          sx={{ 
            mb: { xs: 8, md: 12 } 
          }}
          className="animate-on-scroll fade-in"
        >
          <Typography 
            variant="h2" 
            align="center" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              mb: 2
            }}
          >
            Meet Our Team
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              mb: 6 
            }}
          >
            Brilliant minds working together to transform the world of trading.
          </Typography>
          
          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  elevation={0}
                  className="animate-on-scroll slide-up"
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Box 
                    sx={{ 
                      height: 260, 
                      bgcolor: 'rgba(58, 111, 247, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4
                    }}
                  >
                    <Avatar
                      src={member.avatar}
                      alt={member.name}
                      sx={{ 
                        width: 180, 
                        height: 180,
                        border: '4px solid',
                        borderColor: 'background.paper'
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {member.bio}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener"
                        size="small"
                        sx={{ 
                          minWidth: 'auto',
                          p: 1,
                          color: '#0077B5',
                          bgcolor: 'rgba(0, 119, 181, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(0, 119, 181, 0.2)',
                          }
                        }}
                      >
                        <LinkedInIcon fontSize="small" />
                      </Button>
                      <Button
                        href={member.twitter}
                        target="_blank"
                        rel="noopener"
                        size="small"
                        sx={{ 
                          minWidth: 'auto',
                          p: 1,
                          color: '#1DA1F2',
                          bgcolor: 'rgba(29, 161, 242, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(29, 161, 242, 0.2)',
                          }
                        }}
                      >
                        <TwitterIcon fontSize="small" />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* CTA Section */}
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
              Join Our Journey
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
              Ready to revolutionize your trading with cutting-edge AI technology?
              Start your TradeForge journey today.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                size="large"
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600
                }}
              >
                Get Started
              </Button>
              <Button 
                component={RouterLink} 
                to="/contact" 
                variant="outlined" 
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
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUsPage; 