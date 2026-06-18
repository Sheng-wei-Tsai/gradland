---
title: "The Six-Question Ladder That Stops AI Agents Over-Engineering Everything"
date: "2026-06-18"
excerpt: "Ponytail hit 33k stars this week by embedding a dead-simple heuristic into AI agents: before writing code, climb the ladder. The results are uncomfortable to ignore."
tags: ["AI Agents", "Claude", "Developer Tools"]
coverEmoji: "🪢"
auto_generated: true
source_url: "https://github.com/DietrichGebert/ponytail"
---

You ask your AI agent for a date picker. It installs flatpickr, writes a wrapper component, adds a stylesheet, and opens a thread about timezone handling.

With [ponytail](https://github.com/DietrichGebert/ponytail):

```html
<!-- ponytail: browser has one -->
<input type="date">
```

That's the whole pitch. Ponytail is a skill for AI coding agents that makes them think like a lazy senior dev — one who's been at the company long enough to know that most code should never be written at all. It hit 33k stars this week, and the benchmark numbers are worth taking seriously.

## The Ladder

Before writing a single line, the agent stops and climbs this:

```
1. Does this need to exist?   → no: skip it (YAGNI)
2. Stdlib does it?            → use it
3. Native platform feature?   → use it
4. Installed dependency?      → use it
5. One line?                  → one line
6. Only then: the minimum that works
```

It sounds trivially obvious when written out. The problem is that language models are trained on code, and more code = more tokens = more training signal. Left to their own devices, agents default to writing. Ponytail is a structural intervention: it injects these rules as an always-on ruleset that re-runs every turn, forcing the model to justify new code before it appears.

One important distinction the README makes: lazy is not negligent. The ladder explicitly excludes trust-boundary validation, error handling, security, and accessibility from the "can we skip this?" question. The goal is necessary code, not golfed code.

## The Numbers

Benchmarked against a baseline (no skill) and caveman (another minimalism-focused prompt) across Haiku, Sonnet, and Opus:

- **80–94% less code** than the no-skill baseline
- **3–6× faster** response time
- **42–75% cheaper** per task

These are single-shot numbers on the Claude API, not plan quota. Real agent sessions re-inject the ruleset every turn, which can shift the cost calculus either way. The README is honest about this: on short prompts, or on terse reasoning models like GPT-5.5, the ladder overhead can outweigh the savings. Capability to follow nuanced instructions matters — Haiku, Sonnet, and Opus all follow it well.

## What It Actually Looks Like

The install is a one-liner that adds ponytail as an agent skill (works with Claude Code, Codex, and 11 others). After that, the agent's output changes noticeably. A few before/afters from the examples directory:

**Email validator:**
```ts
// Without: regex from scratch, maybe wrong
// With:
const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
// ponytail: HTML input[type=email] validates this natively if in a form
```

**Rate limiter:**
```ts
// Without: in-memory Map with timestamps, interval clearing
// With: check if the framework already has one (Express rate-limit, etc.)
// If not, 8 lines using Date.now(), no class, no Map, just a closure
```

Every shortcut the agent takes gets marked with a `ponytail:` comment that names the upgrade path — so if you actually need the full implementation later, you know exactly what to reach for.

## What I'd Build With This

**1. A Next.js route analyser.** Feed it your `app/api/**` directory and have it flag routes where the agent (or you) reinvented something that Next.js already handles — form parsing, response caching, redirect logic. The ladder as an audit tool, not just a generation constraint.

**2. Custom rules for your stack.** The ponytail ruleset is generic. For a Supabase + Next.js shop, the ladder should know: "Does Supabase have an RPC for this? Is there already a `lib/` utility that does this?" A project-specific extension would catch intra-codebase duplication the same way the generic one catches stdlib duplication.

**3. Code review as a ponytail pass.** Before merging AI-assisted PRs, run the diff through an agent with the ponytail ruleset and ask: "Which of these lines would ponytail have eliminated?" Not as a gate, but as a smell detector. If the answer is "most of the PR," that's useful signal.

## My Take

What strikes me about ponytail isn't the benchmark numbers — it's that the ladder is the thing I say out loud when pairing with a less experienced dev. "Does the browser already do this? Does the stdlib have it? Is there an existing dep?" We say it so often we stop noticing it's a skill.

The fact that you need to explicitly re-teach this to an agent says something uncomfortable about how we evaluate AI coding output. We reward running tests, not omitting unnecessary code. Ponytail is a corrective.

Whether you install it or just tape the six questions to the wall next to your terminal, the heuristic is worth having front of mind any time you're generating non-trivial code with an LLM.
