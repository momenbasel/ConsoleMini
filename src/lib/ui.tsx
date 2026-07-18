import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

export function Pill({
  children,
  accent = "#d3fd50",
  filled = false,
  style,
}: {
  children: ReactNode;
  accent?: string;
  filled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full font-mono text-[9.5px] tracking-[0.14em] uppercase font-medium whitespace-nowrap"
      style={{
        border: `1px solid ${accent}40`,
        background: filled ? `${accent}16` : "rgba(255,255,255,0.03)",
        color: accent,
        boxShadow: filled ? `0 0 16px ${accent}22, inset 0 0 8px ${accent}10` : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = "default",
  size = "md",
  accent = "#d3fd50",
  onClick,
  disabled,
  style,
  className = "",
  title,
  type = "button",
  focusable = true,
}: {
  children: ReactNode;
  variant?: "default" | "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  accent?: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
  title?: string;
  type?: "button" | "submit";
  focusable?: boolean;
}) {
  const sizes = {
    sm: { h: 26, px: 10, fs: 12 },
    md: { h: 30, px: 12, fs: 12.5 },
    lg: { h: 38, px: 16, fs: 13 },
  } as const;
  const s = sizes[size];

  const base: CSSProperties = {
    height: s.h,
    padding: `0 ${s.px}px`,
    borderRadius: 9,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: s.fs,
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: "nowrap",
    border: "1px solid transparent",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "box-shadow 0.3s var(--ease-glide), background 0.3s var(--ease-glide), border-color 0.3s var(--ease-glide)",
  };

  let skin: CSSProperties = {};
  if (variant === "primary") {
    skin = {
      color: "#0a0b05",
      fontWeight: 650,
      background: `linear-gradient(180deg, ${accent} 0%, ${accent}d8 100%)`,
      boxShadow: `0 4px 18px ${accent}45, inset 0 1px 0 rgba(255,255,255,0.45)`,
      border: `1px solid ${accent}`,
    };
  } else if (variant === "ghost") {
    skin = {
      color: "rgba(255,255,255,0.82)",
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.11)",
    };
  } else {
    skin = {
      color: "white",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    };
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      data-focusable={focusable && !disabled ? "" : undefined}
      className={"no-drag focus-ring " + className}
      style={{ ...base, ...skin, ...style }}
      whileHover={disabled ? undefined : variant === "primary" ? { boxShadow: `0 6px 26px ${accent}60, inset 0 1px 0 rgba(255,255,255,0.5)` } : { background: "rgba(255,255,255,0.09)" }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.button>
  );
}

export function KeyCap({ children }: { children: ReactNode }) {
  return <span className="keycap">{children}</span>;
}

/** tiny glowing status dot */
export function GlowDot({ color, pulse = false, size = 6 }: { color: string; pulse?: boolean; size?: number }) {
  return (
    <span
      className={"rounded-full inline-block flex-shrink-0 " + (pulse ? "animate-cmpulse" : "")}
      style={{ width: size, height: size, background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

/** PlayStation face-button glyph in a ring */
export function FaceGlyph({ glyph, color, size = 13 }: { glyph: string; color: string; size?: number }) {
  return (
    <span
      className="inline-grid place-items-center rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        border: `1px solid ${color}80`,
        color,
        fontSize: size * 0.62,
        lineHeight: 1,
        boxShadow: `0 0 8px ${color}30`,
      }}
    >
      {glyph}
    </span>
  );
}

export function XGlyph() {
  return <FaceGlyph glyph="✕" color="#60a5fa" size={12} />;
}

// deterministic 3-color palette from a string (for ROM cover gradients)
export function paletteFromTitle(title: string): [string, string, string] {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  const hues = [h % 360, (h >>> 8) % 360, (h >>> 16) % 360];
  const c = (hue: number, s: number, l: number) => `hsl(${hue} ${s}% ${l}%)`;
  return [c(hues[0], 58, 42), c(hues[1], 40, 22), c(hues[2], 60, 70)];
}

/** hex -> "r,g,b" for rgba() composition */
export function rgbTriplet(hex: string): string {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  const n = parseInt(v, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

/** tiny hash for deterministic demo numbers */
export function titleHash(s: string, mod: number, base = 0): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % mod) + base;
}
