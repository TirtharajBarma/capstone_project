/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#028174",
        "secondary": "#FEA800",
        "background-light": "#FFFFFF",
        "background-dark": "#102216",
        "panel-light": "#F5F5F5",
        "panel-dark": "#1A2B20",
        "text-light": "#333333",
        "text-dark": "#E0E0E0",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}