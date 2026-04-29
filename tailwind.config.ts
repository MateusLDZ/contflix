import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        contflix: {
          navy: "#071A3D",
          navy2: "#0B2454",
          primary: "#063B78",
          cyan: "#19D3D1",
          cyanDark: "#0EA5A4",
          bg: "#F4F7FB",
          text: "#0B1F4D",
          muted: "#7A8AA0",
          wine: "#A8324A",
          red: "#E5484D"
        }
      }
    }
  },
  plugins: [],
};

export default config;
