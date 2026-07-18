import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, RefreshCw, Play, SearchX } from "lucide-react";
import { CONSOLE_BY_ID, type ConsoleId } from "@/lib/emulators";
import { useStore, type Game } from "@/lib/store";
import { bridge } from "@/lib/ipc";
import { Btn, Pill, GlowDot, paletteFromTitle, titleHash } from "@/lib/ui";

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

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
    // Carry play metadata over a rescan so re-indexing doesn't reset history.
    const prev = new Map(games.filter((g) => g.console === consoleId).map((g) => [g.id, g]));
    const rest = games.filter((g) => g.console !== consoleId);
    setGames([
      ...rest,
      ...found.map<Game>((f) => ({
        ...f,
        console: consoleId,
        lastPlayed: prev.get(f.id)?.lastPlayed,
        playCount: prev.get(f.id)?.playCount,
      })),
    ]);
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
    else if (sort === "size") filtered.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
    else filtered.sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
    return filtered;
  }, [games, consoleId, search, sort]);

  const totalMb = Math.round(list.reduce((sum, g) => sum + (g.size ?? 0), 0) / (1024 * 1024));

  return (
    <div>
      {/* Header block */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex items-start justify-between gap-6 pb-6 mb-5 relative"
      >
        <div className="flex gap-5 items-center">
          <CartridgeIcon accent={c.accent} short={c.shortName} />
          <div>
            <div className="font-mono text-[10px] tracking-[0.24em] text-white/45 uppercase">
              {c.vendor} · {c.year}
            </div>
            <h1
              className="font-display stretch-wide uppercase leading-[1] mt-1.5"
              style={{ fontSize: 40, fontWeight: 360, letterSpacing: "0.005em" }}
            >
              {c.name}
            </h1>
            <div className="flex items-center gap-2.5 mt-3">
              {emuOk ? (
                <Pill accent="#d3fd50" filled>
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
          <Btn variant="primary" accent={c.accent} onClick={pickAndScan}>
            <FolderPlus className="size-3.5" />
            Add ROM folder
          </Btn>
        </div>
        <div className="absolute bottom-0 left-0 right-0 hairline-fade" />
      </motion.div>

      {/* ROM path info */}
      {romDirs[consoleId] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center gap-2.5 px-[14px] py-2.5 rounded-[10px] mb-6 font-mono text-[11px] text-white/55 surface-deep"
        >
          <span className="text-white/35">ROM_PATH</span>
          <span className="text-white/20">/</span>
          <span className="truncate">{romDirs[consoleId]}</span>
          <span className="flex-1" />
          <span className="flex items-center gap-1.5" style={{ color: c.accent }}>
            <GlowDot color={c.accent} pulse size={5} />
            watching
          </span>
        </motion.div>
      )}

      {/* Sort + view toggle */}
      {list.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.35 }}
          className="flex items-center gap-1.5 mb-5"
        >
          <div className="font-mono text-[10px] text-white/40 tracking-[0.18em] mr-2">SORT</div>
          <Chip active={sort === "recent"} onClick={() => setSort("recent")} group="sort">
            Recent
          </Chip>
          <Chip active={sort === "az"} onClick={() => setSort("az")} group="sort">
            A–Z
          </Chip>
          <Chip active={sort === "size"} onClick={() => setSort("size")} group="sort">
            Size
          </Chip>
          <div className="flex-1" />
          <div className="flex items-center gap-0.5 p-[3px] rounded-[9px] surface-deep">
            <ViewToggle icon="grid" active={view === "grid"} onClick={() => setView("grid")} />
            <ViewToggle icon="list" active={view === "list"} onClick={() => setView("list")} />
          </div>
        </motion.div>
      )}

      {scanning && list.length === 0 ? (
        <SkeletonGrid accent={c.accent} />
      ) : list.length === 0 ? (
        search ? (
          <NoResults search={search} />
        ) : (
          <EmptyState consoleName={c.name} accent={c.accent} onPick={pickAndScan} />
        )
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {list.map((g, i) => (
            <GameCard key={g.id} g={g} accent={c.accent} highlight={i === 0 && !search} index={i} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden surface">
          {list.map((g, i) => (
            <GameRow key={g.id} g={g} accent={c.accent} index={i} />
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
  group,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  group: string;
}) {
  return (
    <button
      onClick={onClick}
      data-focusable
      className="relative inline-flex items-center h-[26px] px-3 rounded-full text-[11.5px] font-medium focus-ring"
      style={{ color: active ? "white" : "rgba(255,255,255,0.5)", transition: "color 0.25s" }}
    >
      {active && (
        <motion.span
          layoutId={`chip-${group}`}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.13)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
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
      data-focusable
      className="relative w-8 h-[24px] rounded-[7px] grid place-items-center focus-ring"
      style={{ color: active ? "white" : "rgba(255,255,255,0.4)", transition: "color 0.25s" }}
      title={icon}
    >
      {active && (
        <motion.span
          layoutId="view-toggle"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
          className="absolute inset-0 rounded-[7px]"
          style={{ background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
        />
      )}
      <span className="relative z-10">
        {icon === "grid" ? (
          <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor">
            <rect x="0" y="0" width="4" height="4" rx="0.8" />
            <rect x="6" y="0" width="4" height="4" rx="0.8" />
            <rect x="0" y="6" width="4" height="4" rx="0.8" />
            <rect x="6" y="6" width="4" height="4" rx="0.8" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor">
            <rect x="0" y="1" width="10" height="1.5" rx="0.75" />
            <rect x="0" y="4.25" width="10" height="1.5" rx="0.75" />
            <rect x="0" y="7.5" width="10" height="1.5" rx="0.75" />
          </svg>
        )}
      </span>
    </button>
  );
}

function CartridgeIcon({ accent, short }: { accent: string; short: string }) {
  return (
    <motion.div
      className="relative flex-shrink-0"
      whileHover={{ rotate: -2, y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      style={{
        width: 74,
        height: 80,
        borderRadius: 10,
        background: `linear-gradient(170deg, ${accent} 0%, ${accent}77 100%)`,
        boxShadow: `0 16px 36px -10px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
        border: "1px solid rgba(255,255,255,0.22)",
      }}
    >
      {/* label */}
      <div
        className="absolute grid place-items-center font-display font-black stretch-wide"
        style={{
          top: 9,
          left: 11,
          right: 11,
          bottom: 30,
          borderRadius: 5,
          background: "linear-gradient(180deg, #0d0f15, #090b10)",
          border: "1px solid rgba(0,0,0,0.5)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.6)",
          fontSize: 13,
          color: accent,
          letterSpacing: "0.06em",
          textShadow: `0 0 10px ${accent}`,
        }}
      >
        {short}
      </div>
      {/* grip ridges */}
      <div className="absolute flex gap-[3px]" style={{ bottom: 8, left: "50%", transform: "translateX(-50%)" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 3, height: 12, borderRadius: 2, background: "rgba(0,0,0,0.3)" }} />
        ))}
      </div>
    </motion.div>
  );
}

function GameCard({ g, accent, highlight, index }: { g: Game; accent: string; highlight?: boolean; index: number }) {
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  const [a, b, cc] = paletteFromTitle(g.title);
  const pct = titleHash(g.title, 95, 3);
  return (
    <motion.button
      onClick={async () => {
        setBusy(true);
        await bridge.launch(g.console, g.path);
        useStore.getState().markPlayed(g.id);
        setBusy(false);
      }}
      data-focusable
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + Math.min(index, 11) * 0.04, duration: 0.45, ease: EASE }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileTap={{ scale: 0.97 }}
      className="group text-left flex flex-col gap-2.5 focus-ring"
      style={{ cursor: busy ? "wait" : "pointer" }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "3/4",
          borderRadius: 3,
          background: `linear-gradient(160deg, ${a} 0%, ${cc || b} 100%)`,
          border: `1px solid ${highlight ? accent : hover ? `${accent}70` : "rgba(255,255,255,0.08)"}`,
          boxShadow: highlight
            ? `0 0 0 1px ${accent}55`
            : hover
            ? `0 0 26px ${accent}1e`
            : "none",
          transform: hover ? "translateY(-4px)" : "translateY(0)",
          transition: "transform 0.35s var(--ease-glide), box-shadow 0.35s var(--ease-glide), border-color 0.35s var(--ease-glide)",
        }}
      >
        <div className="absolute inset-0 scanlines-strong" />
        <div className="crt-sweep" style={{ opacity: hover ? 1 : 0.4, transition: "opacity 0.4s" }} />
        <div className="absolute top-2 left-2.5 font-mono text-[8.5px] tracking-[0.18em] text-white/50">
          № {String(index + 1).padStart(3, "0")}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="font-display font-black stretch-narrow uppercase text-center text-white"
            style={{
              fontSize: 34,
              textShadow: "0 2px 0 rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.5)",
              mixBlendMode: "overlay",
              padding: "0 14px",
              lineHeight: 0.95,
            }}
          >
            {g.title.split(":")[0].slice(0, 14)}
          </div>
        </div>
        <div
          className="absolute left-0 right-0 bottom-0 px-3 py-2.5"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.88) 100%)" }}
        >
          <div className="flex items-center justify-between mb-1.5 font-mono text-[9px] tracking-[0.12em]">
            <span className="text-white/60">{busy ? "LAUNCHING…" : "▶ PLAY"}</span>
            <span className="text-white font-semibold">{pct}%</span>
          </div>
          <div className="h-[2.5px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.16)" }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 + Math.min(index, 11) * 0.04 }}
              style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
            />
          </div>
        </div>
        {highlight && (
          <div
            className="absolute top-2 right-2 font-mono text-[8px] tracking-[0.18em] font-bold px-1.5 py-[2.5px]"
            style={{ color: "#0a0b05", background: accent }}
          >
            LATEST
          </div>
        )}
        {/* launching overlay */}
        <AnimatePresence>
          {busy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 grid place-items-center"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-full"
                  style={{ border: `2px solid ${accent}40`, borderTopColor: accent }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                />
                <span className="font-mono text-[9px] tracking-[0.2em] text-white/80">BOOTING</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        <div className="text-[13px] font-medium leading-tight truncate">{g.title}</div>
        <div className="font-mono text-[9.5px] tracking-[0.1em] text-white/40 mt-1 flex items-center gap-1.5">
          <GlowDot color={accent} size={5} />
          <span>{g.console.toUpperCase()}</span>
          <span className="text-white/20">·</span>
          <span>ROM</span>
        </div>
      </div>
    </motion.button>
  );
}

function GameRow({ g, accent, index }: { g: Game; accent: string; index: number }) {
  const [busy, setBusy] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 + Math.min(index, 15) * 0.03, duration: 0.35, ease: EASE }}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.035]"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.045)" }}
    >
      <GlowDot color={accent} />
      <span className="font-mono text-[10px] text-white/45 w-10 tracking-[0.1em]">{g.console.toUpperCase()}</span>
      <span className="flex-1 text-[13.5px] truncate font-medium">{g.title}</span>
      <span className="font-mono text-[10.5px] text-white/35 truncate max-w-[44%]">{g.path}</span>
      <Btn
        variant="primary"
        size="sm"
        accent={accent}
        onClick={async () => {
          setBusy(true);
          await bridge.launch(g.console, g.path);
          useStore.getState().markPlayed(g.id);
          setBusy(false);
        }}
      >
        {busy ? "…" : "Play"}
      </Btn>
    </motion.div>
  );
}

function SkeletonGrid({ accent }: { accent: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col gap-2.5"
        >
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "3/4", borderRadius: 3, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <motion.div
              className="absolute top-0 bottom-0 w-1/2"
              style={{ background: `linear-gradient(100deg, transparent, ${accent}14, transparent)` }}
              animate={{ x: ["-100%", "220%"] }}
              transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.12, ease: "easeInOut" }}
            />
          </div>
          <div className="h-3 rounded w-3/4" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="h-2 rounded w-1/3" style={{ background: "rgba(255,255,255,0.035)" }} />
        </motion.div>
      ))}
    </div>
  );
}

function NoResults({ search }: { search: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-12 text-center surface"
    >
      <SearchX className="size-6 text-white/30 mx-auto mb-4" />
      <h3 className="font-display font-bold stretch-wide uppercase text-[18px]">No matches for “{search}”</h3>
      <p className="text-white/45 mt-2 text-[13px]">Try a shorter title or clear the search.</p>
    </motion.div>
  );
}

function EmptyState({ consoleName, accent, onPick }: { consoleName: string; accent: string; onPick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="p-12 text-center relative overflow-hidden surface"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(60% 80% at 50% 0%, ${accent}10 0%, transparent 60%)` }}
      />
      <div
        className="mx-auto w-12 h-12 grid place-items-center mb-5 relative"
        style={{
          border: `1px solid ${accent}35`,
          background: `${accent}0d`,
          boxShadow: `0 0 30px ${accent}18`,
          color: accent,
        }}
      >
        <FolderPlus className="size-5" />
      </div>
      <h3 className="font-display font-black stretch-wide uppercase text-[22px] relative">No {consoleName} yet</h3>
      <p className="text-white/45 mt-2.5 text-[13.5px] max-w-sm mx-auto leading-relaxed relative">
        Point ConsoleMini at a folder of ROMs — we index them and hand the selected title to {consoleName}. We never
        bundle copyrighted content.
      </p>
      <div className="mt-6 relative">
        <Btn variant="primary" size="lg" accent={accent} onClick={onPick}>
          <FolderPlus className="size-4" /> Choose ROM folder
        </Btn>
      </div>
    </motion.div>
  );
}
