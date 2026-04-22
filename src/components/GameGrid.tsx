import { motion, AnimatePresence } from "framer-motion";
import { Play, FolderPlus, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { CONSOLE_BY_ID } from "@/lib/emulators";
import { useStore, type Game } from "@/lib/store";
import { bridge } from "@/lib/ipc";

export function GameGrid({ consoleId }: { consoleId: import("@/lib/emulators").ConsoleId }) {
  const c = CONSOLE_BY_ID[consoleId];
  const { games, addGames, romDirs, setRomDir, search } = useStore();
  const [emuOk, setEmuOk] = useState<boolean | null>(null);
  const list = games.filter(
    (g) => g.console === consoleId && g.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    bridge.checkEmulator(consoleId).then((r) => setEmuOk(r.installed));
  }, [consoleId]);

  const pickAndScan = async () => {
    const dir = await bridge.pickRomDir(consoleId);
    if (!dir) return;
    setRomDir(consoleId, dir);
    const found = await bridge.scanRoms(consoleId, dir);
    addGames(found.map<Game>((f) => ({ ...f, console: consoleId })));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">
            {c.vendor} - {c.year}
          </div>
          <h2 className="font-display text-3xl font-bold mt-1">{c.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {emuOk === false && (
            <span className="pill bg-neon-amber/15 text-neon-amber border border-neon-amber/30">
              <AlertTriangle className="size-3" /> {c.emulator.name} not installed
            </span>
          )}
          {emuOk && (
            <span className="pill bg-neon-lime/15 text-neon-lime border border-neon-lime/30">
              {c.emulator.name} ready
            </span>
          )}
          <button
            onClick={pickAndScan}
            className="px-4 py-2 rounded-xl glass border-white/10 hover:border-white/30 text-sm flex items-center gap-2 focus-ring"
          >
            <FolderPlus className="size-4" /> Add ROM folder
          </button>
        </div>
      </div>

      {romDirs[consoleId] && (
        <p className="text-xs text-white/50 font-mono">ROMs: {romDirs[consoleId]}</p>
      )}

      <AnimatePresence mode="popLayout">
        {list.length === 0 ? (
          <EmptyState consoleName={c.shortName} onPick={pickAndScan} />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {list.map((g) => (
              <GameTile key={g.id} game={g} accent={c.accent} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GameTile({ game, accent }: { game: Game; accent: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <motion.button
      layout
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={async () => {
        setBusy(true);
        await bridge.launch(game.console, game.path);
        setBusy(false);
      }}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden glass-strong focus-ring text-left"
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${accent}33, transparent 70%)` }} />
      <div className="absolute inset-0 grid-bg opacity-30 mix-blend-overlay" />
      {game.cover && (
        <img src={game.cover} alt={game.title} className="absolute inset-0 size-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/30 to-transparent" />
      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        <div className="font-semibold text-sm leading-tight line-clamp-2">{game.title}</div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/60 font-mono">
          <span>{game.console.toUpperCase()}</span>
          <span className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" style={{ color: accent }}>
            <Play className="size-3" /> {busy ? "Launching" : "Play"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function EmptyState({ consoleName, onPick }: { consoleName: string; onPick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl glass-strong p-12 text-center"
    >
      <div className="mx-auto size-16 rounded-2xl bg-white/5 grid place-items-center mb-4">
        <FolderPlus className="size-7 text-white/60" />
      </div>
      <h3 className="font-display text-xl font-semibold">No {consoleName} games yet</h3>
      <p className="text-white/50 mt-1 max-w-md mx-auto">
        Point ConsoleMini at a folder of ROMs and we will index them. We never bundle copyrighted ROMs - bring your own.
      </p>
      <button onClick={onPick} className="mt-5 px-5 py-2.5 rounded-xl bg-white text-ink-900 font-semibold text-sm focus-ring">
        Choose ROM folder
      </button>
    </motion.div>
  );
}
