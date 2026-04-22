#!/usr/bin/env bash
# Bootstrap dev environment for ConsoleMini.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js missing. Install via 'brew install node' first."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1 && ! command -v npm >/dev/null 2>&1; then
  echo "Need npm or pnpm."
  exit 1
fi

if command -v pnpm >/dev/null 2>&1; then
  pnpm install
else
  npm install
fi

bash scripts/install-emulators.sh
echo "Dev ready. Start with: npm run dev:electron"
