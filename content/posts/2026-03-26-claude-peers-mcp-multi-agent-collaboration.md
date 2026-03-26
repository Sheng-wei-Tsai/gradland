---
title: "Claude Peers MCP: Wire Up Multi-Agent Claude Collaboration Today"
date: "2026-03-26"
excerpt: "Claude Peers MCP lets your Claude Code instances discover each other and exchange messages in real time. Here's what it is, how it works, and what you can actually build with it."
tags: ["TypeScript", "AI Agents", "MCP", "Claude", "Developer Tools"]
coverEmoji: "🤝"
auto_generated: true
source_url: "https://github.com/louislva/claude-peers-mcp"
---

Multi-agent AI coordination has been a mostly theoretical conversation until recently — lots of blog posts about orchestration patterns, not many things you can actually run. Claude Peers MCP changes that. It's a working MCP server that lets multiple Claude Code sessions discover each other on your machine and pass messages back and forth in real time. It hit over 1,200 GitHub stars this week, and it deserves the attention.

## What It Actually Does

The setup is straightforward. You clone the repo, register the MCP server globally with Claude Code, and from that point on every Claude session you start has access to four tools: `list_peers`, `send_message`, `set_summary`, and `check_messages`.

Under the hood, a broker daemon starts automatically on `localhost:7899` and maintains a SQLite database of active sessions. Each session registers itself — including its working directory, git repo, and a human-readable summary of what it's doing. Messages between sessions are pushed via the `claude/channel` protocol, so they arrive instantly rather than on a polling interval.

```bash
# Clone and install
git clone https://github.com/louislva/claude-peers-mcp.git ~/claude-peers-mcp
cd ~/claude-peers-mcp
bun install

# Register globally
claude mcp add --scope user --transport stdio claude-peers -- bun ~/claude-peers-mcp/server.ts

# Run with channel support
alias claudepeers='claude --dangerously-load-development-channels server:claude-peers'
```

Once two sessions are running, you can ask either one to list peers and you'll get back the other session's ID, directory, repo, and summary. Then you can send it a message and it receives it immediately.

## The Pattern Worth Understanding

What makes this interesting isn't just the messaging — it's the scoping. `list_peers` accepts a scope parameter: `machine`, `directory`, or `repo`. That means a Claude working on your API can specifically discover other Claudes working in the same repo, without noise from unrelated sessions.

This enables a coordination pattern that's actually useful in large TypeScript/Next.js projects where you might have one Claude handling your data layer, one on UI components, and one doing integration testing. Instead of context-switching yourself between them, they can directly negotiate — one Claude can ask another what interfaces it's exposing before writing dependent code.

```
Terminal 1 (api/)
> Ask Claude A to message peer [id] in ui/:
  "What props does your UserCard component expect?"

Terminal 2 (ui/)
> Claude B responds with the interface definition

Terminal 1
> Claude A proceeds with that contract — no copy-paste from you
```

This isn't autonomous agents running wild. You're still driving each session. But the coordination overhead drops significantly.

## Caveats Worth Knowing

The `--dangerously-skip-permissions` and `--dangerously-load-development-channels` flags are real flags with real implications. The channel protocol is marked as a development feature. Don't run this in a CI environment or anywhere you don't fully control. This is local dev tooling, not production infrastructure.

The broker is also ephemeral — it's a local daemon, not a persistent service. If you're building something that depends on message history, you'd need to extend the SQLite schema yourself. The current setup is intentionally minimal.

## What I'd Build With This

**Parallel feature development with contract negotiation.** Split a feature across three Claude sessions — one for the database schema, one for the API routes, one for the frontend. Have each one `set_summary` describing its current interface contract, then use `send_message` to negotiate type definitions before any code gets written. Eliminates the integration hell that usually shows up at PR time.

**Automated code review pipeline.** Spin up a dedicated "reviewer" Claude session that sits idle. As you work in your main session, periodically send it file paths or diffs and ask for a review. The reviewer has no context pollution from your implementation decisions — it comes in fresh. Closer to a real second opinion than asking the same session that wrote the code.

**Monorepo task distribution.** In a large monorepo, have one orchestrator Claude session that breaks down a task and delegates subtasks to peer sessions scoped to specific packages. Each peer works in its package, reports back via `send_message` when done. The orchestrator assembles the results. You'd need to babysit it, but the pattern is sound.

I think the most underrated thing here is how low the setup cost is. Five minutes from clone to two talking Claude sessions. The primitives are simple enough that you can build meaningful coordination patterns on top without fighting the framework. Whether this evolves into something more robust or stays a local experiment, it's the most concrete multi-agent Claude tooling available right now — and that alone makes it worth your time.
