#!/usr/bin/env bash
# One-time setup for the daily PriceCharting load on this Mac.
# Run:  bash scripts/install-pricecharting-nightly.sh
# - copies the loader script to ~/.panel-profits (outside Documents, so macOS lets the background job read it)
# - stores your PriceCharting download link in ~/.panel-profits/pricecharting.env (chmod 600; typed hidden, never printed or logged)
# - takes the app's GPA_INGESTION_SECRET from this repo's .env.local (never printed)
# - optionally stores a Zapier / webhook URL that is posted to on every load and failure
# - runs it once now, then schedules it every 20 minutes (days already loaded are skipped in one cheap call)
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$HOME/.panel-profits"
LABEL="com.panelprofits.pricecharting-nightly"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
NODE="$(command -v node || true)"
[ -n "$NODE" ] || { echo "Node.js was not found on this Mac."; exit 1; }
"$NODE" -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)' || { echo "Node 18 or newer is needed."; exit 1; }

mkdir -p "$DIR" "$HOME/Library/LaunchAgents"
chmod 700 "$DIR"
cp "$REPO/scripts/pricecharting-nightly-local.mjs" "$DIR/pricecharting-nightly-local.mjs"

ENVF="$DIR/pricecharting.env"
touch "$ENVF"; chmod 600 "$ENVF"
has() { grep -q "^$1=" "$ENVF"; }

if ! has GPA_INGESTION_SECRET && [ -f "$REPO/.env.local" ]; then
  v="$(grep -E '^GPA_INGESTION_SECRET=' "$REPO/.env.local" | head -1 | cut -d= -f2- || true)"
  if [ -n "$v" ]; then printf 'GPA_INGESTION_SECRET=%s\n' "$v" >> "$ENVF"; fi
fi
has GPA_INGESTION_SECRET || { echo "GPA_INGESTION_SECRET was not found in $REPO/.env.local. Add the line GPA_INGESTION_SECRET=... to $ENVF and run this again."; exit 1; }

if ! has PRICECHARTING_CSV_URL; then
  printf 'Paste your PriceCharting download link (it will not show), then press Enter: '
  read -r -s link; echo
  case "$link" in
    https://www.pricecharting.com/price-guide/download-custom*) ;;
    *) echo "That is not the PriceCharting download-custom link. Nothing was saved."; exit 1 ;;
  esac
  printf 'PRICECHARTING_CSV_URL=%s\n' "$link" >> "$ENVF"
fi

if ! has ALERT_WEBHOOK_URL; then
  printf 'Paste your Zapier "Catch Hook" (or other webhook) URL for alerts, or press Enter to skip: '
  read -r hook
  if [ -n "$hook" ]; then printf 'ALERT_WEBHOOK_URL=%s\n' "$hook" >> "$ENVF"; fi
fi

echo "Running the load once now (takes a few minutes)..."
"$NODE" "$DIR/pricecharting-nightly-local.mjs" || echo "The first run did not finish; see $DIR/pricecharting-nightly.log. The schedule will keep retrying."

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>$NODE</string><string>$DIR/pricecharting-nightly-local.mjs</string></array>
  <key>StartInterval</key><integer>1200</integer>
  <key>RunAtLoad</key><false/>
  <key>StandardOutPath</key><string>$DIR/launchd.out</string>
  <key>StandardErrorPath</key><string>$DIR/launchd.err</string>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string></dict>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo
echo "Done. It now runs every 20 minutes while this Mac is awake."
echo "Log:       tail -f $DIR/pricecharting-nightly.log"
echo "Last good: cat $DIR/last-success.txt"
echo "Remove:    launchctl bootout gui/\$(id -u) $PLIST"
