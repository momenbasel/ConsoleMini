import { useEffect, useState } from "react";
import type { ConsoleSpec } from "@/lib/emulators";
import { useStore } from "@/lib/store";
import { bridge } from "@/lib/ipc";
import { Pill } from "@/lib/ui";

export function ConsoleCard({ c, count }: { c: ConsoleSpec; count: number }) {
  const setSelectedConsole = useStore((s) => s.setSelectedConsole);
  const [ready, setReady] = useState<boolean | null>(null);
  const experimental = c.id === "ps4";

  useEffect(() => {
    bridge.checkEmulator(c.id).then((r) => setReady(r.installed));
  }, [c.id]);

  return (
    <button
      onClick={() => setSelectedConsole(c.id)}
      className="relative h-[150px] rounded-[14px] overflow-hidden text-left focus-ring"
      style={{
        background: "#0d1017",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 100% at 0% 0%, ${c.accent}25 0%, transparent 55%)` }}
      />
      <div
        className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full"
        style={{ background: c.accent, opacity: 0.12, filter: "blur(30px)" }}
      />
      <div className="absolute inset-0 grid-bg" />

      <div className="relative h-full p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-mono text-[9px] tracking-[0.22em] text-white/45 uppercase">
              {c.vendor} · {c.year}
            </div>
            <div
              className="font-display font-bold tracking-[-0.03em] mt-1 leading-none"
              style={{ fontSize: 28, color: c.accent }}
            >
              {c.shortName}
            </div>
            <div className="text-[12px] text-white/75 mt-1 font-medium">{c.name}</div>
          </div>
          {experimental ? (
            <Pill accent="#ff3da6">EXP</Pill>
          ) : ready ? (
            <Pill accent="#c6ff3d" filled>
              ● READY
            </Pill>
          ) : ready === false ? (
            <Pill accent="#ff9f47">⚠ INSTALL</Pill>
          ) : (
            <Pill accent="#ffffff" style={{ color: "rgba(255,255,255,0.4)" }}>
              …
            </Pill>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] text-white/45 tracking-[0.1em]">
            {c.emulator.name} ·{" "}
            <span className="text-white/80">
              {count} {count === 1 ? "rom" : "roms"}
            </span>
          </div>
          <div
            className="w-[26px] h-[26px] rounded-lg grid place-items-center"
            style={{ border: `1px solid ${c.accent}40`, background: `${c.accent}12` }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={c.accent} strokeWidth="1.6">
              <path d="M3 2 L7 5 L3 8" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}
