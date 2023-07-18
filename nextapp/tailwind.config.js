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
        'grey': '#B4B4B4',
        'bg':'#F5F5F5'
      },
      borderRadius: {
        'sm': '0.313rem',
      },
      fontFamily:{
        'inter' : ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}