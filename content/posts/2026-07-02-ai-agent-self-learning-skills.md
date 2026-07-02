---
title: "Make Your AI Coding Agent Actually Learn Between Sessions"
date: "2026-07-02"
excerpt: "Every Claude Code or Cursor session starts from zero. self-learning-skills is a meta-skill that teaches your agent to capture hard-won knowledge and reload it automatically next time."
tags: ["AI", "Claude Code", "Developer Tools"]
coverEmoji: "🧠"
auto_generated: true
source_url: "https://github.com/Kulaxyz/self-learning-skills"
---

I hit the same wall last week that I'd hit three times before: I opened a new Claude Code session on a project I'd not touched in a fortnight, asked it to deploy a fix, and spent the first ten minutes watching it re-discover things we'd already figured out. The exact `pg_dump` flags that work with our RLS config. Which env var the webhook secret lives under. The fact that `npm run check` has to pass before pushing or the pre-push hook blocks you.

That's not AI productivity. That's expensive repetition with a polished UI.

A project called [self-learning-skills](https://github.com/Kulaxyz/self-learning-skills) got 800+ GitHub stars this week. It's a meta-skill — it doesn't do the work, it teaches your agent to capture *how* the work got done, so the next session starts already knowing the route.

## The actual problem

AI coding agents are stateless between sessions by design. Every time you open Claude Code or Cursor on a project, the model has zero memory of what you figured out last time. You've probably noticed this pattern:

- You spend 20 minutes hunting down a migration edge case
- The agent figures it out, you ship it, session ends
- Next week: same 20 minutes, different agent instance

The knowledge doesn't live anywhere. It's not in the code (it's the *why*, not the *what*). It's not in git history unless you wrote a detailed commit message. It evaporates.

self-learning-skills solves this by giving your agent a standing instruction: **when you've just earned a golden path, capture it so the next session starts already knowing it**.

## How it works

The loop is three steps:

1. **Recognise the moment** — a task that only clicked after several tries, a non-obvious command, a project fact that wasn't documented, or you literally saying "remember this".
2. **Capture it immediately, no prompt needed** — the agent writes the *procedure* to a file the tool will auto-load, plus a note on what didn't work (skipping known dead-ends is often worth more than the win itself).
3. **Reuse** — next session the entry loads automatically.

For Claude Code specifically, captured skills land in `skills/<name>/SKILL.md` and get picked up by Claude's skill description matching. For Cursor they go into `.cursor/rules/learned/*.mdc`. For anything else that reads an `AGENTS.md`, they append there.

The triage logic is smart: not everything becomes a skill. Multi-step procedures become skills. Single facts go to a lightweight memory file. Genuine one-offs get skipped. There's also a promotion rule — something only gets enshrined as a skill once the agent has confirmed it actually works, not just that it sounds plausible.

## Install in 30 seconds

```bash
# Works with Claude Code, Cursor, Codex, Cline, OpenCode — auto-detects
npx skills add kulaxyz/self-learning-skills

# Or global — applies to all your projects
npx skills add kulaxyz/self-learning-skills -g

# Claude Code plugin marketplace
/plugin marketplace add kulaxyz/self-learning-skills
/plugin install self-learning@self-learning-skills
```

After that, your agent starts capturing. You don't have to do anything differently.

## What a captured skill looks like

Say you've just spent 15 minutes figuring out the right Supabase service role query pattern for a bulk insert that bypasses RLS. The agent writes something like:

```markdown
# Skill: supabase-bulk-insert-service-role

## When to use
Bulk inserts that must bypass RLS (e.g. seeding, webhook ingestion, admin writes).

## Procedure
1. Import `createSupabaseService` from `lib/auth-server.ts` — NOT the anon client
2. Use `.upsert()` with `{ onConflict: 'id' }` for idempotent inserts
3. Always chunk arrays >500 items with a for loop — `.upsert(bigArray)` will timeout

## What didn't work
- Anon client silently drops rows that fail RLS — no error thrown
- `.insert()` without chunk limit hit Postgres statement timeout at ~800 rows
```

Next session: the agent has this context before you even ask the first question.

## What I'd build with this

**1. Project-wide onboarding skill** — For any new project, I'd seed a skill that captures the critical facts a new dev (or a new agent session) needs on day one: deploy command, DB connection pattern, which env vars are mandatory, what the check script validates. Basically a machine-readable version of `CLAUDE.md` written in procedure form, updated by the agent as it learns the project.

**2. Shared team skill library** — Put the `skills/` directory in git. Every time an agent captures a golden path on your project, commit it. Your whole team's agent sessions benefit from every lesson anyone else has learned. Pair this with a convention: review captured skills in PR descriptions the same way you'd review new documentation.

**3. Per-client skills in an agency context** — If you're shipping web apps for multiple clients, each project gets its own skill set. The agent knows the staging deploy flow for Client A and the production checklist for Client B, and never confuses them. The skill files travel with the repo.

## My take

The interesting thing here isn't the tooling — it's what it reveals about how we're using AI coding agents wrong. We treat them like fancy autocomplete: disposable, session-scoped, stateless. But the real productivity win isn't in the keystrokes they save, it's in accumulated project knowledge that compounds over time.

self-learning-skills is a bandaid on a real architectural gap — these agents should have persistent project memory built in. But until they do, this is the most practical fix I've seen. 800 GitHub stars in a week suggests I'm not the only one who's wanted exactly this.

If you're already writing `CLAUDE.md` files to bootstrap your agent (you should be), think of this as the dynamic layer on top of the static one.
