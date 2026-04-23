const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bridge", {
  pickRomDir: (consoleId) => ipcRenderer.invoke("pickRomDir", consoleId),
  scanRoms: (consoleId, dir) => ipcRenderer.invoke("scanRoms", consoleId, dir),
  launch: (consoleId, romPath) => ipcRenderer.invoke("launch", consoleId, romPath),
  checkEmulator: (consoleId) => ipcRenderer.invoke("checkEmulator", consoleId),
  installEmulators: (ids) => ipcRenderer.invoke("installEmulators", ids),
  toggleFullscreen: () => ipcRenderer.invoke("toggleFullscreen"),
  exitApp: () => ipcRenderer.invoke("exitApp"),
  loadConfig: () => ipcRenderer.invoke("loadConfig"),
  saveConfig: (cfg) => ipcRenderer.invoke("saveConfig", cfg),
  openExternal: (url) => ipcRenderer.invoke("openExternal", url),
  revealInFinder: (p) => ipcRenderer.invoke("revealInFinder", p),
  scanSaveStates: () => ipcRenderer.invoke("scanSaveStates"),
  getAppInfo: () => ipcRenderer.invoke("getAppInfo"),
});
