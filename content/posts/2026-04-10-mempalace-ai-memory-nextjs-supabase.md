---
title: "MemPalace: Wire a 96.6% AI Memory Layer Into Your Next.js App Today"
date: "2026-04-10"
excerpt: "MemPalace just dropped 40k stars in a week with a bold claim: highest-scoring AI memory system ever benchmarked, free, local-only. Here's how it actually works and how to ship it in a real app."
tags: ["AI", "Python", "Next.js", "Supabase", "Memory"]
coverEmoji: "🏛️"
auto_generated: true
source_url: "https://github.com/milla-jovovich/mempalace"
---

MemPalace hit GitHub trending with 40k stars this week and a claim that's hard to ignore: 96.6% on LongMemEval, beating every paid memory system on the market, with zero API calls and zero subscription cost. If you're building any kind of AI assistant, chatbot, or copilot on top of Next.js and Supabase, this is the missing piece you've been duct-taping together with ad-hoc prompt stuffing. Let me show you how it actually works and how to wire it in.

## How MemPalace Actually Works

Most AI memory systems summarise your conversations — they burn an LLM call to extract "user prefers Postgres" and throw away the conversation where you explained *why*. That lossy compression is why they score badly on recall benchmarks. MemPalace does the opposite: store everything verbatim in ChromaDB, then use semantic search to find it later.

The mental model is lifted straight from the ancient Greek method of loci — the "memory palace" technique. Your data is organised into:

- **Wings** — top-level buckets (a person, a project)
- **Halls** — memory types within a wing (decisions, debugging sessions, architecture discussions)
- **Rooms** — specific idea nodes inside a hall

No AI gatekeeps what gets stored. Every word goes in. The hierarchical structure just gives the retrieval layer a navigable map instead of a flat vector blob.

The 96.6% R@5 result on LongMemEval comes from raw mode — straight verbatim storage. There's also an experimental AAAK compression dialect that packs repeated entities into fewer tokens, but it currently regresses to 84.2%, and the authors are upfront about that. Use raw mode for production.

## Setting Up MemPalace Locally

```bash
pip install mempalace
```

MemPalace runs a local MCP (Model Context Protocol) server that your app talks to. Boot it up:

```bash
mempalace serve --port 8765
```

Ingest an existing conversation dump:

```python
from mempalace import Palace

palace = Palace(path="~/.mempalace")

# Store a conversation turn
palace.store(
    wing="projects/my-saas",
    hall="architecture",
    content="We decided to use Supabase RLS over a custom middleware layer because "
            "the team already knows Postgres policy syntax and it keeps auth logic "
            "co-located with the schema.",
    metadata={"timestamp": "2026-04-07", "participants": ["henry", "claude"]}
)

# Retrieve — semantic search, returns top-k chunks
results = palace.recall(
    wing="projects/my-saas",
    query="why did we choose Supabase over custom auth middleware?",
    k=5
)

for r in results:
    print(r.content)
```

ChromaDB handles the embeddings locally — no OpenAI embeddings API call, no data leaving your machine.

## Wiring It Into a Next.js + Supabase App

The cleanest integration pattern is a thin API route that the AI route handler calls before building its prompt. Here's a working Next.js 14 App Router example:

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MEMPALACE_URL = process.env.MEMPALACE_URL ?? 'http://localhost:8765'

async function recallMemory(userId: string, query: string) {
  const res = await fetch(`${MEMPALACE_URL}/recall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wing: `users/${userId}`,
      query,
      k: 5,
    }),
  })
  const data = await res.json()
  return data.results as { content: string; score: number }[]
}

async function storeMemory(userId: string, hall: string, content: string) {
  await fetch(`${MEMPALACE_URL}/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wing: `users/${userId}`,
      hall,
      content,
    }),
  })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { message } = await req.json()

  // Pull relevant memory before building the prompt
  const memories = await recallMemory(user.id, message)
  const memoryContext = memories
    .map(m => `- ${m.content}`)
    .join('\n')

  const systemPrompt = `You are a helpful assistant with memory of past conversations.

Relevant context from memory:
${memoryContext}

Use this context naturally. Don't announce that you're using memory.`

  // Your LLM call here — OpenAI, Anthropic, whatever
  const response = await callLLM(systemPrompt, message)

  // Store the exchange after responding
  await storeMemory(
    user.id,
    'conversations',
    `User: ${message}\nAssistant: ${response}`
  )

  return NextResponse.json({ response })
}
```

The Supabase auth layer scopes each user's memory to their own wing — no cross-contamination. You could also store the raw conversation turns in a Supabase table for audit purposes while MemPalace handles the recall.

For production deployment you'll want to run the MemPalace server as a sidecar container — a simple `Dockerfile` wrapping `mempalace serve` alongside your Next.js app on Railway or Fly.io works fine. The ChromaDB data directory mounts to a persistent volume.

## What I'd Build With This

**Personal dev copilot with project memory** — a Claude/GPT wrapper that remembers every architecture decision, every bug you've fixed, every library you've evaluated across all your projects. Ask it "why did we reject tRPC last year?" and get the actual answer with context, not a hallucination.

**Customer support agent with long-term user context** — instead of reading Supabase CRM records into the prompt manually, let MemPalace recall the last six months of support history for a given user ID. The agent walks in knowing the customer's whole saga without you building a bespoke retrieval pipeline.

**Team knowledge base that actually works** — pipe your Slack exports, PR review threads, and Notion docs into MemPalace wings per project. Give your whole team a chat interface that can recall "what did we decide about the billing architecture in March?" and return the actual Slack thread, not a summary someone wrote two weeks later.

I've been frustrated with how quickly AI tools lose context between sessions. MemPalace's approach — store everything, search well — is obviously the right call, and the benchmark numbers back it up. The local-only constraint is a feature, not a limitation, especially if you're working with anything client-related. Worth dropping into your next project before someone packages it into a $49/month SaaS.
