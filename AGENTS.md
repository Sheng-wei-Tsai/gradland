<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Pre-push Checklist — MANDATORY before pushing to main

**Never push to `main` (or trigger a Vercel deploy) without running both:**

```bash
npm run check    # = npm audit --audit-level=moderate && next build
```

This is enforced by:
1. Local `.git/hooks/pre-push` (installed via `sh scripts/setup-hooks.sh`)
2. GitHub Actions `check` job in `.github/workflows/deploy.yml` — deploy is gated on it

If `npm audit` reports moderate+ vulnerabilities: fix with `npm audit fix` or add an override in `package.json` before pushing. Do NOT bypass with `--no-verify` unless it is a genuine content-only commit (daily posts, docs) where no code changed.
