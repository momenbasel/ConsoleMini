import { useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CONSOLE_BY_ID, CONSOLES } from "@/lib/emulators";
import { useStore } from "@/lib/store";
import { GlowDot, paletteFromTitle } from "@/lib/ui";
import { bridge } from "@/lib/ipc";

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export function Hero() {
  const { games, setSelectedConsole } = useStore();

  const last = useMemo(() => {
    if (games.length === 0) return null;
    const sorted = [...games].sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
    return sorted[0];
  }, [games]);

  if (!last) {
    return <EmptyHero onPick={(id) => setSelectedConsole(id)} />;
  }

  return <ResumeHero gameId={last.id} />;
}

function ResumeHero({ gameId }: { gameId: string }) {
  const game = useStore((s) => s.games.find((g) => g.id === gameId));
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rX = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 140, damping: 18 });
  const rY = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 140, damping: 18 });

  if (!game) return null;
  const c = CONSOLE_BY_ID[game.console];
  const palette = paletteFromTitle(game.title);
  const pct = Math.min(99, Math.max(3, (game.playCount ?? 0) * 12));
  const initials = game.title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const catalog = `№ ${String(Math.abs(game.id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0)) % 900 + 100).padStart(3, "0")}`;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      className="relative mb-10"
    >
      {/* channel kicker */}
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.24em] text-white/45 mb-4">
        <span className="flex items-center gap-2.5">
          <GlowDot color={c.accent} pulse />
          CH·RESUME — {c.shortName} · {c.vendor.toUpperCase()} · {c.year}
        </span>
        <span className="text-white/30">{catalog} / {c.emulator.name.toUpperCase()}</span>
      </div>

      <div className="grid gap-10 items-end" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
        {/* title block — massive, light, uppercase */}
        <div className="min-w-0">
          <h1
            className="font-display stretch-wide uppercase leading-[0.92] truncate"
            style={{ fontSize: "clamp(40px, 5.2vw, 84px)", fontWeight: 320, letterSpacing: "0.005em" }}
          >
            {game.title}
          </h1>

          <div className="flex items-center gap-4 mt-6 max-w-[520px]">
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/45">PROGRESS</span>
            <div className="flex-1 h-px relative" style={{ background: "rgba(255,255,255,0.12)" }}>
              <motion.div
                className="absolute left-0 top-0 h-px"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
                style={{ background: c.accent, boxShadow: `0 0 10px ${c.accent}` }}
              />
              <motion.div
                className="absolute w-[7px] h-[7px] -top-[3px]"
                initial={{ left: 0 }}
                animate={{ left: `${pct}%` }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
                style={{ background: c.accent, boxShadow: `0 0 12px ${c.accent}` }}
              />
            </div>
            <span className="font-mono text-[11px] tabular-nums" style={{ color: c.accent }}>
              {String(pct).padStart(2, "0")}%
            </span>
          </div>

          {/* prompt CTAs */}
          <div className="flex items-center gap-3 mt-7">
            <PromptBtn
              accent={c.accent}
              label="RESUME"
              primary
              onClick={async () => {
                await bridge.launch(game.console, game.path);
                useStore.getState().markPlayed(game.id);
              }}
            />
            <PromptBtn accent={c.accent} label="SAVE STATES" />
            <PromptBtn accent={c.accent} label="DETAILS" />
          </div>
        </div>

        {/* CRT cover in notched double frame */}
        <div className="relative hidden md:block" style={{ width: 218, height: 218 }}>
          <div
            className="notch absolute inset-0"
            style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.02)" }}
          />
          <div
            className="notch-sm absolute"
            style={{ inset: 7, border: `1px solid ${c.accent}45` }}
          />
          <motion.div
            className="notch-sm absolute overflow-hidden grid place-items-center"
            style={{
              inset: 12,
              rotateX: rX,
              rotateY: rY,
              transformStyle: "preserve-3d",
              background: `radial-gradient(130% 110% at 25% 20%, ${palette[0]} 0%, ${palette[1]} 62%, #05070c 100%)`,
            }}
          >
            <div className="absolute inset-0 scanlines opacity-70" />
            <div className="crt-sweep" />
            <div
              className="font-display font-black stretch-wide leading-[0.9]"
              style={{
                fontSize: 76,
                color: "rgba(255,255,255,0.95)",
                textShadow: `0 0 26px ${c.accent}80, 4px 5px 0 rgba(0,0,0,0.45)`,
              }}
            >
              {initials || "??"}
            </div>
            <div className="absolute left-0 right-0 bottom-3 text-center font-mono text-[8.5px] tracking-[0.2em] text-white/55">
              {c.shortName} · {c.year}
            </div>
          </motion.div>
          <div className="absolute -bottom-6 right-0 font-mono text-[9px] tracking-[0.2em] text-white/35">
            SAVE {String((game.playCount ?? 1) % 9 || 1).padStart(2, "0")} · AUTO
          </div>
        </div>
      </div>

      <div className="hairline-fade mt-10" />
    </motion.section>
  );
}

