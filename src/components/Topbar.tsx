import { Search } from "lucide-react";
import { useStore } from "@/lib/store";

export function Topbar() {
  const { search, setSearch } = useStore();
  return (
    <div className="h-16 px-6 flex items-center gap-4 border-b border-white/5">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games, systems..."
          className="w-full pl-10 pr-4 h-10 rounded-xl bg-white/[0.05] border border-white/10 text-sm placeholder:text-white/30 focus:bg-white/[0.08] focus:border-white/30 focus-ring"
        />
      </div>
      <div className="ml-auto flex items-center gap-2 text-xs font-mono text-white/40">
        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10">F11</kbd> fullscreen
        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10">Esc</kbd> back
      </div>
    </div>
  );
}
