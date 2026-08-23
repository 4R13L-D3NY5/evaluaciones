/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a'
        },
        border: '#e2e8f0',
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b'
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2ff',
          300: '#a4b3ff',
          400: '#7d87ff',
          500: '#625fff',
          600: '#4f39f6', // Brand Primary SEA
          700: '#432dd7',
          800: '#372aac',
          900: '#312c85',
          DEFAULT: '#4f39f6'
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d0fae5',
          200: '#a4f4cf',
          500: '#00bb7f', // Success Server SEA
          600: '#009767',
          700: '#007956'
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem'
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
