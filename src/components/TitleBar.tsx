import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { CONSOLE_BY_ID } from "@/lib/emulators";

export function TitleBar() {
  const { view, selectedConsole } = useStore();
  const subtitle =
    view === "settings"
      ? "Settings"
      : view === "recent"
      ? "Recent"
      : selectedConsole === "all"
      ? "Library"
      : CONSOLE_BY_ID[selectedConsole]?.name ?? "Library";

  return (
    <div
      className="drag h-10 px-[14px] flex items-center gap-3 flex-shrink-0 relative"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.008) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      {/* top edge light */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }}
      />
      {/* reserve space for native macOS traffic lights (set by hiddenInset) */}
      <div style={{ width: 68 }} />
      <div className="flex-1 flex items-center justify-center gap-2 text-[12px] min-w-0">
        <span className="font-display font-bold stretch-wide tracking-[0.02em] text-white/85">CONSOLEMINI</span>
        <span className="text-white/25">/</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={subtitle}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="text-white/50 font-medium truncate"
          >
            {subtitle}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-end font-mono text-[9px] tracking-[0.18em] text-white/30" style={{ width: 68 }}>
        10-FT UI
      </div>
    </div>
  );
}
