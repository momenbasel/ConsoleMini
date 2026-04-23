import { CONSOLES, type ConsoleId } from "@/lib/emulators";
import { useStore } from "@/lib/store";
import { bridge } from "@/lib/ipc";

export function Sidebar() {
  const { selectedConsole, setSelectedConsole, view, setView, controllerConnected, games } = useStore();

  const systems = CONSOLES;
  const totalGames = games.length;

  return (
    <aside
      className="w-[232px] flex-shrink-0 flex flex-col no-drag"
      style={{
        background: "linear-gradient(180deg, #0c0e13 0%, #090a0f 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Brand */}
      <div className="px-4 pt-4 pb-[14px] flex items-center gap-2.5">
        <img
          src="./icon.svg"
          alt=""
          className="w-[34px] h-[34px] rounded-[9px] flex-shrink-0 border border-white/10"
          style={{ boxShadow: "0 4px 14px -6px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)" }}
          draggable={false}
        />
        <div>
          <div className="flex items-baseline gap-0.5 font-display tracking-[-0.02em]">
            <span className="text-[15px] font-bold">Console</span>
            <span className="text-[15px] font-light text-white/55">Mini</span>
            <span className="text-accent text-[15px] font-bold">.</span>
          </div>
          <div className="font-mono text-[9px] text-white/35 tracking-[0.18em] mt-[2px]">
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
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="2.5" y="2.5" width="2.5" height="11" rx="0.5" />
              <rect x="6.5" y="2.5" width="2.5" height="11" rx="0.5" />
              <path d="M11.5 4 l2 0.6 -1.8 9.3 -2-0.5z" />
            </svg>
          }
        />
        <NavItem
          label="Settings"
          active={view === "settings"}
          onClick={() => setView("settings")}
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="8" cy="8" r="2.3" />
              <path d="M8 1.5v2 M8 12.5v2 M1.5 8h2 M12.5 8h2 M3.5 3.5l1.4 1.4 M11.1 11.1l1.4 1.4 M3.5 12.5l1.4-1.4 M11.1 4.9l1.4-1.4" />
            </svg>
          }
        />
        <NavItem
          label="Recent"
          count={Math.min(totalGames, 99)}
          active={view === "recent"}
          onClick={() => {
            setSelectedConsole("all");
            setView("recent");
          }}
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="8" cy="8" r="5.5" />
              <path d="M8 4.5V8l2.5 1.5" />
            </svg>
          }
        />
      </div>

      <div className="px-4 pt-[14px] pb-2 flex items-center justify-between font-mono text-[9px] tracking-[0.22em] text-white/32">
        <span>SYSTEMS</span>
        <span className="text-white/25">{systems.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-[10px] pb-2.5">
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
        {systems.map((c) => {
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
        className="px-[14px] py-2.5 flex items-center justify-between font-mono text-[10px] text-white/45"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: controllerConnected ? "#c6ff3d" : "rgba(255,255,255,0.25)",
              boxShadow: controllerConnected ? "0 0 8px #c6ff3d" : undefined,
            }}
          />
          <span>{controllerConnected ? "Controller" : "No pad"}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => bridge.toggleFullscreen()}
            className="w-[22px] h-[22px] rounded-md grid place-items-center text-white/50 hover:text-white hover:bg-white/5 focus-ring no-drag"
            title="Fullscreen"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M10 2h4v4 M6 14H2v-4 M14 2l-5 5 M2 14l5-5" />
            </svg>
          </button>
          <button
            onClick={() => bridge.exitApp()}
            className="w-[22px] h-[22px] rounded-md grid place-items-center text-white/50 hover:text-white hover:bg-white/5 focus-ring no-drag"
            title="Quit"
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M8 2v6" />
              <path d="M4.5 5A5 5 0 1 0 11.5 5" />
            </svg>
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
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg mb-0.5 text-[13px] relative focus-ring " +
        (active ? "text-white" : "text-white/60 hover:text-white hover:bg-white/[0.03]")
      }
      style={{ background: active ? "rgba(255,255,255,0.06)" : undefined, fontWeight: active ? 500 : 400 }}
    >
      {active && (
        <span
          aria-hidden
          className="absolute rounded-sm"
          style={{ left: -10, top: 8, bottom: 8, width: 2, background: "#c6ff3d" }}
        />
      )}
      <span className={active ? "text-white" : "text-white/70"}>{icon}</span>
      <span>{label}</span>
      {count != null && (
        <span className="ml-auto font-mono text-[10px] text-white/35">{count}</span>
      )}
    </button>
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
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-2.5 px-2.5 py-[6px] rounded-lg mb-[1px] text-[12.5px] relative focus-ring " +
        (active ? "text-white" : "text-white/55 hover:text-white hover:bg-white/[0.025]")
      }
      style={{ background: active ? "rgba(255,255,255,0.06)" : undefined }}
    >
      {active && (
        <span
          aria-hidden
          className="absolute rounded-sm"
          style={{
            left: -10,
            top: 6,
            bottom: 6,
            width: 2,
            background: accent,
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
      )}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: accent, boxShadow: `0 0 6px ${accent}66` }}
      />
      <span className="font-mono text-[10px] text-white/40 w-[30px] flex-shrink-0">
        {id === "all" ? "·" : short}
      </span>
      <span className="flex-1 truncate text-left">{name}</span>
      {experimental && (
        <span className="font-mono text-[8.5px] text-[#ff3da6] tracking-[0.14em] ml-auto">EXP</span>
      )}
      {count != null && !experimental && (
        <span className="font-mono text-[9.5px] text-white/40 ml-auto">{count}</span>
      )}
    </button>
  );
}
