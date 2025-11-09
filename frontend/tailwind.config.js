/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#14a9ff",
          600: "#0686db",
          700: "#086bb0",
        },
      },
      boxShadow: {
        soft: "0 6px 24px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
}
