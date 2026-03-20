#!/bin/bash
# Auto-push blog content to GitHub every 30 seconds when files change.
# Run this in a terminal: ./watch.sh

cd "$(dirname "$0")"

echo "👁  Watching content/ for changes... (Ctrl+C to stop)"
echo "    Write in Obsidian → save → this script pushes automatically."
echo ""

while true; do
  if [[ -n $(git status content/ --porcelain) ]]; then
    git add content/
    COMMIT_MSG="blog: $(date '+%Y-%m-%d %H:%M')"
    git commit -m "$COMMIT_MSG"
    git push origin main
    echo "✓  Pushed at $(date '+%H:%M:%S') — Vercel is building now"
  fi
  sleep 30
done
