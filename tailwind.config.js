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
        accent: {
          DEFAULT: '#7C3AED', // Violet-600
          hover: '#6D28D9',
          light: '#A78BFA',
        },
        dark: {
          bg: '#0F0F12',
          card: '#1E1E2A',
          text: '#E4E4E7',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
