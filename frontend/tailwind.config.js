/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#121212',
          secondary: '#1E1E1E',
          tertiary: '#2D2D2D'
        },
        accent: {
          primary: '#6D28D9',
          secondary: '#8B5CF6',
          tertiary: '#A78BFA'
        },
        success: {
          primary: '#059669',
          secondary: '#10B981'
        },
        warning: {
          primary: '#D97706',
          secondary: '#F59E0B'
        },
        error: {
          primary: '#DC2626',
          secondary: '#EF4444'
        },
        teal: {
          primary: '#0D9488',
          secondary: '#14B8A6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif']
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        'neomorphic': '10px 10px 20px rgba(0, 0, 0, 0.2), -10px -10px 20px rgba(255, 255, 255, 0.03)',
        'neomorphic-sm': '5px 5px 10px rgba(0, 0, 0, 0.2), -5px -5px 10px rgba(255, 255, 255, 0.03)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)'
      },
      backdropBlur: {
        'xs': '2px'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'flip': 'flip 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) forwards'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' }
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' }
        }
      },
      transitionDuration: {
        '400': '400ms'
      }
    },
  },
  plugins: [],
};