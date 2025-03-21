import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for detecting when an element enters the viewport
 * and applying animations on scroll
 */
export const useInView = (options = {}, executeOnce = true) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (executeOnce && ref.current) {
          observer.unobserve(ref.current);
        }
      } else if (!executeOnce) {
        setIsInView(false);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options, executeOnce]);

  return { ref, isInView };
};

/**
 * Utility function to add a delay between staggered animations
 */
export const staggerDelay = (index: number, baseDelay = 0.1) => {
  return { animationDelay: `${index * baseDelay}s` };
};

/**
 * Hook for adding entrance animations with staggered timing
 */
export const useStaggerAnimation = (count: number, baseDelay = 0.1) => {
  return Array.from({ length: count }).map((_, index) => ({
    style: { animationDelay: `${index * baseDelay}s` },
    className: 'animate-slide-up'
  }));
};

/**
 * Hook to track mouse position for hover effects
 */
export const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return position;
};

/**
 * Applies a tilt effect to an element when hovered
 */
export const useTiltEffect = () => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;
      
      element.style.transform = `perspective(1000px) rotateX(${deltaY * -5}deg) rotateY(${deltaX * 5}deg)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return { ref };
};

/**
 * Create a ripple effect for buttons and interactive elements
 */
export const createRipple = (event: React.MouseEvent<HTMLElement>) => {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.className = 'ripple';
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
};

/**
 * Initialize scroll animations for elements with animation classes
 */
export const initScrollAnimations = (): void => {
  const animateElements = document.querySelectorAll(
    '.animate-fade-in, .animate-slide-up, .animate-slide-right, .animate-scale-in, .animate-on-scroll'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('animate-on-scroll')) {
            entry.target.classList.add('animate-visible');
          } else {
            entry.target.classList.add('visible');
          }
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  animateElements.forEach((element) => {
    // Reset visibility
    if (element.classList.contains('animate-on-scroll')) {
      element.classList.remove('animate-visible');
    } else {
      element.classList.remove('visible');
    }
    observer.observe(element);
  });
}; 