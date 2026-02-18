/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
           50: '#eef2ff',
           100: '#e0e7ff',
           200: '#c7d2fe',
           300: '#a5b4fc',
           400: '#818cf8',
           500: '#667ee8',
           600: '#667ee8',
           700: '#4338ca',
           800: '#3730a3',
           900: '#312e81',
          purple: '#667eea',
          'dark-purple': '#764ba2',
          pink: '#f093fb',
          cyan: '#4ec5dd',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        bg: {
          dark: '#1a1a2e',
          card: '#16213e',
          darker: '#0f0f23',
        },
        text: {
          light: '#e4e4e7',
          muted: '#a1a1aa',
          dark: '#71717a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
