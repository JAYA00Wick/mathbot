const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {}
  },
  safelist: [
    // Button backgrounds
    'bg-emerald-500',
    'bg-yellow-500',
    'bg-red-500',
    'hover:bg-emerald-600',
    'hover:bg-yellow-600',
    'hover:bg-red-600',
    
    // Text colors
    'text-emerald-500',
    'text-emerald-600',
    'text-yellow-500',
    'text-yellow-600',
    'text-red-500',
    'text-red-600',
    
    // Border colors
    'border-emerald-500',
    'border-yellow-500',
    'border-red-500',

    // Hover states
    'hover:bg-emerald-500',
    'hover:bg-yellow-500',
    'hover:bg-red-500',
    'hover:text-white'
  ],
  plugins: [],
};