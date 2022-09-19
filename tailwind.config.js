/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
   
    extend: {
      colors: {
        'blue': '#E6F5FB',
        'green': '#EFFCEF',
        'purple': '#F0F5FF',
        'grey': '#B4B4B4'
      },
      borderRadius: {
        'sm': '0.313rem',
      },
    },
  },
  plugins: [],
}