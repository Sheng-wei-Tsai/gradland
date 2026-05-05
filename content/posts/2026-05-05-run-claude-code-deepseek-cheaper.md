---
title: "Run Claude Code's Agent Loop on DeepSeek for 17x Less"
date: "2026-05-05"
excerpt: "deepclaude is a shell wrapper that keeps Claude Code's autonomous agent loop intact while routing API calls to DeepSeek V4 Pro — at $0.87/M output tokens instead of $15/M."
tags: ["Claude Code", "AI", "Developer Tools", "DeepSeek"]
coverEmoji: "🔀"
auto_generated: true
source_url: "https://github.com/aattaran/deepclaude"
---

Claude Code's autonomous agent loop is genuinely the best coding agent experience I've used. The multi-step task execution, the subagent spawning, the file reading and editing — it all just works. The problem is the bill. At $200/month base plus API usage, running it through a long refactor or a multi-file scaffolding session adds up fast.

[deepclaude](https://github.com/aattaran/deepclaude) is a shell wrapper that keeps the Claude Code shell — the tool loop, file editing, bash execution, git integration — while routing the actual API calls to a cheaper model. It hit over 1,000 GitHub stars this week.

The setup takes about two minutes. Whether it makes sense to use it depends on what you're doing.

## How it actually works

Claude Code reads a handful of environment variables to decide where to send API calls:

| Variable | Purpose |
|---|---|
| `ANTHROPIC_BASE_URL` | Which endpoint to hit |
| `ANTHROPIC_AUTH_TOKEN` | Auth key for that endpoint |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Model name for Sonnet-tier tasks |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Model name for Opus-tier tasks |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model for spawned subagents |

deepclaude sets these per session before launching Claude Code, then restores your original values on exit. Nothing is permanently changed. Run `deepclaude --status` and you'll see which backend is active, same as running `claude --version` but with provider info.

The default backend is DeepSeek V4 Pro, which scores 96.4% on LiveCodeBench and costs $0.87/M output tokens. Anthropic's equivalent is $15/M output. That's the 17x.

## The backends

```bash
deepclaude                  # DeepSeek V4 Pro (default, $0.87/M out)
deepclaude --backend or     # OpenRouter ($0.44/M input — cheapest overall)
deepclaude --backend fw     # Fireworks AI (US servers, lowest latency)
deepclaude --backend anthropic  # Normal Claude Code when you need Opus
```

The `--switch` flag lets you change backend mid-session without restarting:

```bash
deepclaude --switch anthropic  # Switch to Anthropic for a tricky reasoning task
deepclaude --switch ds         # Switch back to DeepSeek for the grunt work
```

That's the workflow I'd actually use: start sessions on DeepSeek for the routine stuff (writing boilerplate, scaffolding routes, reformatting files), then switch to Anthropic when you need the model to reason carefully about an architectural decision or debug something subtle.

## Setup

```bash
# macOS/Linux — two commands
git clone https://github.com/aattaran/deepclaude
chmod +x deepclaude/deepclaude.sh
sudo ln -s "$(pwd)/deepclaude/deepclaude.sh" /usr/local/bin/deepclaude

# Add your DeepSeek key
echo 'export DEEPSEEK_API_KEY="sk-your-key-here"' >> ~/.bashrc
source ~/.bashrc

# Run
deepclaude
```

Sign up at [platform.deepseek.com](https://platform.deepseek.com), add $5 credit, grab your API key. That $5 will go a very long way at these prices.

The `--benchmark` flag runs a latency test across all configured providers so you can see which is fastest from your region. DeepSeek routes through Chinese servers, which means latency varies. Fireworks AI runs the same model on US infrastructure if that's a concern.

## What to watch out for

The model swap is not invisible. DeepSeek V4 Pro and Claude Sonnet have different personalities, different failure modes, and different strengths. A few things I'd be careful about:

**Instruction following.** Claude Code's AGENTS.md and complex system prompts are tuned for Claude's behaviour. DeepSeek will generally follow them but may interpret edge cases differently. If you have a highly specific AGENTS.md, test it with deepclaude before relying on it for anything critical.

**Reasoning quality.** For straightforward code generation and refactoring, DeepSeek V4 Pro is excellent. For architectural reasoning — "what's the right abstraction here?" — Claude tends to be more reliable. Use `--backend anthropic` for those moments.

**No streaming UI differences.** The Claude Code UI and output format stays exactly the same. This is the point: you're swapping the inference backend, not the harness.

## What I'd build with this

**A tiered cost management system for AI-powered apps.** Most AI-powered products don't actually need the most capable model for every request. You could implement a routing layer that sends simple classification tasks to DeepSeek (via its own API), uses Claude Haiku for structured extraction, and reserves Claude Sonnet for complex user-facing interactions. deepclaude demonstrates the pattern: the harness is separate from the model.

**An agent loop benchmark.** Use deepclaude's `--benchmark` flag as a model and build something similar for your own API calls — a script that runs the same prompt against multiple providers, records latency and token costs, and reports the optimal provider for each task type in your app. Useful if you're running high-volume pipelines.

**A local dev cost tracker.** Log which deepclaude backend you're using per session and how many tokens each session burns. After a month you'd have real data on whether the quality trade-off is worth it for your specific workflow. Right now everyone's making this call based on vibes.

---

My read: deepclaude is worth trying if you're using Claude Code for the kind of sessions where you know roughly what you want and the model is mostly executing. Scaffolding a new feature, writing tests for existing code, reformatting a large file — that's where the cost difference is real and the quality difference is small. For anything that requires genuine reasoning, keep the Anthropic backend available and switch when you need it.

The interesting longer-term implication is what it reveals about the Claude Code architecture: the agent loop is clean enough that you can swap the model without touching anything else. That's a good design.
