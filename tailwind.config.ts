import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E8650A",
          dark: "#C24F00",
          tint: "#FFF1E8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
