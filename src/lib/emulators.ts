export type ConsoleId = "ps1" | "ps2" | "ps3" | "ps4" | "psp" | "n64" | "snes" | "nes" | "gba" | "dreamcast";

export interface ConsoleSpec {
  id: ConsoleId;
  name: string;
  shortName: string;
  vendor: string;
  year: number;
  emulator: {
    name: string;
    binary: string;
    brewCask?: string;
    brewFormula?: string;
    download?: string;
    args?: (romPath: string) => string[];
    notes?: string;
  };
  romExt: string[];
  accent: string;
  gradient: string;
  hero: string;
}

export const CONSOLES: ConsoleSpec[] = [
  {
    id: "ps1",
    name: "PlayStation",
    shortName: "PS1",
    vendor: "Sony",
    year: 1994,
    emulator: {
      name: "DuckStation",
      binary: "/Applications/DuckStation.app/Contents/MacOS/DuckStation",
      brewCask: "duckstation",
      download: "https://www.duckstation.org/",
    },
    romExt: [".cue", ".bin", ".chd", ".pbp", ".iso"],
    accent: "#28e2ff",
    gradient: "from-cyan-500/30 via-blue-500/20 to-indigo-700/30",
    hero: "Original PlayStation. CD-quality 32-bit era.",
  },
  {
    id: "ps2",
    name: "PlayStation 2",
    shortName: "PS2",
    vendor: "Sony",
    year: 2000,
    emulator: {
      name: "PCSX2",
      binary: "/Applications/PCSX2.app/Contents/MacOS/PCSX2",
      brewCask: "pcsx2",
      download: "https://pcsx2.net/",
    },
    romExt: [".iso", ".chd", ".cso", ".bin"],
    accent: "#8a5cff",
    gradient: "from-violet-500/30 via-fuchsia-500/20 to-indigo-700/30",
    hero: "Best-selling console of all time. Emotion Engine inside.",
  },
  {
    id: "ps3",
    name: "PlayStation 3",
    shortName: "PS3",
    vendor: "Sony",
    year: 2006,
    emulator: {
      name: "RPCS3",
      binary: "/Applications/RPCS3.app/Contents/MacOS/rpcs3",
      brewCask: "rpcs3",
      download: "https://rpcs3.net/",
      notes: "Apple Silicon build available. Cell BE emulation - heavy.",
    },
    romExt: [".pkg", ".iso", ".rap"],
    accent: "#b9ff5e",
    gradient: "from-lime-400/25 via-emerald-500/20 to-teal-600/30",
    hero: "Cell processor. Blu-ray. The hardest console to emulate.",
  },
  {
    id: "ps4",
    name: "PlayStation 4",
    shortName: "PS4",
    vendor: "Sony",
    year: 2013,
    emulator: {
      name: "shadPS4",
      binary: "/Applications/shadPS4.app/Contents/MacOS/shadPS4",
      download: "https://shadps4.net/",
      notes: "Experimental. Very early. Limited title compatibility on macOS.",
    },
    romExt: [".pkg"],
    accent: "#ff3da6",
    gradient: "from-pink-500/30 via-rose-500/20 to-red-600/30",
    hero: "Modern era. AMD Jaguar APU. Experimental emulation only.",
  },
  {
    id: "psp",
    name: "PlayStation Portable",
    shortName: "PSP",
    vendor: "Sony",
    year: 2004,
    emulator: {
      name: "PPSSPP",
      binary: "/Applications/PPSSPPSDL.app/Contents/MacOS/PPSSPPSDL",
      brewCask: "ppsspp",
      download: "https://www.ppsspp.org/",
    },
    romExt: [".iso", ".cso", ".pbp"],
    accent: "#ffb547",
    gradient: "from-amber-400/30 via-orange-500/20 to-rose-600/30",
    hero: "Handheld powerhouse. Runs natively at 4x on M-series.",
  },
  {
    id: "n64",
    name: "Nintendo 64",
    shortName: "N64",
    vendor: "Nintendo",
    year: 1996,
    emulator: {
      name: "Mupen64Plus",
      binary: "/opt/homebrew/bin/mupen64plus",
      brewFormula: "mupen64plus",
    },
    romExt: [".n64", ".z64", ".v64"],
    accent: "#ff5e5e",
    gradient: "from-red-500/30 via-rose-500/20 to-pink-700/30",
    hero: "Three-pronged controller. Mario 64 era.",
  },
  {
    id: "snes",
    name: "Super Nintendo",
    shortName: "SNES",
    vendor: "Nintendo",
    year: 1990,
    emulator: {
      name: "RetroArch",
      binary: "/Applications/RetroArch.app/Contents/MacOS/RetroArch",
      brewCask: "retroarch",
    },
    romExt: [".sfc", ".smc"],
    accent: "#a78bfa",
    gradient: "from-purple-500/30 via-indigo-500/20 to-violet-700/30",
    hero: "16-bit Mode 7 magic.",
  },
  {
    id: "nes",
    name: "Nintendo Entertainment System",
    shortName: "NES",
    vendor: "Nintendo",
    year: 1983,
    emulator: {
      name: "RetroArch",
      binary: "/Applications/RetroArch.app/Contents/MacOS/RetroArch",
      brewCask: "retroarch",
    },
    romExt: [".nes"],
    accent: "#f87171",
    gradient: "from-red-500/30 via-orange-500/20 to-amber-700/30",
    hero: "Where it all started. 8-bit royalty.",
  },
  {
    id: "gba",
    name: "Game Boy Advance",
    shortName: "GBA",
    vendor: "Nintendo",
    year: 2001,
    emulator: {
      name: "mGBA",
      binary: "/Applications/mGBA.app/Contents/MacOS/mGBA",
      brewCask: "mgba",
    },
    romExt: [".gba"],
    accent: "#60a5fa",
    gradient: "from-sky-500/30 via-blue-500/20 to-indigo-700/30",
    hero: "Pocket arcade. ARM7 inside.",
  },
  {
    id: "dreamcast",
    name: "Dreamcast",
    shortName: "DC",
    vendor: "Sega",
    year: 1998,
    emulator: {
      name: "Flycast",
      binary: "/Applications/Flycast.app/Contents/MacOS/Flycast",
      brewCask: "flycast",
    },
    romExt: [".cdi", ".gdi", ".chd"],
    accent: "#fb923c",
    gradient: "from-orange-500/30 via-amber-500/20 to-yellow-600/30",
    hero: "Last great Sega console. VMU and dial-up nostalgia.",
  },
];

export const CONSOLE_BY_ID = Object.fromEntries(
  CONSOLES.map((c) => [c.id, c])
) as Record<ConsoleId, ConsoleSpec>;
