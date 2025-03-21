import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextProps {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Get saved theme from localStorage or use 'light' as default
    const savedTheme = localStorage.getItem('themeMode');
    return (savedTheme as ThemeMode) || 'light';
  });

  // Effect to update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Optional: Update body class for additional styling hooks
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${mode}`);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  // Get the current theme based on mode
  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 