import type { CSSProperties, ReactNode } from "react";

export function Pill({
  children,
  accent = "#c6ff3d",
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
        background: filled ? `${accent}15` : "rgba(255,255,255,0.03)",
        color: accent,
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
  accent = "#c6ff3d",
  onClick,
  disabled,
  style,
  className = "",
  title,
  type = "button",
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
}) {
  const sizes = {
    sm: { h: 26, px: 10, fs: 12 },
    md: { h: 30, px: 12, fs: 12.5 },
    lg: { h: 36, px: 14, fs: 13 },
  } as const;
  const s = sizes[size];

  const base: CSSProperties = {
    height: s.h,
    padding: `0 ${s.px}px`,
    borderRadius: 8,
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
  };

  let skin: CSSProperties = {};
  if (variant === "primary") {
    skin = {
      color: "#07080b",
      fontWeight: 600,
      background: `linear-gradient(180deg, ${accent} 0%, ${accent}e0 100%)`,
      boxShadow: `0 4px 14px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.4)`,
      border: `1px solid ${accent}`,
    };
  } else if (variant === "ghost") {
    skin = {
      color: "rgba(255,255,255,0.8)",
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.1)",
    };
  } else {
    skin = {
      color: "white",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    };
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={"no-drag focus-ring " + className}
      style={{ ...base, ...skin, ...style }}
    >
      {children}
    </button>
  );
}

export function KeyCap({ children }: { children: ReactNode }) {
  return <span className="keycap">{children}</span>;
}

export function XGlyph() {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: 99,
        border: "1px solid #60a5fa",
        color: "#60a5fa",
        display: "inline-grid",
        placeItems: "center",
        fontSize: 8,
      }}
    >
      ✕
    </span>
  );
}

// deterministic 3-color palette from a string (for ROM cover gradients)
export function paletteFromTitle(title: string): [string, string, string] {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  const hues = [
    h % 360,
    (h >>> 8) % 360,
    (h >>> 16) % 360,
  ];
  const c = (hue: number, s: number, l: number) => `hsl(${hue} ${s}% ${l}%)`;
  return [c(hues[0], 58, 42), c(hues[1], 40, 22), c(hues[2], 60, 70)];
}
