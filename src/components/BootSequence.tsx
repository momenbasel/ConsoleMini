import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const LINES = [
  "CM-OS 0.1.3 · CONSOLEMINI SYSTEM ROM",
  "> MOUNTING ROM VAULTS .......... OK",
  "> PROBING EMULATOR RUNTIMES .... OK",
  "> PAD INTERFACE ................ LISTENING",
  "> SIGNAL LOCK — 60HZ",
];

const FULL = LINES.join("\n");

/**
 * Console-authentic boot: phosphor terminal types itself in, then five columns
 * collapse upward to reveal the launcher. Any key / click / pad button skips.
 */
export function BootSequence({ onDone }: { onDone: () => void }) {
  const [typed, setTyped] = useState(0);
  const [collapsing, setCollapsing] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setCollapsing(true);
    window.setTimeout(onDone, 620);
  };

  // type-out driven by rAF elapsed time — robust under timer throttling
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const DELAY = 320;
    const DURATION = 2300;
    const tick = (t: number) => {
      if (doneRef.current) return;
      const el = t - t0 - DELAY;
      const raw = Math.max(0, Math.min(1, el / DURATION));
      // bursty easing: fast start, stepped pauses like a real terminal
      const eased = raw < 0.12 ? raw * 0.4 : 0.048 + (raw - 0.12) * 1.086;
      const n = Math.min(FULL.length, Math.floor(Math.min(1, eased) * FULL.length));
      setTyped(n);
      if (n >= FULL.length) {
        window.setTimeout(finish, 400);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // skip on key / click / any pad button
  useEffect(() => {
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onKey);
    let raf = 0;
    const poll = () => {
      const pads = navigator.getGamepads?.() || [];
      if (pads.some((p) => p && p.buttons.some((b) => b.pressed))) finish();
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onKey);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.min(100, Math.round((typed / FULL.length) * 100));
  const shown = FULL.slice(0, typed);
  const lastNl = shown.lastIndexOf("\n");
  const prior = shown.slice(0, lastNl + 1);
  const current = shown.slice(lastNl + 1);

  return (
    <div className="fixed inset-0 z-[100]" aria-hidden>
      {/* collapsing columns */}
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-full flex-1"
            style={{ background: "#030304", transformOrigin: "center top" }}
            initial={{ scaleY: 1 }}
            animate={collapsing ? { scaleY: 0 } : { scaleY: 1 }}
            transition={{ delay: i * 0.055, duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
          />
        ))}
      </div>

      {/* terminal content */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-between p-10"
        animate={collapsing ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.22 }}
      >
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] text-white/40">
          <span
            className="inline-block w-2 h-2"
            style={{ background: "#d3fd50", boxShadow: "0 0 10px #d3fd50" }}
          />
          CM-OS BOOT AGENT
        </div>

        <div className="font-mono text-[13px] leading-[2] text-white/85 whitespace-pre-wrap max-w-[560px]">
          <span className="text-white/40">{prior}</span>
          <span>
            {current.startsWith("CM-OS") ? (
              <span style={{ color: "#d3fd50" }}>{current}</span>
            ) : (
              current
            )}
            <span className="caret" style={{ color: "#d3fd50" }} />
          </span>
        </div>

        <div className="flex items-end justify-between font-mono text-[10px] tracking-[0.2em] text-white/40">
          <div className="flex items-center gap-3 w-full max-w-[420px]">
            <span>LOAD</span>
            <div className="flex-1 h-[3px]" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full"
                style={{ width: `${pct}%`, background: "#d3fd50", boxShadow: "0 0 12px #d3fd5080" }}
              />
            </div>
            <span className="tabular-nums text-white/70">{String(pct).padStart(3, "0")}%</span>
          </div>
          <span className="animate-cmpulse">PRESS ANY BUTTON TO SKIP</span>
        </div>
      </motion.div>
    </div>
  );
}
