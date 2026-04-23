import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { KeyCap } from "@/lib/ui";

export function Topbar({ right }: { right?: ReactNode }) {
  const { search, setSearch } = useStore();
  return (
    <div
      className="h-12 px-5 flex items-center gap-4 flex-shrink-0"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.012) 0%, transparent 100%)",
      }}
    >
      <div className="flex-1 max-w-[380px] relative no-drag">
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.4"
          className="absolute left-[10px] top-1/2 -translate-y-1/2"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5 l3 3" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games, systems…"
          className="w-full h-7 rounded-[7px] pl-[30px] pr-10 text-[12.5px] text-white placeholder:text-white/30 focus-ring"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9.5px] text-white/30 rounded px-1.5 py-[1px]"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          ⌘K
        </span>
      </div>
      <div className="flex-1" />
      {right}
      <div className="flex items-center gap-2 font-mono text-[9.5px] text-white/40 tracking-[0.13em] uppercase no-drag">
        <KeyCap>F11</KeyCap>
        <span>fullscreen</span>
        <span className="text-white/20">·</span>
        <KeyCap>Esc</KeyCap>
        <span>back</span>
      </div>
    </div>
  );
}
