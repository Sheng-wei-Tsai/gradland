---
title: "Run Codex Inside Claude Code for a Real Multi-Agent Review Loop"
date: "2026-03-31"
excerpt: "OpenAI's new Claude Code plugin lets you fire Codex reviews without leaving your existing workflow. Here's how to wire it up in a Next.js/TypeScript project today."
tags: ["OpenAI", "Claude", "TypeScript", "Next.js", "AI Tooling"]
coverEmoji: "🔁"
auto_generated: true
source_url: "https://github.com/openai/codex-plugin-cc"
---

OpenAI just dropped a Claude Code plugin that lets you call Codex directly from inside Claude Code — reviews, adversarial challenges, background jobs, the lot. That's nearly 1,800 GitHub stars in a week, which tells me a lot of people have been waiting for exactly this kind of cross-model workflow. If you're already living in Claude Code for your Next.js or TypeScript work, this is a same-day install.

## Installing the Plugin

You need Node 18.18+, a ChatGPT subscription or OpenAI API key, and Claude Code already running. Three commands and you're done:

```bash
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
```

Then run `/codex:setup` — it'll check your environment and offer to install the `@openai/codex` CLI if it's missing. If Codex is installed but you haven't authenticated yet:

```bash
!codex login
```

After that you've got six slash commands available: `/codex:review`, `/codex:adversarial-review`, `/codex:rescue`, `/codex:status`, `/codex:result`, and `/codex:cancel`. There's also a `codex:codex-rescue` subagent sitting in `/agents` for delegating background work.

## The Review Workflow in a Next.js/TypeScript Project

The basic use case: you've been refactoring your app router layout, you've got uncommitted changes across a handful of files, and you want a second opinion before you push. Standard review:

```bash
/codex:review --background
```

Multi-file reviews take time — running it in the background means you keep working. Check in when you're ready:

```bash
/codex:status
/codex:result
```

For branch comparison before a PR merge:

```bash
/codex:review --base main
```

This is read-only — Codex won't touch your files. It reviews your current uncommitted diff or the branch delta, same quality as running `/review` natively inside Codex.

Where it gets genuinely useful is `/codex:adversarial-review`. Say you've just wired up a new data-fetching pattern using React Server Components and you're not confident about the tradeoffs:

```bash
/codex:adversarial-review --base main
```

This mode is steerable — it pressure-tests your implementation decisions, questions the design, surfaces failure modes, and asks whether a simpler approach exists. In a TypeScript codebase it tends to catch things like overly broad `any` escapes, missing error boundaries, and RSC/client component boundary mistakes that a standard linter won't flag.

## Background Delegation with `/codex:rescue`

The rescue flow is for when you're stuck. You hand a problem off to Codex as a background job and come back to it:

```bash
/codex:rescue "Fix the type errors in src/lib/auth.ts and make sure the session handler matches the NextAuth v5 types"
```

Then:

```bash
/codex:status   # see if it's still running
/codex:result   # grab the output when done
/codex:cancel   # kill it if you've already solved it yourself
```

This is the multi-agent piece — Claude Code handles your active context and conversation, Codex runs the delegated task async. For longer jobs like migrating a module from Pages Router to App Router, this beats blocking your whole session on a single task.

## What I'd Build With This

**Automated PR review bot for a Next.js monorepo.** Wire `/codex:review --base main` into a pre-push git hook or a lightweight CI step. Not to block merges, but to post Codex's output as a PR comment automatically — a second model's read on every diff before human review.

**TypeScript migration assistant.** Point `/codex:rescue` at files still using `// @ts-ignore` or implicit `any` with a prompt to tighten the types. Let it run in the background across multiple files while you work on something else, then review the diffs with `/codex:adversarial-review` before committing.

**Architecture pressure-tester.** Before any significant refactor — say, moving from a custom auth solution to NextAuth v5, or adopting Zustand over Context — run `/codex:adversarial-review` on the proposed changes. Use it as a structured way to surface the objections you haven't thought of yet.

Honestly, the thing I find most practical here isn't any single command — it's the fact that it fits inside a workflow you're already in. No context switching, no copy-pasting code into a separate chat. You get a second model's opinion without leaving Claude Code, and the background job support means you're not blocked while it thinks. Whether Codex's output is better or worse than Claude's for your specific codebase is something you'll figure out in the first week — but having the option costs you about three minutes to set up.
