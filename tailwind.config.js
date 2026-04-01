/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          100: '#eaeaea',
        },
        primary: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#18181b', // Main button background
          700: '#000000', // Hover button background
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
      },
      boxShadow: {
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
      },
      borderRadius: {
        'lg': '0.375rem',
        'xl': '0.375rem',
        '2xl': '0.5rem',
      }
    },
  },
  plugins: [],
}
