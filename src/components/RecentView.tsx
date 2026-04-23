import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { CONSOLE_BY_ID } from "@/lib/emulators";
import { useStore, type Game } from "@/lib/store";
import { bridge } from "@/lib/ipc";
import { Btn, Pill, paletteFromTitle } from "@/lib/ui";

export function RecentView() {
  const { games, search, setSelectedConsole } = useStore();

  const list = useMemo(() => {
    const filtered = games.filter((g) =>
      g.title.toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered].sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
  }, [games, search]);

  if (list.length === 0) {
    return (
      <div>
        <Header />
        <div
          className="rounded-xl p-10 text-center mt-4"
          style={{ background: "#0c0e14", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h3 className="font-display font-semibold text-[20px] tracking-tightest">Nothing played yet</h3>
          <p className="text-white/45 mt-2 text-[13px] max-w-sm mx-auto leading-relaxed">
            Indexed ROMs across all systems will show up here, most recent first.
          </p>
          <div className="mt-5 flex justify-center">
            <Btn variant="primary" onClick={() => setSelectedConsole("gba")}>
              Open a system
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header count={list.length} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
        {list.map((g) => (
          <RecentTile key={g.id} g={g} />
        ))}
      </div>
    </div>
  );
}

function Header({ count }: { count?: number }) {
  return (
    <div
      className="flex items-end justify-between pb-5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div>
        <div className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase">
          HISTORY / RECENT
        </div>
        <h1
          className="font-display font-bold tracking-tightest mt-1 leading-[1.05]"
          style={{ fontSize: 36 }}
        >
          Jump back in
        </h1>
      </div>
      {count != null && (
        <Pill>{count} TITLES</Pill>
      )}
    </div>
  );
}

function RecentTile({ g }: { g: Game }) {
  const [busy, setBusy] = useState(false);
  const c = CONSOLE_BY_ID[g.console];
  const [a, b] = paletteFromTitle(g.title);
  const pct = deterministicPct(g.title);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        await bridge.launch(g.console, g.path);
        setBusy(false);
      }}
      className="text-left flex flex-col gap-2 focus-ring"
    >
      <div
        className="relative overflow-hidden rounded-[10px]"
        style={{
          aspectRatio: "3/4",
          background: `linear-gradient(160deg, ${a} 0%, ${b} 100%)`,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
        }}
      >
        <div className="absolute inset-0 scanlines-strong" />
        <div
          className="absolute left-0 right-0 bottom-0 px-2.5 py-2"
          style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.7))" }}
        >
          <div className="font-mono text-[8.5px] tracking-[0.14em] text-white/70">
            {pct}% · <span className="text-white">{busy ? "LAUNCHING…" : "▶ PLAY"}</span>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <span
            className="w-1.5 h-1.5 rounded-full block"
            style={{ background: c.accent, boxShadow: `0 0 6px ${c.accent}` }}
          />
        </div>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <Play className="size-6 text-white/70 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
        </div>
      </div>
      <div>
        <div className="text-[12px] font-medium truncate">{g.title}</div>
        <div className="font-mono text-[9.5px] text-white/40 tracking-[0.1em] mt-0.5">
          {g.console.toUpperCase()} · {c.emulator.name.toUpperCase()}
        </div>
      </div>
    </button>
  );
}

function deterministicPct(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 95) + 3;
}
