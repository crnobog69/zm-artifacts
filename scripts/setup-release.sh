#!/usr/bin/env bash
# setup-release.sh — one-shot setup for Zlikord mobile releases on zm-artifacts
# Run from anywhere; the script finds its own location.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
KEYSTORE_PATH="$SCRIPT_DIR/zlikord-release.keystore"
REPO="zm-artifacts"

# ── colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[info]${NC} $*"; }
success() { echo -e "${GREEN}[ok]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[warn]${NC} $*"; }
die()     { echo -e "${RED}[error]${NC} $*" >&2; exit 1; }

# ── Step 1: prerequisites ────────────────────────────────────────────────────
echo
echo "=== Step 1: Checking prerequisites ==="

for cmd in gh keytool bun; do
  if command -v "$cmd" &>/dev/null; then
    success "$cmd found"
  else
    die "$cmd is not installed. Please install it and re-run."
  fi
done

if gh auth status &>/dev/null; then
  success "gh CLI authenticated"
else
  die "Not authenticated with gh. Run: gh auth login"
fi

GH_USER="$(gh api user --jq .login)"
FULL_REPO="${GH_USER}/${REPO}"
info "GitHub user: $GH_USER  →  repo: $FULL_REPO"

# ── Step 2: keystore ─────────────────────────────────────────────────────────
echo
echo "=== Step 2: Keystore ==="

if [ -f "$KEYSTORE_PATH" ]; then
  success "Keystore already exists at $KEYSTORE_PATH"
else
  info "No keystore found. Generating one now…"
  read -rp "  Keystore password: " -s KEYSTORE_PASSWORD; echo
  read -rp "  Confirm password:  " -s KP_CONFIRM; echo
  [ "$KEYSTORE_PASSWORD" = "$KP_CONFIRM" ] || die "Passwords do not match."

  read -rp "  Key alias [zlikord]: " KEY_ALIAS
  KEY_ALIAS="${KEY_ALIAS:-zlikord}"

  read -rp "  Key password (leave blank to use keystore password): " -s KEY_PASSWORD; echo
  KEY_PASSWORD="${KEY_PASSWORD:-$KEYSTORE_PASSWORD}"

  keytool -genkeypair \
    -keystore "$KEYSTORE_PATH" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=Zlikord, OU=Mobile, O=Zlikord, L=Unknown, ST=Unknown, C=US"

  success "Keystore created at $KEYSTORE_PATH"
fi

# Read stored values if we didn't just create the keystore
if [ -z "${KEYSTORE_PASSWORD+x}" ]; then
  read -rp "  Keystore password: " -s KEYSTORE_PASSWORD; echo
  read -rp "  Key alias [zlikord]: " KEY_ALIAS
  KEY_ALIAS="${KEY_ALIAS:-zlikord}"
  read -rp "  Key password (leave blank to use keystore password): " -s KEY_PASSWORD; echo
  KEY_PASSWORD="${KEY_PASSWORD:-$KEYSTORE_PASSWORD}"
fi

# ── Step 3: GitHub secrets ───────────────────────────────────────────────────
echo
echo "=== Step 3: Setting GitHub secrets on $FULL_REPO ==="

# Check repo exists / user has access
if ! gh repo view "$FULL_REPO" &>/dev/null; then
  warn "Repository $FULL_REPO not found or no access."
  read -rp "  Create it now? [y/N]: " CREATE_REPO
  if [[ "$CREATE_REPO" =~ ^[Yy]$ ]]; then
    gh repo create "$FULL_REPO" --private --description "Zlikord mobile release artifacts"
    success "Repository $FULL_REPO created"
  else
    die "Cannot set secrets without a repository. Create $FULL_REPO first."
  fi
fi

KEYSTORE_B64="$(base64 -w0 "$KEYSTORE_PATH")"

gh secret set ANDROID_KEYSTORE_BASE64     --repo "$FULL_REPO" --body "$KEYSTORE_B64"
success "Secret ANDROID_KEYSTORE_BASE64 set"

gh secret set ANDROID_KEYSTORE_PASSWORD  --repo "$FULL_REPO" --body "$KEYSTORE_PASSWORD"
success "Secret ANDROID_KEYSTORE_PASSWORD set"

gh secret set ANDROID_KEY_ALIAS          --repo "$FULL_REPO" --body "$KEY_ALIAS"
success "Secret ANDROID_KEY_ALIAS set"

gh secret set ANDROID_KEY_PASSWORD       --repo "$FULL_REPO" --body "$KEY_PASSWORD"
success "Secret ANDROID_KEY_PASSWORD set"

read -rp "  Expo token (from expo.dev → Account → Access Tokens): " EXPO_TOKEN
if [ -n "$EXPO_TOKEN" ]; then
  gh secret set EXPO_TOKEN --repo "$FULL_REPO" --body "$EXPO_TOKEN"
  success "Secret EXPO_TOKEN set"
else
  warn "EXPO_TOKEN skipped — set it manually with: gh secret set EXPO_TOKEN --repo $FULL_REPO"
fi

# ── Step 4: git remote ───────────────────────────────────────────────────────
echo
echo "=== Step 4: Git remote ==="

cd "$MOBILE_DIR"

REMOTE_URL="https://github.com/${FULL_REPO}.git"

if git remote get-url origin &>/dev/null; then
  EXISTING="$(git remote get-url origin)"
  if [ "$EXISTING" = "$REMOTE_URL" ]; then
    success "Remote 'origin' already points to $REMOTE_URL"
  else
    warn "Remote 'origin' exists but points to $EXISTING"
    read -rp "  Update it to $REMOTE_URL? [y/N]: " UPDATE_REMOTE
    if [[ "$UPDATE_REMOTE" =~ ^[Yy]$ ]]; then
      git remote set-url origin "$REMOTE_URL"
      success "Remote 'origin' updated to $REMOTE_URL"
    fi
  fi
else
  git remote add origin "$REMOTE_URL"
  success "Remote 'origin' added → $REMOTE_URL"
fi

# Initial commit + push
read -rp "  Stage all, commit, and push to origin main now? [y/N]: " DO_PUSH
if [[ "$DO_PUSH" =~ ^[Yy]$ ]]; then
  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "initial: mobile app source + CI workflow"
  else
    info "Nothing to commit — working tree clean"
  fi

  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  git push -u origin "${CURRENT_BRANCH}:main"
  success "Pushed to origin/main"
fi

# ── Step 5: trigger a build ──────────────────────────────────────────────────
echo
echo "=== Step 5: Trigger build ==="

read -rp "  Trigger a workflow_dispatch build now? [y/N]: " DO_BUILD
if [[ "$DO_BUILD" =~ ^[Yy]$ ]]; then
  gh workflow run android.yml --repo "$FULL_REPO" -f build_type=apk
  success "Build triggered! Watch it at: https://github.com/$FULL_REPO/actions"
fi

echo
echo -e "${GREEN}All done!${NC}"
echo "  Secrets:  gh secret list --repo $FULL_REPO"
echo "  Tag push: git tag v1.0.0 && git push origin v1.0.0"
echo "  Actions:  https://github.com/$FULL_REPO/actions"
