import { useEffect, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Hero } from "./components/Hero";
import { ConsoleCard } from "./components/ConsoleCard";
import { GameGrid } from "./components/GameGrid";
import { SettingsView } from "./components/SettingsView";
import { CONSOLES, type ConsoleId } from "./lib/emulators";
import { useStore } from "./lib/store";
import { startGamepadLoop } from "./lib/gamepad";
import { bridge } from "./lib/ipc";

export default function App() {
  const { selectedConsole, view, games, setControllerConnected, setSelectedConsole, setView } = useStore();

  useEffect(() => {
    const stop = startGamepadLoop(
      (a) => {
        if (a === "back") {
          if (selectedConsole !== "all") setSelectedConsole("all");
          else if (view !== "library") setView("library");
        }
      },
      (b) => setControllerConnected(b)
    );
    return stop;
  }, [selectedConsole, view, setControllerConnected, setSelectedConsole, setView]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F11") bridge.toggleFullscreen();
      if (e.key === "Escape") {
        if (selectedConsole !== "all") setSelectedConsole("all");
        else if (view !== "library") setView("library");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedConsole, view, setSelectedConsole, setView]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const g of games) m[g.console] = (m[g.console] || 0) + 1;
    return m;
  }, [games]);

  return (
    <div className="h-full w-full flex bg-ink-950 text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {view === "settings" ? (
            <SettingsView />
          ) : selectedConsole === "all" ? (
            <>
              <Hero />
              <section>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Systems</h2>
                    <p className="text-white/50 text-sm">Pick a console to enter its library.</p>
                  </div>
                  <span className="text-xs font-mono text-white/40">{CONSOLES.length} systems</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {CONSOLES.map((c) => (
                    <ConsoleCard key={c.id} c={c} count={counts[c.id] || 0} />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <GameGrid consoleId={selectedConsole as ConsoleId} />
          )}
        </div>
      </main>
    </div>
  );
}
