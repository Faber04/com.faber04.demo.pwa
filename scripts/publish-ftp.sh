#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Load local FTP settings from ignored file when available.
if [[ -f "$ROOT_DIR/INTERNAL/.ftp.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/INTERNAL/.ftp.env"
fi

required_vars=(FTP_USER FTP_PASS FTP_HOST FTP_BASE)
for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required variable: $var_name"
    echo "Create INTERNAL/.ftp.env with FTP_USER, FTP_PASS, FTP_HOST, FTP_BASE."
    exit 1
  fi
done

if ! command -v lftp >/dev/null 2>&1; then
  echo "lftp is not installed. Install it first (e.g. brew install lftp)."
  exit 1
fi

if [[ ! -d "$ROOT_DIR/dist" ]]; then
  echo "dist/ not found. Run npm run build first."
  exit 1
fi

tmp_script="$(mktemp)"
trap 'rm -f "$tmp_script"' EXIT

cat > "$tmp_script" <<EOF
set net:timeout 60
set net:max-retries 3
set ftp:ssl-allow no
open -u "$FTP_USER","$FTP_PASS" "$FTP_HOST"
mirror --reverse --delete --delete-first --verbose=1 dist "$FTP_BASE"
bye
EOF

lftp -f "$tmp_script"

echo "FTP publish completed."
