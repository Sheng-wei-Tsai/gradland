---
title: "OpenClaude: Run a Claude Code-Style Agent on Any Model You Want"
date: "2026-04-04"
excerpt: "OpenClaude is an open-source Claude Code alternative that wires into 200+ models via OpenAI-compatible APIs. Here's how to self-host a coding agent CLI and plug it into your Next.js/Supabase stack today."
tags: ["AI", "TypeScript", "Developer Tools", "Self-Hosting", "LLMs"]
coverEmoji: "🤖"
auto_generated: true
source_url: "https://github.com/Gitlawb/openclaude"
---

Claude Code is genuinely useful, but you're locked into Anthropic's pricing, their model choices, and their terms. OpenClaude — 14,000+ stars this week on GitHub — is the open-source drop-in that gives you the same terminal-first coding agent workflow but lets you point it at literally any OpenAI-compatible backend: GPT-4o, Gemini, GitHub Models, local Ollama, whatever. Full control, no surprises on the bill.

## What OpenClaude Actually Is

It's a CLI coding agent — think Claude Code or Codex CLI — but model-agnostic. You get bash tools, file tools, grep/glob, MCP support, slash commands, streaming output, and a built-in VS Code extension for launch integration. The whole thing is TypeScript, MIT licensed, and you can run it against a local Ollama instance for zero API cost, or swap in a cloud provider for heavier lifts.

Install is one line:

```bash
npm install -g @gitlawb/openclaude
```

Then you wire it to a provider. Fastest path with OpenAI:

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o

openclaude
```

Or run it fully local with Ollama and `qwen2.5-coder`:

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=qwen2.5-coder:7b

openclaude
```

No cloud dependency, no per-token bill, no data leaving your machine.

## Wiring It Into a Next.js/Supabase Workflow

This is where it gets practical. Most of my projects are Next.js + Supabase, and the pattern I've landed on is using OpenClaude as the agent layer for scaffolding, migrations, and repetitive CRUD generation — tasks that are too involved for a one-shot prompt but don't need a full Cursor subscription.

For a Supabase project, I drop a `.env.local`-style config and let OpenClaude handle the context:

```bash
# .openclaude/profile.sh
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=https://api.openai.com/v1
export OPENAI_MODEL=gpt-4o
export OPENAI_API_KEY=$(cat ~/.keys/openai)
```

Then inside a session I can say something like:

```
/agent: generate a Supabase migration for a `posts` table with RLS policies
  that allow authenticated users to read all rows and only write their own.
  Also scaffold the Next.js server action and the Zod schema.
```

It'll read the existing schema files, generate the SQL migration, write the server action, and produce the Zod types — all in one shot, with full file tool access. That's the same loop you get with Claude Code, but you control the model and the cost.

The `/provider` slash command inside the CLI lets you save multiple profiles — handy when you want to switch between a cheap local model for scaffolding and a smarter cloud model for complex refactors without re-exporting env vars every time.

## Model Selection Is the Real Feature

The reason OpenClaude matters right now is the model landscape. Six months ago you picked Claude or GPT-4 and that was it. Now you've got `qwen2.5-coder`, `deepseek-coder-v2`, `codestral`, and a dozen others that are legitimately good at code and either cheap or fully local. OpenClaude's OpenAI-compatible API layer means any of these work without code changes — just swap the `OPENAI_BASE_URL` and `OPENAI_MODEL` env vars.

For production use I'd probably run a cheap local model (Ollama + qwen2.5-coder:7b) for the 80% of tasks that are boilerplate, and profile-switch to GPT-4o or Claude 3.5 Sonnet via their OpenAI-compatible endpoints when I need heavier reasoning. The `/provider` system makes that a two-second switch inside the CLI.

## What I'd Build With This

**1. A private coding agent for a client project.** Self-host OpenClaude on a dev box pointed at a local Ollama instance. Zero data leaves the network, no per-seat SaaS cost, and you can give junior devs access without worrying about API key exposure or sensitive codebase data hitting third-party servers.

**2. An automated PR review bot.** Wire OpenClaude's agent and bash tools into a GitHub Actions workflow. On PR open, run the agent against the diff with a prompt that checks for missing RLS policies, type safety gaps, or missing error handling. Output the review as a PR comment. The MCP support means you can extend this with custom tools pretty cleanly.

**3. A cost-optimised code generation pipeline.** Build a small orchestration layer that routes tasks by complexity — simple CRUD to local qwen2.5-coder (free), complex architectural decisions to GPT-4o (paid but rare). OpenClaude's provider profiles make the switching trivial. Log token usage per task and you'll get a clear picture of what actually needs the expensive model.

I've been burned before by coding agent tools that work great in the demo and fall apart when you try to use them in a real project with a real codebase. OpenClaude's architecture — proper file tools, bash access, MCP, streaming — suggests it's built by people who actually use these workflows daily. The star velocity backs that up. Worth pulling it into your next project and seeing how far local models can take you before you need to reach for a paid API.
