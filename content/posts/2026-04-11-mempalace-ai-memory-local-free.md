---
title: "MemPalace: 96.6% AI Memory Benchmark Score, Runs Local, Free"
date: "2026-04-11"
excerpt: "Every AI session ends and your context dies with it. MemPalace just hit the highest LongMemEval score ever published — and you can wire it into your Next.js app this week."
tags: ["AI", "Python", "Next.js", "Supabase", "Memory"]
coverEmoji: "🏛️"
auto_generated: true
source_url: "https://github.com/MemPalace/mempalace"
---

AI memory has been a solved problem on paper for years and a disaster in practice. Every chat session is a clean slate. Every debugging context, every architectural decision you talked through — gone. MemPalace just dropped on GitHub with 41k stars in a week and a 96.6% score on LongMemEval, the standard benchmark for AI memory retrieval. That's higher than every paid cloud offering. It runs locally. It costs nothing. Here's how it actually works and how to ship something with it.

## How MemPalace Actually Works

Most memory systems are lossy by design. They fire an LLM call after each conversation, extract "key facts" — `user prefers Postgres`, `user is building a SaaS` — and throw away the original exchange. The problem is that extraction is opinionated. The AI decides what matters, and it's wrong often enough to make the whole thing unreliable.

MemPalace flips the model: **store everything verbatim, make it findable via semantic search**. Your raw conversation chunks go into ChromaDB. No summarisation, no extraction LLM call, no lossy compression. When context is needed, vector similarity retrieval pulls the actual exchanges back.

The spatial metaphor isn't just marketing. Conversations are structured into:
- **Wings** — people or projects (e.g., `project:my-saas`, `person:client-name`)
- **Halls** — memory types (debugging sessions, architecture decisions, preferences)
- **Rooms** — specific retrievable chunks

This gives the retrieval layer a navigable map rather than a flat vector index. Instead of semantic search across everything you've ever said, it narrows the search space before firing similarity queries.

The 96.6% LongMemEval R@5 score comes from raw mode — no AAAK compression, just verbatim storage with structured retrieval. They're honest that their experimental AAAK compression dialect (a lossy abbreviation format for token efficiency) currently regresses to 84.2%. Raw mode is what you should use today.

## Wiring MemPalace into a Next.js/Supabase Project

MemPalace ships with an MCP (Model Context Protocol) server, which means any MCP-compatible client can talk to it. Here's how I'd integrate it into a Next.js app that already has Supabase on the backend.

**Step 1 — Run the MemPalace MCP server locally (or on a sidecar):**

```bash
git clone https://github.com/MemPalace/mempalace
cd mempalace
pip install -r requirements.txt
python mcp_server.py
```

By default it exposes an MCP endpoint at `localhost:8765`. ChromaDB persists to disk in `./palace_data`.

**Step 2 — Store conversation turns from your Next.js API route:**

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'

const MEMPALACE_URL = process.env.MEMPALACE_URL ?? 'http://localhost:8765'

async function storeMemory(userId: string, projectId: string, exchange: { user: string; assistant: string }) {
  await fetch(`${MEMPALACE_URL}/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wing: `project:${projectId}`,
      hall: 'chat',
      content: `User: ${exchange.user}\nAssistant: ${exchange.assistant}`,
      metadata: { userId, timestamp: Date.now() }
    })
  })
}

async function retrieveContext(projectId: string, query: string): Promise<string> {
  const res = await fetch(`${MEMPALACE_URL}/retrieve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wing: `project:${projectId}`,
      query,
      top_k: 5
    })
  })
  const data = await res.json()
  return data.chunks.map((c: { content: string }) => c.content).join('\n---\n')
}

export async function POST(req: NextRequest) {
  const { userId, projectId, message } = await req.json()

  // Pull relevant past context before sending to LLM
  const memory = await retrieveContext(projectId, message)

  const systemPrompt = memory
    ? `Relevant context from past sessions:\n${memory}\n\nUse this to inform your response.`
    : 'No prior context available.'

  // Your normal LLM call here (OpenAI, Anthropic, etc.)
  const llmResponse = await callYourLLM(systemPrompt, message)

  // Store the new exchange
  await storeMemory(userId, projectId, { user: message, assistant: llmResponse })

  return NextResponse.json({ response: llmResponse })
}
```

**Step 3 — Track session metadata in Supabase:**

MemPalace handles the vector storage. Use Supabase for structured session metadata — timestamps, project ownership, user preferences — so you can build UI around it (session history lists, project-scoped memory management).

```sql
create table memory_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  project_id text not null,
  created_at timestamptz default now(),
  message_count int default 0
);
```

Increment `message_count` on each exchange and you've got a lightweight audit trail without duplicating the actual memory storage.

## What I'd Build With This

**1. Persistent AI code reviewer** — Wire MemPalace into a GitHub PR review tool. Every review decision, every pattern you've accepted or rejected, every repo convention discussed — stored and retrieved as context when the next PR comes in. The reviewer gets smarter per-repo over time without any fine-tuning.

**2. Client-scoped AI assistant** — Build a multi-tenant SaaS where each customer's AI assistant has its own wing in MemPalace. Six months of support conversations, onboarding chats, and feature requests become retrievable context. When a customer asks "why did we set it up this way?", the assistant actually knows.

**3. Long-running dev agent memory** — If you're building autonomous agents that run coding tasks over days or weeks, MemPalace gives them persistent working memory. Store intermediate reasoning, failed approaches, and environment observations. Retrieve relevant history before starting each new task step. No more agents that forget they already tried the thing that doesn't work.

I'm keeping an eye on the AAAK compression work — if they close the gap from 84.2% back toward 96.6%, you get token efficiency without sacrificing retrieval quality. That's when this becomes genuinely viable for high-volume production apps where storage costs matter. For now, raw mode is solid, local, and ready to ship.
