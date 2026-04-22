#!/bin/bash
# Cancels any pending idle trigger for this project.
# Called when user submits a new prompt, indicating they are back.

PID_FILE="$HOME/.claude/idle-trigger-henrys-blog.pid"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null
  fi
  rm -f "$PID_FILE"
fi
