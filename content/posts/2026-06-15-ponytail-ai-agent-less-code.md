---
title: "Ponytail: Teaching AI Agents to Write Less Code"
date: "2026-06-15"
excerpt: "A new agent skill hit 10k GitHub stars in a week by solving the most annoying thing about AI coding assistants: they write too much code. Here's how it works and why it matters."
tags: ["AI", "Developer Tools", "Claude"]
coverEmoji: "🐴"
auto_generated: true
source_url: "https://github.com/DietrichGebert/ponytail"
---

You ask your AI agent for a date picker. It installs flatpickr, writes a wrapper component, adds a stylesheet, and starts a discussion about timezones.

The correct answer is `<input type="date">`.

This is the core insight behind [Ponytail](https://github.com/DietrichGebert/ponytail), which hit 10k GitHub stars this week. It's an agent skill that makes your AI coding assistant think like the laziest senior dev in the room — the one who's been at the company longer than the version control, looks at your fifty lines, says nothing, and replaces them with one.

## What Ponytail Actually Does

Ponytail installs a decision ladder that the agent checks before writing anything:

```
1. Does this need to exist?   → no: skip it (YAGNI)
2. Stdlib does it?            → use it
3. Native platform feature?   → use it
4. Installed dependency?      → use it
5. One line?                  → one line
6. Only then: the minimum that works
```

The key insight is that AI agents are optimised for _producing output_. Left to their own devices, they'll demonstrate effort by writing comprehensive, thorough, maintainable code. That's great when you need something complex. It's wasteful when the browser already ships the thing you asked for.

When Ponytail's rules kick in, the agent leaves a comment marking what it skipped and why:

```html
<!-- ponytail: browser has one -->
<input type="date">
```

Every shortcut is documented with its upgrade path. So you're not stuck with a comment that says "I was lazy here" — you're stuck with a comment that says "native input, swap for react-day-picker if you need custom styling or past-date disabling".

## The Numbers

The benchmark covers five everyday tasks: email validator, debounce, CSV sum, countdown timer, rate limiter. Three models (Haiku, Sonnet, Opus), ten runs each.

**80–94% less code. 47–77% cheaper. 3–6× faster.**

The cost reduction is the one that gets me. On Haiku the saving is more modest because Haiku already tends toward brevity. On Sonnet and Opus, where the model really leans into "let me write you something robust", the impact is dramatic.

This compounds on longer tasks too. The benchmark notes that "production-grade tasks, where an unconstrained agent bloats far more" are where the gains are biggest — the simple tasks understate what you'd see in practice.

## Installing in Claude Code

```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

That's it. Ponytail supports 11 agents: Claude Code, Codex, Pi, OpenCode, Gemini CLI, and others. The plugin injects the ruleset every turn and adds `/ponytail` commands to toggle between `lite`, `full`, and `ultra` strictness levels.

The `lite` level (default) applies the ladder to new code but won't rewrite existing code. `full` applies it everywhere. `ultra` is for when you want to go full minimalist.

## What I'd Build with This

**1. A project-specific Ponytail layer for Supabase work.** The ladder already covers "stdlib" and "installed dependency", but it doesn't know that Supabase Auth, RLS, and realtime subscriptions already exist in my stack. I'd extend the rules with a project-level `AGENTS.md` section: "Before writing auth logic, check that Supabase Auth doesn't already solve this." The pattern is the same, just domain-specific.

**2. A `/ponytail-review` step in CI.** Run the agent over every PR with Ponytail at `ultra` strictness and output a "could be simpler" comment for any file over a threshold. Not a blocker — just a flag. Useful for catching the cases where a dev (or an agent) reached for a package when a one-liner would do.

**3. A "lazy pass" before any feature build.** Before starting on a new feature, run a quick agent pass with Ponytail asking: "Does anything in the existing codebase already do this?" Not to reuse bad code, but to catch the cases where you're about to write something that's already in `lib/` or available natively.

## The Actual Insight

The skill itself is simple. The insight behind it is not.

AI agents are trained on code. Most code on the internet is either tutorial code (intentionally verbose) or production code written by developers demonstrating thoroughness. The signal for "good code" in training data skews toward completeness over minimalism.

A senior dev who's maintained a codebase for five years has a different signal: every line is a liability. Every dependency is a future CVE. Every wrapper component is something the next person has to understand.

Ponytail is a way to inject that accumulated cynicism into a model that hasn't earned it yet. Ten thousand developers starred it in a week. Apparently we all know exactly who the long-ponytail guy is.
