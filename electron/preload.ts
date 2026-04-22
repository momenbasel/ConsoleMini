import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("bridge", {
  pickRomDir: (consoleId: string) => ipcRenderer.invoke("pickRomDir", consoleId),
  scanRoms: (consoleId: string, dir: string) => ipcRenderer.invoke("scanRoms", consoleId, dir),
  launch: (consoleId: string, romPath: string) => ipcRenderer.invoke("launch", consoleId, romPath),
  checkEmulator: (consoleId: string) => ipcRenderer.invoke("checkEmulator", consoleId),
  installEmulators: () => ipcRenderer.invoke("installEmulators"),
  toggleFullscreen: () => ipcRenderer.invoke("toggleFullscreen"),
  exitApp: () => ipcRenderer.invoke("exitApp"),
  loadConfig: () => ipcRenderer.invoke("loadConfig"),
  saveConfig: (cfg: Record<string, unknown>) => ipcRenderer.invoke("saveConfig", cfg),
  openExternal: (url: string) => ipcRenderer.invoke("openExternal", url),
});
