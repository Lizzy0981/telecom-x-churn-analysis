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
          purple: '#667eea',
          'dark-purple': '#764ba2',
          pink: '#f093fb',
          cyan: '#4ec5dd',
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
