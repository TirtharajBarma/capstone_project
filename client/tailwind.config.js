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
        "primary": "#16a34a", // Green
        "primary-dark": "#15803d", // Dark Green
        "background-light": "#FFFFFF",
        "container-light": "#F5F5F5",
        "text-light": "#333333",
        "custom-teal": "#1A535C",
        "custom-coral": "#FF6B6B",
        "custom-background": "#F7F7F7",
        "custom-text": "#171717",
        "custom-success": "#4CAF50",
        "custom-error": "#D32F2F"
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
          "DEFAULT": "0.25rem", 
          "lg": "0.5rem", 
          "xl": "0.75rem", 
          "full": "9999px"
      },
    },
  },
  plugins: [],
}