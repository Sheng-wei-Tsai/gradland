---
title: "Stop Re-Explaining Your Codebase to Claude Every Session"
date: "2026-05-19"
excerpt: "agentmemory is a self-hosted memory engine that gives AI coding agents persistent, searchable context across sessions — 95% retrieval accuracy, zero external dependencies, works with Claude Code today."
tags: ["AI", "Claude", "Developer Tools"]
coverEmoji: "🧠"
auto_generated: true
source_url: "https://github.com/rohitg00/agentmemory"
---

Every session with an AI coding agent starts the same way. You explain the auth setup. You explain why you're using Supabase RLS instead of checking ownership in application code. You explain that this project uses CSS custom properties, not Tailwind. By the third time you've typed the same paragraph, you start wondering if you're the one doing the learning here.

`agentmemory` shipped this week to fix that. It's trending at 13k stars with 7.8k earned in the past seven days — fast enough that it's worth understanding what it actually does before the hype cycle turns it into vapourware mythology.

## What it is

It's a self-hosted memory server that sits alongside your agent tooling. You boot it once, point Claude Code (or Cursor, or Codex, or whatever you're running) at it via MCP, and it starts capturing what the agent learns automatically. File access patterns, architectural decisions, things you've corrected — 12 hooks record context without you doing anything manually.

When you start a new session, the agent queries the memory server instead of asking you to re-explain. The claim is 95.2% retrieval accuracy (R@5 benchmark), which it backs with comparisons against mem0 (68.5%) and Letta (83.2%).

Getting started is a single command:

```bash
npx @agentmemory/agentmemory
# Starts memory server on :3111, dashboard on :3113
```

For Claude Code specifically:

```bash
/plugin install agentmemory
```

That auto-registers the 12 capture hooks and exposes 53 MCP tools to the agent. From that point on, sessions accumulate context rather than starting from scratch.

## How the retrieval works

The interesting part isn't the storage — it's the search. Most agent memory implementations go straight to vector embeddings, and that's where they fall apart for code. Code has specific terminology (`createSupabaseServer`, `assertSameOrigin`, your custom hook names) that vector similarity handles poorly because the embeddings for unusual tokens are underfit.

agentmemory fuses three signals via reciprocal rank fusion:

- **BM25** — classic keyword matching, reliable for exact identifiers
- **Vector embeddings** — semantic similarity for concepts
- **Knowledge graph** — relationships between entities (functions, files, decisions)

The fusion is what gets you to 95% instead of 68%. You can query it directly:

```bash
curl -X POST http://localhost:3111/agentmemory/smart-search \
  -d '{"project": "myapp", "query": "how does auth work in route handlers"}'
```

Or save something explicitly:

```bash
curl -X POST http://localhost:3111/agentmemory/remember \
  -d '{"project": "myapp", "insight": "Never use service role client outside of write-bypass scenarios — RLS is enforced everywhere else"}'
```

The four-tier memory consolidation (working → episodic → semantic → procedural) mirrors how human memory works. Fresh observations sit in working memory; repeated patterns get promoted to semantic memory where they're cheaper to recall. Token efficiency is the real win here: they report annual spend dropping from ~650k tokens to ~170k for a typical codebase.

## What I'd build with this

**Per-project architecture context for a team.** The memory server exposes a REST API, so you could seed it with decisions from architecture decision records (ADRs) before the first agent session. Every developer on the team would share the same institutional knowledge — the agent already knows why you chose Supabase over PlanetScale, what the RLS patterns look like, which libraries are banned.

**A "what changed this sprint" agent hook.** Wire the memory server to your CI pipeline. After each merge to main, run a script that stores a summary of what changed and why (pulled from git commit messages). The next agent session has sprint context without anyone maintaining a CLAUDE.md by hand.

**Embedded memory for AI features in your own app.** agentmemory exposes MCP + REST, which means you can use it as a memory backend for AI features you're shipping to users — not just for your own dev workflow. A career platform, for example, could store what a user has told their AI mentor across multiple chat sessions without blowing out context windows on every turn.

## My take

The zero-external-dependencies angle is what makes this production-credible. SQLite + a custom vector engine means you can run it on a VPS, in a Docker container alongside your dev environment, or in a GitHub Actions job. No Postgres, no Pinecone account, no vendor lock-in.

The 95% retrieval number is high enough to matter. At 68% you're still re-explaining things about a third of the time — at 95% you're getting mostly correct recall with occasional misses, which is actually useful rather than occasionally useful.

The main unknown is longevity. Projects that explode to 13k stars in a week can disappear just as fast. The Apache-2.0 licence means you can fork it if you need to, which takes the edge off that risk.

Worth setting up in a weekend. If it saves you five minutes of context re-explanation per session and you're running a few agent sessions a day, it pays for itself in a week.
