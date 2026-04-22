#!/usr/bin/env bash
# ConsoleMini - emulator installer for macOS (Apple Silicon + Intel)
# Installs PS1/PS2/PS3/PSP/N64/SNES/NES/GBA/Dreamcast emulators via Homebrew.
# PS4 (shadPS4) is fetched directly - not in Homebrew at time of writing.

set -euo pipefail

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
red() { printf "\033[31m%s\033[0m\n" "$*"; }

if ! command -v brew >/dev/null 2>&1; then
  yellow "Homebrew not found. Installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

bold "==> Updating Homebrew"
brew update

CASKS=(
  duckstation     # PS1
  pcsx2           # PS2
  rpcs3           # PS3 (Apple Silicon supported)
  ppsspp          # PSP
  mgba            # GBA
  flycast         # Dreamcast
  retroarch       # SNES/NES/Genesis multi-system
)

FORMULAE=(
  mupen64plus     # N64
)

for c in "${CASKS[@]}"; do
  if brew list --cask "$c" >/dev/null 2>&1; then
    green "[ok] $c already installed"
  else
    bold "==> Installing cask: $c"
    brew install --cask "$c" || yellow "[warn] $c install failed - check $c manually"
  fi
done

for f in "${FORMULAE[@]}"; do
  if brew list "$f" >/dev/null 2>&1; then
    green "[ok] $f already installed"
  else
    bold "==> Installing formula: $f"
    brew install "$f" || yellow "[warn] $f install failed"
  fi
done

bold "==> PS4 (shadPS4) - manual download recommended"
SHADPS4_URL="https://github.com/shadps4-emu/shadPS4/releases/latest"
if [ ! -d "/Applications/shadPS4.app" ]; then
  yellow "shadPS4 is experimental and not on Homebrew yet."
  yellow "Download macOS build from: $SHADPS4_URL"
  yellow "Drop shadPS4.app into /Applications when done."
else
  green "[ok] shadPS4 already in /Applications"
fi

bold "==> RetroArch cores"
CORES_DIR="/Applications/RetroArch.app/Contents/Resources/cores"
if [ -d "$CORES_DIR" ]; then
  green "Cores dir: $CORES_DIR"
  yellow "Open RetroArch -> Online Updater -> Core Downloader -> grab snes9x, nestopia, mupen64plus_next"
else
  yellow "RetroArch not installed - skipping core check"
fi

bold "==> Done"
green "Run ConsoleMini and check Settings > Emulators for status."
