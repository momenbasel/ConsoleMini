#!/usr/bin/env bash
# ConsoleMini - Mac mini kiosk / living-room setup
# Auto-launches ConsoleMini at login, hides Dock, disables sleep on AC.
# Run with: bash scripts/setup-kiosk.sh

set -euo pipefail

APP_PATH="${APP_PATH:-/Applications/ConsoleMini.app}"
LAUNCH_AGENT="$HOME/Library/LaunchAgents/io.consolemini.app.plist"

if [ ! -d "$APP_PATH" ]; then
  echo "[warn] $APP_PATH not found. Build with: npm run package"
fi

echo "==> Disabling sleep on AC power (requires sudo)"
sudo pmset -c sleep 0 disksleep 0 displaysleep 30

echo "==> Auto-hide Dock"
defaults write com.apple.dock autohide -bool true
defaults write com.apple.dock autohide-delay -float 1000
killall Dock || true

echo "==> Creating LaunchAgent at $LAUNCH_AGENT"
mkdir -p "$(dirname "$LAUNCH_AGENT")"
cat > "$LAUNCH_AGENT" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>io.consolemini.app</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/open</string>
    <string>-a</string>
    <string>$APP_PATH</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
PLIST

launchctl unload "$LAUNCH_AGENT" 2>/dev/null || true
launchctl load "$LAUNCH_AGENT"

echo "==> Done. Reboot the Mac mini and ConsoleMini will launch on login."
