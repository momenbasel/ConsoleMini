import { motion } from "framer-motion";
import { Play, Zap } from "lucide-react";
import { CONSOLES } from "@/lib/emulators";
import { useStore } from "@/lib/store";

export function Hero() {
  const { setSelectedConsole } = useStore();
  const featured = CONSOLES.slice(0, 4);

  return (
    <div className="relative h-72 rounded-3xl overflow-hidden glass-strong">
      <div className="absolute inset-0 bg-aurora opacity-90" />
      <div className="absolute inset-0 grid-bg opacity-40 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />

      <div className="relative h-full flex flex-col justify-between p-8">
        <div className="flex items-center gap-2">
          <span className="pill bg-neon-lime/15 text-neon-lime border border-neon-lime/30">
            <Zap className="size-3" /> Living-room mode
          </span>
          <span className="pill bg-white/5 text-white/60 border border-white/10">macOS / Apple Silicon</span>
        </div>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl font-bold leading-tight"
          >
            Your <span className="text-gradient">Mac mini</span>,
            <br /> reborn as a console.
          </motion.h2>
          <p className="mt-3 text-white/60 max-w-xl">
            Plug a controller. Pick a system. Play. PS1 to PS4, plus the classics - one beautiful big-picture launcher built for the couch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {featured.map((c) => (
            <motion.button
              key={c.id}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedConsole(c.id)}
              className="group relative px-4 py-2.5 rounded-xl glass border border-white/10 hover:border-white/30 transition focus-ring"
            >
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition" style={{ boxShadow: `inset 0 0 0 1px ${c.accent}55` }} />
              <span className="flex items-center gap-2 text-sm">
                <span className="size-2 rounded-full" style={{ background: c.accent, boxShadow: `0 0 10px ${c.accent}` }} />
                <span className="font-semibold">{c.shortName}</span>
                <Play className="size-3 opacity-60" />
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
