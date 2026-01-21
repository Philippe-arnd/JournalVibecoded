/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        journal: {
          50: '#FDFBF7',   // Warm off-white background
          100: '#F2F7F6',  // Lightest teal tint
          200: '#D6E8E6',  // Soft teal borders
          500: '#3D8D88',  // Primary Teal
          800: '#2A5B58',  // Secondary text
          900: '#153331',  // Deepest Teal text
          accent: '#E07A5F', // Warm Terracotta/Coral
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // More modern font
        serif: ['Fraunces', 'serif'], // Elegant headings
      }
    },
  },
  plugins: [],
}