---
title: "OpenCode: The Terminal AI Coding Agent Worth Switching To"
date: "2026-07-09"
excerpt: "OpenCode just hit 160K GitHub stars and 7.5M monthly active developers. It's a terminal-first coding agent that works with any model provider — including local ones — and has a plan/build split that actually prevents the runaway edit problem."
tags: ["AI Tools", "Developer Tools", "LLMs"]
coverEmoji: "⌨️"
auto_generated: true
source_url: "https://opencode.ai/docs/"
---

OpenCode hit 160K GitHub stars this week. That's not blog-post fluff — that's the fastest adoption of any open-source coding agent ever, and for good reason.

I've been running it alongside Claude Code for the past fortnight and there's a specific property that makes it worth your attention: it separates the *planning* step from the *building* step at the agent level. If you've ever had a coding agent make 15 file edits when you asked it a question, you'll understand why this matters.

## What OpenCode actually is

It's a terminal-first AI coding agent, MIT-licensed, that works with any model provider — Anthropic, OpenAI, Google, GitHub Copilot, or local models via Ollama. You're paying your model vendor directly; OpenCode is just the shell.

Install it in under a minute:

```bash
# macOS (Homebrew)
brew install opencode-ai/tap/opencode

# or via the installer script
curl -fsSL https://opencode.ai/install | bash
```

Then run `opencode` inside any project directory. It reads your codebase, respects your `.gitignore`, and picks up LSP diagnostics from TypeScript automatically.

## The plan/build agent split

This is the feature that sold me.

OpenCode ships with two agents you switch between with Tab:

- **Build agent** — full access. Can read files, write files, run shell commands, make API calls. The default for development work.
- **Plan agent** — read-only. Denies file edits by default and asks permission before running any shell command.

When I want to understand a bug or explore an unfamiliar part of the codebase, I switch to Plan. It can't accidentally overwrite anything. When I'm ready to make changes, I switch to Build and paste in the plan I just generated.

This sounds simple but it eliminates the most annoying failure mode of agentic coding: asking "what does this function do?" and getting back 8 edited files.

## Config for a Next.js + TypeScript project

Drop an `opencode.json` in your project root:

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-6",
  "agents": {
    "plan": {
      "model": "claude-haiku-4-5-20251001"
    }
  }
}
```

The plan agent uses Haiku (cheap, fast) and the build agent uses Sonnet (quality). For interactive exploration you want fast responses; for actually writing code you want the better model. This config makes that happen automatically without you thinking about it.

OpenCode also reads an `AGENTS.md` file in your project root — same format as Claude Code. If you've already got one, it just works.

## Running it against local models

Point it at Ollama for fully offline operation:

```json
{
  "provider": "ollama",
  "model": "qwen2.5-coder:32b",
  "baseUrl": "http://localhost:11434"
}
```

Qwen2.5-Coder 32B running locally handles most TypeScript tasks well enough for the plan agent and code review workflows. Not as capable as Sonnet for complex reasoning, but zero API cost, zero data leaving your machine. For a Next.js project where you're working on auth or payment flows, that privacy property is useful.

## Running multiple agents in parallel

OpenCode supports parallel sessions on the same project:

```bash
# Terminal 1: agent working on tests
opencode --session fix-tests

# Terminal 2: agent working on docs
opencode --session update-docs
```

Each session maintains its own context. No bleed between them. This is useful when you have two independent tasks — fix failing tests in one window while the other agent updates API docs — and don't want to context-switch mid-stream.

I've been running three sessions at once on larger refactors: one for the data layer, one for the UI, one in plan mode for reviewing what the other two did.

## What I'd build with this

**A per-project model router.** An `opencode.json` that switches models based on the task — Haiku for "explain this function", Sonnet for feature work, Opus for architecture questions. The config supports per-agent model selection already; you'd just build a CLI wrapper that swaps the config based on a `--task` flag.

**A local-first code review pipeline.** Use Ollama + OpenCode in plan mode to run automated pre-commit code review against your own rules. Completely offline, no API costs, no code leaving the machine. Pair it with a AGENTS.md that encodes your team's conventions and you get custom linting that actually understands context.

**An AGENTS.md generator.** A script that reads your `package.json`, `tsconfig.json`, folder structure and key config files, then generates a project-specific AGENTS.md. Run it once when you start a project and OpenCode has the context it needs from day one.

## My take

OpenCode isn't trying to be an IDE. It's a sharp tool: terminal-first, model-agnostic, composable with whatever else you're running. The plan/build split is genuinely useful, not a gimmick. And the local model support means you can use it in contexts where sending code to an external API isn't an option.

The 75+ provider support does mean there's more config surface than Claude Code, but for most projects the defaults are sensible and you can dial it in with a 10-line JSON file.

Worth an afternoon to try. The install is fast, it won't touch your files until you're in build mode, and the worst case is you go back to what you were using before.
