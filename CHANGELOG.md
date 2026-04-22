# Changelog

All notable changes to ConsoleMini are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-04-22

### Added
- First public release.
- 10 supported systems: PS1, PS2, PS3, PS4, PSP, N64, SNES, NES, GBA, Dreamcast.
- Big-picture launcher UI built with Electron + React + Tailwind + Framer Motion.
- HTML5 Gamepad API navigation with auto-detect.
- ROM folder scanner (recursive, per-console extension matching).
- Settings tab with one-click "Install / update all emulators" via Homebrew.
- Kiosk script (`scripts/setup-kiosk.sh`): auto-launch at login, hide Dock, disable sleep.
- Codesigned + hardened-runtime macOS build (arm64 + x64).
- Retro Macintosh icon set + landing page (`docs/`).
