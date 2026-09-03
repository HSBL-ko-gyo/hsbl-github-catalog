#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_NAME="$(id -un)"
HOME_DIR="$(getent passwd "$USER_NAME" | cut -d: -f6)"
export PATH="${HOME_DIR}/.local/bin:${PATH}"
DRY_RUN=0
INSTALL_MODE=system

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --user) INSTALL_MODE=user ;;
    *)
      echo "Usage: $0 [--dry-run] [--user]"
      exit 2
      ;;
  esac
  shift
done

CODEX_BIN="$(command -v codex)"
GH_BIN="$(command -v gh)"
NODE_BIN="$(command -v node)"
NPM_BIN="$(command -v npm)"

for value in "$CODEX_BIN" "$GH_BIN" "$NODE_BIN" "$NPM_BIN"; do
  [[ -n "$value" ]] || { echo "Required command is missing."; exit 1; }
done

PATH_DIRS="$(printf '%s\n' \
  "$(dirname "$CODEX_BIN")" \
  "$(dirname "$GH_BIN")" \
  "$(dirname "$NODE_BIN")" \
  "$(dirname "$NPM_BIN")" \
  /usr/local/sbin /usr/local/bin /usr/sbin /usr/bin /sbin /bin \
  | awk '!seen[$0]++' | paste -sd: -)"

CURRENT_TZ="$(timedatectl show --property=Timezone --value 2>/dev/null || true)"
if [[ "$CURRENT_TZ" != "Asia/Tokyo" ]]; then
  echo "Warning: system timezone is '$CURRENT_TZ'. Timer is intended for Asia/Tokyo."
  echo "Set it with: sudo timedatectl set-timezone Asia/Tokyo"
fi

TMP_SERVICE="$(mktemp --suffix=.service)"
trap 'rm -f "$TMP_SERVICE"' EXIT
sed \
  -e "s|__USER__|$USER_NAME|g" \
  -e "s|__HOME__|$HOME_DIR|g" \
  -e "s|__REPO_DIR__|$ROOT_DIR|g" \
  -e "s|__PATH__|$PATH_DIRS|g" \
  "$ROOT_DIR/systemd/hsbl-github-catalog-discovery.service.in" > "$TMP_SERVICE"

if [[ "$INSTALL_MODE" == "user" ]]; then
  sed -i \
    -e '/^User=/d' \
    -e 's/^WantedBy=multi-user.target$/WantedBy=default.target/' \
    "$TMP_SERVICE"
fi

if [[ "$DRY_RUN" == "1" ]]; then
  grep -q '__[A-Z_]*__' "$TMP_SERVICE" && { echo "Unresolved service template variable."; exit 1; }
  systemd-analyze verify "$TMP_SERVICE"
  systemd-analyze calendar 'Sun *-*-* 05:20:00 Asia/Tokyo' >/dev/null
  echo "systemd service template and Sunday 05:20 JST timer are valid."
  echo "No system unit was installed or enabled."
  exit 0
fi

if [[ "$INSTALL_MODE" == "user" ]]; then
  USER_UNIT_DIR="${XDG_CONFIG_HOME:-${HOME_DIR}/.config}/systemd/user"
  install -d -m 0755 "$USER_UNIT_DIR"
  install -m 0644 "$TMP_SERVICE" "$USER_UNIT_DIR/hsbl-github-catalog-discovery.service"
  install -m 0644 "$ROOT_DIR/systemd/hsbl-github-catalog-discovery.timer" "$USER_UNIT_DIR/hsbl-github-catalog-discovery.timer"
  systemctl --user daemon-reload
  systemctl --user enable --now hsbl-github-catalog-discovery.timer
  systemctl --user list-timers hsbl-github-catalog-discovery.timer --no-pager
  exit 0
fi

sudo install -m 0644 "$TMP_SERVICE" /etc/systemd/system/hsbl-github-catalog-discovery.service
sudo install -m 0644 "$ROOT_DIR/systemd/hsbl-github-catalog-discovery.timer" /etc/systemd/system/hsbl-github-catalog-discovery.timer

sudo systemctl daemon-reload
sudo systemctl enable --now hsbl-github-catalog-discovery.timer

systemctl list-timers hsbl-github-catalog-discovery.timer --no-pager

echo
echo "Initial non-mutating verification:"
echo "  HSBL_CATALOG_DRY_RUN=1 $ROOT_DIR/automation/run-weekly.sh"
echo
echo "Run immediately in autonomous mode:"
echo "  sudo systemctl start hsbl-github-catalog-discovery.service"
echo
echo "Service log:"
echo "  journalctl -u hsbl-github-catalog-discovery.service -n 200 --no-pager"
