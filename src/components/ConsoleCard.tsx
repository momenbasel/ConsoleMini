import { motion } from "framer-motion";
import { ArrowRight, Cpu, Calendar } from "lucide-react";
import type { ConsoleSpec } from "@/lib/emulators";
import { useStore } from "@/lib/store";

export function ConsoleCard({ c, count }: { c: ConsoleSpec; count: number }) {
  const setSelectedConsole = useStore((s) => s.setSelectedConsole);
  return (
    <motion.button
      onClick={() => setSelectedConsole(c.id)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative h-56 rounded-3xl overflow-hidden glass-strong text-left focus-ring"
      style={{ boxShadow: "0 30px 60px -25px rgba(0,0,0,0.7)" }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-90`} />
      <div className="absolute inset-0 grid-bg opacity-30 mix-blend-overlay" />
      <div className="absolute -top-20 -right-20 size-72 rounded-full blur-3xl opacity-50" style={{ background: c.accent }} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />

      <div className="relative h-full p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/50">{c.vendor}</div>
            <div className="font-display text-3xl font-bold mt-1 leading-none">{c.shortName}</div>
            <div className="text-white/60 text-sm mt-1">{c.name}</div>
          </div>
          <span className="pill border border-white/15 bg-white/5 text-white/70">
            {count} {count === 1 ? "game" : "games"}
          </span>
        </div>

        <div>
          <p className="text-xs text-white/60 mb-3 line-clamp-2">{c.hero}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-white/50 font-mono">
              <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{c.year}</span>
              <span className="inline-flex items-center gap-1"><Cpu className="size-3" />{c.emulator.name}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-white group-hover:gap-2 transition-all">
              Open <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
