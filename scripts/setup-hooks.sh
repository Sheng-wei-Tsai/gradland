#!/bin/sh
# Run once after cloning: sh scripts/setup-hooks.sh
# Installs a pre-push hook that blocks pushes to main if audit or build fails.

HOOK=.git/hooks/pre-push

cat > "$HOOK" << 'EOF'
#!/bin/sh
# Pre-push hook — runs security audit + build check before pushing to main.
# To bypass in a genuine emergency: git push --no-verify (use sparingly)

REMOTE_NAME="$1"
REMOTE_URL="$2"

# Only gate pushes that target the main branch
while read local_ref local_sha remote_ref remote_sha; do
  if echo "$remote_ref" | grep -q "refs/heads/main"; then
    echo "🔒 Pre-push: running security & build check before pushing to main..."

    # 1. Lockfile sync — catches package.json/package-lock.json drift
    #    that would break `npm ci` in every CI workflow.
    echo "\n── lockfile sync ──────────────────────────────"
    sh scripts/check-lockfile-sync.sh
    if [ $? -ne 0 ]; then
      echo "\n❌ Push blocked: package-lock.json is out of sync. See message above."
      exit 1
    fi

    # 2. Dependency audit
    echo "\n── npm audit ──────────────────────────────────"
    npm audit --audit-level=moderate
    if [ $? -ne 0 ]; then
      echo "\n❌ Push blocked: npm audit found moderate+ vulnerabilities."
      echo "   Fix with: npm audit fix"
      echo "   Or override: git push --no-verify  (last resort only)"
      exit 1
    fi

    # 3. Build + TypeScript check
    echo "\n── next build ─────────────────────────────────"
    npm run build
    if [ $? -ne 0 ]; then
      echo "\n❌ Push blocked: build failed. Fix TypeScript errors before pushing."
      exit 1
    fi

    echo "\n✅ All checks passed — pushing to main."
  fi
done

exit 0
EOF

chmod +x "$HOOK"
echo "✅ Pre-push hook installed at $HOOK"
echo "   It will run lockfile-sync + 'npm audit' + 'npm run build' before every push to main."
