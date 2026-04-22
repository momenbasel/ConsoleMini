/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#05060a",
          900: "#0a0d18",
          800: "#0f1422",
          700: "#161c2e",
        },
        neon: {
          pink: "#ff3da6",
          cyan: "#28e2ff",
          violet: "#8a5cff",
          lime: "#b9ff5e",
          amber: "#ffb547",
        },
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(138,92,255,0.55), 0 0 80px -20px rgba(40,226,255,0.35)",
        cardLift: "0 30px 60px -25px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
        aurora:
          "radial-gradient(60% 40% at 20% 10%,rgba(138,92,255,0.35),transparent 60%),radial-gradient(50% 35% at 80% 20%,rgba(40,226,255,0.30),transparent 55%),radial-gradient(40% 35% at 60% 90%,rgba(255,61,166,0.25),transparent 60%)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};
