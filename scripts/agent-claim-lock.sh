#!/usr/bin/env bash
# Atomically claim a task lock for an AI agent.
# Usage: agent-claim-lock.sh <agent> <task_id>
# Exit 0: lock claimed. Exit 1: already locked by another agent.
set -euo pipefail

agent="${1:?Usage: agent-claim-lock.sh <agent> <task_id>}"
task_id="${2:?Usage: agent-claim-lock.sh <agent> <task_id>}"
branch="agent-lock/${task_id}"

# Annotate the lock branch HEAD commit with agent identity
git config user.name  "github-actions[bot]" 2>/dev/null || true
git config user.email "github-actions[bot]@users.noreply.github.com" 2>/dev/null || true

if git push origin "HEAD:refs/heads/${branch}" 2>/dev/null; then
  echo "[lock] claimed agent-lock/${task_id} for ${agent}"
  exit 0
else
  # Show who holds it (best-effort — may be empty on network issues)
  holder=$(git ls-remote origin "refs/heads/${branch}" 2>/dev/null | awk '{print $1}' | head -c 12)
  echo "[lock] agent-lock/${task_id} already held (sha: ${holder:-unknown}) — ${agent} backing off"
  exit 1
fi
