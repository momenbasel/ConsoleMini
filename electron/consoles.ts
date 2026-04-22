export type ConsoleId =
  | "ps1" | "ps2" | "ps3" | "ps4" | "psp"
  | "n64" | "snes" | "nes" | "gba" | "dreamcast";

interface EmuSpec {
  name: string;
  binary: string;
  args?: (rom: string) => string[];
}
interface ConsoleSpec {
  id: ConsoleId;
  romExt: string[];
  emulator: EmuSpec;
}

export const CONSOLES: ConsoleSpec[] = [
  { id: "ps1",       romExt: [".cue", ".bin", ".chd", ".pbp", ".iso"],
    emulator: { name: "DuckStation", binary: "/Applications/DuckStation.app/Contents/MacOS/DuckStation",
      args: (r) => ["-fullscreen", r] } },
  { id: "ps2",       romExt: [".iso", ".chd", ".cso", ".bin"],
    emulator: { name: "PCSX2", binary: "/Applications/PCSX2.app/Contents/MacOS/PCSX2",
      args: (r) => ["--", r] } },
  { id: "ps3",       romExt: [".pkg", ".iso", ".rap"],
    emulator: { name: "RPCS3", binary: "/Applications/RPCS3.app/Contents/MacOS/rpcs3",
      args: (r) => ["--no-gui", r] } },
  { id: "ps4",       romExt: [".pkg"],
    emulator: { name: "shadPS4", binary: "/Applications/shadPS4.app/Contents/MacOS/shadPS4",
      args: (r) => [r] } },
  { id: "psp",       romExt: [".iso", ".cso", ".pbp"],
    emulator: { name: "PPSSPP", binary: "/Applications/PPSSPPSDL.app/Contents/MacOS/PPSSPPSDL",
      args: (r) => [r] } },
  { id: "n64",       romExt: [".n64", ".z64", ".v64"],
    emulator: { name: "Mupen64Plus", binary: "/opt/homebrew/bin/mupen64plus",
      args: (r) => ["--fullscreen", r] } },
  { id: "snes",      romExt: [".sfc", ".smc"],
    emulator: { name: "RetroArch", binary: "/Applications/RetroArch.app/Contents/MacOS/RetroArch",
      args: (r) => ["-L", "/Applications/RetroArch.app/Contents/Resources/cores/snes9x_libretro.dylib", r] } },
  { id: "nes",       romExt: [".nes"],
    emulator: { name: "RetroArch", binary: "/Applications/RetroArch.app/Contents/MacOS/RetroArch",
      args: (r) => ["-L", "/Applications/RetroArch.app/Contents/Resources/cores/nestopia_libretro.dylib", r] } },
  { id: "gba",       romExt: [".gba"],
    emulator: { name: "mGBA", binary: "/Applications/mGBA.app/Contents/MacOS/mGBA",
      args: (r) => ["-f", r] } },
  { id: "dreamcast", romExt: [".cdi", ".gdi", ".chd"],
    emulator: { name: "Flycast", binary: "/Applications/Flycast.app/Contents/MacOS/Flycast",
      args: (r) => [r] } },
];
