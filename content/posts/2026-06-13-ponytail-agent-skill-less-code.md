---
title: "Ponytail: The Agent Skill That Stops AI Over-Engineering"
date: "2026-06-13"
excerpt: "AI agents default to too much code. Ponytail is a skill that embeds the 'laziest senior dev' heuristic into any agent — 80-94% less code, 47-77% cheaper, 3-6x faster on real tasks."
tags: ["AI", "Agents", "Developer Tools"]
coverEmoji: "🦄"
auto_generated: true
source_url: "https://github.com/DietrichGebert/ponytail"
---

You ask your AI agent for a date picker. It installs flatpickr, writes a wrapper component, adds a stylesheet, and starts a discussion about timezones.

The right answer was `<input type="date">`.

[Ponytail](https://github.com/DietrichGebert/ponytail) is an agent skill built around this exact failure mode. It embeds a constraint — "use what already exists before building something new" — and benchmarks show it's not a small improvement. Across five real-world tasks, three models, and ten runs each: **80-94% less code, 47-77% cheaper, 3-6x faster**.

## The six-rung ladder

Before writing any code, ponytail forces the agent to stop at the first rung that holds:

```
1. Does this need to exist?    → no: skip it (YAGNI)
2. Stdlib does it?             → use it
3. Native platform feature?    → use it
4. Installed dependency?       → use it  
5. One line?                   → one line
6. Only then: the minimum that works
```

That's it. No new dependencies until rungs 1-4 are exhausted. No multi-function abstraction until rung 5 fails. The agent still handles trust boundaries, security, and data-loss paths — those are never negotiable — but feature bloat gets cut before it's written.

The before/after cases from the README are the kind of thing that will stick in your head:

```html
<!-- Without ponytail: flatpickr + wrapper component + stylesheet + timezone discussion -->
<!-- With ponytail: -->
<input type="date">
```

```ts
// Without ponytail: custom debounce implementation
// With ponytail:
import { debounce } from 'lodash'; // already a dep
```

## Why AI agents default to over-engineering

I've thought about this a lot since I started shipping AI features in Gradland. The short answer: agents are rewarded for thoroughness in training, not restraint. A response that installs a library, writes tests, and adds error handling looks more complete than `<input type="date">`. It's not. But it looks that way.

The longer answer is that agents don't have skin in the game. They don't pay the maintenance cost of the extra dependency. They don't get woken up at 2am when flatpickr has a security advisory. Ponytail externalises that cost into the prompt — it's a form of making the agent care about what happens after the diff lands.

## Installing it

For Claude Code:

```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

For Codex:

```bash
codex plugin marketplace add DietrichGebert/ponytail
codex
```

Once installed, it's active every session. Two commands get added: `/ponytail-review` scans your current diff for what to delete, and `/ponytail ultra` exists for when you want maximum aggression against unnecessary code.

The skill also drops a `ponytail:` comment on every shortcut it takes, naming the upgrade path. So if you later genuinely need flatpickr for recurring event selection or timezone support, you know exactly where to change it and why the simpler version was chosen.

## What I'd build with this

**A pre-merge diff audit.** Run `/ponytail-review` on every PR automatically via GitHub Actions. Surface anything that installs a new dep when a stdlib equivalent exists, or adds a new util function when one line would do. Not to auto-block — just to flag. The three seconds it takes to read the flag is worth it.

**A cost telemetry hook for AI routes.** In a Next.js app, you can pair ponytail with a prompt prefix that says "this endpoint is called 10,000 times/day — minimise tokens in output." The ponytail skill is the code-side version of the same idea: minimise what gets generated because you pay to maintain all of it.

**Skeleton generation for new features.** When starting a new Supabase-backed API route, I want the minimum viable implementation — auth check, one DB query, typed response — with no extras. A ponytail-constrained agent is exactly right for this. It scaffolds the skeleton, leaves gaps explicit, and doesn't pre-fill decisions I haven't made yet.

## My take

I've been using a rough version of this approach informally — ending prompts with "use the simplest implementation that works, no new dependencies" — and seeing measurable improvement. Ponytail formalises that into a proper skill with benchmarks behind it.

The numbers are the part that surprised me. 80-94% less code sounds like marketing, but the benchmark methodology is public and reproducible: `npx promptfoo eval -c benchmarks/promptfooconfig.yaml`. The tasks are real (email validator, debounce, CSV sum, countdown timer, rate limiter). The cost savings compound — less code means fewer tokens in context on every subsequent call.

The senior dev with the ponytail would say nothing. He'd just send you the link.
