import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#06f5b7",
          dark: "#05c492",
          50: "#e6fff7",
          100: "#b3ffe6",
          200: "#80ffd6",
          300: "#4dffc5",
          400: "#1affb5",
          500: "#06f5b7",
          600: "#05c492",
          700: "#04936e",
          800: "#036249",
          900: "#013125",
        },
        surface: {
          DEFAULT: "#0a0a0a",
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
