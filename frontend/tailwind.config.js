/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0D0F1E',
        'secondary-dark': '#151834',
        'accent-purple': '#8A2BE2',
        'accent-gold': '#FFD700',
        'text-primary-dark': '#E0E0E0',
        'text-secondary-dark': '#A0A0A0',
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'pattern-dark': "url('/src/assets/islamic-pattern.svg')",
      }
    },
  },
  plugins: [],
};