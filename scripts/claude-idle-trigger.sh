#!/bin/bash
# Runs in background when a Claude Code session ends in this project.
# If user doesn't start a new session within 1 hour, triggers the
# Autonomous Loop GitHub Actions workflow (Opus analyse → Sonnet implement).
#
# Cancelled by scripts/claude-cancel-trigger.sh when user returns.

REPO="Sheng-wei-Tsai/henrys-blog"
PID_FILE="$HOME/.claude/idle-trigger-henrys-blog.pid"
IDLE_MINUTES=60

echo $$ > "$PID_FILE"

sleep $(( IDLE_MINUTES * 60 ))

# Still alive? User was idle. Trigger autonomous workflow.
if [ -f "$PID_FILE" ] && [ "$(cat "$PID_FILE")" = "$$" ]; then
  SESSION_ID="idle-$(date -u +%Y%m%dT%H%M)"
  gh workflow run autonomous-loop.yml \
    --repo "$REPO" \
    --field iteration=1 \
    --field session_id="$SESSION_ID" \
    >> "$HOME/.claude/idle-trigger.log" 2>&1
  rm -f "$PID_FILE"
fi
