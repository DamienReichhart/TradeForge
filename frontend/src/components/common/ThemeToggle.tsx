import React from 'react';
import { IconButton, Tooltip, SxProps, Theme } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  sx?: SxProps<Theme>;
  size?: 'small' | 'medium' | 'large';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  sx = {}, 
  size = 'medium' 
}) => {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        size={size}
        className={className}
        sx={{
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'rotate(12deg) scale(1.1)',
          },
          ...sx
        }}
      >
        {mode === 'light' ? (
          <DarkModeIcon fontSize={size} />
        ) : (
          <LightModeIcon fontSize={size} sx={{ color: '#ffee58' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 