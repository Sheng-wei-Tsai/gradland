# Deploy Gate Hardening — Runbook

Make the security/quality gate actually block production, so no vulnerable
dependency, failing build, or unreviewed code can reach gradland.au.

## The problem (what was true before this work)

- `main` had **no branch protection** and **no required status checks** (verified: the API returned *"Required status checks not enabled"*).
- Everyone — you and the bots — **pushed directly to `main`**.
- Vercel's **native Git integration auto-deploys `main`** on every push (`vercel.json` `ignoreCommand` builds main unconditionally), *independently* of GitHub Actions.
- The `deploy.yml` `check` job ran **after** the push, and its `deploy` job waited for a manual approval nobody clicked.

**Net effect:** the gate was decorative. The esbuild RCE advisory that shipped is the proof — it reached `main` and would deploy regardless of the check.

### The root cause that shapes the fix

The bots authenticate with the default **`GITHUB_TOKEN`**, which GitHub deliberately blocks from triggering other workflows (anti-recursion). So bot-created PRs/pushes **never trigger the `check`**. That's why simply turning on branch protection isn't enough — the required check would never run on bot changes and the daily pipeline would stall. The fix needs a credential that *can* trigger checks: a **GitHub App**.

## End-state architecture

```
content/code change ──▶ PR (authored via GitHub App token)
                          │
                          ▼
            Required checks run:  Security & Build Check  +  CodeQL
                          │  (branch protection blocks merge until green)
                          ▼
                    squash auto-merge ──▶ main ──▶ Vercel native deploy
```

- Nothing reaches `main` (the deployed branch) without passing the gate.
- Vercel keeps doing what it's good at (atomic deploys, instant rollback).
- The code bots (`claude-pr-loop`, `autonomous-loop`, `phone-task`) already use PR branches; they just need the App token so their PRs trigger the check.
- The content bots publish via auto-merge PRs through the shared `commitAndPublish` helper.

## What this PR already contains (inert until you activate)

Merging this changes **nothing** about live behaviour — it's safe to merge anytime:

| File | What it does |
|------|--------------|
| `scripts/lib/git-publish.ts` | Shared `commitAndPublish({add, message})`. Defaults to `PUBLISH_MODE=direct` (current behaviour). `PUBLISH_MODE=pr` switches to branch + auto-merge PR. |
| 7 content scripts | Refactored to call `commitAndPublish` instead of inlining `git push origin main`. Behaviour identical until the flag flips. |
| `.github/workflows/codeql.yml` | CodeQL SAST. Runs on PRs/weekly. Advisory until made a required check. |
| `.github/workflows/deploy.yml` | Removed the redundant `vercel --prod` deploy job + `workflow_run` trigger (Vercel native already deploys; this just clears the perpetual "waiting" runs). The `check` job is unchanged. |
| `scripts/setup-branch-protection.sh` | One-shot script to enable protection requiring both checks. **Not run automatically.** |
| `docs/DEPLOY_HARDENING.md` | This runbook. |

## Activation — do these in order

> Do **not** enable branch protection (step 4) before the App is wired and a bot PR has produced a green check (step 3). Out-of-order = stalled pipeline.

### 1. Create the GitHub App (you — ~15 min, only you can)

1. **Settings → Developer settings → GitHub Apps → New GitHub App.**
   - Name: `gradland-ci-bot` (or anything).
   - Homepage URL: your repo URL. Uncheck **Webhook → Active**.
   - **Repository permissions:** `Contents: Read and write`, `Pull requests: Read and write`. Nothing else.
   - "Only on this account."
2. **Create**, then note the **App ID**. Generate a **private key** (downloads a `.pem`).
3. **Install App** → install on `Sheng-wei-Tsai/gradland` only.
4. Add two repo secrets (**Settings → Secrets and variables → Actions → Secrets**):
   - `BOT_APP_ID` = the App ID
   - `BOT_APP_PRIVATE_KEY` = the full contents of the `.pem`

