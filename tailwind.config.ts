import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8f0",
          100: "#feefd9",
          200: "#fcdcb3",
          300: "#fac282",
          400: "#f7a04f",
          500: "#f37a22", // warm Indian tiffin saffron-orange
          600: "#e45e14",
          700: "#be4511",
          800: "#983715",
          900: "#7c2f15",
          950: "#441407",
        },
        curry: {
          50: "#fef9ee",
          100: "#fdf0d2",
          200: "#fbe0a4",
          500: "#e9a31a",
          600: "#cf8211",
        },
        leaf: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        }
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 12px -2px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.08)",
        floating: "0 10px 30px -5px rgba(0, 0, 0, 0.12)",
      }
    },
  },
  plugins: [],
};

export default config;
