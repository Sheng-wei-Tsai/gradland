---
title: "Teaching Your AI Agent to Remember What It Learned"
date: "2026-07-03"
excerpt: "A new meta-skill for Claude Code and Cursor lets AI agents capture hard-won debugging knowledge and reuse it next session instead of starting from zero every time."
tags: ["AI", "Claude Code", "Developer Tools"]
coverEmoji: "🧠"
auto_generated: true
source_url: "https://github.com/Kulaxyz/self-learning-skills"
---

Here's a frustrating loop I've been stuck in: I spend 20 minutes figuring out the right way to hit our staging DB from a local script, get it working, and then the next Claude Code session I'm explaining the same setup again. The agent has no memory of the last session. It re-learns. I re-explain. Repeat.

`self-learning-skills` is a 945-star GitHub repo (in 7 days) that directly solves this. It's a meta-skill — not a feature you build, but a behaviour you install into your agent — that teaches it to recognise when it just learned something worth keeping and persist it automatically.

## What it actually does

The core idea is simple: when your AI agent solves something non-obvious — a multi-step deploy command, a gotcha in your codebase, a recovery path for a common failure — it captures the *procedure* as a reusable skill instead of letting it evaporate at session end.

For Claude Code specifically, it writes to `.claude/skills/` (or your global `~/.claude/skills/`). Next session, the agent loads those skills by description matching and already knows the route.

Three categories of things get captured:

- **Procedures** — multi-step workflows that recur: "how do I seed the local DB", "what's the deploy command for this project"
- **Facts and corrections** — one-liners that correct a wrong assumption: "the types are generated, don't edit them manually"
- **Dead ends** — what *didn't* work, which is often more valuable than what did

The last one is underrated. If I know that running `supabase db push` without the `--local` flag nukes the remote schema, I want my agent to know that too before it tries.

## Installing it

The easiest path is the `skills` CLI:

```bash
npx skills add kulaxyz/self-learning-skills
```

This auto-detects which agents you have installed (Claude Code, Cursor, Cline, Codex) and wires it up correctly for each. For a global install across all your projects:

```bash
npx skills add kulaxyz/self-learning-skills -g
```

If you're Claude Code-only and want to do it manually:

```bash
git clone https://github.com/kulaxyz/self-learning-skills
cp -R self-learning-skills/skills/self-learning ~/.claude/skills/
```

Or via the plugin marketplace (if you're on a recent Claude Code build):

```
/plugin marketplace add kulaxyz/self-learning-skills
/plugin install self-learning@self-learning-skills
```

## How it decides what to keep

There's a triage system built into the skill so it doesn't bloat your config with junk:

| What was learned | Where it goes |
|---|---|
| Multi-step reusable procedure | New skill file |
| Single fact or correction | Lightweight notes/memory |
| Genuine one-off | Skipped |

There's also a promotion rule: a session only gets promoted to a durable skill when you've actually confirmed it works — not just tried it once. The repo calls this "don't enshrine guesses", which I think is the right instinct. If the agent just tried something and it seemed to work, that's not the same as a proven path.

The golden-path pattern it captures looks like this in the generated skill:

```markdown
## Proven path
1. Run `npx tsx scripts/seed.ts` (not `ts-node` — it chokes on the path aliases)
2. Confirm with `SELECT count(*) FROM users` in the Supabase dashboard
3. If it fails with ECONNREFUSED, check the .env.local SUPABASE_SERVICE_ROLE_KEY

## What didn't work
- `ts-node scripts/seed.ts` — fails with TS path alias resolution errors
- Running seed without the service role key — RLS blocks all inserts
```

That's the format I actually want. Not just "here's the command" but "here's why the alternatives failed."

## What I'd build with this

**Project-specific onboarding skills.** For any team project, set this up and let it accumulate knowledge over a few weeks. At the end you have a living document of how the project actually works — not the README version, the "what we discovered in production" version. New team members (human or AI) benefit immediately.

**Cross-project pattern library.** Keep a global skills directory for patterns that recur across projects: how I structure Next.js API routes, how I set up Supabase RLS, how I handle Stripe webhooks. Let the agent contribute to it rather than maintaining it by hand.

**Failure archaeology.** Specifically configure it to capture failed approaches during complex debugging sessions. When you finally fix a gnarly bug, you want a record of the 6 things that didn't work — that's the part that's hardest to reconstruct later and most useful next time.

---

I've been running Claude Code sessions where I manually maintain a `MEMORY.md` to persist project context between sessions (the project you're reading this on uses that pattern). This is the automated version of that instinct, applied at the skill layer rather than just facts. The framing of "golden paths" rather than "notes" is what makes it more useful — it's capturing procedures, not just observations.

Worth installing on any project where you find yourself re-explaining the same setup steps to your agent.
