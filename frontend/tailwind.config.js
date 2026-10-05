/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        indigo: {
          50: '#f1f5f7',
          100: '#e2eaee',
          200: '#c7d6dd',
          300: '#a5bdc8',
          400: '#7f9eae',
          500: '#638293',
          600: '#4e6d7e',
          700: '#405969',
          800: '#374b57',
          900: '#303f49',
          950: '#1c2931',
        },
      },
    },
  },
  plugins: [],
};
