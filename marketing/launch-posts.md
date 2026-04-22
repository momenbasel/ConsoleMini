# ConsoleMini - Launch Copy

Use one block per channel. Tweak hashtags / community tone as needed.

---

## Hacker News (Show HN)

**Title:** `Show HN: ConsoleMini - turn a Mac mini into a living-room PS1-PS4 console`

**Body:**
I built ConsoleMini after my Mac mini sat idle under the TV for months. It's a controller-first launcher (Electron + React) that wraps the actual emulators - DuckStation, PCSX2, RPCS3, shadPS4, PPSSPP, RetroArch - in a big-picture UI you can drive entirely from a DualShock / Xbox / 8BitDo pad.

Why another launcher: OpenEmu doesn't cover PS2/3/4. RetroArch is powerful but the menu is rough on a TV. Pegasus is great but heavy on Apple Silicon. ConsoleMini stays out of the way - it scans your ROM folders, hands the path to the right emulator, and runs full-screen.

Tech notes:
- Apple Silicon native (arm64 + x64 universal). Hardened runtime, codesigned, notarization in flight.
- HTML5 Gamepad API for menu nav. Each emulator handles in-game input itself.
- Per-console catalogue is data-driven (`src/lib/emulators.ts`) so adding a system is a one-file change.
- Kiosk mode script: auto-launch at login, hide Dock, no sleep.

Repo + DMG: https://github.com/momenbasel/ConsoleMini

It ships zero ROMs / BIOS - bring your own. Feedback welcome, especially on the PS4 (shadPS4) integration which is rough.

---

## Reddit - r/emulation

**Title:** `[Tool] ConsoleMini - macOS launcher that wraps DuckStation / PCSX2 / RPCS3 / shadPS4 / PPSSPP / RetroArch in one couch UI`

**Body:**
Hey r/emulation - long-time lurker. I made a launcher specifically for the Mac mini → TV setup so I can drop on the couch with a controller and not touch the keyboard.

What it does:
- Pretty per-console grid (PS1, PS2, PS3, PS4, PSP, N64, SNES, NES, GBA, Dreamcast)
- Scans a folder you pick, indexes by extension per system
- One-tap launches the right emulator with the ROM path
- Full Gamepad API navigation, Esc/B-button = back

What it does NOT do:
- Emulate anything itself. Real emulators do the heavy lifting.
- Ship ROMs/BIOS. Bring your own.

Apple Silicon native, hardened runtime, codesigned. Free + MIT.

Repo: https://github.com/momenbasel/ConsoleMini

Honest about the limits: PS4 (shadPS4) is experimental upstream so compatibility is thin. PS3 (RPCS3) works but heavy on M-series. Everything PS2 and below feels native.

---

## Reddit - r/macgaming

**Title:** `ConsoleMini: I turned my Mac mini into a couch console - PS1-PS4 + retro, big-picture launcher (free, MIT)`

(Body: similar to above, leaning into the "Apple Silicon performance" angle and pairing with a DualSense over Bluetooth.)

---

## Reddit - r/macmini

**Title:** `Best use I've found for my Mac mini: turn it into a retro/PlayStation console`

**Body:**
My M2 Mac mini was gathering dust. Hooked it to the TV, paired a DualSense, and built a launcher that lets me boot PS1-PS4 + retro from one big-picture UI without touching the keyboard.

It's just a frontend over real emulators (DuckStation/PCSX2/RPCS3/shadPS4/PPSSPP/RetroArch), so all the credit for the heavy lifting goes to those teams. The Homebrew installer in the repo grabs everything in one shot.

Open source, signed DMG: https://github.com/momenbasel/ConsoleMini

---

## X / Twitter

> Mac mini under the TV doing nothing?
>
> ConsoleMini turns it into a controller-first PS1-PS4 + retro launcher. Apple Silicon native, codesigned, MIT.
>
> 10 systems, one beautiful big-picture UI. Bring your own ROMs.
>
> https://github.com/momenbasel/ConsoleMini

Thread variant (4 tweets):
1. Hook + screenshot
2. "What it wraps" - DuckStation, PCSX2, RPCS3, shadPS4, PPSSPP, RetroArch, mGBA, Flycast, Mupen64Plus
3. Kiosk script: auto-launch at login + no sleep = literally a console
4. Star + DMG link

Hashtags: `#macgaming #emulation #PlayStation #retrogaming #AppleSilicon #MacMini`

---

## Product Hunt

**Tagline:** Turn your Mac mini into a living-room console.

**Description:**
ConsoleMini is a beautiful, controller-first big-picture launcher that wraps the best macOS emulators (DuckStation, PCSX2, RPCS3, shadPS4, PPSSPP, RetroArch, mGBA, Flycast) into one couch-friendly UI. Apple Silicon native, codesigned, MIT-licensed. Bring a DualSense, a TV, and your ROMs.

**First comment:**
Hey PH! Built this because my Mac mini was the most underutilized thing in my apartment. Real emulators do the heavy lifting; ConsoleMini just gives them a UI you can navigate without a keyboard. Would love feedback - especially on cover art scraping (next on the roadmap).

**Topics:** Gaming, Mac, Apple, Open Source

---

## IndieHackers

**Title:** `Open-sourced ConsoleMini - day one, looking for first users`

**Body:** Same hook as HN, plus a "what I learned shipping an Electron + React app on macOS with full codesign + notarization" angle for the IH audience.

---

## Lobste.rs

**Tags:** `release announcement, mac, javascript, gaming`

(Same body as HN - keep technical, mention the Gamepad API loop and the data-driven console catalogue.)

---

## Discord servers / Telegram channels worth posting in

- `r/emulation` Discord
- RetroArch Discord (#showcase)
- DuckStation Discord
- macgaming subreddit Discord
- Apple Silicon Games Telegram

---

## Email pitch (for blog coverage)

Subject: `Open-source launcher turns the Mac mini into a PS1-PS4 console`

Hi <name>,

I just released ConsoleMini, a free + open source big-picture launcher that turns a Mac mini into a couch console for PS1-PS4 plus the usual retro lineup. Codesigned DMG, Apple Silicon native, MIT.

Repo + screenshots: https://github.com/momenbasel/ConsoleMini

If you cover Mac gaming or emulation, happy to share the build notes - especially the path I took for the controller-first UI and the kiosk-mode auto-launch script.

Thanks!
Moamen
