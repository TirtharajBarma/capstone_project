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
        "primary": "#BC4B29",
        "secondary": "#5B8C5A",
        "accent": "#F4A261",
        "background-light": "#FAF6F1",
        "background-dark": "#2C2416",
        "panel-light": "#FFFFFF",
        "panel-dark": "#1A2B20",
        "text-light": "#2C2416",
        "text-dark": "#E0E0E0",
      },
      fontFamily: {
        "display": ["DM Serif Display", "Georgia", "serif"],
        "body": ["Figtree", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}