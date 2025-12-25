/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Navy color palette for sidebar and dark elements
        navy: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        // Teal/cyan accent colors
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        // Background colors
        background: '#f8fafc',
        card: '#ffffff',
      },
      backgroundImage: {
        'teal-gradient': 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        'navy-gradient': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'premium': '0 10px 30px -5px rgba(20, 184, 166, 0.15)',
        'focus-teal': '0 0 15px rgba(20, 184, 166, 0.1)',
        'luxury': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'stat': '0 4px 20px -1px rgba(0, 0, 0, 0.03)',
        'stat-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
