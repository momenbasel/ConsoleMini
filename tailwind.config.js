/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"SF Pro Text"', "Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ['"SF Pro Display"', "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          950: "#07080b",
          900: "#0a0b10",
          850: "#0c0e14",
          800: "#0d1017",
          750: "#101218",
          700: "#16181f",
          600: "#1c1f28",
        },
        accent: {
          DEFAULT: "#c6ff3d",
          dim: "#8fb22b",
        },
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      keyframes: {
        cmpulse: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        cmpulse: "cmpulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
