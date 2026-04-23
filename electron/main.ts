import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { spawn, exec } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONSOLES, type ConsoleId } from "./consoles.js";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(app.getPath("userData"), "console-mini.json");

let win: BrowserWindow | null = null;

async function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#05060a",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 14, y: 12 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once("ready-to-show", () => win?.show());

  const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
  if (!app.isPackaged && process.env.ELECTRON_DEV !== "0") {
    await win.loadURL(devUrl);
  } else {
    await win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

function findConsole(id: ConsoleId) {
  const c = CONSOLES.find((c) => c.id === id);
  if (!c) throw new Error(`unknown console: ${id}`);
  return c;
}

ipcMain.handle("pickRomDir", async () => {
  const r = await dialog.showOpenDialog(win!, { properties: ["openDirectory"] });
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle("scanRoms", async (_e, consoleId: ConsoleId, dir: string) => {
  const c = findConsole(consoleId);
  const out: { id: string; title: string; path: string }[] = [];
  async function walk(d: string) {
    const items = await fs.readdir(d, { withFileTypes: true });
    for (const it of items) {
      const p = path.join(d, it.name);
      if (it.isDirectory()) await walk(p);
      else if (c.romExt.some((e) => it.name.toLowerCase().endsWith(e))) {
        const base = path.basename(it.name, path.extname(it.name));
        out.push({ id: `${consoleId}:${p}`, title: base.replace(/[._-]+/g, " ").trim(), path: p });
      }
    }
  }
  try {
    await walk(dir);
  } catch (e) {
    console.error("scan failed", e);
  }
  out.sort((a, b) => a.title.localeCompare(b.title));
  return out;
});

ipcMain.handle("checkEmulator", async (_e, consoleId: ConsoleId) => {
  const c = findConsole(consoleId);
  try {
    await fs.access(c.emulator.binary);
    return { installed: true, binary: c.emulator.binary };
  } catch {
    return { installed: false, binary: c.emulator.binary };
  }
});

ipcMain.handle("launch", async (_e, consoleId: ConsoleId, romPath: string) => {
  const c = findConsole(consoleId);
  try {
    const args = c.emulator.args ? c.emulator.args(romPath) : [romPath];
    const child = spawn(c.emulator.binary, args, { detached: true, stdio: "ignore" });
    child.unref();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
});

ipcMain.handle("installEmulators", async (_e, ids?: ConsoleId[]) => {
  const resRoot = process.resourcesPath && app.isPackaged
    ? process.resourcesPath
    : app.getAppPath();
  const script = path.join(resRoot, "scripts", "install-emulators.sh");
  const args = Array.isArray(ids) && ids.length ? ids.map((s) => JSON.stringify(s)).join(" ") : "";
  try {
    const { stdout, stderr } = await execAsync(`bash ${JSON.stringify(script)} ${args}`.trim(), {
      maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, NONINTERACTIVE: "1" },
    });
    return { ok: true, log: stdout + (stderr ? "\n[stderr]\n" + stderr : "") };
  } catch (e: any) {
    return { ok: false, log: String(e?.stderr || e?.stdout || e?.message || e) };
  }
});

ipcMain.handle("toggleFullscreen", async () => {
  if (!win) return;
  win.setFullScreen(!win.isFullScreen());
});

ipcMain.handle("exitApp", async () => app.quit());

ipcMain.handle("loadConfig", async () => {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
});

ipcMain.handle("saveConfig", async (_e, cfg: Record<string, unknown>) => {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf-8");
});

ipcMain.handle("openExternal", async (_e, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle("revealInFinder", async (_e, p: string) => {
  try {
    await fs.access(p);
    shell.showItemInFolder(p);
  } catch {
    // path doesn't exist — open parent if present, else do nothing
    const parent = path.dirname(p);
    try {
      await fs.access(parent);
      shell.openPath(parent);
    } catch {
      /* noop */
    }
  }
});

// Known save-state dirs per emulator on macOS
const SAVE_STATE_DIRS: Record<ConsoleId, string> = {
  ps1: path.join(app.getPath("home"), "Library", "Application Support", "DuckStation", "savestates"),
  ps2: path.join(app.getPath("home"), "Library", "Application Support", "PCSX2", "sstates"),
  ps3: path.join(app.getPath("home"), "Library", "Application Support", "rpcs3", "savestates"),
  ps4: path.join(app.getPath("home"), "Library", "Application Support", "shadPS4", "user", "savedata"),
  psp: path.join(app.getPath("home"), "Library", "Application Support", "PPSSPP", "PSP", "PPSSPP_STATE"),
  n64: path.join(app.getPath("home"), ".config", "mupen64plus", "save"),
  snes: path.join(app.getPath("home"), "Library", "Application Support", "RetroArch", "states"),
  nes: path.join(app.getPath("home"), "Library", "Application Support", "RetroArch", "states"),
  gba: path.join(app.getPath("home"), "Library", "Application Support", "mGBA", "states"),
  dreamcast: path.join(app.getPath("home"), "Library", "Application Support", "Flycast", "data"),
};

ipcMain.handle("scanSaveStates", async () => {
  const out: Array<{
    console: ConsoleId;
    dir: string;
    exists: boolean;
    fileCount: number;
    lastModified?: number;
  }> = [];
  for (const [id, dir] of Object.entries(SAVE_STATE_DIRS) as [ConsoleId, string][]) {
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      let latest = 0;
      let count = 0;
      for (const it of items) {
        if (it.isFile()) {
          count += 1;
          try {
            const st = await fs.stat(path.join(dir, it.name));
            if (st.mtimeMs > latest) latest = st.mtimeMs;
          } catch {
            /* noop */
          }
        }
      }
      out.push({ console: id, dir, exists: true, fileCount: count, lastModified: latest || undefined });
    } catch {
      out.push({ console: id, dir, exists: false, fileCount: 0 });
    }
  }
  return out;
});

ipcMain.handle("getAppInfo", async () => ({
  version: app.getVersion(),
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node,
  arch: process.arch,
  platform: process.platform,
}));
