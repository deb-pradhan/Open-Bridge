/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface (Cool Greys)
        surface: {
          canvas: '#E8E9ED',
          card: '#FFFFFF',
          subtle: '#F5F6F8',
        },
        // Ink (Text)
        ink: {
          primary: '#0F1115',
          secondary: '#585C65',
          tertiary: '#9AA0A6',
          'on-accent': '#FFFFFF',
        },
        // Accent (Violet)
        accent: {
          main: '#3A2E6F',
          hover: '#4D4085',
          subtle: '#EBE9F5',
        },
        // Functional Signals
        signal: {
          error: '#B3261E',
          warning: '#E6B000',
          success: '#006E50',
        },
        // Borders
        border: {
          grid: '#C4C6CD',
          element: '#E0E2E6',
          accent: '#3A2E6F',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '1.0', letterSpacing: '-0.025em' }],
        'h1': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['16px', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
        'body': ['14px', { lineHeight: '1.5', letterSpacing: '0' }],
        'label': ['11px', { lineHeight: '1.0', letterSpacing: '0.06em' }],
        'data': ['13px', { lineHeight: '1.4', letterSpacing: '0' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
      },
      borderRadius: {
        'none': '0px',
        'pill': '999px',
      },
      boxShadow: {
        'none': 'none',
      },
    },
  },
  plugins: [],
}
