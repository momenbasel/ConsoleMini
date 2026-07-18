import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ConsoleSpec } from "@/lib/emulators";
import { useStore } from "@/lib/store";
import { bridge } from "@/lib/ipc";
import { Pill } from "@/lib/ui";

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export function ConsoleCard({ c, count, index = 0 }: { c: ConsoleSpec; count: number; index?: number }) {
  const setSelectedConsole = useStore((s) => s.setSelectedConsole);
  const [ready, setReady] = useState<boolean | null>(null);
  const [hover, setHover] = useState(false);
  const experimental = c.id === "ps4";
  const num = String(index + 1).padStart(3, "0");

  useEffect(() => {
    bridge.checkEmulator(c.id).then((r) => setReady(r.installed));
  }, [c.id]);

  return (
    <motion.button
      onClick={() => setSelectedConsole(c.id)}
      data-focusable
      initial={{ opacity: 0, rotateX: -32, y: 26 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ delay: 0.06 + index * 0.05, duration: 0.55, ease: EASE }}
      style={{ transformPerspective: 1100, transformOrigin: "center top" }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileTap={{ scale: 0.98 }}
      className="group relative h-[168px] overflow-hidden text-left focus-ring"
    >
      <div
        className="absolute inset-0"
        style={{
          background: hover ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.022)",
          border: `1px solid ${hover ? `${c.accent}66` : "rgba(255,255,255,0.075)"}`,
          transition: "background 0.3s var(--ease-glide), border-color 0.3s var(--ease-glide)",
        }}
      />
      {/* corner ticks instead of glow */}
      <span
        className="absolute top-0 left-0 w-2.5 h-2.5 transition-opacity duration-300"
        style={{
          borderTop: `1.5px solid ${c.accent}`,
          borderLeft: `1.5px solid ${c.accent}`,
          opacity: hover ? 1 : 0.35,
        }}
      />
      <span
        className="absolute bottom-0 right-0 w-2.5 h-2.5 transition-opacity duration-300"
        style={{
          borderBottom: `1.5px solid ${c.accent}`,
          borderRight: `1.5px solid ${c.accent}`,
          opacity: hover ? 1 : 0.35,
        }}
      />
      {/* faint accent field, flat */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: `${c.accent}${hover ? "0d" : "06"}` }}
      />

      <div className="relative h-full p-[18px] flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="font-mono text-[9px] tracking-[0.22em] text-white/45 uppercase">
            № {num} / {c.vendor} · {c.year}
          </div>
          {experimental ? (
            <Pill accent="#ff3da6">EXP</Pill>
          ) : ready ? (
            <Pill accent="#d3fd50" filled>
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

        <div>
          <div
            className="font-display font-black stretch-wide leading-none transition-all duration-300"
            style={{
              fontSize: 38,
              color: c.accent,
              letterSpacing: "0.01em",
              textShadow: hover ? `0 0 24px ${c.accent}80` : "none",
            }}
          >
            {c.shortName}
          </div>
          <div className="text-[12.5px] text-white/75 mt-1.5 font-medium">{c.name}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] text-white/45 tracking-[0.1em]">
            {c.emulator.name.toUpperCase()} ·{" "}
            <span className="text-white/85">
              {count} {count === 1 ? "ROM" : "ROMS"}
            </span>
          </div>
          <motion.div
            className="font-mono text-[13px]"
            animate={hover ? { x: 4 } : { x: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ color: hover ? c.accent : "rgba(255,255,255,0.35)" }}
          >
            -›
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}
