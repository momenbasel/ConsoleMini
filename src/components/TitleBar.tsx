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
      className="drag h-9 px-[14px] flex items-center gap-3 flex-shrink-0"
      style={{
        background: "linear-gradient(180deg, #16181f 0%, #101218 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* reserve space for native macOS traffic lights (set by hiddenInset) */}
      <div style={{ width: 68 }} />
      <div
        className="flex-1 text-center text-[12px] font-medium tracking-[0.01em]"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        ConsoleMini <span style={{ color: "rgba(255,255,255,0.28)" }}>— {subtitle}</span>
      </div>
      <div style={{ width: 68 }} />
    </div>
  );
}
