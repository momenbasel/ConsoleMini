# Contributing to ConsoleMini

Thanks for wanting to make ConsoleMini better. The project is small and the bar is "does it improve the couch experience or correctness."

## Where to start

- **Bugs**: open an issue with the OS version, ConsoleMini version, controller make, and the emulator + ROM (extension only - no piracy).
- **Adding a new system / emulator**: edit `src/lib/emulators.ts` (UI side) and `electron/consoles.ts` (launch side). One file each, fully data-driven.
- **UI tweaks**: components live under `src/components/`. Tailwind classes only - no per-component CSS.
- **Marketing or design**: PRs to `assets/` (icons, banners) and `marketing/` (launch copy) very welcome.

## Dev loop

```bash
bash scripts/setup.sh       # deps + emulators (Homebrew)
npm run dev:electron        # Vite + Electron, hot reload
npm run build               # type-check + production bundle
npm run package             # signed DMG via electron-builder
```

## PR rules

- Keep PRs scoped - one feature or one fix.
- No new top-level dependencies without a reason in the PR description.
- ROMs / BIOS / scrapers for copyrighted artwork are out of scope.
- All new emulator wiring should test as: install via `scripts/install-emulators.sh`, launch a homebrew/PD ROM, controller works.

## Code style

- TypeScript strict.
- Functional React components. `zustand` for app state.
- Prefer composition over abstraction. Three similar lines beats a premature helper.

## Reporting security issues

Please do not open a public issue for security problems. Email the maintainer directly (see `package.json`).
