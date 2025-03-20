/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd8ff',
          300: '#8ebdff',
          400: '#5698ff',
          500: '#3a6ff7', // Primary color
          600: '#2953cc',
          700: '#1c3fad',
          800: '#173385',
          900: '#102d6e',
        },
        secondary: {
          50: '#eefdf7',
          100: '#d6f9ee',
          200: '#aff3dc',
          300: '#77e9c3',
          400: '#42dca9',
          500: '#32d4a4', // Secondary color
          600: '#18a880',
          700: '#138564', 
          800: '#11604a',
          900: '#0e513e',
        },
        dark: {
          50: '#f5f7fa',
          100: '#e7ebf3',
          200: '#d0d9e8',
          300: '#a5b8d3',
          400: '#6b778c', // Text secondary
          500: '#455571',
          600: '#32415e',
          700: '#253552',
          800: '#1e294a',
          900: '#172b4d', // Text primary
        },
      },
      boxShadow: {
        'card': '0 5px 22px 0 rgba(0, 0, 0, 0.03), 0 0 1px 0 rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 30px 0 rgba(0, 0, 0, 0.08), 0 0 1px 0 rgba(0, 0, 0, 0.1)',
        'btn-primary': '0 4px 14px 0 rgba(58, 111, 247, 0.25)',
        'btn-primary-hover': '0 6px 20px 0 rgba(58, 111, 247, 0.35)',
        'btn-secondary': '0 4px 14px 0 rgba(50, 212, 164, 0.25)',
        'btn-secondary-hover': '0 6px 20px 0 rgba(50, 212, 164, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'slide-down': 'slideDown 0.5s ease-in-out',
        'slide-left': 'slideLeft 0.5s ease-in-out',
        'slide-right': 'slideRight 0.5s ease-in-out',
        'bounce-in': 'bounceIn 0.8s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.17, 0.67, 0.83, 0.67)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
}

