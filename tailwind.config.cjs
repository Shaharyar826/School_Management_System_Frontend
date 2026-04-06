/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'navbar': '1172px',
    },
    extend: {
      colors: {
        // SaaS Brand palette (hot-pink → magenta → purple)
        brand: {
          50:  '#FFF0F8',
          100: '#FFD6F0',
          200: '#FFB3E3',
          300: '#FF80CF',
          400: '#FF4DBB',
          500: '#E91E8C',   // PRIMARY
          600: '#CC1A7C',
          700: '#A81568',
          800: '#841254',
          900: '#600D3C',
        },
        accent: {
          50:  '#F5F0FF',
          100: '#EDE0FF',
          200: '#D9BFFF',
          300: '#BF94FF',
          400: '#A569FF',
          500: '#9333EA',   // ACCENT PURPLE
          600: '#7927CC',
          700: '#611DAA',
          800: '#4B1588',
          900: '#350E66',
        },
        // Keep school namespace for backward compat (mapped to brand)
        school: {
          yellow: {
            light: '#FFD6F0',
            DEFAULT: '#E91E8C',
            dark: '#CC1A7C'
          },
          orange: {
            light: '#FFB3E3',
            DEFAULT: '#FF4DBB',
            dark: '#E91E8C'
          },
          navy: {
            light: '#374151',
            DEFAULT: '#1F2937',
            dark: '#111827'
          },
          purple: {
            light: '#A569FF',
            DEFAULT: '#9333EA',
            dark: '#7927CC'
          },
          white: '#FFFFFF',
          gray: {
            light: '#F9FAFB',
            DEFAULT: '#E5E7EB',
            dark: '#6B7280'
          }
        },
        // Neutral grays
        gray: {
          750: '#2d3236',
          850: '#1a1f25',
        },
        // Sidebar dark background
        sidebar: {
          bg: '#111827',
          hover: '#1F2937',
          active: '#1F2937',
          border: '#1F2937',
          text: '#9CA3AF',
          activeText: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'pill': '9999px',
        'card': '16px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card':        '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(233,30,140,0.06)',
        'card-hover':  '0 4px 24px rgba(233,30,140,0.14)',
        'input':       '0 2px 4px rgba(0,0,0,0.04)',
        'input-focus': '0 0 0 3px rgba(233,30,140,0.18)',
        'brand':       '0 4px 24px rgba(233,30,140,0.28)',
        'dropdown':    '0 8px 32px rgba(0,0,0,0.12)',
        'nav':         '0 1px 0 rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'brand-gradient':     'linear-gradient(135deg, #E91E8C 0%, #9333EA 100%)',
        'brand-gradient-h':   'linear-gradient(90deg, #E91E8C 0%, #9333EA 100%)',
        'brand-gradient-alt': 'linear-gradient(135deg, #FF6B8A 0%, #E91E8C 50%, #9333EA 100%)',
        'sidebar-gradient':   'linear-gradient(180deg, #111827 0%, #0D1117 100%)',
        'hero-gradient':      'linear-gradient(135deg, #FFF0F8 0%, #F5F0FF 50%, #FAFAFA 100%)',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-in':    'slideIn 0.3s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'float':       'float 3s ease-in-out infinite',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn:    { from: { transform: 'translateX(-12px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideUp:    { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseBrand: { '0%,100%': { boxShadow: '0 0 0 0 rgba(233,30,140,0)' }, '50%': { boxShadow: '0 0 0 8px rgba(233,30,140,0.15)' } },
      },
    },
  },
  plugins: [],
}
