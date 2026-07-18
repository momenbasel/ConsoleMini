import { useEffect, useState } from "react";
import { create } from "zustand";
import { motion } from "framer-motion";
import { useStore } from "./store";
import { CONSOLE_BY_ID } from "./emulators";

export type Direction = "up" | "down" | "left" | "right";

interface FocusState {
  /** currently spotlighted element (null = no spatial focus) */
  focusEl: HTMLElement | null;
  /** true once the user navigates with pad/keys — hides ring during mouse use */
  spatial: boolean;
  setFocus: (el: HTMLElement | null) => void;
  setSpatial: (b: boolean) => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  focusEl: null,
  spatial: false,
  setFocus: (el) =>
    set((s) => {
      if (s.focusEl && s.focusEl !== el) s.focusEl.removeAttribute("data-spotlight");
      if (el) el.setAttribute("data-spotlight", "");
      return { focusEl: el };
    }),
  setSpatial: (b) =>
    set((s) => {
      // mouse mode: hide the inversion; pad/keys bring it back
      if (!b && s.focusEl) s.focusEl.removeAttribute("data-spotlight");
      if (b && s.focusEl) s.focusEl.setAttribute("data-spotlight", "");
      return { spatial: b };
    }),
}));

function visibleFocusables(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-focusable]")).filter((el) => {
    if (!document.contains(el)) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none";
  });
}

const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

function nearest(from: DOMRect, els: HTMLElement[], dir: Direction): HTMLElement | null {
  const a = center(from);
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r === from) continue;
    const b = center(r);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const primary = dir === "up" ? -dy : dir === "down" ? dy : dir === "left" ? -dx : dx;
    if (primary < 6) continue;
    const ortho = dir === "up" || dir === "down" ? Math.abs(dx) : Math.abs(dy);
    // reward candidates whose orthogonal axis overlaps the current element
    const overlap =
      dir === "up" || dir === "down"
        ? r.left < from.right && r.right > from.left
        : r.top < from.bottom && r.bottom > from.top;
    const score = primary + ortho * 2.2 + (overlap ? 0 : 420);
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}

/** Move the spotlight. Falls back to the first focusable when none is active. */
export function navigate(dir: Direction) {
  const { focusEl } = useFocusStore.getState();
  useFocusStore.getState().setSpatial(true);
  const els = visibleFocusables();
  if (els.length === 0) return;
  let next: HTMLElement | null = null;
  if (!focusEl || !document.contains(focusEl)) {
    next = els[0];
  } else {
    next = nearest(focusEl.getBoundingClientRect(), els.filter((e) => e !== focusEl), dir);
  }
  if (next) {
    useFocusStore.getState().setFocus(next);
    next.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }
}

/** Activate the spotlighted element (A / Cross). */
export function confirmFocus() {
  const { focusEl } = useFocusStore.getState();
  if (!focusEl || !document.contains(focusEl)) return;
  if (focusEl instanceof HTMLInputElement) focusEl.focus();
  else focusEl.click();
}

export function clearFocus() {
  useFocusStore.getState().setFocus(null);
}

/** The flying spotlight ring — one overlay, springs between focused elements. */
export function FocusRing() {
  const focusEl = useFocusStore((s) => s.focusEl);
  const spatial = useFocusStore((s) => s.spatial);
  const selectedConsole = useStore((s) => s.selectedConsole);
  const accent = selectedConsole === "all" ? "#d3fd50" : CONSOLE_BY_ID[selectedConsole]?.accent ?? "#d3fd50";
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!focusEl || !spatial || !document.contains(focusEl)) {
      setRect(null);
      return;
    }
    let raf = 0;
    let frames = 0;
    const measure = () => {
      if (!document.contains(focusEl)) {
        setRect(null);
        return;
      }
      setRect(focusEl.getBoundingClientRect());
      // keep tracking for ~700ms so entrance/layout animations settle under the ring
      if (frames++ < 45) raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    const remeasure = () => {
      if (document.contains(focusEl)) setRect(focusEl.getBoundingClientRect());
    };
    window.addEventListener("scroll", remeasure, true);
    window.addEventListener("resize", remeasure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", remeasure, true);
      window.removeEventListener("resize", remeasure);
    };
  }, [focusEl, spatial]);

  const pad = 5;
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 z-[90] pointer-events-none"
      initial={false}
      animate={
        rect
          ? {
              x: rect.left - pad,
              y: rect.top - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2,
              opacity: 1,
            }
          : { opacity: 0 }
      }
      transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.9 }}
    >
      {rect && (
        <div
          className="w-full h-full animate-ringpulse"
          style={{
            borderRadius: 13,
            border: `1.5px solid ${accent}`,
            boxShadow: `0 0 0 3px ${accent}26, 0 0 24px ${accent}40, inset 0 0 18px ${accent}14`,
            background: `${accent}08`,
          }}
        />
      )}
    </motion.div>
  );
}
