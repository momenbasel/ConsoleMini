import { motion } from "framer-motion";
import { LibraryBig, History, Settings2, Maximize2, Power } from "lucide-react";
import { CONSOLES, type ConsoleId } from "@/lib/emulators";
import { useStore } from "@/lib/store";
import { bridge } from "@/lib/ipc";
import { GlowDot } from "@/lib/ui";

const SPRING = { type: "spring", stiffness: 480, damping: 38 } as const;

export function Sidebar() {
  const { selectedConsole, setSelectedConsole, view, setView, controllerConnected, games } = useStore();

  const recentCount = games.filter((g) => g.lastPlayed != null).length;

  return (
    <aside
      className="w-[248px] flex-shrink-0 flex flex-col no-drag relative"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.018) 0%, rgba(255,255,255,0.006) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Brand */}
      <div className="px-4 pt-4 pb-4 flex items-center gap-3">
        <div className="relative">
          <img
            src="./icon.svg"
            alt=""
            className="w-9 h-9 rounded-[10px] flex-shrink-0 border border-white/10"
            style={{ boxShadow: "0 6px 18px -6px rgba(0,0,0,0.9), 0 0 20px rgba(138,92,255,0.15)" }}
            draggable={false}
          />
          <span
            className="absolute -inset-1 rounded-[13px] pointer-events-none"
            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
          />
        </div>
        <div>
          <div className="flex items-baseline gap-[3px] font-display stretch-wide tracking-[0.01em]">
            <span className="text-[15px] font-extrabold">CONSOLE</span>
            <span className="text-[15px] font-light text-white/50">MINI</span>
          </div>
          <div className="font-mono text-[8.5px] text-white/35 tracking-[0.22em] mt-[3px]">
            V0.1 · MAC MINI EDITION
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="px-[10px] pt-1">
        <NavItem
          label="Library"
          active={view === "library"}
          onClick={() => setView("library")}
          icon={<LibraryBig className="size-[15px]" />}
        />
        <NavItem
          label="Recent"
          count={Math.min(recentCount, 99)}
          active={view === "recent"}
          onClick={() => {
            setSelectedConsole("all");
            setView("recent");
          }}
          icon={<History className="size-[15px]" />}
        />
        <NavItem
          label="Settings"
          active={view === "settings"}
          onClick={() => setView("settings")}
          icon={<Settings2 className="size-[15px]" />}
        />
      </div>

      <div className="px-4 pt-5 pb-2 flex items-center justify-between font-mono text-[9px] tracking-[0.24em] text-white/35">
        <span>SYSTEMS</span>
        <span className="text-white/25">{CONSOLES.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-[10px] pb-2.5">
        <ConsoleRow
          id="all"
          short="·"
          name="All Systems"
          accent="#ffffff"
          active={selectedConsole === "all" && view === "library"}
          onClick={() => {
            setSelectedConsole("all");
            setView("library");
          }}
        />
        {CONSOLES.map((c) => {
          const installedCount = games.filter((g) => g.console === c.id).length;
          return (
            <ConsoleRow
              key={c.id}
              id={c.id}
              short={c.shortName}
              name={c.name}
              accent={c.accent}
              experimental={c.id === "ps4"}
              count={installedCount || undefined}
              active={selectedConsole === c.id && view === "library"}
              onClick={() => {
                setSelectedConsole(c.id);
                setView("library");
              }}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="px-3.5 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2 font-mono text-[9.5px] tracking-[0.1em] uppercase">
          <GlowDot color={controllerConnected ? "#d3fd50" : "rgba(255,255,255,0.22)"} pulse={controllerConnected} />
          <span className={controllerConnected ? "text-white/75" : "text-white/40"}>
            {controllerConnected ? "Controller" : "No pad"}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => bridge.toggleFullscreen()}
            className="w-6 h-6 rounded-md grid place-items-center text-white/45 hover:text-white hover:bg-white/[0.06] focus-ring no-drag transition-colors"
            title="Fullscreen (F11)"
          >
            <Maximize2 className="size-3" />
          </button>
          <button
            onClick={() => bridge.exitApp()}
            className="w-6 h-6 rounded-md grid place-items-center text-white/45 hover:text-[#ff6b6b] hover:bg-white/[0.06] focus-ring no-drag transition-colors"
            title="Quit"
          >
            <Power className="size-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      data-focusable
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      className={
        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[3px] mb-[3px] text-[13px] relative focus-ring overflow-hidden " +
        (active ? "text-white" : "text-white/55 hover:text-white")
      }
      style={{ fontWeight: active ? 550 : 400 }}
    >
      <span className="spot-fill" aria-hidden />
      {active && (
        <motion.span
          layoutId="nav-active"
          transition={SPRING}
          className="absolute inset-0"
          style={{
            background: "rgba(255,255,255,0.065)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />
      )}
      <span className={"relative z-10 spot-target " + (active ? "text-[#d3fd50]" : "text-white/60")}>{icon}</span>
      <span className="relative z-10 spot-target">{label}</span>
      {count != null && count > 0 && (
        <span className="relative z-10 ml-auto font-mono text-[9.5px] text-white/40 px-1.5 py-[1px] spot-dim">
          {count}
        </span>
      )}
    </motion.button>
  );
}

function ConsoleRow({
  id,
  short,
  name,
  accent,
  active,
  experimental,
  count,
  onClick,
}: {
  id: ConsoleId | "all";
  short: string;
  name: string;
  accent: string;
  active?: boolean;
  experimental?: boolean;
  count?: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      data-focusable
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      className={
        "w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-[3px] mb-[2px] text-[12.5px] relative focus-ring overflow-hidden " +
        (active ? "text-white" : "text-white/50 hover:text-white/90")
      }
    >
      <span className="spot-fill" aria-hidden />
      {active && (
        <motion.span
          layoutId="console-active"
          transition={SPRING}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${accent}14 0%, rgba(255,255,255,0.04) 60%)`,
            border: `1px solid ${accent}30`,
          }}
        />
      )}
      <span className="relative z-10 spot-dot">
        <GlowDot color={accent} size={6} />
      </span>
      <span className="relative z-10 font-mono text-[9.5px] text-white/40 w-[30px] flex-shrink-0 tracking-[0.06em] spot-dim">
        {id === "all" ? "·" : short}
      </span>
      <span className="relative z-10 flex-1 truncate text-left spot-target">{name}</span>
      {experimental && (
        <span className="relative z-10 font-mono text-[8px] text-[#ff3da6] tracking-[0.14em] ml-auto border border-[#ff3da6]/30 px-1 py-[1px] spot-target">
          EXP
        </span>
      )}
      {count != null && !experimental && (
        <span className="relative z-10 font-mono text-[9.5px] text-white/40 ml-auto spot-dim">{count}</span>
      )}
    </motion.button>
  );
}
