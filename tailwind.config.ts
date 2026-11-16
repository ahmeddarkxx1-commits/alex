import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#fdfbf9",
          paper: "#fdfbf9",
        },
        dew: {
          DEFAULT: "#f7efe9",
          drop: "#f7efe9",
        },
        charcoal: "#171717",
        cocoa: {
          DEFAULT: "#2b1a07",
          ink: "#2b1a07",
        },
        marker: {
          DEFAULT: "#ff6f1e",
          orange: "#ff6f1e",
        },
        sienna: {
          DEFAULT: "#ce500a",
          burnt: "#ce500a",
        },
        sky: {
          sticker: "#3b82f6",
        },
        bubblegum: {
          sticker: "#ff66cf",
        },
        sprout: {
          sticker: "#22c55e",
        },
        shadow: {
          mist: "#bebcbb",
        },
      },
      fontFamily: {
        cairo: ["'Cairo'", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        inter: ["'Inter'", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        'pill': '20px',
        'footer': '56px',
        'card': '12px',
      },
      boxShadow: {
        'paper-btn': 'rgba(0, 0, 0, 0.25) 0px 1px 2px 0px',
        'paper-card': 'rgba(0, 0, 0, 0.06) 0px 2px 20px 0px',
        'paper-lift': 'rgba(0, 0, 0, 0.12) 0px 3px 8px 0px',
      },
    },
  },
  plugins: [],
};

export default config;
