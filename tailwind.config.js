/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brawl-orange': '#FF6B35',
        'brawl-yellow': '#FFD23F',
        'brawl-purple': '#8B5CF6',
        'brawl-blue': '#3B82F6',
        'brawl-pink': '#EC4899',
        'brawl-dark': '#1a1a2e',
        'brawl-dark-light': '#2d2d44',
      },
      fontFamily: {
        'school': ['SchoolschriftLG', 'cursive', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
