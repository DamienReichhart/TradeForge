import { createTheme } from '@mui/material/styles';

// Create a theme instance with modern color scheme and animation-friendly configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#3a6ff7', // Vibrant blue
      light: '#6b9aff',
      dark: '#0047c3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#32d4a4', // Teal/mint
      light: '#7effec',
      dark: '#00a275',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff5252',
      light: '#ff867f',
      dark: '#c50e29',
    },
    warning: {
      main: '#ffb74d',
      light: '#ffe97d',
      dark: '#c88719',
    },
    info: {
      main: '#64b5f6',
      light: '#9be7ff',
      dark: '#2286c3',
    },
    success: {
      main: '#66bb6a',
      light: '#98ee99',
      dark: '#338a3e',
    },
    background: {
      default: '#f8fafc', // Very light blue-gray
      paper: '#ffffff',
    },
    text: {
      primary: '#172b4d', // Dark blue-gray
      secondary: '#6b778c', // Medium gray with blue tint
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.7,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          boxShadow: '0 4px 14px 0 rgba(58, 111, 247, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(58, 111, 247, 0.35)',
          },
        },
        containedSecondary: {
          boxShadow: '0 4px 14px 0 rgba(50, 212, 164, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(50, 212, 164, 0.35)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 5px 22px 0 rgba(0, 0, 0, 0.03), 0 0 1px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.08), 0 0 1px 0 rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.8)',
          color: '#172b4d',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(58, 111, 247, 0.08)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(58, 111, 247, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(58, 111, 247, 0.16)',
            },
          },
        },
      },
    },
  },
});

export default theme; 