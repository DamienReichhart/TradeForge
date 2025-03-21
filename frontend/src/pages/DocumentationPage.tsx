import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Divider,
  TextField, 
  InputAdornment,
  Card,
  CardContent,
  Chip,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
      id={`documentation-tabpanel-${index}`}
      aria-labelledby={`documentation-tab-${index}`}
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
    id: `documentation-tab-${index}`,
    'aria-controls': `documentation-tabpanel-${index}`,
  };
}

interface DocItem {
  title: string;
  description: string;
  link: string;
  category: string;
  tags: string[];
}

const documentationItems: DocItem[] = [
  {
    title: 'Getting Started with TradeForge',
    description: 'Learn the basics of TradeForge and set up your first trading bot.',
    link: '/help/getting-started',
    category: 'guides',
    tags: ['beginner', 'setup']
  },
  {
    title: 'API Reference',
    description: 'Complete reference for all TradeForge API endpoints.',
    link: '/help/api-reference',
    category: 'reference',
    tags: ['api', 'development']
  },
  {
    title: 'Backtest Configuration',
    description: 'How to set up and run backtests for your trading strategies.',
    link: '/help/backtest-configuration',
    category: 'guides',
    tags: ['backtesting', 'strategy']
  },
  {
    title: 'Strategy Development Guide',
    description: 'Comprehensive guide to developing effective trading strategies.',
    link: '/help/strategy-development',
    category: 'guides',
    tags: ['strategy', 'development']
  },
  {
    title: 'Using Technical Indicators',
    description: 'How to leverage technical indicators in your trading strategies.',
    link: '/help/technical-indicators',
    category: 'tutorials',
    tags: ['indicators', 'strategy']
  },
  {
    title: 'Risk Management Tools',
    description: 'Guide to using the risk management features of TradeForge.',
    link: '/help/risk-management',
    category: 'guides',
    tags: ['risk', 'management']
  },
  {
    title: 'Exchange Integration',
    description: 'How to connect TradeForge to different cryptocurrency exchanges.',
    link: '/help/exchange-integration',
    category: 'guides',
    tags: ['exchange', 'integration']
  },
  {
    title: 'Webhook Notifications',
    description: 'Setting up notifications for your trading bot activities.',
    link: '/help/webhook-notifications',
    category: 'tutorials',
    tags: ['notifications', 'webhooks']
  },
  {
    title: 'Strategy Optimization',
    description: 'Techniques for optimizing your trading strategies.',
    link: '/help/strategy-optimization',
    category: 'tutorials',
    tags: ['optimization', 'strategy']
  },
  {
    title: 'Frequently Asked Questions',
    description: 'Answers to common questions about using TradeForge.',
    link: '/help/faq',
    category: 'support',
    tags: ['faq', 'support']
  },
];

const DocumentationPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredItems = documentationItems.filter(item => {
    if (searchQuery === '') return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }).filter(item => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return item.category === 'guides';
    if (tabValue === 2) return item.category === 'tutorials';
    if (tabValue === 3) return item.category === 'reference';
    if (tabValue === 4) return item.category === 'support';
    return true;
  });

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box 
          className="animate-on-scroll fade-in" 
          sx={{ 
            textAlign: 'center', 
            mb: { xs: 6, md: 8 } 
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
            Documentation & Resources
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              mb: 4 
            }}
          >
            Everything you need to know about using TradeForge effectively.
            From getting started guides to advanced API references.
          </Typography>
          
          {/* Search Box */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 6 }}>
            <TextField
              fullWidth
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  '& fieldset': { 
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                  },
                }
              }}
            />
          </Box>
        </Box>
        
        {/* Documentation Content */}
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              }}
              className="animate-on-scroll slide-right"
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Documentation
              </Typography>
              <List component="nav" sx={{ mb: 3 }}>
                <ListItem button component={RouterLink} to="/help/getting-started">
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PlayArrowIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Getting Started" />
                </ListItem>
                <ListItem button component={RouterLink} to="/help/api-reference">
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CodeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="API Reference" />
                </ListItem>
                <ListItem button component={RouterLink} to="/help/strategy-development">
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <MenuBookIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Strategy Guide" />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Support
              </Typography>
              <List component="nav">
                <ListItem button component={RouterLink} to="/help/faq">
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <HelpOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="FAQs" />
                </ListItem>
                <ListItem button component={RouterLink} to="/contact">
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SchoolIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Contact Support" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Box className="animate-on-scroll slide-left">
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  mb: 3,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minWidth: 100,
                  }
                }}
              >
                <Tab label="All" {...a11yProps(0)} />
                <Tab label="Guides" {...a11yProps(1)} />
                <Tab label="Tutorials" {...a11yProps(2)} />
                <Tab label="Reference" {...a11yProps(3)} />
                <Tab label="Support" {...a11yProps(4)} />
              </Tabs>
              
              {[0, 1, 2, 3, 4].map(tabIndex => (
                <TabPanel key={tabIndex} value={tabValue} index={tabIndex}>
                  {filteredItems.length > 0 ? (
                    <Grid container spacing={3}>
                      {filteredItems.map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Card 
                            component={RouterLink} 
                            to={item.link}
                            sx={{ 
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              textDecoration: 'none',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ArticleIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6" component="h3" color="text.primary">
                                  {item.title}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {item.description}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
                                {item.tags.map((tag, tagIndex) => (
                                  <Chip 
                                    key={tagIndex} 
                                    label={tag}
                                    size="small"
                                    sx={{ 
                                      bgcolor: 'rgba(58, 111, 247, 0.1)',
                                      color: 'primary.main',
                                      fontWeight: 500
                                    }}
                                  />
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="h6" color="text.secondary">
                        No documentation found matching your search.
                      </Typography>
                    </Box>
                  )}
                </TabPanel>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DocumentationPage; 