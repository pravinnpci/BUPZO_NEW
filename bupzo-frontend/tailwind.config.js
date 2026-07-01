/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#565264',
        'dim-grey': '#706677',
        'dusty-mauve': '#A6808C',
        'almond-silk': '#CCB7AE',
        'dust-grey': '#D6CFCB',
        // E-commerce Brand Colors
        'brand-blue': '#0055D4',
        'brand-red': '#DF1E26',
        'brand-yellow': '#FFD000',
        'brand-gray-light': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
