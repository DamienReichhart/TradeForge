import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Chip,
  Divider,
  useTheme,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CodeIcon from '@mui/icons-material/Code';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CheckIcon from '@mui/icons-material/Check';
import { Link as RouterLink } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`careers-tabpanel-${index}`}
      aria-labelledby={`careers-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `careers-tab-${index}`,
    'aria-controls': `careers-tabpanel-${index}`,
  };
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

const jobPostings: JobPosting[] = [
  {
    id: 'swe-backend',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'New York, NY (Remote Available)',
    type: 'Full-time',
    level: 'Mid-Senior',
    description: 'We are looking for a skilled Backend Engineer to join our engineering team to develop scalable and reliable systems that power our trading platform.',
    responsibilities: [
      'Design and build scalable microservices for our trading platform',
      'Optimize database queries and data structures for improved performance',
      'Develop and maintain APIs for internal and external consumption',
      'Collaborate with frontend engineers to integrate backend services',
      'Implement security best practices and data protection measures'
    ],
    requirements: [
      '3+ years of experience in backend development',
      'Proficiency in Python, Go, or Java',
      'Experience with RESTful APIs and microservices architecture',
      'Knowledge of SQL and NoSQL databases',
      'Understanding of cloud services (AWS, GCP, or Azure)'
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Flexible work arrangements, including remote options',
      'Professional development budget',
      'Unlimited PTO policy'
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    department: 'Data Science',
    location: 'New York, NY (Remote Available)',
    type: 'Full-time',
    level: 'Mid-Senior',
    description: 'Join our data science team to build sophisticated machine learning models for trading strategy optimization and market prediction.',
    responsibilities: [
      'Develop and implement machine learning models for financial market prediction',
      'Create algorithms for trading strategy optimization',
      'Analyze large datasets to extract meaningful insights',
      'Collaborate with engineering team to deploy models to production',
      'Stay up-to-date with latest research in AI and machine learning'
    ],
    requirements: [
      'Masters or PhD in Computer Science, Statistics, or related field',
      '3+ years of experience in data science or machine learning',
      'Proficiency in Python and data science libraries (NumPy, Pandas, Scikit-learn)',
      'Experience with deep learning frameworks (TensorFlow or PyTorch)',
      'Knowledge of financial markets is a plus'
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Flexible work arrangements, including remote options',
      'Professional development budget',
      'Unlimited PTO policy'
    ]
  },
  {
    id: 'ui-designer',
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    level: 'Mid-Level',
    description: 'We are seeking a talented UI/UX Designer to create exceptional user experiences for our trading platform, ensuring it is both intuitive and visually appealing.',
    responsibilities: [
      'Design intuitive and visually appealing user interfaces for web applications',
      'Create wireframes, prototypes, and high-fidelity mockups',
      'Conduct user research and usability testing',
      'Collaborate with product managers and engineers',
      'Maintain and evolve our design system'
    ],
    requirements: [
      '3+ years of experience in UI/UX design for web applications',
      'Proficiency in design tools such as Figma, Sketch, or Adobe XD',
      'Experience with design systems and component libraries',
      'Understanding of accessibility standards and best practices',
      'Portfolio showcasing your design process and solutions'
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Flexible work arrangements, including remote options',
      'Professional development budget',
      'Unlimited PTO policy'
    ]
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'Full-time',
    level: 'Senior',
    description: 'We are looking for an experienced Product Manager to lead the development of new features and improvements to our trading platform.',
    responsibilities: [
      'Define product strategy and roadmap for specific features or product areas',
      'Gather and prioritize user requirements and feature requests',
      'Work closely with engineering, design, and marketing teams',
      'Analyze market trends and competitor offerings',
      'Use data to drive product decisions and measure success'
    ],
    requirements: [
      '5+ years of product management experience',
      'Experience with trading platforms or financial products',
      'Strong analytical and problem-solving skills',
      'Excellent communication and stakeholder management',
      'Technical background or understanding of software development'
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Flexible work arrangements, including remote options',
      'Professional development budget',
      'Unlimited PTO policy'
    ]
  }
];

const benefits = [
  {
    title: 'Competitive Compensation',
    description: 'Excellent base salary, equity packages, and performance bonuses.',
    icon: <AttachMoneyIcon fontSize="large" />,
    color: '#4caf50'
  },
  {
    title: 'Flexible Work',
    description: 'Work remotely or from our offices with flexible scheduling options.',
    icon: <AccessTimeIcon fontSize="large" />,
    color: '#3a6ff7'
  },
  {
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance for you and your family.',
    icon: <WorkIcon fontSize="large" />,
    color: '#ff9800'
  },
  {
    title: 'Professional Growth',
    description: 'Dedicated budget for conferences, courses, and learning resources.',
    icon: <WorkIcon fontSize="large" />,
    color: '#9c27b0'
  }
];

const CareersPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredJobs = () => {
    if (tabValue === 0) return jobPostings;
    if (tabValue === 1) return jobPostings.filter(job => job.department === 'Engineering');
    if (tabValue === 2) return jobPostings.filter(job => job.department === 'Data Science');
    if (tabValue === 3) return jobPostings.filter(job => job.department === 'Design');
    if (tabValue === 4) return jobPostings.filter(job => job.department === 'Product');
    return jobPostings;
  };

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
            Join Our Team
            <Box component="span" sx={{ display: 'block' }} className="gradient-text">
              Revolutionize Trading Together
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
            We're building the future of algorithmic trading and we need
            talented, passionate people to join us on this journey.
          </Typography>
          
          <Box 
            component="img"
            src="/careers-hero.png"
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
        
        {/* Company Culture Section */}
        <Box 
          sx={{ 
            mb: { xs: 8, md: 12 }
          }}
          className="animate-on-scroll fade-in"
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Our Culture
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                At TradeForge, we believe in creating an environment where innovative minds can thrive. Our culture is built on collaboration, continuous learning, and a shared passion for revolutionizing how people trade.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                We value diversity of thought and background, knowing that the best solutions come from teams with different perspectives working together towards common goals.
              </Typography>
              <List>
                {[
                  'Innovation-driven environment',
                  'Transparency in communication and decision-making',
                  'Support for personal and professional growth',
                  'Emphasis on work-life balance'
                ].map((item, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckIcon sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box 
                    component="img"
                    src="/culture-1.png"
                    alt="TradeForge Culture"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 2,
                      mb: 3,
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Box 
                    component="img"
                    src="/culture-2.png"
                    alt="TradeForge Culture"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Box 
                    component="img"
                    src="/culture-3.png"
                    alt="TradeForge Culture"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                      mt: { xs: 0, sm: 5 }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        
        {/* Benefits Section */}
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
              mb: 1
            }}
          >
            Why Join Us
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
            We offer competitive compensation and great benefits to ensure you thrive personally and professionally.
          </Typography>
          
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                    p: 3,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: alpha(benefit.color, 0.1),
                      color: benefit.color,
                      mb: 2
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Open Positions Section */}
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
              mb: 1
            }}
          >
            Open Positions
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
            Join our team of passionate professionals building the future of trading.
          </Typography>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              mb: 4,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minWidth: 120,
              }
            }}
          >
            <Tab 
              label="All Departments" 
              icon={<BusinessCenterIcon />} 
              iconPosition="start" 
              {...a11yProps(0)} 
            />
            <Tab 
              label="Engineering" 
              icon={<CodeIcon />} 
              iconPosition="start" 
              {...a11yProps(1)} 
            />
            <Tab 
              label="Data Science" 
              icon={<SupportAgentIcon />} 
              iconPosition="start" 
              {...a11yProps(2)} 
            />
            <Tab 
              label="Design" 
              icon={<DesignServicesIcon />} 
              iconPosition="start" 
              {...a11yProps(3)} 
            />
            <Tab 
              label="Product" 
              icon={<BusinessCenterIcon />} 
              iconPosition="start" 
              {...a11yProps(4)} 
            />
          </Tabs>
          
          {[0, 1, 2, 3, 4].map(index => (
            <TabPanel key={index} value={tabValue} index={index}>
              <Grid container spacing={3}>
                {filteredJobs().map((job, jobIndex) => (
                  <Grid item xs={12} key={jobIndex}>
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                        p: 3,
                        transition: 'box-shadow 0.3s ease-in-out',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                            {job.title}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip 
                              icon={<WorkIcon fontSize="small" />} 
                              label={job.department}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(58, 111, 247, 0.1)',
                                color: 'primary.main'
                              }}
                            />
                            <Chip 
                              icon={<LocationOnIcon fontSize="small" />} 
                              label={job.location}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(76, 175, 80, 0.1)',
                                color: '#4caf50'
                              }}
                            />
                            <Chip 
                              icon={<AccessTimeIcon fontSize="small" />} 
                              label={job.type}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(255, 152, 0, 0.1)',
                                color: '#ff9800'
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {job.description}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                          <Button
                            component={RouterLink}
                            to={`/careers/${job.id}`}
                            variant="contained"
                            size="large"
                            sx={{ 
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              fontWeight: 600
                            }}
                          >
                            Apply Now
                          </Button>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Key Responsibilities:
                      </Typography>
                      <Grid container spacing={2}>
                        {job.responsibilities.slice(0, 3).map((resp, respIndex) => (
                          <Grid item xs={12} sm={4} key={respIndex}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <CheckIcon 
                                sx={{ 
                                  color: 'primary.main', 
                                  mr: 1,
                                  mt: 0.3
                                }} 
                              />
                              <Typography variant="body2" color="text.secondary">
                                {resp}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          ))}
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
              Don't See the Perfect Fit?
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
              We're always looking for talented individuals to join our team. 
              Send us your resume and we'll keep you in mind for future opportunities.
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
        </Box>
      </Container>
    </Box>
  );
};

export default CareersPage; 