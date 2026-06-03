/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: { 500: '#22c55e', 100: '#dcfce7' },
        amber: { 500: '#f59e0b', 100: '#fef3c7' },
        red: { 500: '#ef4444', 100: '#fee2e2' },
      },
    },
  },
  plugins: [],
}
