import { useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { FaceGlyph } from "@/lib/ui";

export function ControllerBar() {
  const { controllerConnected } = useStore();
  const [time, setTime] = useState(() => fmt(new Date()));

  useEffect(() => {
    const t = setInterval(() => setTime(fmt(new Date())), 20_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="h-[34px] px-5 flex items-center gap-5 flex-shrink-0 font-mono text-[9.5px] text-white/40 tracking-[0.13em] uppercase relative"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        background: "linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.12))",
      }}
    >
      <span className="flex items-center gap-2">
        <Gamepad2
          className="size-3.5"
          style={{ color: controllerConnected ? "#d3fd50" : "rgba(255,255,255,0.3)" }}
        />
        <span style={{ color: controllerConnected ? "rgba(255,255,255,0.75)" : undefined }}>
          {controllerConnected ? "Controller" : "No pad"}
        </span>
        {controllerConnected && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d3fd50] opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#d3fd50]" />
          </span>
        )}
      </span>
      <span className="text-white/15">|</span>
      <span className="hidden sm:inline-flex items-center gap-1.5">
        <span className="text-white/50">D-PAD</span> navigate
      </span>
      <Hint glyph="✕" label="select" color="#7aa2ff" />
      <Hint glyph="○" label="back" color="#ff6b6b" />
      <Hint glyph="△" label="settings" color="#6fdc8c" />
      <Hint glyph="□" label="search" color="#ff7ab8" />
      <div className="flex-1" />
      <span className="text-white/30">V0.1.2</span>
      <span className="text-white/15">|</span>
      <span className="text-white/60 tabular-nums">{time}</span>
    </div>
  );
}

function Hint({ glyph, label, color }: { glyph: string; label: string; color: string }) {
  return (
    <span className="hidden md:inline-flex items-center gap-1.5">
      <FaceGlyph glyph={glyph} color={color} size={13} />
      <span>{label}</span>
    </span>
  );
}

function fmt(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
