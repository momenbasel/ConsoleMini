import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { TitleBar } from "./components/TitleBar";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Hero } from "./components/Hero";
import { ConsoleCard } from "./components/ConsoleCard";
import { GameGrid } from "./components/GameGrid";
import { SettingsView } from "./components/SettingsView";
import { RecentView } from "./components/RecentView";
import { ControllerBar } from "./components/ControllerBar";
import { Ambient } from "./components/Ambient";
import { BootSequence } from "./components/BootSequence";
import { CONSOLES, type ConsoleId } from "./lib/emulators";
import { useStore } from "./lib/store";
import { startGamepadLoop, type GamepadAction } from "./lib/gamepad";
import { bridge } from "./lib/ipc";
import { FocusRing, navigate, confirmFocus, clearFocus, useFocusStore } from "./lib/focus";

const VIEW_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export default function App() {
  const { selectedConsole, view, games, setControllerConnected, setSelectedConsole, setView, hydrate } = useStore();
  // ?skipboot bypasses the CM-OS boot sequence (dev / kiosk fast-path)
  const [booted, setBooted] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("skipboot")
  );

  // Restore persisted ROM directories (and their games) on launch.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const goBack = useCallback(() => {
    clearFocus();
    if (selectedConsole !== "all") setSelectedConsole("all");
    else if (view !== "library") setView("library");
  }, [selectedConsole, view, setSelectedConsole, setView]);

  const cycleConsole = useCallback(
    (step: 1 | -1) => {
      const order: (ConsoleId | "all")[] = ["all", ...CONSOLES.map((c) => c.id)];
      const i = order.indexOf(selectedConsole);
      const next = order[(i + step + order.length) % order.length];
      setSelectedConsole(next);
      setView("library");
      clearFocus();
    },
    [selectedConsole, setSelectedConsole, setView]
  );

  // Gamepad: d-pad flies the spotlight, A confirms, B goes back,
  // LB/RB cycle systems, Select opens search, Start opens settings.
  useEffect(() => {
    const onAction = (a: GamepadAction) => {
      if (a === "up" || a === "down" || a === "left" || a === "right") navigate(a);
      else if (a === "confirm") confirmFocus();
      else if (a === "back") goBack();
      else if (a === "lb") cycleConsole(-1);
      else if (a === "rb") cycleConsole(1);
      else if (a === "select") document.getElementById("global-search")?.focus();
      else if (a === "start") setView(view === "settings" ? "library" : "settings");
    };
    const stop = startGamepadLoop(onAction, (b) => setControllerConnected(b));
    return stop;
  }, [goBack, cycleConsole, view, setControllerConnected, setView]);

  // Keyboard mirrors the pad; mouse movement returns to pointer mode.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
        return;
      }
      if (e.key === "F11") {
        bridge.toggleFullscreen();
        return;
      }
      if (e.key === "Escape") {
        if (inInput) {
          (e.target as HTMLElement).blur();
          return;
        }
        goBack();
        return;
      }
      if (inInput) {
        if (e.key === "ArrowDown") {
          (e.target as HTMLElement).blur();
          navigate("down");
        }
        return;
      }
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const dir = e.key.slice(5).toLowerCase() as "up" | "down" | "left" | "right";
        navigate(dir);
      } else if (e.key === "Enter") {
        confirmFocus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goBack]);

  useEffect(() => {
    let last = 0;
    const onMove = () => {
      const now = performance.now();
      if (now - last < 120) return;
      last = now;
      useFocusStore.getState().setSpatial(false);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Fresh screen, fresh spotlight.
  useEffect(() => {
    clearFocus();
  }, [view, selectedConsole]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const g of games) m[g.console] = (m[g.console] || 0) + 1;
    return m;
  }, [games]);

  const contentKey = view === "library" ? `library:${selectedConsole}` : view;

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-full w-full flex flex-col text-white relative" style={{ background: "#030304" }}>
        <Ambient />
        <div className="relative z-10 h-full flex flex-col">
          <TitleBar />
          <div className="flex-1 flex min-h-0">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <div className="flex-1 overflow-y-auto px-8 pt-6 pb-8 relative" id="main-scroll">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={contentKey}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: VIEW_EASE }}
                  >
                    {view === "settings" ? (
                      <SettingsView />
                    ) : view === "recent" ? (
                      <RecentView />
                    ) : selectedConsole === "all" ? (
                      <>
                        <Hero />
                        <section>
                          <div className="flex items-end justify-between mb-5">
                            <div>
                              <div className="font-mono text-[10px] tracking-[0.24em] text-white/40">
                                CH·01 — SYSTEM INDEX
                              </div>
                              <h2
                                className="font-display stretch-wide uppercase mt-1.5 leading-none"
                                style={{ fontSize: 26, fontWeight: 380, letterSpacing: "0.01em" }}
                              >
                                Select hardware
                              </h2>
                            </div>
                            <div className="font-mono text-[10px] tracking-[0.14em] text-white/40 flex items-center gap-2">
                              <span>{CONSOLES.length} SYSTEMS</span>
                              <span className="text-white/20">·</span>
                              <span className="text-white/30">LB / RB TO CYCLE</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {CONSOLES.map((c, i) => (
                              <ConsoleCard key={c.id} c={c} count={counts[c.id] || 0} index={i} />
                            ))}
                          </div>
                        </section>
                      </>
                    ) : (
                      <GameGrid consoleId={selectedConsole as ConsoleId} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <ControllerBar />
            </main>
          </div>
        </div>
        <FocusRing />
        {!booted && <BootSequence onDone={() => setBooted(true)} />}
      </div>
    </MotionConfig>
  );
}
