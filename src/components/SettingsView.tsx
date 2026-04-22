import { useEffect, useState } from "react";
import { Download, Check, X, Terminal } from "lucide-react";
import { CONSOLES } from "@/lib/emulators";
import { bridge } from "@/lib/ipc";

export function SettingsView() {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [installing, setInstalling] = useState(false);
  const [log, setLog] = useState("");

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

  const install = async () => {
    setInstalling(true);
    setLog("Running scripts/install-emulators.sh ...\n");
    const r = await bridge.installEmulators();
    setLog(r.log);
    setInstalling(false);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">Settings</h2>
        <p className="text-white/50 mt-1">Emulator status, installs, and Mac mini console tuning.</p>
      </div>

      <div className="rounded-3xl glass-strong p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-semibold">Emulators</h3>
            <p className="text-white/50 text-sm">All installs go through Homebrew where possible.</p>
          </div>
          <button
            onClick={install}
            disabled={installing}
            className="px-4 py-2 rounded-xl bg-white text-ink-900 font-semibold text-sm flex items-center gap-2 focus-ring disabled:opacity-50"
          >
            <Download className="size-4" /> {installing ? "Installing..." : "Install / update all"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONSOLES.map((c) => {
            const ok = status[c.id];
            return (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="size-2.5 rounded-full" style={{ background: c.accent, boxShadow: `0 0 12px ${c.accent}` }} />
                  <div>
                    <div className="font-semibold text-sm">{c.shortName} - {c.emulator.name}</div>
                    <div className="text-[11px] font-mono text-white/40">{c.emulator.binary}</div>
                  </div>
                </div>
                {ok ? (
                  <span className="pill bg-neon-lime/15 text-neon-lime border border-neon-lime/30">
                    <Check className="size-3" /> ready
                  </span>
                ) : (
                  <span className="pill bg-white/5 text-white/50 border border-white/10">
                    <X className="size-3" /> missing
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {log && (
          <pre className="mt-4 p-3 rounded-xl bg-black/60 text-xs font-mono text-neon-lime/90 max-h-64 overflow-auto whitespace-pre-wrap">
            <Terminal className="inline size-3 mr-1 text-white/50" />
            {log}
          </pre>
        )}
      </div>
    </div>
  );
}
