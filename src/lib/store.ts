import { create } from "zustand";
import type { ConsoleId } from "./emulators";

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
  controllerConnected: boolean;
  setControllerConnected: (b: boolean) => void;
  view: "library" | "console" | "settings" | "recent";
  setView: (v: "library" | "console" | "settings" | "recent") => void;
}

export const useStore = create<UIState>((set) => ({
  selectedConsole: "all",
  setSelectedConsole: (c) => set({ selectedConsole: c }),
  search: "",
  setSearch: (s) => set({ search: s }),
  games: [],
  setGames: (games) => set({ games }),
  addGames: (g) => set((s) => ({ games: [...s.games, ...g] })),
  romDirs: {} as Record<ConsoleId, string | undefined>,
  setRomDir: (c, dir) =>
    set((s) => ({ romDirs: { ...s.romDirs, [c]: dir } })),
  controllerConnected: false,
  setControllerConnected: (b) => set({ controllerConnected: b }),
  view: "library",
  setView: (v) => set({ view: v }),
}));
