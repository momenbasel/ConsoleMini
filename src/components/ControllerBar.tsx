import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export function ControllerBar() {
  const { controllerConnected } = useStore();
  const [time, setTime] = useState(() => fmt(new Date()));

  useEffect(() => {
    const t = setInterval(() => setTime(fmt(new Date())), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="h-[30px] px-4 flex items-center gap-4 flex-shrink-0 font-mono text-[9.5px] text-white/40 tracking-[0.13em] uppercase"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}
    >
      <span className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: controllerConnected ? "#c6ff3d" : "rgba(255,255,255,0.2)",
            boxShadow: controllerConnected ? "0 0 6px #c6ff3d" : undefined,
          }}
        />
        {controllerConnected ? "Controller connected" : "No controller"}
      </span>
      <span className="text-white/20">·</span>
      <Hint glyph="✕" label="select" color="#60a5fa" />
      <Hint glyph="○" label="back" color="#f87171" />
      <Hint glyph="△" label="menu" color="#5fbf6f" />
      <Hint glyph="□" label="info" color="#ff3da6" />
      <div className="flex-1" />
      <span>{time}</span>
    </div>
  );
}

function Hint({ glyph, label, color }: { glyph: string; label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-grid place-items-center rounded-full"
        style={{
          width: 14,
          height: 14,
          border: `1px solid ${color}70`,
          color,
          fontSize: 8.5,
          textTransform: "none",
        }}
      >
        {glyph}
      </span>
      <span>{label}</span>
    </span>
  );
}

function fmt(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
