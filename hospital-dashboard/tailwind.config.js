/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#000000', // Global background
          800: '#0A0A0A', // Panel background
          700: '#121212', // Cards background
        },
        emergency: '#E53935',
        moderate: '#FFB300',
        normal: '#00C853',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
