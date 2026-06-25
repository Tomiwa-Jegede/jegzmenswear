/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        offwhite: "#F8F7F4",
        cream: "#EFE9DF",
        ink: "#111111",
        charcoal: "#2A2A2A",
        burgundy: "#6A1F2B",
        crimson: "#8C2D3C",
      },
    },
  },
  plugins: [],
};