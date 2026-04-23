import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Download,
  Copy,
  Check,
  ExternalLink,
  FolderOpen,
  Maximize2,
  Volume2,
  Gamepad2,
  Monitor,
  Save,
  Power,
  Bluetooth,
  Thermometer,
  Info,
  Heart,
} from "lucide-react";
import { CONSOLES, CONSOLE_BY_ID, type ConsoleId } from "@/lib/emulators";
import { bridge, type SaveStateEntry } from "@/lib/ipc";
import { Btn, Pill } from "@/lib/ui";

const BREW_CMD =
  "brew install --cask duckstation pcsx2 rpcs3 ppsspp mgba flycast retroarch && brew install mupen64plus";

type PanelId =
  | "emulators"
  | "controllers"
  | "display"
  | "audio"
  | "saves"
  | "kiosk"
  | "autolaunch"
  | "bluetooth"
  | "thermals"
  | "version"
  | "credits";

interface NavEntry {
  id: PanelId;
  label: string;
  section: "general" | "macmini" | "about";
}

const NAV: NavEntry[] = [
  { id: "emulators", label: "Emulators", section: "general" },
  { id: "controllers", label: "Controllers", section: "general" },
  { id: "display", label: "Display", section: "general" },
  { id: "audio", label: "Audio", section: "general" },
  { id: "saves", label: "Save states", section: "general" },
  { id: "kiosk", label: "Kiosk mode", section: "macmini" },
  { id: "autolaunch", label: "Auto-launch", section: "macmini" },
  { id: "bluetooth", label: "Bluetooth", section: "macmini" },
  { id: "thermals", label: "Thermals", section: "macmini" },
  { id: "version", label: "Version 0.1", section: "about" },
  { id: "credits", label: "Credits", section: "about" },
];

export function SettingsView() {
  const [panel, setPanel] = useState<PanelId>("emulators");

  return (
    <div className="flex gap-6">
      <nav className="w-40 flex-shrink-0">
        <RailHeader>GENERAL</RailHeader>
        {NAV.filter((n) => n.section === "general").map((n) => (
          <RailItem key={n.id} label={n.label} active={panel === n.id} onClick={() => setPanel(n.id)} />
        ))}
        <div className="h-4" />
        <RailHeader>MAC MINI</RailHeader>
        {NAV.filter((n) => n.section === "macmini").map((n) => (
          <RailItem key={n.id} label={n.label} active={panel === n.id} onClick={() => setPanel(n.id)} />
        ))}
        <div className="h-4" />
        <RailHeader>ABOUT</RailHeader>
        {NAV.filter((n) => n.section === "about").map((n) => (
          <RailItem key={n.id} label={n.label} active={panel === n.id} onClick={() => setPanel(n.id)} />
        ))}
      </nav>

      <div className="flex-1 min-w-0">
        {panel === "emulators" && <EmulatorsPanel />}
        {panel === "controllers" && <ControllersPanel />}
        {panel === "display" && <DisplayPanel />}
        {panel === "audio" && <AudioPanel />}
        {panel === "saves" && <SavesPanel />}
        {panel === "kiosk" && <KioskPanel />}
        {panel === "autolaunch" && <AutoLaunchPanel />}
        {panel === "bluetooth" && <BluetoothPanel />}
        {panel === "thermals" && <ThermalsPanel />}
        {panel === "version" && <VersionPanel />}
        {panel === "credits" && <CreditsPanel />}
      </div>
    </div>
  );
}

