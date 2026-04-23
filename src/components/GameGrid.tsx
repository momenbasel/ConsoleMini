import { useEffect, useMemo, useState } from "react";
import { FolderPlus, RefreshCw } from "lucide-react";
import { CONSOLE_BY_ID, type ConsoleId } from "@/lib/emulators";
import { useStore, type Game } from "@/lib/store";
import { bridge } from "@/lib/ipc";
import { Btn, Pill, paletteFromTitle } from "@/lib/ui";

export function GameGrid({ consoleId }: { consoleId: ConsoleId }) {
  const c = CONSOLE_BY_ID[consoleId];
  const { games, setGames, romDirs, setRomDir, search } = useStore();
  const [emuOk, setEmuOk] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [sort, setSort] = useState<"recent" | "az" | "size">("recent");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    bridge.checkEmulator(consoleId).then((r) => setEmuOk(r.installed));
  }, [consoleId]);

  const scanDir = async (dir: string) => {
    setScanning(true);
    const found = await bridge.scanRoms(consoleId, dir);
    const rest = games.filter((g) => g.console !== consoleId);
    setGames([...rest, ...found.map<Game>((f) => ({ ...f, console: consoleId }))]);
    setScanning(false);
  };

  const pickAndScan = async () => {
    const dir = await bridge.pickRomDir(consoleId);
    if (!dir) return;
    setRomDir(consoleId, dir);
    await scanDir(dir);
  };

  const rescan = async () => {
    const dir = romDirs[consoleId];
    if (dir) await scanDir(dir);
    else pickAndScan();
  };

  const list = useMemo(() => {
    const filtered = games.filter(
      (g) => g.console === consoleId && g.title.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "az") filtered.sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }, [games, consoleId, search, sort]);

  const totalMb = list.length * 8;

  return (
    <div>
      {/* Header block */}
      <div
        className="flex items-start justify-between gap-6 pb-5 mb-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex gap-[18px] items-center">
          <CartridgeIcon accent={c.accent} short={c.shortName} />
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase">
              {c.vendor} · {c.year}
            </div>
            <h1 className="font-display font-bold tracking-tightest mt-1 leading-[1.05]" style={{ fontSize: 36 }}>
              {c.name}
            </h1>
            <div className="flex items-center gap-2.5 mt-2.5">
              {emuOk ? (
                <Pill accent="#c6ff3d" filled>
                  ● {c.emulator.name.toUpperCase()} READY
                </Pill>
              ) : emuOk === false ? (
                <Pill accent="#ff9f47">⚠ {c.emulator.name.toUpperCase()} MISSING</Pill>
              ) : (
                <Pill>CHECKING…</Pill>
              )}
              <span className="font-mono text-[10.5px] text-white/50">
                {list.length} ROMS{list.length ? ` · ~${totalMb} MB` : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {romDirs[consoleId] && (
            <Btn variant="ghost" onClick={rescan} disabled={scanning}>
              <RefreshCw className={"size-3 " + (scanning ? "animate-spin" : "")} />
              {scanning ? "scanning…" : "Rescan"}
            </Btn>
          )}
          <Btn variant="default" onClick={pickAndScan}>
            <FolderPlus className="size-3.5" />
            Add ROM folder
          </Btn>
        </div>
      </div>

      {/* ROM path info */}
      {romDirs[consoleId] && (
        <div
          className="flex items-center gap-2.5 px-[14px] py-2.5 rounded-[10px] mb-6 font-mono text-[11px] text-white/55"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="text-white/35">ROM_PATH</span>
          <span className="text-white/20">/</span>
          <span className="truncate">{romDirs[consoleId]}</span>
          <span className="flex-1" />
          <span style={{ color: c.accent }}>● watching</span>
        </div>
      )}

      {/* Sort + view toggle */}
      {list.length > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          <div className="font-mono text-[10px] text-white/40 tracking-[0.15em] mr-1.5">SORT</div>
          <Chip active={sort === "recent"} onClick={() => setSort("recent")}>
            Recent
          </Chip>
          <Chip active={sort === "az"} onClick={() => setSort("az")}>
            A–Z
          </Chip>
          <Chip active={sort === "size"} onClick={() => setSort("size")}>
            Size
          </Chip>
          <div className="flex-1" />
          <div
            className="flex items-center gap-0.5 p-[2px] rounded-[7px]"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <ViewToggle icon="grid" active={view === "grid"} onClick={() => setView("grid")} />
            <ViewToggle icon="list" active={view === "list"} onClick={() => setView("list")} />
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState consoleName={c.name} onPick={pickAndScan} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {list.map((g, i) => (
            <GameCard key={g.id} g={g} accent={c.accent} highlight={i === 0} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {list.map((g) => (
            <GameRow key={g.id} g={g} accent={c.accent} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-medium focus-ring"
      style={{
        color: active ? "white" : "rgba(255,255,255,0.55)",
        background: active ? "rgba(255,255,255,0.08)" : "transparent",
        border: `1px solid ${active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      {children}
    </button>
  );
}

function ViewToggle({
  icon,
  active,
  onClick,
}: {
  icon: "grid" | "list";
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-6 h-[22px] rounded-[5px] grid place-items-center focus-ring"
      style={{
        background: active ? "rgba(255,255,255,0.08)" : "transparent",
        color: active ? "white" : "rgba(255,255,255,0.4)",
      }}
      title={icon}
    >
      {icon === "grid" ? (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <rect x="0" y="0" width="4" height="4" rx="0.5" />
          <rect x="6" y="0" width="4" height="4" rx="0.5" />
          <rect x="0" y="6" width="4" height="4" rx="0.5" />
          <rect x="6" y="6" width="4" height="4" rx="0.5" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <rect x="0" y="1" width="10" height="1.5" rx="0.75" />
          <rect x="0" y="4.25" width="10" height="1.5" rx="0.75" />
          <rect x="0" y="7.5" width="10" height="1.5" rx="0.75" />
        </svg>
      )}
    </button>
  );
}

function CartridgeIcon({ accent, short }: { accent: string; short: string }) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: 68,
        height: 72,
        borderRadius: 8,
        background: `linear-gradient(180deg, ${accent} 0%, ${accent}88 100%)`,
        boxShadow: `0 10px 28px -8px ${accent}66`,
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <div
        className="absolute grid place-items-center font-mono font-bold"
        style={{
          top: 8,
          left: 10,
          right: 10,
          bottom: 26,
          borderRadius: 4,
          background: "#0e1016",
          border: "1px solid rgba(0,0,0,0.4)",
          fontSize: 11,
          color: accent,
          letterSpacing: "0.08em",
        }}
      >
        {short}
      </div>
      <div
        className="absolute"
        style={{ bottom: 6, left: "50%", transform: "translateX(-50%)", width: 24, height: 3, borderRadius: 99, background: "rgba(0,0,0,0.3)" }}
      />
    </div>
  );
}

function GameCard({ g, accent, highlight }: { g: Game; accent: string; highlight?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [a, b, c] = paletteFromTitle(g.title);
  const pct = deterministicPct(g.title);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        await bridge.launch(g.console, g.path);
        setBusy(false);
      }}
      className="text-left flex flex-col gap-2.5 focus-ring"
      style={{ cursor: busy ? "wait" : "pointer" }}
    >
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          aspectRatio: "3/4",
          background: `linear-gradient(160deg, ${a} 0%, ${c || b} 100%)`,
          border: `1px solid ${highlight ? "#c6ff3d" : "rgba(255,255,255,0.07)"}`,
          boxShadow: highlight
            ? "0 0 0 3px rgba(198,255,61,0.15), 0 18px 40px -12px rgba(0,0,0,0.6)"
            : "0 10px 30px -10px rgba(0,0,0,0.5)",
        }}
      >
        <div className="absolute inset-0 scanlines-strong" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="font-display font-extrabold tracking-[-0.05em] text-center text-white"
            style={{
              fontSize: 36,
              textShadow: "0 2px 0 rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.5)",
              mixBlendMode: "overlay",
              padding: "0 12px",
              lineHeight: 1,
            }}
          >
            {g.title.split(":")[0].slice(0, 14)}
          </div>
        </div>
        <div
          className="absolute left-0 right-0 bottom-0 px-3 py-2.5"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)" }}
        >
          <div className="flex items-center justify-between mb-1.5 font-mono text-[9px] tracking-[0.12em]">
            <span className="text-white/60">{busy ? "LAUNCHING…" : "▶ PLAY"}</span>
            <span className="text-white font-semibold">{pct}%</span>
          </div>
          <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div
              className="h-full"
              style={{ width: `${pct}%`, background: accent }}
            />
          </div>
        </div>
        {highlight && (
          <div
            className="absolute top-2 left-2 font-mono text-[9px] tracking-[0.15em] font-bold px-1.5 py-[2px] rounded"
            style={{ color: "#0b0b0b", background: "#c6ff3d" }}
          >
            LATEST
          </div>
        )}
      </div>
      <div>
        <div className="text-[13px] font-medium leading-tight truncate">{g.title}</div>
        <div className="font-mono text-[9.5px] tracking-[0.1em] text-white/40 mt-0.5 flex items-center gap-1.5">
          <span>{g.console.toUpperCase()}</span>
          <span className="text-white/20">·</span>
          <span>ROM</span>
        </div>
      </div>
    </button>
  );
}

function GameRow({ g, accent }: { g: Game; accent: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 bg-[#0c0e14]"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
      />
      <span className="font-mono text-[10px] text-white/45 w-10 tracking-[0.1em]">{g.console.toUpperCase()}</span>
      <span className="flex-1 text-[13px] truncate">{g.title}</span>
      <span className="font-mono text-[10.5px] text-white/40 truncate max-w-[50%]">{g.path}</span>
      <Btn
        variant="primary"
        size="sm"
        onClick={async () => {
          setBusy(true);
          await bridge.launch(g.console, g.path);
          setBusy(false);
        }}
      >
        {busy ? "…" : "Play"}
      </Btn>
    </div>
  );
}

function EmptyState({ consoleName, onPick }: { consoleName: string; onPick: () => void }) {
  return (
    <div
      className="rounded-xl p-10 text-center"
      style={{ background: "#0c0e14", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div
        className="mx-auto w-10 h-10 grid place-items-center rounded-md mb-4 text-white/40"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <FolderPlus className="size-4" />
      </div>
      <h3 className="font-display font-semibold text-[20px] tracking-tightest">No {consoleName} yet</h3>
      <p className="text-white/45 mt-2 text-[13px] max-w-sm mx-auto leading-relaxed">
        Point ConsoleMini at a folder of ROMs — we index them and hand the selected title to {consoleName}. We never
        bundle copyrighted content.
      </p>
      <div className="mt-5">
        <Btn variant="primary" onClick={onPick}>
          <FolderPlus className="size-3.5" /> Choose ROM folder
        </Btn>
      </div>
    </div>
  );
}

function deterministicPct(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 95) + 3;
}
