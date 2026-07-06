/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warm neutral palette
        cream: {
          50:  '#FDFCFB',
          100: '#F7F5F2',
          200: '#EDE9E3',
          300: '#DDD7CE',
          400: '#C8BFB3',
          500: '#A89E93',
        },
        charcoal: {
          50:  '#F5F4F2',
          100: '#E8E5E0',
          200: '#C9C4BC',
          300: '#9E968C',
          400: '#6B6259',
          500: '#3D342C',
          600: '#2A231C',
          700: '#1C1712',
          800: '#1A1511',
          900: '#110E0A',
        },
        amber: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
        'slide-down': 'slideDown 0.35s ease-out forwards',
        'scale-in': 'scaleIn 0.25s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(28,23,18,0.06), 0 1px 2px rgba(28,23,18,0.04)',
        'warm': '0 4px 12px rgba(28,23,18,0.08), 0 2px 4px rgba(28,23,18,0.04)',
        'warm-md': '0 8px 24px rgba(28,23,18,0.10), 0 4px 8px rgba(28,23,18,0.06)',
        'warm-lg': '0 16px 48px rgba(28,23,18,0.12), 0 8px 16px rgba(28,23,18,0.08)',
        'amber': '0 4px 16px rgba(217,119,6,0.25)',
        'amber-lg': '0 8px 32px rgba(217,119,6,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
