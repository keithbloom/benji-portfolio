/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./layouts/**/*.html",
      "./content/**/*.md",
      "./themes/**/layouts/**/*.html"
    ],
    theme: {
      extend: {
        colors: {
          'zone-40-blue': '#519bf4',
          'zone-40-grey': '#a1c3d3',
          'zone-42-green': '#ccf462',
          'zone-44-green': '#cdf564',
          'zone-44-pink': '#f673a2',
          'zone-41-red': '#ff4633',
          'zone-41-orange': '#ffc665',
          'zone-43-pink': '#ffd3d9',
        },
        fontFamily: {
          'carter': ['"Carter One"', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }