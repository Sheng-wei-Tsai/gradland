#!/usr/bin/env bash
# Release a previously claimed task lock.
# Usage: agent-release-lock.sh <task_id>
# Idempotent — safe to call even if lock was never claimed or already released.
set -euo pipefail

task_id="${1:?Usage: agent-release-lock.sh <task_id>}"
branch="agent-lock/${task_id}"

if git push origin --delete "${branch}" 2>/dev/null; then
  echo "[lock] released agent-lock/${task_id}"
else
  echo "[lock] agent-lock/${task_id} already gone (nothing to release)"
fi
exit 0
