/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--secondary-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        success: '#22C55E', 
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        purple: '#8B5CF6',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}