#!/usr/bin/env bash
#
# Enable branch protection on main so nothing reaches production ungated.
#
# Run this ONLY after the GitHub App is wired and you've confirmed bot PRs
# trigger the checks (see docs/DEPLOY_HARDENING.md). Enabling it before the
# bots can produce passing checks will stall the daily content pipeline.
#
# Requires: gh CLI authenticated with admin on the repo.
# Usage:    sh scripts/setup-branch-protection.sh
#           ENFORCE_ADMINS=true sh scripts/setup-branch-protection.sh   # also gate the owner
#
set -euo pipefail

REPO="${REPO:-Sheng-wei-Tsai/gradland}"
BRANCH="${BRANCH:-main}"
ENFORCE_ADMINS="${ENFORCE_ADMINS:-false}"   # true = even repo admins must use PRs (most secure)

# Required status-check contexts. These must match the check-run names exactly.
#   "Security & Build Check" — the job name in deploy.yml
#   "CodeQL"                  — the CodeQL workflow's check name
# If a name is wrong the API silently waits forever; verify with:
#   gh api "repos/$REPO/commits/$BRANCH/check-runs" --jq '.check_runs[].name'
CONTEXT_BUILD="Security & Build Check"
CONTEXT_CODEQL="CodeQL"

echo "Enabling branch protection on $REPO@$BRANCH (enforce_admins=$ENFORCE_ADMINS)…"

# required_approving_review_count: 0 forces a PR for every change (no direct
# pushes) without requiring a human approval — the gate is the checks, not a
# reviewer. Raise to 1 later if you want mandatory human review on code.
gh api -X PUT "repos/$REPO/branches/$BRANCH/protection" \
  -H "Accept: application/vnd.github+json" \
  --input - <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["$CONTEXT_BUILD", "$CONTEXT_CODEQL"]
  },
  "enforce_admins": $ENFORCE_ADMINS,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

echo "✅ Branch protection enabled. Verify:"
echo "   gh api repos/$REPO/branches/$BRANCH/protection --jq '.required_status_checks'"
echo
echo "Also enable repo-level auto-merge (one-time):"
echo "   gh api -X PATCH repos/$REPO -f allow_auto_merge=true"
