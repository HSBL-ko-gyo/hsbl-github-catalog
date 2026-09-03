#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

RUN_USER_HOME="$(getent passwd "$(id -un)" | cut -d: -f6)"
PROFILE_DIR="${HSBL_CATALOG_CHROME_PROFILE:-${RUN_USER_HOME}/.local/share/ashread/chromium-profile}"
TARGET_URL="https://protopedia.net/settings/prototypes"

if [[ -n "${HSBL_CHROME_BIN:-}" ]]; then
  BROWSER_BIN="$HSBL_CHROME_BIN"
elif [[ -x /usr/bin/chromium ]]; then
  BROWSER_BIN=/usr/bin/chromium
elif [[ -x "${RUN_USER_HOME}/.local/bin/google-chrome-stable" ]]; then
  BROWSER_BIN="${RUN_USER_HOME}/.local/bin/google-chrome-stable"
else
  echo "Chrome/Chromium not found. Set HSBL_CHROME_BIN."
  exit 1
fi

WAS_ACTIVE=0
if systemctl --user is-active --quiet ashread-chromium.service; then
  WAS_ACTIVE=1
  systemctl --user stop ashread-chromium.service
fi

restart_headless() {
  if [[ "$WAS_ACTIVE" == "1" ]]; then
    systemctl --user start ashread-chromium.service
  fi
}
trap restart_headless EXIT

echo "Opening the external persistent automation profile."
echo "Sign in to ProtoPedia once, confirm the works page opens, then close this browser."
"$BROWSER_BIN" \
  --user-data-dir="$PROFILE_DIR" \
  --no-first-run \
  --no-default-browser-check \
  "$TARGET_URL"

echo "ProtoPedia bootstrap browser closed. The headless service has been restored."