function RailHeader({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[9.5px] tracking-[0.22em] text-white/35 mb-2.5">{children}</div>;
}

function RailItem({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2.5 py-1.5 mb-[1px] rounded-md text-[12.5px] focus-ring"
      style={{
        color: active ? "white" : "rgba(255,255,255,0.55)",
        background: active ? "rgba(255,255,255,0.05)" : "transparent",
        fontWeight: active ? 500 : 400,
        borderLeft: `2px solid ${active ? "#c6ff3d" : "transparent"}`,
        paddingLeft: 10,
      }}
    >
      {label}
    </button>
  );
}

// ---------- Header primitive shared by panels ----------

function PanelHeader({
  kicker,
  title,
  sub,
  icon,
  right,
}: {
  kicker: string;
  title: string;
  sub?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex gap-3">
        {icon && (
          <div
            className="w-11 h-11 rounded-[10px] grid place-items-center text-white/70 flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {icon}
          </div>
        )}
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">{kicker}</div>
          <h1 className="font-display font-bold tracking-tightest mt-1 leading-[1.1]" style={{ fontSize: 28 }}>
            {title}
          </h1>
          {sub && <p className="text-white/55 text-[13px] mt-1.5 max-w-[560px]">{sub}</p>}
        </div>
      </div>
      {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={"rounded-xl " + className}
      style={{ background: "#0c0e14", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {children}
    </div>
  );
}

function StatTile({
  value,
  label,
  accent = "rgba(255,255,255,0.75)",
  detail,
}: {
  value: string;
  label: string;
  accent?: string;
  detail?: string;
}) {
  return (
    <div
      className="px-[14px] py-3.5 rounded-[10px]"
      style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
    >
      <div className="font-display font-bold tracking-[-0.02em]" style={{ fontSize: 22, color: accent }}>
        {value}
      </div>
      <div className="font-mono text-[9.5px] tracking-[0.18em] text-white/40 mt-1">
        {label}
        {detail && <span className="text-white/25 ml-1.5">· {detail}</span>}
      </div>
    </div>
  );
}

// ---------- EMULATORS ----------

function EmulatorsPanel() {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = async () => {
    const r: Record<string, boolean> = {};
    for (const c of CONSOLES) {
      const s = await bridge.checkEmulator(c.id);
      r[c.id] = s.installed;
    }
    setStatus(r);
  };

  useEffect(() => {
    refresh();
  }, []);

  const install = async (ids?: ConsoleId[]) => {
    const tag = ids && ids.length === 1 ? ids[0] : "all";
    setBusy(tag);
    setLog(`$ install-emulators.sh ${ids?.join(" ") ?? "(all)"}\n`);
    const r = await bridge.installEmulators(ids);
    setLog(r.log);
    setBusy(null);
    refresh();
  };

  const readyCount = useMemo(() => Object.values(status).filter(Boolean).length, [status]);
  const total = CONSOLES.length;
  const missing = CONSOLES.filter((c) => status[c.id] === false).map((c) => c.id);

  return (
    <div>
      <PanelHeader
        kicker="SYSTEM / EMULATORS"
        title="Emulator Runtimes"
        sub="All installs go through Homebrew where possible. ConsoleMini never bundles copyrighted BIOS."
        icon={<Download className="size-5" />}
        right={
          <>
            <Btn variant="ghost" onClick={refresh}>
              <RefreshCw className="size-3" /> Refresh
            </Btn>
            <Btn
              variant="primary"
              onClick={() => install(missing.length ? missing : undefined)}
              disabled={busy !== null}
            >
              <Download className="size-3" />
              {busy === "all" ? "installing…" : missing.length ? `Install ${missing.length} missing` : "Install all"}
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-2.5 mb-[22px]">
        <StatTile value={`${readyCount}/${total}`} label="READY" accent="#c6ff3d" />
        <StatTile value={`${total - readyCount}`} label="MISSING" accent="#ff9f47" />
        <StatTile value="—" label="DISK USED" />
        <StatTile value="M-SERIES" label="APPLE SILICON" accent="#60a5fa" detail="ARM64" />
      </div>

      <Card>
        <div
          className="flex items-center justify-between px-4 py-3 font-mono text-[10px] tracking-[0.14em] text-white/45"
          style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span>{total} RUNTIMES · BREW CASK PREFERRED</span>
          <span>LOCAL PATH CHECK</span>
        </div>
        {CONSOLES.map((c) => (
          <EmulatorRow
            key={c.id}
            id={c.id}
            short={c.shortName}
            name={c.emulator.name}
            path={c.emulator.binary}
            accent={c.accent}
            ready={status[c.id]}
            busy={busy === c.id}
            onInstall={() => install([c.id])}
            disabled={busy !== null}
          />
        ))}
      </Card>

      <div
        className="mt-[18px] px-[14px] py-3 rounded-[10px] flex items-center gap-3 font-mono text-[11px] text-white/55"
        style={{ border: "1px dashed rgba(255,255,255,0.08)" }}
      >
        <span style={{ fontSize: 16 }}>🍺</span>
        <span className="truncate flex-1">{BREW_CMD}</span>
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(BREW_CMD);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "copied" : "Copy"}
        </Btn>
      </div>

      {log && (
        <pre
          className="mt-5 p-3 rounded-md font-mono text-[11px] text-white/75 max-h-64 overflow-auto whitespace-pre-wrap"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {log}
        </pre>
      )}
    </div>
  );
}

function EmulatorRow({
  id,
  short,
  name,
  path,
  accent,
  ready,
  busy,
  disabled,
  onInstall,
}: {
  id: ConsoleId;
  short: string;
  name: string;
  path: string;
  accent: string;
  ready?: boolean;
  busy?: boolean;
  disabled?: boolean;
  onInstall: () => void;
}) {
  return (
    <div
      className="grid items-center gap-4 px-4 py-3.5"
      style={{ gridTemplateColumns: "auto 1fr auto auto", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="flex items-center gap-2.5 min-w-[110px]">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
        <div>
          <div className="font-mono text-[10px] tracking-[0.15em] text-white/40">{short}</div>
          <div className="text-[13.5px] font-semibold mt-0.5">{name}</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="font-mono text-[10.5px] text-white/50 truncate">{path}</div>
        <div className="font-mono text-[9.5px] text-white/30 tracking-[0.1em] mt-0.5">
          {id.toUpperCase()} · {ready ? "APPLE SILICON · NATIVE" : "NOT INSTALLED"}
        </div>
      </div>
      <div>
        {ready ? (
          <Pill accent="#c6ff3d" filled>
            ● READY
          </Pill>
        ) : ready === false ? (
          <Pill accent="#ff9f47">✕ MISSING</Pill>
        ) : (
          <Pill>…</Pill>
        )}
      </div>
      <div className="flex gap-1.5">
        {ready ? (
          <Btn variant="ghost" size="sm" onClick={onInstall} disabled={disabled}>
            {busy ? "…" : "Update"}
          </Btn>
        ) : (
          <Btn variant="primary" size="sm" onClick={onInstall} disabled={disabled}>
            {busy ? "…" : "Install"}
          </Btn>
        )}
      </div>
    </div>
  );
}

// ---------- CONTROLLERS ----------

function ControllersPanel() {
  const [pads, setPads] = useState<(Gamepad | null)[]>([]);
  useEffect(() => {
    const tick = () => {
      const list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
      setPads(list);
    };
    tick();
    const t = setInterval(tick, 500);
    const onCon = () => tick();
    window.addEventListener("gamepadconnected", onCon);
    window.addEventListener("gamepaddisconnected", onCon);
    return () => {
      clearInterval(t);
      window.removeEventListener("gamepadconnected", onCon);
      window.removeEventListener("gamepaddisconnected", onCon);
    };
  }, []);

  const connected = pads.filter(Boolean) as Gamepad[];

  return (
    <div>
      <PanelHeader
        kicker="INPUT / CONTROLLERS"
        title="Controllers"
        sub="DualShock 4, DualSense, Xbox, 8BitDo. Pair over Bluetooth from macOS Settings — ConsoleMini will pick them up automatically."
        icon={<Gamepad2 className="size-5" />}
        right={
          <Btn variant="ghost" onClick={() => bridge.openExternal("x-apple.systempreferences:com.apple.BluetoothSettings")}>
            <Bluetooth className="size-3" /> Open Bluetooth
          </Btn>
        }
      />

      <Card className="p-4">
        {connected.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-white/55 text-[13px]">No gamepads detected.</div>
            <div className="font-mono text-[10.5px] text-white/35 mt-2 tracking-[0.12em]">
              PRESS ANY BUTTON ON A PAIRED CONTROLLER TO WAKE IT
            </div>
          </div>
        ) : (
          connected.map((p) => <PadRow key={p.index} pad={p} />)
        )}
      </Card>
    </div>
  );
}

function PadRow({ pad }: { pad: Gamepad }) {
  const pressedButtons = pad.buttons
    .map((b, i) => (b.pressed ? i : -1))
    .filter((n) => n >= 0);
  return (
    <div
      className="grid items-center gap-4 py-3 px-1"
      style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#c6ff3d", boxShadow: "0 0 8px #c6ff3d" }} />
      <div className="min-w-0">
        <div className="font-mono text-[10px] tracking-[0.14em] text-white/40">SLOT {pad.index}</div>
        <div className="text-[13.5px] font-semibold truncate">{pad.id}</div>
        <div className="font-mono text-[10px] text-white/40 tracking-[0.1em] mt-0.5">
          {pad.buttons.length} buttons · {pad.axes.length} axes · {pad.mapping || "raw"}
        </div>
      </div>
      <div className="text-right">
        <Pill accent="#c6ff3d" filled>
          ● READY
        </Pill>
        <div className="font-mono text-[10px] text-white/45 mt-1.5">
          {pressedButtons.length ? `DOWN: ${pressedButtons.join(",")}` : "IDLE"}
        </div>
      </div>
    </div>
  );
}

// ---------- DISPLAY ----------

function DisplayPanel() {
  const [dims, setDims] = useState({ w: window.screen.width, h: window.screen.height, dpr: window.devicePixelRatio });
  useEffect(() => {
    const t = setInterval(() => {
      setDims({ w: window.screen.width, h: window.screen.height, dpr: window.devicePixelRatio });
    }, 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div>
      <PanelHeader
        kicker="OUTPUT / DISPLAY"
        title="Display"
        sub="Fullscreen is the preferred mode in the living room. Press F11 or use this button from anywhere."
        icon={<Monitor className="size-5" />}
        right={
          <Btn variant="primary" onClick={() => bridge.toggleFullscreen()}>
            <Maximize2 className="size-3" /> Toggle fullscreen
          </Btn>
        }
      />

      <div className="grid grid-cols-4 gap-2.5 mb-5">
        <StatTile value={`${dims.w}×${dims.h}`} label="PRIMARY DISPLAY" accent="#c6ff3d" />
        <StatTile value={`${dims.dpr}x`} label="DEVICE PIXEL RATIO" />
        <StatTile value={`${window.innerWidth}×${window.innerHeight}`} label="WINDOW" accent="#60a5fa" />
        <StatTile value="F11" label="FULLSCREEN" detail="HOTKEY" />
      </div>

      <Card className="p-4">
        <div className="font-mono text-[10px] tracking-[0.14em] text-white/45 mb-2">NOTES</div>
        <ul className="space-y-2 text-[13px] text-white/70 leading-relaxed">
          <li>• Emulators render in their own window — ConsoleMini hands off the ROM and gets out of the way.</li>
          <li>• For true kiosk / TV output, see <b>Mac mini → Kiosk mode</b>.</li>
          <li>• Retina scaling is handled per-emulator; adjust internal res inside each emulator's settings.</li>
        </ul>
      </Card>
    </div>
  );
}

// ---------- AUDIO ----------

function AudioPanel() {
  return (
    <div>
      <PanelHeader
        kicker="OUTPUT / AUDIO"
        title="Audio"
        sub="Audio is routed by the OS — each emulator opens its own CoreAudio stream. Route per-app in macOS Audio MIDI if you need stems."
        icon={<Volume2 className="size-5" />}
        right={
          <Btn variant="ghost" onClick={() => bridge.openExternal("x-apple.systempreferences:com.apple.preference.sound")}>
            <ExternalLink className="size-3" /> Sound settings
          </Btn>
        }
      />

      <Card className="p-4 text-[13px] text-white/70 leading-relaxed">
        <div className="font-mono text-[10px] tracking-[0.14em] text-white/45 mb-2">DEFAULTS</div>
        <ul className="space-y-2">
          <li>• <b>Output</b> — follows the macOS system default (Mac mini HDMI, AirPods, etc.).</li>
          <li>• <b>Latency</b> — 512-sample buffer per emulator, ~10 ms at 48 kHz on M-series.</li>
          <li>• <b>Exclusive mode</b> — disabled; you can keep music/podcasts mixed in.</li>
        </ul>
      </Card>
    </div>
  );
}

// ---------- SAVE STATES ----------

function SavesPanel() {
  const [entries, setEntries] = useState<SaveStateEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const r = await bridge.scanSaveStates();
    setEntries(r);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);

  const totalFiles = entries.reduce((a, e) => a + e.fileCount, 0);
  const present = entries.filter((e) => e.exists).length;

  return (
    <div>
      <PanelHeader
        kicker="USER DATA / SAVE STATES"
        title="Save states"
        sub="Every emulator keeps its own save-state vault on disk. ConsoleMini just shows you where they live — nothing is touched."
        icon={<Save className="size-5" />}
        right={
          <Btn variant="ghost" onClick={refresh}>
            <RefreshCw className={"size-3 " + (loading ? "animate-spin" : "")} /> Rescan
          </Btn>
        }
      />

      <div className="grid grid-cols-4 gap-2.5 mb-5">
        <StatTile value={String(totalFiles)} label="STATE FILES" accent="#c6ff3d" />
        <StatTile value={`${present}/${entries.length}`} label="VAULTS PRESENT" accent="#60a5fa" />
        <StatTile value="F1 / F4" label="MGBA SAVE / LOAD" />
        <StatTile value="F2 / F3" label="RETROARCH SAVE / LOAD" />
      </div>

      <Card>
        {entries.map((e, i) => {
          const c = CONSOLE_BY_ID[e.console];
          return (
            <div
              key={e.console}
              className="grid items-center gap-4 px-4 py-3.5"
              style={{
                gridTemplateColumns: "auto 1fr auto auto",
                borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined,
              }}
            >
              <div className="flex items-center gap-2.5 min-w-[110px]">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: c.accent, boxShadow: `0 0 8px ${c.accent}` }}
                />
                <div>
                  <div className="font-mono text-[10px] tracking-[0.15em] text-white/40">{c.shortName}</div>
                  <div className="text-[13.5px] font-semibold mt-0.5">{c.emulator.name}</div>
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[10.5px] text-white/50 truncate">{e.dir}</div>
                <div className="font-mono text-[9.5px] text-white/30 tracking-[0.1em] mt-0.5">
                  {e.exists
                    ? `${e.fileCount} FILES${e.lastModified ? ` · LAST ${new Date(e.lastModified).toLocaleString()}` : ""}`
                    : "DIRECTORY DOES NOT EXIST"}
                </div>
              </div>
              <div>
                {e.exists && e.fileCount > 0 ? (
                  <Pill accent="#c6ff3d" filled>
                    ● {e.fileCount}
                  </Pill>
                ) : e.exists ? (
                  <Pill>EMPTY</Pill>
                ) : (
                  <Pill accent="#ff9f47">NONE</Pill>
                )}
              </div>
              <div>
                <Btn variant="ghost" size="sm" onClick={() => bridge.revealInFinder(e.dir)} disabled={!e.exists}>
                  <FolderOpen className="size-3" /> Reveal
                </Btn>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ---------- KIOSK ----------

function KioskPanel() {
  return (
    <div>
      <PanelHeader
        kicker="MAC MINI / KIOSK"
        title="Kiosk mode"
        sub="Turn the Mac mini into a dedicated console — auto-boot into ConsoleMini fullscreen, hide the Dock + menu bar, disable screensaver."
        icon={<Power className="size-5" />}
        right={
          <Btn
            variant="ghost"
            onClick={() =>
              navigator.clipboard.writeText(
                "bash /Applications/ConsoleMini.app/Contents/Resources/scripts/setup-kiosk.sh"
              )
            }
          >
            <Copy className="size-3" /> Copy command
          </Btn>
        }
      />
      <Card className="p-4">
        <div className="font-mono text-[10px] tracking-[0.14em] text-white/45 mb-2">WHAT IT DOES</div>
        <ul className="space-y-2 text-[13px] text-white/70 leading-relaxed">
          <li>• Installs a LaunchAgent that opens ConsoleMini on login.</li>
          <li>• Disables screensaver and "display sleep" while plugged in.</li>
          <li>• Sets Dock autohide + menu bar autohide for a clean TV look.</li>
          <li>• Every step is a shell command — auditable and reversible.</li>
        </ul>
        <pre
          className="mt-4 p-3 rounded-md font-mono text-[11px] text-white/75 whitespace-pre-wrap"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
{`# run once as your user
bash /Applications/ConsoleMini.app/Contents/Resources/scripts/setup-kiosk.sh`}
        </pre>
      </Card>
    </div>
  );
}

// ---------- AUTO-LAUNCH ----------

function AutoLaunchPanel() {
  const plist = `~/Library/LaunchAgents/io.consolemini.autolaunch.plist`;
  return (
    <div>
      <PanelHeader
        kicker="MAC MINI / AUTO-LAUNCH"
        title="Auto-launch"
        sub="Open ConsoleMini on login without showing the Dock. Pairs with Kiosk mode for a TV-ready boot experience."
        icon={<Power className="size-5" />}
      />
      <Card className="p-4">
        <div className="font-mono text-[10px] tracking-[0.14em] text-white/45 mb-2">ENABLE</div>
        <pre
          className="p-3 rounded-md font-mono text-[11px] text-white/75 whitespace-pre-wrap"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
{`# add ConsoleMini to macOS Login Items
osascript -e 'tell application "System Events" \\
  to make login item at end with properties \\
  {path:"/Applications/ConsoleMini.app", hidden:false}'`}
        </pre>
        <div className="font-mono text-[10px] tracking-[0.14em] text-white/45 mt-4 mb-2">DISABLE</div>
        <pre
          className="p-3 rounded-md font-mono text-[11px] text-white/75 whitespace-pre-wrap"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
{`osascript -e 'tell application "System Events" \\
  to delete login item "ConsoleMini"'`}
        </pre>
        <p className="text-[12px] text-white/45 mt-4 font-mono">LaunchAgent path: {plist}</p>
      </Card>
    </div>
  );
}

// ---------- BLUETOOTH ----------

function BluetoothPanel() {
  return (
    <div>
      <PanelHeader
        kicker="MAC MINI / BLUETOOTH"
        title="Bluetooth"
        sub="Pairing happens in macOS — once paired, the pad appears under Controllers automatically."
        icon={<Bluetooth className="size-5" />}
        right={
          <Btn
            variant="primary"
            onClick={() => bridge.openExternal("x-apple.systempreferences:com.apple.BluetoothSettings")}
          >
            <ExternalLink className="size-3" /> Open Bluetooth settings
          </Btn>
        }
      />
      <Card className="p-4 text-[13px] text-white/70 leading-relaxed">
        <div className="font-mono text-[10px] tracking-[0.14em] text-white/45 mb-2">PAIRING CHEATSHEET</div>
        <ul className="space-y-2">
          <li>• <b>DualShock 4</b> — hold <span className="font-mono">SHARE + PS</span> until light bar flashes white.</li>
          <li>• <b>DualSense</b> — hold <span className="font-mono">CREATE + PS</span> until the light bar pulses.</li>
          <li>• <b>Xbox Wireless</b> — hold the pair button on top for 3s.</li>
          <li>• <b>8BitDo</b> — long-press <span className="font-mono">START + B/X/Y</span> depending on model mode.</li>
        </ul>
      </Card>
    </div>
  );
}

// ---------- THERMALS ----------

function ThermalsPanel() {
  return (
    <div>
      <PanelHeader
        kicker="MAC MINI / THERMALS"
        title="Thermals"
        sub="M-series Mac minis throttle quietly — if you see frame drops in PS3/PS4 emulation, this is the first place to look."
        icon={<Thermometer className="size-5" />}
        right={
          <Btn variant="ghost" onClick={() => bridge.openExternal("x-apple.systempreferences:com.apple.ActivityMonitor")}>
            <ExternalLink className="size-3" /> Activity Monitor
          </Btn>
        }
      />
      <Card className="p-4 text-[13px] text-white/70 leading-relaxed">
        <div className="font-mono text-[10px] tracking-[0.14em] text-white/45 mb-2">QUICK CHECKS</div>
        <ul className="space-y-2">
          <li>• Is the Mac mini sitting flat on its intake? Lift it on feet if airflow looks blocked.</li>
          <li>• <b>powermetrics</b> shows CPU/GPU power draw live — good to rule out a runaway process.</li>
          <li>• For RPCS3 specifically, drop resolution scaling to 1x first, then raise again.</li>
        </ul>
        <pre
          className="mt-4 p-3 rounded-md font-mono text-[11px] text-white/75 whitespace-pre-wrap"
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
{`sudo powermetrics --samplers smc,cpu_power,gpu_power -i 2000 -n 3`}
        </pre>
      </Card>
    </div>
  );
}

// ---------- VERSION ----------

function VersionPanel() {
  const [info, setInfo] = useState<Awaited<ReturnType<typeof bridge.getAppInfo>> | null>(null);
  useEffect(() => {
    bridge.getAppInfo().then(setInfo);
  }, []);

  return (
    <div>
      <PanelHeader kicker="ABOUT / BUILD" title={`Version ${info?.version ?? "0.1.0"}`} icon={<Info className="size-5" />} />
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        <StatTile value={info?.version ?? "0.1.0"} label="CONSOLEMINI" accent="#c6ff3d" />
        <StatTile value={info?.electron ?? "-"} label="ELECTRON" accent="#60a5fa" />
        <StatTile value={info?.chrome ?? "-"} label="CHROMIUM" />
        <StatTile value={info?.node ?? "-"} label="NODE" />
      </div>
      <Card className="p-4 text-[13px] text-white/70">
        <div className="font-mono text-[10px] tracking-[0.14em] text-white/45 mb-2">BUILD</div>
        <div className="font-mono text-[12px] text-white/75">
          {info ? `${info.platform} · ${info.arch}` : "…"}
        </div>
      </Card>
    </div>
  );
}

// ---------- CREDITS ----------

function CreditsPanel() {
  const emus = [
    { name: "DuckStation", url: "https://www.duckstation.org/" },
    { name: "PCSX2", url: "https://pcsx2.net/" },
    { name: "RPCS3", url: "https://rpcs3.net/" },
    { name: "shadPS4", url: "https://shadps4.net/" },
    { name: "PPSSPP", url: "https://www.ppsspp.org/" },
    { name: "mGBA", url: "https://mgba.io/" },
    { name: "Mupen64Plus", url: "https://mupen64plus.org/" },
    { name: "RetroArch", url: "https://www.retroarch.com/" },
    { name: "Flycast", url: "https://github.com/flyinghead/flycast" },
  ];
  return (
    <div>
      <PanelHeader
        kicker="ABOUT / CREDITS"
        title="Credits"
        sub="ConsoleMini is a launcher — the heroes are the emulator teams that actually do the hard work."
        icon={<Heart className="size-5" />}
      />
      <Card>
        {emus.map((e, i) => (
          <div
            key={e.name}
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: i < emus.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}
          >
            <div className="text-[13.5px]">{e.name}</div>
            <Btn variant="ghost" size="sm" onClick={() => bridge.openExternal(e.url)}>
              <ExternalLink className="size-3" /> Visit
            </Btn>
          </div>
        ))}
      </Card>
    </div>
  );
}
