---
title: "Computer Use Costs 45x More — Build the API Instead"
date: "2026-05-06"
excerpt: "A benchmark from Reflex shows the same admin panel task costs 551k tokens with computer use and 12k tokens with a structured API. Here's how to think about the tradeoff when building AI features."
tags: ["AI", "APIs", "Architecture"]
coverEmoji: "🖱️"
auto_generated: true
source_url: "https://reflex.dev/blog/computer-use-is-45x-more-expensive-than-structured-apis/"
---

There's a benchmark making the rounds on HN this week that every developer building AI features should read before they reach for `browser-use` or Claude's computer use mode.

Reflex ran the same task on an admin panel two ways: a vision agent (screenshot → reason → click) and an API agent (call a structured endpoint, get data back). Same task, same result. The vision agent needed 53 steps and 551,000 tokens. The API agent needed 8 calls and 12,000 tokens. That's a 45x cost difference. At Sonnet prices, the difference between a $0.01 operation and a $0.46 one — every single time it runs.

## What the loop actually looks like

Computer use works like a human with no keyboard shortcuts. It takes a screenshot, figures out what's on screen, moves the cursor, clicks something, waits, takes another screenshot. That loop repeats for every state transition. It's brilliant when there's no other option. It's expensive when there is.

A structured API call skips all of that. The model sends one request, gets back exactly the data it needs in JSON, and acts on it. No pixels to interpret, no clicking, no waiting for page loads.

The difference in token usage isn't a surprise once you think about it. Every screenshot gets encoded into tokens. Every "I see a table with these rows" reasoning step costs tokens. A 53-step computer use flow is burning tokens on the *mechanics* of navigation, not on the *problem*.

## When each approach is right

Computer use genuinely wins in a few scenarios:

- **External sites you don't control** — scraping a competitor's pricing page, filling out a government form, interacting with a legacy SaaS you have no API access to
- **One-off automation** — it's not worth building an API integration for something you'll run once
- **UI testing** — visually verifying that your own app looks right is actually a valid use case

Structured APIs win everywhere else. If an AI agent is going to repeatedly interact with your own application — reading data, triggering actions, updating records — build it a proper interface.

## What this looks like in a Next.js app

The mistake I see developers make is treating their own application like an external website. They spin up a computer use agent to click around their own dashboard when they could just expose an API route the agent can call directly.

Instead of this:

```
agent → computer use → screenshot dashboard → click "Export" → wait → screenshot CSV modal → click download → ...
```

Do this:

```ts
// app/api/agent/export-users/route.ts
export async function GET(req: NextRequest) {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: users } = await sb
    .from('users')
    .select('id, email, created_at, plan')
    .eq('org_id', user.user_metadata.org_id)
    .order('created_at', { ascending: false })
    .limit(500);

  return NextResponse.json({ users });
}
```

Then your agent prompt just says: "Call GET /api/agent/export-users to get the user list." One request, 200 tokens, done.

You can go further and expose a small set of "agent-optimised" endpoints that return exactly what the model needs — no extra fields, clear structure, sensible limits. Think of it as building an internal MCP without the overhead.

```ts
// Schema the model can reason about cleanly
{
  "users": [
    { "id": "uuid", "email": "...", "plan": "pro", "joined": "2026-03-14" }
  ],
  "total": 847,
  "exported_at": "2026-05-06T04:00:00Z"
}
```

Compare that to what the model has to do with computer use: parse a rendered HTML table, deal with pagination, handle loading states, extract the same data from visual noise.

## What I'd build with this

**Agent-optimised API layer for existing SaaS tools.** Most internal tools have terrible APIs or none at all. A thin proxy layer that translates an AI-friendly interface into whatever the underlying tool actually expects — a single structured API in front of five ugly ones. One place to maintain, all your agents can use it.

**Automated admin workflows in Next.js apps.** Build a set of agent routes alongside your user-facing routes: `/api/agent/get-failing-jobs`, `/api/agent/retry-payment`, `/api/agent/flag-account`. Wire them to a lightweight agent loop. You get automation that costs fractions of a cent per task instead of dollars.

**Hybrid agent that falls back to computer use.** Default to structured API calls. Only escalate to computer use when the action isn't available via API. Log which tasks trigger the fallback — that's your backlog of API endpoints to build.

## My take

The lesson isn't "computer use is bad." It's that computer use is a last resort, not a first option. When you control the application, you control the interface — and building a clean API is almost always worth it.

The hard part is the discipline to build that API before you need it, rather than reaching for browser automation because it feels like the "AI way" to do things. But the 45x cost difference is a pretty compelling argument for some upfront work.

If you're building AI agents that interact with your own apps, spend two hours creating agent-optimised endpoints. Your token bill will thank you.
