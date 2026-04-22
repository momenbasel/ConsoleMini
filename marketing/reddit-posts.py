"""Generate per-subreddit 1-click submit URLs with prefilled title + body.

Reddit supports prefilled text posts via:
    https://www.reddit.com/r/<sub>/submit
      ?selftext=true
      &title=<urlencoded>
      &text=<urlencoded>

Opening each link in a logged-in browser drops the user straight on the
submit page with fields already populated; they only click Post.

Usage:
    python3 marketing/reddit-posts.py            # write Markdown index
    python3 marketing/reddit-posts.py --open     # also open all in default browser
"""
from __future__ import annotations

import argparse
import subprocess
from urllib.parse import quote_plus

REPO = "https://github.com/momenbasel/ConsoleMini"
RELEASE = f"{REPO}/releases/latest"
SITE = "https://momenbasel.github.io/ConsoleMini/"
LIBRARY_IMG = f"{REPO}/blob/main/screenshots/01-library.png?raw=true"

POSTS: dict[str, tuple[str, str]] = {

    # --------------------------------------------------------------------- r/emulation
    "emulation": (
        "[Tool] ConsoleMini - macOS launcher that wraps DuckStation / PCSX2 / RPCS3 / "
        "shadPS4 / PPSSPP / RetroArch in one couch UI",
        f"""\
Hey r/emulation - long-time lurker here.

I made a launcher specifically for the Mac mini -> TV setup so I can drop on the couch with a controller and not touch the keyboard.

**What it does**

- Pretty per-console grid (PS1, PS2, PS3, PS4, PSP, N64, SNES, NES, GBA, Dreamcast)
- Scans a folder you pick, indexes by extension per system
- One-tap launches the right emulator with the ROM path
- Full HTML5 Gamepad API navigation, B-button = back

**What it does NOT do**

- Emulate anything itself. Real emulators do the heavy lifting (huge respect to the DuckStation/PCSX2/RPCS3/shadPS4/PPSSPP/RetroArch teams).
- Ship ROMs/BIOS. Bring your own (legally).

**Honest about the limits**: PS4 (shadPS4) is upstream-experimental so compatibility is thin. PS3 (RPCS3) works but heavy on M-series. PS2 and below feels native on Apple Silicon.

Apple Silicon native, codesigned with Developer ID + hardened runtime. Free + MIT.

- Repo: {REPO}
- Signed DMG/zip: {RELEASE}
- Site: {SITE}

Feedback welcome - especially on the PS4 wiring and ideas for cover art scrapers (next on the roadmap).
""",
    ),

    # --------------------------------------------------------------------- r/macgaming
    "macgaming": (
        "ConsoleMini: I turned my Mac mini into a couch console - PS1-PS4 + retro, "
        "free big-picture launcher (Apple Silicon, MIT)",
        f"""\
Built this after my M2 Mac mini sat under the TV doing nothing for months.

**ConsoleMini** is a controller-first big-picture launcher. Pair a DualSense, plug HDMI, pick a system, play. It just wraps the actual emulators (DuckStation, PCSX2, RPCS3, shadPS4, PPSSPP, RetroArch, mGBA, Flycast, Mupen64Plus) in a UI tuned for couch-distance viewing.

- Apple Silicon native (also works on Intel)
- Codesigned with Developer ID, hardened runtime
- Kiosk script: auto-launch at login + no sleep -> Mac mini boots straight into the launcher
- Zero ROMs / BIOS shipped, zero telemetry

Free, MIT.

- Download: {RELEASE}
- Source: {REPO}
- Site: {SITE}

PS3 / PS4 are still emulation-heavy obviously. PS2 and below feels native on M-series.
""",
    ),

    # --------------------------------------------------------------------- r/macmini
    "macmini": (
        "Best use I've found for an idle Mac mini: turn it into a retro / PlayStation console",
        f"""\
My Mac mini was gathering dust. Hooked it to the TV, paired a DualSense, and built a launcher so I never have to touch a keyboard from the couch.

It's a controller-first big-picture frontend over real emulators (DuckStation/PCSX2/RPCS3/shadPS4/PPSSPP/RetroArch/mGBA/Flycast). All credit to those teams - this just gives them a UI that works on a TV.

The Homebrew installer in the repo grabs every emulator in one shot, and there's a kiosk script that auto-launches the app at login and disables sleep, so the Mac mini behaves like a console.

- Repo + signed DMG: {REPO}
- Free, open-source (MIT), Apple Silicon native

Anyone else found similarly fun second lives for an idle Mac mini? Curious for ideas.
""",
    ),

    # --------------------------------------------------------------------- r/AppleSiliconMacs
    "AppleSiliconMacs": (
        "ConsoleMini - controller-first PS1-PS4 + retro launcher, Apple Silicon native (free, MIT)",
        f"""\
For the Apple Silicon crowd specifically: ConsoleMini is a free, signed, hardened-runtime launcher that wraps the best macOS emulators (DuckStation, PCSX2, RPCS3, shadPS4, PPSSPP, RetroArch, mGBA, Flycast, Mupen64Plus) into one couch-friendly UI.

PS2 and below run native on M-series. PS3 (RPCS3) is heavy but viable. PS4 (shadPS4) is upstream-experimental.

- Repo: {REPO}
- Signed DMG (arm64 + x64): {RELEASE}
- Site: {SITE}

MIT licensed. Bring your own ROMs.
""",
    ),

    # --------------------------------------------------------------------- r/RetroGaming
    "retrogaming": (
        "Made a free macOS launcher that puts PS1-PS4 + N64/SNES/NES/GBA/Dreamcast in one couch UI",
        f"""\
Hey r/retrogaming. Open-sourced something today and figured this is the right room.

ConsoleMini is a controller-first big-picture launcher for macOS that wraps DuckStation, PCSX2, RPCS3, shadPS4, PPSSPP, RetroArch, mGBA, Flycast, and Mupen64Plus into a single grid UI you drive entirely with a controller. Built specifically for the Mac-mini-under-the-TV use case.

- Apple Silicon native, codesigned, hardened runtime
- Kiosk mode: Mac mini boots straight into the launcher
- Zero ROMs/BIOS bundled, zero telemetry, MIT

Repo + signed download: {REPO}

Honest disclaimers: PS4 (shadPS4) is upstream-experimental. PS3 works but is heavy. PS2 and earlier feels great on M-series.
""",
    ),

    # --------------------------------------------------------------------- r/opensource
    "opensource": (
        "ConsoleMini - MIT-licensed Mac mini retro / PlayStation console launcher (Electron + React)",
        f"""\
Just open-sourced ConsoleMini, a controller-first big-picture launcher for macOS that wraps every solid Mac emulator (DuckStation, PCSX2, RPCS3, shadPS4, PPSSPP, RetroArch, mGBA, Flycast, Mupen64Plus) into one couch-friendly UI.

Built with Electron + React + Vite + TypeScript + Tailwind + Framer Motion. Per-console catalogue is data-driven (one file change = new system supported). The whole thing is MIT.

- Repo: {REPO}
- Site: {SITE}
- Release: {RELEASE}

Feedback, PRs, theme ideas, and especially cover-art scraper PRs all welcome.
""",
    ),

    # --------------------------------------------------------------------- r/mac
    "mac": (
        "ConsoleMini turns your Mac mini into a living-room PS1-PS4 + retro console",
        f"""\
ConsoleMini is a free + open-source big-picture launcher for macOS. Plug a controller (DualShock, DualSense, Xbox, 8BitDo - anything HTML5 Gamepad), pick a system, play.

Wraps DuckStation, PCSX2, RPCS3, shadPS4, PPSSPP, RetroArch, mGBA, Flycast, Mupen64Plus. Apple Silicon native, codesigned with Developer ID + hardened runtime.

Bring your own ROMs (the project bundles zero copyrighted content). MIT licensed.

- Download (signed DMG/zip): {RELEASE}
- Source: {REPO}
- Site: {SITE}
""",
    ),
}


