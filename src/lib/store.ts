import { create } from "zustand";
import { CONSOLE_BY_ID, type ConsoleId } from "./emulators";
import { bridge } from "./ipc";

export interface Game {
  id: string;
  console: ConsoleId;
  title: string;
  path: string;
  cover?: string;
  lastPlayed?: number;
  playCount?: number;
}

interface UIState {
  selectedConsole: ConsoleId | "all";
  setSelectedConsole: (c: ConsoleId | "all") => void;
  search: string;
  setSearch: (s: string) => void;
  games: Game[];
  setGames: (g: Game[]) => void;
  addGames: (g: Game[]) => void;
  romDirs: Record<ConsoleId, string | undefined>;
  setRomDir: (c: ConsoleId, dir: string) => void;
  hydrate: () => Promise<void>;
  controllerConnected: boolean;
  setControllerConnected: (b: boolean) => void;
  view: "library" | "console" | "settings" | "recent";
  setView: (v: "library" | "console" | "settings" | "recent") => void;
}

// Persist ROM directories to disk via the main process (console-mini.json).
// Fire-and-forget: a failed write must never block the UI state update.
async function persistRomDirs(romDirs: Record<ConsoleId, string | undefined>) {
  try {
    await bridge.saveConfig({ romDirs });
  } catch (e) {
    console.error("saveConfig failed", e);
  }
}

export const useStore = create<UIState>((set, get) => ({
  selectedConsole: "all",
  setSelectedConsole: (c) => set({ selectedConsole: c }),
  search: "",
  setSearch: (s) => set({ search: s }),
  games: [],
  setGames: (games) => set({ games }),
  addGames: (g) => set((s) => ({ games: [...s.games, ...g] })),
  romDirs: {} as Record<ConsoleId, string | undefined>,
  setRomDir: (c, dir) => {
    const romDirs = { ...get().romDirs, [c]: dir };
    set({ romDirs });
    void persistRomDirs(romDirs);
  },
  hydrate: async () => {
    let cfg: Record<string, unknown> = {};
    try {
      cfg = await bridge.loadConfig();
    } catch (e) {
      console.error("loadConfig failed", e);
    }
    const saved = (cfg.romDirs as Record<string, string | undefined>) || {};
    // Only keep entries for known consoles — a hand-edited or corrupted config
    // could carry bogus IDs that would crash scanRoms in the main process.
    const dirs = Object.entries(saved).filter(
      ([id, dir]) => !!dir && id in CONSOLE_BY_ID
    ) as [ConsoleId, string][];
    const romDirs = Object.fromEntries(dirs) as Record<ConsoleId, string | undefined>;
    set({ romDirs });

    // Repopulate the game library from the restored directories so the user
    // sees their ROMs immediately on launch instead of an empty grid.
    const restored: Game[] = [];
    for (const [consoleId, dir] of dirs) {
      try {
        const found = await bridge.scanRoms(consoleId, dir);
        restored.push(...found.map<Game>((f) => ({ ...f, console: consoleId })));
      } catch (e) {
        console.error("rescan failed for", consoleId, e);
      }
    }
    if (restored.length) {
      // Merge rather than replace: if the user added a folder while this
      // background hydrate was still scanning, keep those games instead of
      // clobbering them with the restored set (race-safe).
      const restoredConsoles = new Set(dirs.map(([id]) => id));
      set((s) => ({
        games: [...s.games.filter((g) => !restoredConsoles.has(g.console)), ...restored],
      }));
    }
  },
  controllerConnected: false,
  setControllerConnected: (b) => set({ controllerConnected: b }),
  view: "library",
  setView: (v) => set({ view: v }),
}));
