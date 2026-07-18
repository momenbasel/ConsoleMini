/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", '"SF Pro Text"', "system-ui", "-apple-system", "sans-serif"],
        display: ["Archivo", '"SF Pro Display"', "Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          950: "#030304",
          900: "#060709",
          850: "#090a0e",
          800: "#0b0d12",
          750: "#0f1118",
          700: "#14161e",
          600: "#1b1e28",
        },
        accent: {
          DEFAULT: "#d3fd50",
          dim: "#96b138",
        },
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      transitionTimingFunction: {
        // signature UI ease — fast attack, long settle
        glide: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        cmpulse: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        sheen: {
          "0%": { transform: "translateX(-120%) skewX(-18deg)" },
          "100%": { transform: "translateX(240%) skewX(-18deg)" },
        },
        grain: {
          "0%,100%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-2%,1%)" },
          "40%": { transform: "translate(1%,-2%)" },
          "60%": { transform: "translate(-1%,2%)" },
          "80%": { transform: "translate(2%,-1%)" },
        },
        floaty: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-8px,0)" },
        },
        ringpulse: {
          "0%,100%": { opacity: "0.9" },
          "50%": { opacity: "0.45" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
      },
      animation: {
        cmpulse: "cmpulse 1.6s ease-in-out infinite",
        sheen: "sheen 0.9s cubic-bezier(0.32,0.72,0,1) forwards",
        grain: "grain 1.2s steps(4) infinite",
        floaty: "floaty 7s ease-in-out infinite",
        ringpulse: "ringpulse 1.8s ease-in-out infinite",
        scan: "scan 3.2s cubic-bezier(0.4,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};
