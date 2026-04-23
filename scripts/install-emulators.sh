#!/usr/bin/env bash
# ConsoleMini - emulator installer for macOS (Apple Silicon + Intel)
# Usage: install-emulators.sh [id1 id2 ...]
#   IDs: ps1 ps2 ps3 ps4 psp n64 snes nes gba dreamcast
#   No args = install everything.

set -euo pipefail

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
red() { printf "\033[31m%s\033[0m\n" "$*"; }

if ! command -v brew >/dev/null 2>&1; then
  yellow "Homebrew not found. Installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# map id -> "kind:name"  (kind = cask|formula|manual)
id_pkg() {
  case "$1" in
    ps1)        echo "cask:duckstation" ;;
    ps2)        echo "cask:pcsx2" ;;
    ps3)        echo "cask:rpcs3" ;;
    ps4)        echo "manual:shadps4" ;;
    psp)        echo "cask:ppsspp" ;;
    n64)        echo "formula:mupen64plus" ;;
    snes|nes)   echo "cask:retroarch" ;;
    gba)        echo "cask:mgba" ;;
    dreamcast)  echo "cask:flycast" ;;
    *)          echo "" ;;
  esac
}

ALL_IDS=(ps1 ps2 ps3 ps4 psp n64 snes nes gba dreamcast)
if [ "$#" -eq 0 ]; then
  SELECTED=("${ALL_IDS[@]}")
else
  SELECTED=("$@")
fi

bold "==> Updating Homebrew"
brew update || yellow "[warn] brew update failed - continuing"

# dedupe resolved pkgs so retroarch isn't installed twice when both snes+nes selected
declare -a SEEN=()
seen() { for s in "${SEEN[@]:-}"; do [ "$s" = "$1" ] && return 0; done; return 1; }

for id in "${SELECTED[@]}"; do
  entry=$(id_pkg "$id")
  [ -z "$entry" ] && { yellow "[skip] unknown id: $id"; continue; }
  kind="${entry%%:*}"; name="${entry#*:}"
  if seen "$kind:$name"; then continue; fi
  SEEN+=("$kind:$name")

  case "$kind" in
    cask)
      if brew list --cask "$name" >/dev/null 2>&1; then
        green "[ok] $name already installed"
      else
        bold "==> Installing cask: $name"
        brew install --cask "$name" || yellow "[warn] $name install failed"
      fi
      ;;
    formula)
      if brew list "$name" >/dev/null 2>&1; then
        green "[ok] $name already installed"
      else
        bold "==> Installing formula: $name"
        brew install "$name" || yellow "[warn] $name install failed"
      fi
      ;;
    manual)
      if [ "$name" = "shadps4" ]; then
        if [ -d "/Applications/shadPS4.app" ]; then
          green "[ok] shadPS4 already in /Applications"
        else
          yellow "shadPS4 not on Homebrew. Download macOS build:"
          yellow "  https://github.com/shadps4-emu/shadPS4/releases/latest"
          yellow "Drop shadPS4.app into /Applications when done."
        fi
      fi
      ;;
  esac
done

# RetroArch cores notice only if RetroArch selected
for id in "${SELECTED[@]}"; do
  case "$id" in
    snes|nes)
      CORES_DIR="/Applications/RetroArch.app/Contents/Resources/cores"
      if [ -d "$CORES_DIR" ]; then
        yellow "Open RetroArch -> Online Updater -> Core Downloader -> snes9x, nestopia"
      fi
      break
      ;;
  esac
done

bold "==> Done"
green "Selected: ${SELECTED[*]}"
