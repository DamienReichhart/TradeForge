import React from 'react';
import { Button, ButtonProps, Theme } from '@mui/material';
import { createRipple } from '../../utils/animations';

interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'default' | 'border' | 'float' | 'pulse';
  rippleEffect?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animationType = 'default',
  rippleEffect = true,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (rippleEffect) {
      createRipple(event);
    }
    if (props.onClick) {
      props.onClick(event);
    }
  };
  
  // Determine animation class based on animation type
  let animationClass = 'btn-hover';
  if (animationType === 'border') {
    animationClass = 'animated-border btn-hover';
  } else if (animationType === 'float') {
    animationClass = 'floating btn-hover';
  } else if (animationType === 'pulse') {
    animationClass = 'animate-pulse-slow btn-hover';
  }
  
  // Combine with existing classes
  const buttonClass = `${props.className || ''} ${animationClass} ${rippleEffect ? 'ripple-container' : ''}`.trim();
  
  // Create default styles based on variant
  let defaultSx = {};
  if (props.variant === 'contained') {
    defaultSx = {
      boxShadow: (theme: Theme) => props.color === 'secondary' 
        ? theme.shadows[3] 
        : theme.shadows[3],
      '&:hover': {
        boxShadow: (theme: Theme) => props.color === 'secondary'
          ? '0 6px 20px 0 rgba(50, 212, 164, 0.35)'
          : '0 6px 20px 0 rgba(58, 111, 247, 0.35)',
      }
    };
  } else if (props.variant === 'outlined') {
    defaultSx = {
      borderWidth: '2px',
      '&:hover': {
        borderWidth: '2px',
      }
    };
  }
  
  return (
    <Button
      {...props}
      className={buttonClass}
      onClick={handleClick}
      sx={{ 
        borderRadius: props.variant === 'contained' ? '50px' : '8px',
        fontWeight: 600,
        padding: '10px 20px',
        transition: 'all 0.2s ease-in-out',
        ...defaultSx,
        ...props.sx 
      }}
    >
      {children}
    </Button>
  );
};

export default AnimatedButton; 