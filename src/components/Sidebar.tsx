import { motion } from "framer-motion";
import { Gamepad2, Library, Settings, Power, Maximize2 } from "lucide-react";
import { CONSOLES } from "@/lib/emulators";
import { useStore } from "@/lib/store";
import { bridge } from "@/lib/ipc";

export function Sidebar() {
  const { selectedConsole, setSelectedConsole, view, setView, controllerConnected } = useStore();

  return (
    <aside className="w-72 shrink-0 h-full glass-strong border-r border-white/10 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-violet to-neon-pink shadow-glow grid place-items-center">
          <Gamepad2 className="size-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold leading-none text-gradient">ConsoleMini</h1>
          <p className="text-xs text-white/50 mt-1 font-mono">v0.1 - mac mini edition</p>
        </div>
      </div>

      <nav className="px-3 mt-2 space-y-1">
        <NavBtn icon={<Library className="size-4" />} label="Library" active={view === "library"} onClick={() => setView("library")} />
        <NavBtn icon={<Settings className="size-4" />} label="Settings" active={view === "settings"} onClick={() => setView("settings")} />
      </nav>

      <div className="px-6 mt-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Consoles</div>
      <div className="px-3 flex-1 overflow-y-auto pb-4 space-y-1">
        <ConsoleBtn id="all" label="All Systems" accent="#ffffff" active={selectedConsole === "all"} onClick={() => setSelectedConsole("all")} />
        {CONSOLES.map((c) => (
          <ConsoleBtn
            key={c.id}
            id={c.id}
            label={c.shortName + "  " + c.name}
            accent={c.accent}
            active={selectedConsole === c.id}
            onClick={() => setSelectedConsole(c.id)}
          />
        ))}
      </div>

      <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={"size-2 rounded-full " + (controllerConnected ? "bg-neon-lime animate-pulse" : "bg-white/20")} />
          <span className="text-white/60 font-mono">{controllerConnected ? "Pad ready" : "No pad"}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => bridge.toggleFullscreen()} className="p-2 rounded-lg hover:bg-white/10 focus-ring" title="Fullscreen">
            <Maximize2 className="size-4 text-white/70" />
          </button>
          <button onClick={() => bridge.exitApp()} className="p-2 rounded-lg hover:bg-white/10 focus-ring" title="Quit">
            <Power className="size-4 text-white/70" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition focus-ring " +
        (active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")
      }
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ConsoleBtn({
  id,
  label,
  accent,
  active,
  onClick,
}: {
  id: string;
  label: string;
  accent: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition focus-ring " +
        (active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white")
      }
    >
      <span className="size-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
      <span className="truncate font-medium">{label}</span>
      {id === "ps4" && <span className="ml-auto text-[9px] font-mono text-neon-amber/80">EXP</span>}
    </motion.button>
  );
}
