import type { ConsoleId } from "./emulators";

export interface SaveStateEntry {
  console: ConsoleId;
  dir: string;
  exists: boolean;
  fileCount: number;
  lastModified?: number;
}

export interface BridgeAPI {
  pickRomDir: (consoleId: ConsoleId) => Promise<string | null>;
  scanRoms: (consoleId: ConsoleId, dir: string) => Promise<
    { id: string; title: string; path: string }[]
  >;
  launch: (consoleId: ConsoleId, romPath: string) => Promise<{ ok: boolean; error?: string }>;
  checkEmulator: (consoleId: ConsoleId) => Promise<{ installed: boolean; binary: string }>;
  installEmulators: (ids?: ConsoleId[]) => Promise<{ ok: boolean; log: string }>;
  toggleFullscreen: () => Promise<void>;
  exitApp: () => Promise<void>;
  loadConfig: () => Promise<Record<string, unknown>>;
  saveConfig: (cfg: Record<string, unknown>) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  revealInFinder: (path: string) => Promise<void>;
  scanSaveStates: () => Promise<SaveStateEntry[]>;
  getAppInfo: () => Promise<{
    version: string;
    electron: string;
    chrome: string;
    node: string;
    arch: string;
    platform: string;
  }>;
}

declare global {
  interface Window {
    bridge: BridgeAPI;
  }
}

export const bridge: BridgeAPI = (typeof window !== "undefined" && window.bridge) || ({
  pickRomDir: async () => null,
  scanRoms: async () => [],
  launch: async () => ({ ok: false, error: "bridge unavailable" }),
  checkEmulator: async () => ({ installed: false, binary: "" }),
  installEmulators: async () => ({ ok: false, log: "bridge unavailable" }),
  toggleFullscreen: async () => undefined,
  exitApp: async () => undefined,
  loadConfig: async () => ({}),
  saveConfig: async () => undefined,
  openExternal: async () => undefined,
  revealInFinder: async () => undefined,
  scanSaveStates: async () => [],
  getAppInfo: async () => ({
    version: "0.1.0",
    electron: "-",
    chrome: "-",
    node: "-",
    arch: "-",
    platform: "-",
  }),
} as BridgeAPI);
