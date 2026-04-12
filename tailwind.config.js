/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        green: {
          50:  "#f0f9f4",
          100: "#dcf0e5",
          200: "#bbe2ce",
          300: "#8dcbae",
          400: "#5aac87",
          500: "#3a9169",
          600: "#2d7554",
          700: "#265f44",
          800: "#224d38",
          900: "#1e3f2f",
        },
      },
    },
  },
  plugins: [],
}
