---
title: "Claude Code Instances That Talk to Each Other: claude-peers-mcp"
date: "2026-03-26"
excerpt: "claude-peers lets your Claude Code sessions discover each other and exchange messages in real time. Here's what that actually unlocks for multi-agent TypeScript workflows."
tags: ["TypeScript", "Claude", "MCP", "Multi-Agent", "AI"]
coverEmoji: "🤝"
auto_generated: true
source_url: "https://github.com/louislva/claude-peers-mcp"
---

Multi-agent AI coordination has mostly been theoretical hand-waving — until you actually wire it up locally. claude-peers-mcp dropped on GitHub this week and already has over 1,200 stars, and the reason is simple: it lets your Claude Code instances find each other and send messages that arrive instantly. No cloud orchestration layer, no complicated setup. A SQLite broker on localhost:7899, an MCP server per session, and suddenly five Claude sessions running across your monorepo can actually coordinate.

## How It Works Under the Hood

The architecture is deliberately simple. A broker daemon runs locally on port 7899 with a SQLite database. Each Claude Code session spawns an MCP server process that registers with the broker on startup. Messages are pushed back into the session via the `claude/channel` protocol, so Claude sees inbound messages immediately rather than polling.

The four tools exposed are exactly what you'd want:

- `list_peers` — find other instances, optionally scoped to the same directory or git repo
- `send_message` — send a message to a peer by ID
- `set_summary` — let other peers know what you're working on
- `check_messages` — manual fallback if you're not in channel mode

Setup is under two minutes:

```bash
git clone https://github.com/louislva/claude-peers-mcp.git ~/claude-peers-mcp
cd ~/claude-peers-mcp
bun install

# Register globally so every Claude session picks it up
claude mcp add --scope user --transport stdio claude-peers -- bun ~/claude-peers-mcp/server.ts

# Alias for convenience
alias claudepeers='claude --dangerously-load-development-channels server:claude-peers'
```

Then just open two terminals, run `claudepeers` in each, and ask one to list its peers. You'll see the other session with its working directory, git repo, and current summary.

## Coordination Patterns Worth Using

The interesting question isn't "can they talk" — it's "what do you actually coordinate on". Here are the patterns that make sense in a real TypeScript/Next.js project.

**Shared type contract negotiation.** You've got one Claude working on the API routes and another on the frontend components. Instead of copy-pasting types between terminals, the API Claude can message the frontend Claude when a response shape changes:

```typescript
// API Claude announces a schema change
// "send message to peer [frontend-id]: 
//  UserProfile response now includes avatarUrl?: string — update your ProfileCard props"

// frontend-id Claude receives this and updates:
interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string // updated per API peer
}
```

**Work partitioning across a large codebase.** Spin up a Claude per domain — `app/api`, `app/(dashboard)`, `lib/db`. Each calls `set_summary` describing what it's touching. Before any Claude modifies a shared utility, it lists peers and checks nobody else is mid-refactor on the same file. Simple, but it prevents the conflict hell you get when running parallel sessions naively.

**Test-driven handoff.** One Claude writes failing tests, sets its summary to "waiting for implementation", then messages a second Claude with the test file path. The second Claude runs the tests, implements until green, messages back. You've got a crude but functional red-green loop across two sessions without a single orchestration framework.

```bash
# In Claude A (test writer)
> Write failing tests for the /api/invoices/[id] route, then message peer [impl-id] 
  with the test file path and tell them to implement until green

# Claude B (implementer) receives the message, runs:
npx jest app/api/invoices/\[id\]/route.test.ts
# implements, reruns, messages back when passing
```

## What I'd Build With This

**Automated PR review pipeline.** Three Claude sessions: one reads the diff and writes a review checklist, messages a second that checks types and tests pass, messages a third that verifies the changes against the product spec. Each posts their findings back to a shared markdown file. Runs while you're having lunch.

**Monorepo migration assistant.** Large Next.js App Router migration from Pages Router? One Claude per route group, each claiming ownership via `set_summary`. A coordinator Claude lists peers, assigns work, then polls for completion messages. Parallelise the boring mechanical work without sessions stepping on each other.

**Live architecture documentation.** Each Claude session working on a domain sets a summary of what it's actively touching. A lightweight Node script polls the broker API every 30 seconds and writes current session summaries to a `WORKING.md` in the repo root. Your team gets a live view of what's in-flight across AI sessions without anyone having to remember to update a doc.

This is still rough — the `--dangerously-skip-permissions` flag in the quick start should give you pause before you run this on anything sensitive. But the coordination primitive itself is solid, and the fact that it's all local with no external dependencies makes it easy to reason about. I'll be wiring this into my next monorepo project. The overhead is near zero and the upside of sessions that don't blindly clobber each other is immediately worth it.
