/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#565264",
        dimGrey: "#706677",
        dustyMauve: "#A6808C",
        almondSilk: "#CCB7AE",
        dustGrey: "#D6CFCB",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        'plus-jakarta': ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};