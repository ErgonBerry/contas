/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tea_green: {
          DEFAULT: '#d1f0b1',
          50: '#f6fcf0',
          100: '#edf9e0',
          200: '#e3f6d1',
          300: '#daf3c1',
          400: '#a7e36c',
          500: '#d1f0b1',
          600: '#7dd328',
          700: '#548d1b',
          800: '#2a460d',
          900: '#1a2d09'
        },
        celadon: {
          DEFAULT: '#b6cb9e',
          50: '#f1f5ec',
          100: '#e2ead9',
          200: '#d4e0c5',
          300: '#c5d6b2',
          400: '#93b270',
          500: '#b6cb9e',
          600: '#6f8d4c',
          700: '#4a5e33',
          800: '#252f19',
          900: '#181f10'
        },
        cambridge_blue: {
          DEFAULT: '#92b4a7',
          50: '#e9f0ed',
          100: '#d4e1dc',
          200: '#bed2ca',
          300: '#a8c3b9',
          400: '#6c9988',
          500: '#92b4a7',
          600: '#507466',
          700: '#364d44',
          800: '#1b2722',
          900: '#121a16'
        },
        taupe_gray: {
          DEFAULT: '#8c8a93',
          50: '#e8e8e9',
          100: '#d1d0d4',
          200: '#bab9be',
          300: '#a3a2a9',
          400: '#706e77',
          500: '#8c8a93',
          600: '#545259',
          700: '#38373b',
          800: '#1c1b1e',
          900: '#131214'
        },
        chinese_violet: {
          DEFAULT: '#81667a',
          50: '#e6e0e5',
          100: '#cec0ca',
          200: '#b5a1b0',
          300: '#9c8195',
          400: '#675161',
          500: '#81667a',
          600: '#4d3d49',
          700: '#332830',
          800: '#1a1418',
          900: '#110e11'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spinSlow 3s linear infinite',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};