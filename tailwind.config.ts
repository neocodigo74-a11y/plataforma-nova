import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          red: "#E11D48",
          dark: "#0B0F19",
          blue: "#2563EB",
          muted: "#6B7280",
          light: "#F8FAFC",
        },
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      boxShadow: {
        nova: "0 10px 30px rgba(225, 29, 72, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
