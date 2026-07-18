import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, History } from "lucide-react";
import { CONSOLE_BY_ID, CONSOLES } from "@/lib/emulators";
import { useStore, type Game } from "@/lib/store";
import { bridge } from "@/lib/ipc";
import { Btn, Pill, GlowDot, paletteFromTitle, titleHash } from "@/lib/ui";

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export function RecentView() {
  const { games, search, setSelectedConsole } = useStore();

  const list = useMemo(() => {
    const filtered = games.filter(
      (g) => g.lastPlayed != null && g.title.toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered].sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
  }, [games, search]);

  if (list.length === 0) {
    return (
      <div>
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
          className="p-12 text-center mt-6 relative overflow-hidden surface"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(211,253,80,0.06) 0%, transparent 60%)" }}
          />
          <div
            className="mx-auto w-12 h-12 grid place-items-center mb-5 relative text-white/50"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
          >
            <History className="size-5" />
          </div>
          <h3 className="font-display font-black stretch-wide uppercase text-[22px] relative">Nothing played yet</h3>
          <p className="text-white/45 mt-2.5 text-[13.5px] max-w-sm mx-auto leading-relaxed relative">
            Indexed ROMs across all systems will show up here, most recent first.
          </p>
          <div className="mt-6 flex justify-center relative">
            <Btn variant="primary" size="lg" onClick={() => setSelectedConsole(CONSOLES[0].id)}>
              Open a system
            </Btn>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <Header count={list.length} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
        {list.map((g, i) => (
          <RecentTile key={g.id} g={g} index={i} />
        ))}
      </div>
    </div>
  );
}

function Header({ count }: { count?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-end justify-between pb-6 relative"
    >
      <div>
        <div className="font-mono text-[10px] tracking-[0.24em] text-white/45 uppercase">HISTORY / RECENT</div>
        <h1 className="font-display stretch-wide uppercase leading-[1] mt-1.5" style={{ fontSize: 40, fontWeight: 360 }}>
          Jump back in
        </h1>
      </div>
      {count != null && <Pill accent="#d3fd50" filled>{count} TITLES</Pill>}
      <div className="absolute bottom-0 left-0 right-0 hairline-fade" />
    </motion.div>
  );
}

function RecentTile({ g, index }: { g: Game; index: number }) {
  const [busy, setBusy] = useState(false);
  const c = CONSOLE_BY_ID[g.console];
  const [a, b] = paletteFromTitle(g.title);
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + Math.min(index, 11) * 0.04, duration: 0.4, ease: EASE }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
      className="group text-left flex flex-col gap-2 focus-ring"
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "3/4",
          borderRadius: 3,
          background: `linear-gradient(160deg, ${a} 0%, ${b} 100%)`,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="absolute inset-0 scanlines-strong" />
        <div className="absolute top-2 left-2.5 font-mono text-[8.5px] tracking-[0.18em] text-white/50">
          № {String(index + 1).padStart(3, "0")}
        </div>
        <div
          className="absolute left-0 right-0 bottom-0 px-2.5 py-2"
          style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))" }}
        >
          <div className="font-mono text-[8.5px] tracking-[0.14em] text-white/70">
            {pct}% · <span className="text-white">{busy ? "LAUNCHING…" : "▶ PLAY"}</span>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <GlowDot color={c.accent} size={6} />
        </div>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <motion.div
            className="w-10 h-10 rounded-full grid place-items-center"
            style={{
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(4px)",
            }}
            whileHover={{ scale: 1.12 }}
          >
            <Play className="size-4 text-white ml-0.5" fill="currentColor" />
          </motion.div>
        </div>
        <AnimatePresence>
          {busy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: "rgba(0,0,0,0.5)" }}
            />
          )}
        </AnimatePresence>
      </div>
      <div>
        <div className="text-[12.5px] font-medium truncate">{g.title}</div>
        <div className="font-mono text-[9px] text-white/40 tracking-[0.1em] mt-1">
          {g.console.toUpperCase()} · {c.emulator.name.toUpperCase()}
        </div>
      </div>
    </motion.button>
  );
}
