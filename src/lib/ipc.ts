import type { ConsoleId } from "./emulators";

export interface BridgeAPI {
  pickRomDir: (consoleId: ConsoleId) => Promise<string | null>;
  scanRoms: (consoleId: ConsoleId, dir: string) => Promise<
    { id: string; title: string; path: string }[]
  >;
  launch: (consoleId: ConsoleId, romPath: string) => Promise<{ ok: boolean; error?: string }>;
  checkEmulator: (consoleId: ConsoleId) => Promise<{ installed: boolean; binary: string }>;
  installEmulators: () => Promise<{ ok: boolean; log: string }>;
  toggleFullscreen: () => Promise<void>;
  exitApp: () => Promise<void>;
  loadConfig: () => Promise<Record<string, unknown>>;
  saveConfig: (cfg: Record<string, unknown>) => Promise<void>;
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
} as BridgeAPI);
