import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { CONSOLE_BY_ID } from "@/lib/emulators";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

interface Ribbon {
  baseY: number; // fraction of height
  amp1: number;
  amp2: number;
  freq1: number;
  freq2: number;
  speed1: number;
  speed2: number;
  thickness: number;
  alpha: number;
  colorMix: number; // 0 = system accent, 1 = white
}

const RIBBONS: Ribbon[] = [
  { baseY: 0.42, amp1: 46, amp2: 18, freq1: 0.0042, freq2: 0.011, speed1: 0.16, speed2: 0.05, thickness: 90, alpha: 0.075, colorMix: 0 },
  { baseY: 0.58, amp1: 38, amp2: 14, freq1: 0.0036, freq2: 0.009, speed1: -0.11, speed2: 0.07, thickness: 70, alpha: 0.055, colorMix: 0.35 },
  { baseY: 0.3, amp1: 30, amp2: 12, freq1: 0.005, freq2: 0.013, speed1: 0.08, speed2: -0.06, thickness: 50, alpha: 0.04, colorMix: 0.7 },
];

/**
 * The room: near-black, slow XMB-style sine ribbons drifting across the field,
 * faint grid, film grain, vignette. Ribbon hue eases toward the selected system.
 */
export function Ambient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedConsole = useStore((s) => s.selectedConsole);
  const targetRef = useRef<[number, number, number]>(hexToRgb("#d3fd50"));
  targetRef.current =
    selectedConsole === "all"
      ? hexToRgb("#d3fd50")
      : hexToRgb(CONSOLE_BY_ID[selectedConsole]?.accent ?? "#d3fd50");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const cur: [number, number, number] = [...targetRef.current];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (t: number) => {
      // ease current hue toward target
      const tgt = targetRef.current;
      cur[0] += (tgt[0] - cur[0]) * 0.02;
      cur[1] += (tgt[1] - cur[1]) * 0.02;
      cur[2] += (tgt[2] - cur[2]) * 0.02;

      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;

      for (const r of RIBBONS) {
        const cr = Math.round(cur[0] + (255 - cur[0]) * r.colorMix);
        const cg = Math.round(cur[1] + (255 - cur[1]) * r.colorMix);
        const cb = Math.round(cur[2] + (255 - cur[2]) * r.colorMix);
        const cy = r.baseY * h;

        const grad = ctx.createLinearGradient(0, cy - r.thickness, 0, cy + r.thickness);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
        grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${r.alpha})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = grad;

        ctx.beginPath();
        const yAt = (x: number) =>
          cy +
          Math.sin(x * r.freq1 + time * r.speed1 * Math.PI * 2 * 0.12) * r.amp1 +
          Math.sin(x * r.freq2 - time * r.speed2 * Math.PI * 2 * 0.12) * r.amp2;
        ctx.moveTo(0, yAt(0) - r.thickness);
        for (let x = 0; x <= w; x += 8) ctx.lineTo(x, yAt(x) - r.thickness);
        for (let x = w; x >= 0; x -= 8) ctx.lineTo(x, yAt(x) + r.thickness);
        ctx.closePath();
        ctx.fill();

        // hairline crest
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${r.alpha * 1.6})`;
        ctx.lineWidth = 1;
        ctx.moveTo(0, yAt(0));
        for (let x = 0; x <= w; x += 8) ctx.lineTo(x, yAt(x));
        ctx.stroke();
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #06070a 0%, #030304 70%)" }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 grid-bg" style={{ opacity: 0.5 }} />
      <div
        className="absolute animate-grain"
        style={{
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          backgroundImage: GRAIN,
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.5) 100%)" }}
      />
    </div>
  );
}
