module.exports = {
  content: ['./**/*.liquid', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: false,
    extend: {
      screens: {
        'prototype': '1440px',
      },
    }
  },
  plugins: [],
};