A GitHub App is the secure choice: scoped to this one repo, issues short-lived tokens, revocable, and doesn't impersonate you. Keep the `.pem` out of the repo.

### 2. Wire the workflows to use the App token in PR mode

For **each content workflow** (`daily-posts.yml`, `daily-claude-news.yml`, `daily-claude-skill.yml`, `daily-diagrams.yml`, `daily-career-edge.yml`, `idle-posts.yml`), and in **each job that runs a content script**, add a token-minting step and pass it to the script step. Pattern:

```yaml
      # add BEFORE the step that runs the content script
      - name: Mint bot token (PR mode only)
        if: ${{ vars.PUBLISH_MODE == 'pr' }}
        id: bot
        uses: actions/create-github-app-token@v2
        with:
          app-id: ${{ secrets.BOT_APP_ID }}
          private-key: ${{ secrets.BOT_APP_PRIVATE_KEY }}

      - name: <existing content step>
        env:
          PUBLISH_MODE: ${{ vars.PUBLISH_MODE || 'direct' }}
          # App token in PR mode (triggers the check); GITHUB_TOKEN otherwise
          GH_TOKEN: ${{ steps.bot.outputs.token || secrets.GITHUB_TOKEN }}
          GITHUB_TOKEN: ${{ steps.bot.outputs.token || secrets.GITHUB_TOKEN }}
        run: |
          git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
          npx tsx scripts/fetch-ai-news.ts   # ← the existing script call
```

The `if:` + `|| 'direct'` / `|| secrets.GITHUB_TOKEN` fallbacks mean this is a **no-op until the `PUBLISH_MODE` repo variable is set to `pr`** — so you can merge the workflow edits safely and flip the switch later.

For the **code bots** (`claude-pr-loop.yml`, `autonomous-loop.yml`, `phone-task.yml`): they already open PRs, but with `secrets.GITHUB_TOKEN`, so their PRs won't trigger the required check. Swap the token used for `gh pr create` / `git push` / `gh pr merge` to the App token (same `actions/create-github-app-token` step, then `GH_TOKEN: ${{ steps.bot.outputs.token }}`). Otherwise their PRs will stall under branch protection.

### 3. Flip the switch and verify

```bash
# enable repo-level auto-merge
gh api -X PATCH repos/Sheng-wei-Tsai/gradland -f allow_auto_merge=true
# turn on PR mode for the bots
gh variable set PUBLISH_MODE --body pr
```

Manually run one content workflow (`gh workflow run "Daily Posts"`). Confirm: it opens a PR authored by the App, the `Security & Build Check` + `CodeQL` checks run on it, and it auto-merges when green. If the checks don't appear on the PR, the App token isn't being used — recheck step 2.

### 4. Enable branch protection

```bash
sh scripts/setup-branch-protection.sh
# or, to gate yourself too (most secure):
ENFORCE_ADMINS=true sh scripts/setup-branch-protection.sh
```

Verify the context names match real check-run names:

```bash
gh api repos/Sheng-wei-Tsai/gradland/commits/main/check-runs --jq '.check_runs[].name'
```

If `CodeQL`'s check name differs, edit `CONTEXT_CODEQL` in the script and re-run.

## Rollback

- **Disable PR mode:** `gh variable set PUBLISH_MODE --body direct` (bots resume direct-push).
- **Remove protection:** `gh api -X DELETE repos/Sheng-wei-Tsai/gradland/branches/main/protection`.
- The script refactor is behaviour-identical in `direct` mode, so reverting the flag fully restores the old pipeline.

## Residual notes

- This gate blocks **vulnerable deps, broken builds, failing tests, and CodeQL alerts**. Application-logic security (RLS, rate limiting, auth, input validation) is governed by `AGENTS.md` §5 and code review — not this gate. Consider requiring 1 human review on `app/api/**` and `lib/` paths via CODEOWNERS for the highest-risk code.
- The App private key is now your most sensitive CI secret. If it leaks, revoke it in the App settings and generate a new one.
