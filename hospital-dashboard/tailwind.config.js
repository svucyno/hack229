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
          900: '#050D1A', // Global background
          800: '#0A1628', // Panel background
          700: '#0F1F3D', // Cards background
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
