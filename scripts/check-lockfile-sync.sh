#!/bin/sh
# Verify package.json and package-lock.json are in sync.
# Exits non-zero with a clear remediation message if they have drifted.
#
# Why this exists:
#   `npm ci` (used by every workflow and the pre-push hook) fails with a
#   cryptic error when the lockfile is out of sync. We saw this in commit
#   3fb709e — every CI workflow died at step 1 for nearly a day. This guard
#   runs in <1s and catches the drift before it ever gets pushed.

set -e

if ! npm ci --dry-run --ignore-scripts --no-audit --no-fund > /dev/null 2>&1; then
  echo ""
  echo "❌ package-lock.json is out of sync with package.json."
  echo ""
  echo "   Likely cause: a dependency was added/removed/bumped without"
  echo "   regenerating the lockfile. Fix locally:"
  echo ""
  echo "     npm install"
  echo "     git add package-lock.json"
  echo "     git commit -m 'chore: regenerate lockfile'"
  echo ""
  exit 1
fi
