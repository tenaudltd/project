/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#071317",
        },
        ink: {
          50: "#f5f7f7",
          100: "#dde5e5",
          200: "#b7c5c7",
          300: "#90a7aa",
          400: "#66868a",
          500: "#46656b",
          600: "#2e4d55",
          700: "#1e3a43",
          800: "#132b31",
          900: "#0b1a1f",
        },
        sand: {
          50: "#fffdfa",
          100: "#faf3e5",
          200: "#f2dfba",
          300: "#e9c98a",
          400: "#e4b564",
          500: "#d59138",
          600: "#b86f23",
          700: "#93511d",
          800: "#6e3c18",
          900: "#472812",
        },
        coral: {
          50: "#fff4f0",
          100: "#ffe2d7",
          200: "#ffc0aa",
          300: "#ff9a79",
          400: "#f67b5b",
          500: "#e95c40",
          600: "#cb4029",
          700: "#a73423",
          800: "#892d22",
          900: "#6f281f",
        },
        gray: {
          100: "#eaeaea",
        },
        primary: {
          50: "#f4fbfb",
          100: "#ddeeed",
          200: "#b8dbd8",
          300: "#8ac1bc",
          400: "#5fa29e",
          500: "#3f8582",
          600: "#2a6666",
          700: "#1d4e51",
          800: "#153c40",
          900: "#0d292d",
          950: "#08181b",
        },
      },
      boxShadow: {
        glow: "0 24px 80px rgba(9, 36, 41, 0.28)",
        float: "0 18px 60px rgba(12, 23, 32, 0.18)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Avenir Next"', '"Segoe UI"', "sans-serif"],
        display: ['"Fraunces"', '"Iowan Old Style"', '"Palatino Linotype"', "serif"],
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        pulseSoft: "pulseSoft 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