def submit_url(sub: str, title: str, body: str) -> str:
    return (
        f"https://www.reddit.com/r/{sub}/submit"
        "?selftext=true"
        f"&title={quote_plus(title)}"
        f"&text={quote_plus(body)}"
    )


def write_index(path: str) -> None:
    lines = [
        "# Reddit launch - 1-click prefilled submit links",
        "",
        "Each link below opens reddit.com on the subreddit's submit page with the title and body **already filled in**. You only click **Post** (already logged in).",
        "",
        "**Order to post** (space 10-15 min apart so the spam heuristics stay calm):",
        "",
    ]
    for i, sub in enumerate(POSTS.keys(), 1):
        lines.append(f"{i}. r/{sub}")
    lines += ["", "---", ""]
    for sub, (title, body) in POSTS.items():
        url = submit_url(sub, title, body)
        lines += [
            f"## r/{sub}",
            "",
            f"**Title** - {title}",
            "",
            "<details><summary>Body</summary>",
            "",
            "```",
            body.rstrip(),
            "```",
            "</details>",
            "",
            f"[1-click submit URL]({url})",
            "",
            "---",
            "",
        ]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"wrote {path} ({len(POSTS)} subreddits)")


def open_all() -> None:
    for sub, (title, body) in POSTS.items():
        url = submit_url(sub, title, body)
        print(f"opening r/{sub}")
        subprocess.run(["open", url], check=False)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--open", action="store_true", help="also open every URL in default browser")
    p.add_argument("--out", default="marketing/reddit-one-click-links.md")
    args = p.parse_args()
    write_index(args.out)
    if args.open:
        open_all()
