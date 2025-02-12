/** @type {import('tailwindcss').Config} */

let plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./**/*.liquid', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [],
  theme: {
    extend: {},
  },
  plugins: [],
};