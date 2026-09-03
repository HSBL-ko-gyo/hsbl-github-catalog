#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

REPO_DIR="${HSBL_CATALOG_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
RUN_USER_HOME="$(getent passwd "$(id -un)" | cut -d: -f6)"
export PATH="${RUN_USER_HOME}/.local/bin:${PATH}"
LOCK_FILE="${XDG_RUNTIME_DIR:-/tmp}/hsbl-github-catalog-discovery.lock"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG_DIR="${REPO_DIR}/.automation-logs"
LOG_FILE="${LOG_DIR}/${STAMP}.log"
DRY_RUN="${HSBL_CATALOG_DRY_RUN:-0}"
SKIP_COLLECT="${HSBL_CATALOG_SKIP_COLLECT:-0}"

mkdir -p "$LOG_DIR"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "Another catalog discovery run is active; exiting."
  exit 0
fi

exec > >(tee -a "$LOG_FILE") 2>&1

echo "== HSBL GitHub catalog autonomous discovery: ${STAMP} =="
cd "$REPO_DIR"

command -v git >/dev/null
command -v gh >/dev/null
command -v node >/dev/null
command -v npm >/dev/null
command -v codex >/dev/null

codex login status >/dev/null
if [[ "$DRY_RUN" != "1" ]]; then
  gh auth status --hostname github.com >/dev/null
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Refusing to overwrite local work."
  exit 1
fi

cleanup_on_failure() {
  status=$?
  if [[ $status -ne 0 ]]; then
    echo "Autonomous run failed with status $status. No force-push or destructive cleanup was attempted."
    echo "Log: $LOG_FILE"
  fi
  exit "$status"
}
trap cleanup_on_failure ERR

git switch main
if git remote get-url origin >/dev/null 2>&1; then
  git fetch origin main
  git pull --ff-only origin main
elif [[ "$DRY_RUN" == "1" ]]; then
  echo "No origin remote is configured; continuing local dry-run without fetch/pull."
else
  echo "origin remote is required for autonomous apply mode."
  exit 1
fi

npm ci
if [[ "$SKIP_COLLECT" == "1" ]]; then
  if [[ "$DRY_RUN" != "1" ]]; then
    echo "HSBL_CATALOG_SKIP_COLLECT is allowed only during dry-run."
    exit 1
  fi
  echo "Using the existing public GitHub collection for this dry-run."
else
  npm run collect:github
fi

set +e
codex exec \
  --ephemeral \
  --approve-for-me \
  --cd "$REPO_DIR" \
  -c sandbox_workspace_write.network_access=false \
  "$(cat automation/WEEKLY_PROMPT.md)"
CODEX_STATUS=$?
set -e

if [[ $CODEX_STATUS -ne 0 ]]; then
  echo "Codex execution failed: $CODEX_STATUS"
  exit "$CODEX_STATUS"
fi

npm run capture:thumbnails
npm run prepare:protopedia
npm run validate:protopedia-actions
npm run audit:repo-seo
npm run validate:repo-seo-actions
npm run check
npm run build
git diff --check

if [[ "$DRY_RUN" == "1" ]]; then
  echo "== Remote SEO actions: dry-run only =="
  npm run apply:repo-seo -- --dry-run
  echo "== ProtoPedia publisher: authentication and duplicate-check dry-run =="
  npm run publish:protopedia -- --dry-run
  echo "== Catalog diff =="
  git status --short
  git diff --stat
  echo "Dry run complete. No GitHub repository and no catalog branch was modified remotely."
  exit 0
fi

# This command is the only step allowed to change other public repositories.
# It must revalidate owner, visibility, fork/archive status, action type, limits,
# README base SHA, and managed-block boundaries before every mutation.
npm run apply:repo-seo

# The apply command may write result reports, so validate the final tree again.
npm run check
npm run build
git diff --check

if [[ -n "$(git status --porcelain)" ]]; then
  git add --all
  git commit -m "chore(catalog): autonomous GitHub discovery ${STAMP}"

  # Never force-push. A concurrent main update makes this run fail safely and
  # the next run can retry after the repository is reconciled normally.
  git push origin main
  echo "Catalog and ProtoPedia queue published to main."
else
  echo "No catalog changes before ProtoPedia publishing."
fi

# Fixed Playwright automation performs account/duplicate checks, form entry,
# thumbnail upload, and a single submit. It records committed state only after
# the public page has been read back successfully. A failed or uncertain submit
# leaves the queue intact for a safe next-run reconciliation.
npm run publish:protopedia

# A verified publication changes the registry/frontmatter and drains the queue.
# Validate and publish those facts separately so a failed external submission
# never creates a false publication-state entry.
npm run prepare:protopedia
npm run validate:protopedia-actions
npm run check
npm run build
git diff --check

if [[ -n "$(git status --porcelain)" ]]; then
  git add --all
  git commit -m "chore(protopedia): record verified publications ${STAMP}"
  git push origin main
  echo "Verified ProtoPedia publication state published to main."
else
  echo "ProtoPedia queue was empty; no publication-state commit needed."
fi

echo "Autonomous weekly catalog and ProtoPedia run complete."
