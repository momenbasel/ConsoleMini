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
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once("ready-to-show", () => win?.show());

  const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
  if (process.env.NODE_ENV !== "production" && process.env.ELECTRON_DEV !== "0") {
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

ipcMain.handle("installEmulators", async () => {
  const script = path.join(app.getAppPath(), "scripts", "install-emulators.sh");
  try {
    const { stdout, stderr } = await execAsync(`bash ${JSON.stringify(script)}`, {
      maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, NONINTERACTIVE: "1" },
    });
    return { ok: true, log: stdout + (stderr ? "\n[stderr]\n" + stderr : "") };
  } catch (e: any) {
    return { ok: false, log: String(e?.stderr || e?.message || e) };
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
