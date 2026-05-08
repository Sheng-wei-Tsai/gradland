---
title: "Claude Code's Agent Loop Costs 17x Less When You Swap the Brain"
date: "2026-05-08"
excerpt: "A new tool called deepclaude redirects Claude Code's API calls to DeepSeek V4 Pro — same autonomous agent loop, same file editing and bash execution, $0.87/M output tokens instead of $15/M."
tags: ["AI", "Claude", "Developer Tools"]
coverEmoji: "🔀"
auto_generated: true
source_url: "https://github.com/aattaran/deepclaude"
---

Claude Code is genuinely the best autonomous coding agent I've used. The tool loop — read files, edit, run bash, spawn subagents, loop until done — is hard to replicate. But at $15/M output tokens, a heavy session generates real costs. DeepSeek V4 Pro scores 96.4% on LiveCodeBench and costs $0.87/M output tokens.

A repo called [deepclaude](https://github.com/aattaran/deepclaude) hit 1,600 stars this week by exploiting a fact most people don't know: Claude Code's API routing is fully configurable via environment variables.

## How Claude Code actually picks its backend

Claude Code reads a handful of env vars at startup:

```bash
ANTHROPIC_BASE_URL           # API endpoint (default: api.anthropic.com)
ANTHROPIC_AUTH_TOKEN         # API key for that backend
ANTHROPIC_DEFAULT_SONNET_MODEL  # Model name for Sonnet-tier tasks
ANTHROPIC_DEFAULT_HAIKU_MODEL   # Model name for Haiku-tier subagents
CLAUDE_CODE_SUBAGENT_MODEL     # Model for spawned subagents
```

Point `ANTHROPIC_BASE_URL` at any Anthropic-compatible API and set `ANTHROPIC_AUTH_TOKEN` to that provider's key, and the entire Claude Code runtime — tool calls, file editing, bash execution, multi-step loops — runs against that backend instead.

`deepclaude` is a shell script (plus a PowerShell version for Windows) that sets these per-session, launches Claude Code, then restores your original env on exit. No patches, no forks, no monkey-patching.

```bash
#!/usr/bin/env bash
# Simplified version of what deepclaude does
export ANTHROPIC_BASE_URL="https://api.deepseek.com"
export ANTHROPIC_AUTH_TOKEN="$DEEPSEEK_API_KEY"
export ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-chat"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-chat"

claude "$@"

# Restore on exit (handled via trap in the real script)
```

Install is three commands:

```bash
git clone https://github.com/aattaran/deepclaude
cd deepclaude
sudo ln -s "$(pwd)/deepclaude.sh" /usr/local/bin/deepclaude
```

Then `deepclaude` instead of `claude`. Done.

## Supported backends and real pricing

The script ships with routing for several providers:

| Backend | Flag | Input $/M | Output $/M |
|---------|------|-----------|------------|
| DeepSeek V4 Pro | `--backend ds` | $0.44 | $0.87 |
| OpenRouter | `--backend or` | $0.44 | $0.87 |
| Fireworks AI | `--backend fw` | ~$0.90 | ~$2.70 |
| Normal Claude | `--backend anthropic` | varies | $15.00 |

You can benchmark latency across providers with `deepclaude --benchmark`, which runs a test prompt against each configured backend and reports response times. Useful if you're in a region where the DeepSeek servers are slow.

Mid-session switching is also supported: `deepclaude --switch anthropic` when you genuinely need Opus-level reasoning, then `deepclaude --switch ds` to go back.

## The architectural insight worth remembering

The deeper point here isn't the cost savings — it's what this reveals about how Claude Code is structured.

The autonomous agent loop (read → think → act → observe → repeat) is separate from the model that drives it. Claude Code is a harness. The model is a plugin. This same pattern appears in [LangChain's agent executors](https://python.langchain.com/docs/modules/agents/), OpenAI's Assistants API, and Anthropic's own Agent SDK.

Once you see it this way, a few things click:
- You can run the same agent loop against different models for different subtasks
- You can proxy calls through your own server to add logging, caching, or rate limiting
- You can test prompts against multiple backends to find the best cost/quality tradeoff per task type

The env var approach is intentional, not an oversight. Anthropic designed Claude Code to be backend-agnostic.

## What I'd build with this

**A cost-routing proxy.** Build a small Express or Next.js API route that sits at `ANTHROPIC_BASE_URL`. Route simple tasks (file reads, grep, brief explanations) to DeepSeek at $0.87/M and complex reasoning (architecture decisions, debugging multi-file issues) to Claude Opus. Use a classifier or token-count heuristic to decide which tier to use. Could cut costs 60–80% on mixed workloads.

**A benchmark dashboard.** Run the same set of coding tasks across DeepSeek, OpenRouter, Fireworks, and Anthropic nightly. Track quality scores (does the code compile? do tests pass?) and latency. Surface regressions when a provider changes their model. Useful as an internal tool if you're running agentic pipelines at scale.

**A per-project backend config.** Create a `.claude-backend` file in project roots that specifies which provider to use. A small shell wrapper reads it on startup. Experimental/greenfield projects default to DeepSeek; production code with strict quality requirements defaults to Claude Sonnet. Commit the config file so the whole team uses the same routing.

## My take

I've been running deepclaude for two days. For routine tasks — renaming things, writing tests, refactoring components — DeepSeek V4 Pro is indistinguishable from Sonnet in practice. For genuinely complex multi-file reasoning, I switch back to Anthropic. That's probably a 70/30 split, which puts my effective rate around $2–3/M instead of $15/M.

The limitations are real: DeepSeek's servers are in China, so if you're working on anything sensitive stay on Anthropic. Latency is higher from Australia. And some edge cases in Claude Code's tool use (particularly around subagent coordination) behave slightly differently with non-Claude models.

But for building internal tools, prototyping, and writing tests? This is hard to ignore.
