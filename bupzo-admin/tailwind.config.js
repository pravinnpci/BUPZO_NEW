/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9f9ff",
        primary: "#003d9b",
        "primary-container": "#0052cc",
        secondary: "#5e4db9",
        "secondary-container": "#9f8eff",
        tertiary: "#004e32",
        "tertiary-container": "#006844",
        surface: "#f9f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e0e8ff",
        "surface-container-highest": "#d7e2ff",
        "on-surface": "#041b3c",
        "on-surface-variant": "#434654",
        outline: "#737685",
        "outline-variant": "#c3c6d6",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "inverse-surface": "#1d3052",
        "inverse-primary": "#b2c5ff",
        charcoal: '#565264',
        'dim-grey': '#706677',
        'dusty-mauve': '#A6808C',
        'almond-silk': '#CCB7AE',
        'dust-grey': '#D6CFCB',
      },
      fontFamily: {
        sans: ['var(--font-hanken-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        heading: ['var(--font-hanken-grotesk)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