/** terminal-style prompt button: `> LABEL`, accent flips on hover */
function PromptBtn({
  accent,
  label,
  primary = false,
  onClick,
}: {
  accent: string;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      data-focusable
      whileTap={{ scale: 0.96 }}
      className="group/btn relative h-10 px-5 flex items-center gap-2.5 font-mono text-[11.5px] tracking-[0.18em] focus-ring"
      style={{
        border: `1px solid ${primary ? accent : "rgba(255,255,255,0.16)"}`,
        color: primary ? "#07080b" : "rgba(255,255,255,0.85)",
        background: primary ? accent : "transparent",
        boxShadow: primary ? `0 0 24px ${accent}35` : undefined,
        transition: "border-color 0.25s var(--ease-glide), color 0.25s var(--ease-glide), background 0.25s var(--ease-glide)",
      }}
      onMouseEnter={(e) => {
        if (!primary) {
          e.currentTarget.style.borderColor = accent;
          e.currentTarget.style.color = accent;
        }
      }}
      onMouseLeave={(e) => {
        if (!primary) {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
          e.currentTarget.style.color = "rgba(255,255,255,0.85)";
        }
      }}
    >
      <span style={{ color: primary ? "#07080b" : accent }}>›</span>
      {label}
    </motion.button>
  );
}

function EmptyHero({ onPick }: { onPick: (id: (typeof CONSOLES)[number]["id"]) => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="relative mb-10"
    >
      <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.24em] text-white/45 mb-4">
        <GlowDot color="#d3fd50" pulse />
        CH·00 — NO SIGNAL · MAC MINI EDITION
      </div>

      <h1
        className="font-display stretch-wide uppercase leading-[0.92]"
        style={{ fontSize: "clamp(40px, 5.2vw, 84px)", fontWeight: 320, letterSpacing: "0.005em" }}
      >
        Ten systems.
        <br />
        <span style={{ color: "#d3fd50" }}>Zero</span> cartridges
        <br />
        on the shelf.
      </h1>

      <p className="mt-6 text-[14px] text-white/55 max-w-lg leading-relaxed">
        Point a system at a folder of ROMs and it joins the catalog. Pick one to start the transmission:
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5">
        {CONSOLES.slice(0, 6).map((c, i) => (
          <motion.button
            key={c.id}
            data-focusable
            onClick={() => onPick(c.id)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.055, duration: 0.35, ease: EASE }}
            className="group flex items-center gap-2 font-mono text-[12.5px] tracking-[0.1em] py-1 focus-ring"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = c.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            <span style={{ color: c.accent }}>›</span>
            {c.shortName}
            <span className="text-white/30 group-hover:hidden">{c.name}</span>
            <span className="hidden group-hover:inline" style={{ color: c.accent }}>
              {c.name}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="hairline-fade mt-10" />
    </motion.section>
  );
}
