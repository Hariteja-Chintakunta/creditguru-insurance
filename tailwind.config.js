/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#14264C",
        deepnavy: "#0D1B36",
        teal: "#0E7C7B",
        deepteal: "#0A5E5D",
        amber: "#F59E0B",
        mist: "#E6F4F3",
        ink: "#1F2937",
        slategrey: "#6B7280",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
