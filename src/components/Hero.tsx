import { useMemo } from "react";
import { CONSOLE_BY_ID, CONSOLES } from "@/lib/emulators";
import { useStore } from "@/lib/store";
import { Btn, XGlyph, Pill, paletteFromTitle } from "@/lib/ui";
import { bridge } from "@/lib/ipc";

export function Hero() {
  const { games, setSelectedConsole } = useStore();

  const last = useMemo(() => {
    // most recently touched / first indexed title as "continue"
    if (games.length === 0) return null;
    const sorted = [...games].sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
    return sorted[0];
  }, [games]);

  if (!last) {
    return <EmptyHero onPick={(id) => setSelectedConsole(id)} />;
  }

  const c = CONSOLE_BY_ID[last.console];
  const palette = paletteFromTitle(last.title);
  const pct = Math.min(99, Math.max(3, (last.playCount ?? 3) * 6)); // deterministic fake progress
  const initials = last.title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <section
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{ background: "#0c0e14", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="grid min-h-[240px]" style={{ gridTemplateColumns: "minmax(260px, 360px) 1fr" }}>
        {/* CRT cover panel */}
        <div
          className="relative overflow-hidden"
          style={{
            background: `radial-gradient(120% 100% at 20% 20%, ${palette[0]} 0%, ${palette[1]} 60%, #060910 100%)`,
          }}
        >
          <div className="absolute inset-0 scanlines opacity-60" />
          <div className="absolute inset-0 grid place-items-center">
            <div
              className="w-[180px] h-[180px] rounded-[18px] grid place-items-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 100%)`,
                border: `2px solid ${c.accent}66`,
                boxShadow: `0 0 40px ${c.accent}30, inset 0 0 30px rgba(0,0,0,0.4)`,
              }}
            >
              <div
                className="font-display font-extrabold leading-[0.9] tracking-[-0.05em]"
                style={{
                  fontSize: 64,
                  color: c.accent,
                  textShadow: `0 0 20px ${c.accent}99, 4px 4px 0 rgba(0,0,0,0.4)`,
                }}
              >
                {initials || "??"}
              </div>
              <div className="absolute left-3 right-3 bottom-2.5 text-center font-mono text-[8.5px] tracking-[0.14em] text-white/50">
                {c.shortName} · {c.year}
              </div>
            </div>
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)" }}
          />
          <div className="absolute top-[14px] left-[14px] flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.14em] text-white/75">
            <span
              className="w-1.5 h-1.5 rounded-full animate-cmpulse"
              style={{ background: "#ff3366", boxShadow: "0 0 8px #ff3366" }}
            />
            RESUME · SAVE STATE {String((last.playCount ?? 1) % 9 || 1).padStart(2, "0")}
          </div>
        </div>

        {/* Info column */}
        <div className="p-7 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] text-white/40">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.accent }} />
              {c.shortName} · {c.vendor.toUpperCase()} · {c.year}
            </div>
            <h1 className="font-display font-bold leading-[1.05] tracking-tightest mt-2" style={{ fontSize: 40 }}>
              {last.title}
            </h1>
            <div className="text-[13px] text-white/55 mt-1.5">
              Last played · {pct}% complete · {c.emulator.name}
            </div>
          </div>

          <div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #5fbf6f, #c6ff3d)",
                  boxShadow: "0 0 12px rgba(198,255,61,0.5)",
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Btn
              variant="primary"
              size="lg"
              accent="#c6ff3d"
              onClick={() => bridge.launch(last.console, last.path)}
            >
              <svg width="11" height="11" viewBox="0 0 10 10">
                <path d="M1 1 L9 5 L1 9 Z" fill="currentColor" />
              </svg>
              Resume
              <span
                className="inline-flex items-center gap-1 font-mono text-[9.5px] rounded-[4px] px-1.5 py-[2px]"
                style={{ background: "rgba(0,0,0,0.2)" }}
              >
                <XGlyph /> Press
              </span>
            </Btn>
            <Btn variant="ghost" size="lg">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="12" height="10" rx="1.5" />
                <path d="M5 6v4 M8 6v4 M11 6v4" />
              </svg>
              Save states
            </Btn>
            <Btn variant="ghost" size="lg">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="5.5" />
                <path d="M8 4.5V8l2.5 1.5" />
              </svg>
              Rewind
            </Btn>
            <div className="flex-1" />
            <Pill accent="#c6ff3d" filled>
              ● LIVING-ROOM
            </Pill>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyHero({ onPick }: { onPick: (id: (typeof CONSOLES)[number]["id"]) => void }) {
  return (
    <section
      className="relative rounded-2xl overflow-hidden mb-6 p-7"
      style={{ background: "#0c0e14", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_#c6ff3d]" />
        LIVING-ROOM MODE · APPLE SILICON
      </div>
      <h1 className="font-display font-bold leading-[1.05] tracking-tightest mt-2" style={{ fontSize: 40 }}>
        A quiet launcher for the <span className="text-accent">couch</span>.
      </h1>
      <p className="mt-2 text-[13.5px] text-white/55 max-w-xl leading-relaxed">
        Point ConsoleMini at a folder of ROMs — we index them and hand them to the right emulator. Plug a controller,
        sit back.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {CONSOLES.slice(0, 6).map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c.id)}
            className="h-8 px-3 rounded-md flex items-center gap-2 text-[12px] focus-ring"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.accent, boxShadow: `0 0 6px ${c.accent}` }} />
            <span className="font-mono text-[10px] text-white/45 w-8">{c.shortName}</span>
            <span className="text-white/75">{c.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
