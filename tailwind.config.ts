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
        kabala: {
          bg: "#09090b",
          card: "#121216",
          border: "#27272a",
          gold: "#d4af37",
          "gold-light": "#fef08a",
          crimson: "#991b1b",
          "crimson-glow": "#ef4444",
          mystic: "#8b5cf6",
          parchment: "#fef3c7"
        }
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        medieval: ["MedievalSharp", "cursive"],
      }
    },
  },
  plugins: [],
};
export default config;
