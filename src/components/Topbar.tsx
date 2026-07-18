import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { KeyCap } from "@/lib/ui";

export function Topbar({ right }: { right?: ReactNode }) {
  const { search, setSearch, games } = useStore();
  return (
    <div
      className="h-[52px] px-6 flex items-center gap-5 flex-shrink-0"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.014) 0%, transparent 100%)",
      }}
    >
      <div className="flex-1 max-w-[420px] relative no-drag group/search">
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.4"
          className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5 l3 3" />
        </svg>
        <input
          id="global-search"
          data-focusable
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && search) {
              e.stopPropagation();
              setSearch("");
            }
          }}
          placeholder="Search your library…"
          className="w-full h-[30px] rounded-[8px] pl-[31px] pr-11 text-[12.5px] text-white placeholder:text-white/30 focus-ring"
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.07)",
            transition: "border-color 0.25s var(--ease-glide), box-shadow 0.25s var(--ease-glide), background 0.25s var(--ease-glide)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(211,253,80,0.45)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(211,253,80,0.12), 0 0 20px rgba(211,253,80,0.08)";
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = "rgba(255,255,255,0.035)";
          }}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="w-[18px] h-[18px] rounded-full grid place-items-center text-white/50 hover:text-white hover:bg-white/10 text-[10px]"
              title="Clear"
            >
              ✕
            </button>
          ) : (
            <KeyCap>⌘K</KeyCap>
          )}
        </span>
      </div>
      <div className="flex-1" />
      {right}
      <div className="hidden md:flex items-center gap-2.5 font-mono text-[9.5px] text-white/40 tracking-[0.13em] uppercase no-drag">
        {search && (
          <span className="text-white/55 normal-case tracking-normal">
            {games.filter((g) => g.title.toLowerCase().includes(search.toLowerCase())).length} match
          </span>
        )}
        <KeyCap>F11</KeyCap>
        <span>fullscreen</span>
        <span className="text-white/20">·</span>
        <KeyCap>Esc</KeyCap>
        <span>back</span>
      </div>
    </div>
  );
}
