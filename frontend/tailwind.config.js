/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#070C18',
          900: '#0B132B',
          850: '#111C38',
          800: '#1C2541',
          700: '#3A506B',
          teal: '#06B6D4',
          cyan: '#14B8A6',
          blue: '#3B82F6',
          accent: '#0D9488'
        }
      }
    },
  },
  plugins: [],
}
