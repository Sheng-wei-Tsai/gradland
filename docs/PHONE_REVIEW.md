# PHONE_REVIEW.md — Reviewing Autonomous PRs from Your iPhone

This is the runbook for the `claude-pr-loop.yml` workflow when you're on a train, at the office, or anywhere you don't have your laptop. The goal: **review and ship 1 PR in under 2 minutes per commute**.

---

## One-time setup (do this once)

### 1. Enable GitHub mobile notifications

iOS App → **Settings** (top-right avatar) → **Notifications** → **Pull requests**:

- Toggle on: *Pull request review requests*
- Toggle on: *Mentions*
- Toggle on: *Workflow run failures* (so red CI pings you)

This costs nothing and works alongside Telegram + email.

### 2. Telegram bot setup

Already configured — `TELEGRAM_BOT_TOKEN` lives in repo secrets. The Cloudflare Worker bridge means **the bot can also receive messages from you and dispatch tasks**. See `.github/workflows/phone-task.yml` for the dispatch shape.

If notifications stop arriving, check `TELEGRAM_OWNER_CHAT_ID` is set in repo secrets. Find your chat id by messaging `@userinfobot` on Telegram.

### 3. Resend email

`RESEND_API_KEY` already set in repo secrets — emails go to `henry88002605@gmail.com`. If you want to silence them, just delete the secret. The notify script fails open.

### 4. Branch protection (recommended for auto-merge to be safe)

GitHub web → repo Settings → Branches → Add rule for `main`:

- Require status checks to pass before merging → check `Security & Build Check`
- Require linear history (squash merges only)
- Do NOT require approving review (auto-merge can't satisfy that)

Without protection, auto-merge runs as soon as the PR opens — fine for low-risk, but means a bug bypassing the test suite will still ship. The test suite IS the safety net.

---

## When a notification arrives

### Notification types — what each tag means

| Tag in title | Meaning | What you do |
|---|---|---|
| `[auto] feat: …`     | Low-risk + green CI. Auto-merge already enabled. | Glance at title, archive the email. Optionally tap PR to confirm. |
| `[risky] feat: …`    | Touched billing/auth/db/CI/etc. Auto-merge OFF. | **Review required.** Open PR, swipe diff, tap Merge. |
| `[review] feat: …`   | Manually flagged for review (e.g. `force_review` was set, or 3 attempts failed). | Open PR, see what went wrong, decide. |
| `[review] wip: …` (DRAFT) | Sonnet failed `npm run check` 3 times. PR opened as draft with `[needs human]` label. | Pull branch on laptop, finish locally. |

### Phone review — 4 taps

1. **Open Telegram** → tap PR link
2. **Tap "Files changed"** at top of PR — swipe through diff
3. **Tap the Plan link** in PR body → 1-page summary in `.claude/plans/<task-id>.md`
4. **Tap "Checks"** → all green checkmarks?

Then:

- ✅ Looks right + green → tap **Merge** (Squash) → done
- ❌ Want changes → tap **Comment**, write `/redo <reason>` → submit
- 🚫 Bad direction → tap **Close** (top-right ⋯ menu)

### How `/redo <reason>` works

(Wired up via the existing Cloudflare Worker bridge that powers `phone-task.yml`.)

Comment `/redo make the new endpoint accept POST instead of GET` and the bridge:

1. Closes the current PR
2. Re-claims the same task with your reason appended to the prompt
3. Triggers `claude-pr-loop.yml` again

---

## Suggested workflow rhythm (with a 9-to-5 job)

| Time (Brisbane) | Quota window | What happens | Your move |
|---|---|---|---|
| 04:50 (sleep) | W1 | Quota resets. Scheduler fires within 60 min cron. | Nothing — phone is off. |
| 07:30 (commute) | W1 done | 1 PR landed in inbox. | Tap Merge if `[auto]`. Skim if `[risky]`. |
| 12:30 (lunch)  | W2 fires | Daily content + 1 dev task. | Same — 1-3 PRs to triage. |
| 17:30 (commute home) | W3 | Idle-trigger or scheduler.   | Same. |
| 22:00 (Mac on) | W4 | If you open Claude Code, idle-trigger fires.    | Optional — review on laptop. |

**Total daily attention: ~5 minutes split across 3 commutes.**

---

## Failure modes + what they look like

| Symptom | Cause | Fix |
|---|---|---|
| No notifications all day | Quota exhausted overnight, sentinel `quota-reset-at/<epoch>` blocks scheduler | Check `git ls-remote --heads origin "quota-reset-at/*"` — branch name = epoch |
| `[risky]` PR but diff looks low-risk | File matched a pattern in `.github/prompts/risky-allowlist.txt` | Open the allowlist; widen if the pattern is too broad |
| Draft PR with `[needs human]` label | 3 attempts failed `npm run check` | `git fetch origin <branch> && git checkout <branch>` on laptop, fix locally |
| Auto-merge didn't fire | Branch protection missing OR auto-merge disabled in repo settings | Settings → General → Pull Requests → Allow auto-merge ✓ |
| Telegram message arrives but no PR link | The notify script ran before the PR was created (race) | Pull-to-refresh; PR link will be in the next message |

---

## Manually dispatching a task from your phone

1. Open GitHub mobile → repo → ⋯ → **Run a workflow**
2. Select **Claude PR Loop**
3. Paste your task as `task_text`, e.g. `[a11y] add aria-label to JobCard save button`
4. Tap **Run**

PR will arrive in the same notification channels within ~5 minutes.

---

## Trust the loop

This is the most important rule: **don't merge a PR you didn't review**. The retry loop is good but not infallible. If a green CI hides a bug, the test suite will eventually catch it — but only if you keep adding tests for things that go wrong. Every time a bad PR slips through, write a test that would have caught it and add the touched area to the risky-allowlist.
