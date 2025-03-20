import React, { useState, useRef, ReactNode } from 'react';
import { Card, CardProps, Box } from '@mui/material';
import { useTiltEffect } from '../../utils/animations';

interface AnimatedCardProps extends CardProps {
  children: ReactNode;
  glareEffect?: boolean;
  tiltEffect?: boolean;
  hoverLift?: boolean;
  animationOnScroll?: boolean;
  animationType?: 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'bounce-in';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  glareEffect = false,
  tiltEffect = false,
  hoverLift = true,
  animationOnScroll = true,
  animationType = 'fade-in',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { ref: tiltRef } = useTiltEffect();
  
  // Set the proper ref based on whether tilt effect is enabled
  const ref = tiltEffect ? tiltRef : cardRef;
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  // Build class names based on props
  const cardClasses = [
    props.className || '',
    hoverLift ? 'card-hover' : '',
    tiltEffect ? 'card-3d' : '',
    animationOnScroll ? `animate-on-scroll ${animationType}` : animationType,
  ].filter(Boolean).join(' ');
  
  return (
    <Card
      {...props}
      ref={ref as any}
      className={cardClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        transformStyle: tiltEffect ? 'preserve-3d' : 'flat',
        ...props.sx
      }}
    >
      {/* Card content with 3D effect if enabled */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          transform: tiltEffect && isHovered ? 'translateZ(50px)' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {children}
      </Box>
      
      {/* Glare effect visible only on hover */}
      {glareEffect && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 100%)',
            opacity: isHovered ? 0.2 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />
      )}
    </Card>
  );
};

export default AnimatedCard; 