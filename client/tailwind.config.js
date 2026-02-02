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
        },
        // Semantic color aliases for landing page
        paper: '#FDFBF7',    // Same as journal-50
        card: '#FFFFFF',      // Pure white for cards
        ink: '#153331',       // Same as journal-900
        subtle: '#6B7280',    // Gray-600 for muted text
        border: '#E5E7EB',    // Gray-200 for borders
        accent: '#E07A5F',    // Same as journal-accent
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // More modern font
        serif: ['Fraunces', 'serif'], // Elegant headings
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
      },
    },
  },
  plugins: [],
}