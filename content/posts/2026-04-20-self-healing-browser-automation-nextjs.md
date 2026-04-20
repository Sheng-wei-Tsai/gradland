---
title: "Self-Healing Browser Automation with browser-harness and Next.js"
date: "2026-04-20"
excerpt: "browser-harness lets LLMs rewrite their own tooling mid-task when something breaks. Here's how to wire it into a Next.js app so your browser agents stop dying on you."
tags: ["Python", "AI Agents", "Browser Automation", "Next.js", "TypeScript"]
coverEmoji: "♞"
auto_generated: true
source_url: "https://github.com/browser-use/browser-harness"
---

Browser automation breaks constantly. Selectors change, flows shift, sites add CAPTCHAs, and your carefully crafted Playwright scripts silently fail at 2am. browser-harness flips this on its head — instead of you maintaining the tool layer, the LLM rewrites it. When the agent hits a missing capability mid-task, it edits `helpers.py` itself and keeps going. That's not a gimmick; at ~592 lines of Python total, the whole thing is thin enough that you can actually reason about what it's doing.

## What's Actually Happening Under the Hood

browser-harness is a direct CDP (Chrome DevTools Protocol) websocket bridge. No Playwright, no Selenium, no framework sitting between your agent and the browser. The architecture is deliberately minimal:

- `run.py` — spawns Python with helpers preloaded
- `helpers.py` — the live tool layer the agent reads and edits
- `daemon.py` + `admin.py` — CDP websocket + socket bridge

The self-healing loop works like this: the agent attempts a task, realises a function doesn't exist in `helpers.py`, writes that function into the file, and continues execution. No restart, no intervention. The agent is literally extending its own toolset at runtime.

```
● agent: wants to upload a file
│
● helpers.py → upload_file() missing
│
● agent edits helpers.py         192 → 199 lines
│                                 + upload_file()
✓ file uploaded
```

Skills it learns get stored in `domain-skills/` — agent-generated files that capture selectors, flows, and edge cases for specific sites. Next time it hits the same site, it reads the skill first.

## Wiring It Into a Next.js App

The typical setup is local: connect to your Chrome instance via remote debugging, point the agent at a task, let it run. But if you want this inside a Next.js app — say, a dashboard that triggers scraping jobs or a testing harness — you communicate with the Python daemon over a local socket or HTTP.

Here's a minimal Next.js API route that spawns a harness task and streams back results:

```typescript
// app/api/agent/route.ts
import { spawn } from 'child_process'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { task } = await req.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const proc = spawn('python', ['run.py', '--task', task], {
        cwd: process.env.HARNESS_DIR,
        env: { ...process.env },
      })

      proc.stdout.on('data', (chunk: Buffer) => {
        controller.enqueue(encoder.encode(`data: ${chunk.toString()}\n\n`))
      })

      proc.stderr.on('data', (chunk: Buffer) => {
        controller.enqueue(encoder.encode(`data: [err] ${chunk.toString()}\n\n`))
      })

      proc.on('close', () => {
        controller.enqueue(encoder.encode('data: [done]\n\n'))
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
       'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
```

On the client, consume that SSE stream and render progress in real time:

```typescript
// components/AgentRunner.tsx
'use client'
import { useState } from 'react'

export function AgentRunner() {
  const [log, setLog] = useState<string[]>([])

  async function runTask(task: string) {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const line = decoder.decode(value).replace(/^data: /, '').trim()
      if (line === '[done]') break
      setLog(prev => [...prev, line])
    }
  }

  return (
    <div>
      <button onClick={() => runTask('Extract pricing from competitor.com')}>Run</button>
      <pre>{log.join('\n')}</pre>
    </div>
  )
}
```

For remote browser instances (useful when you don't want to run Chrome locally), grab a free API key from `cloud.browser-use.com` — 3 concurrent browsers, no card needed. Set `BROWSER_USE_API_KEY` in your env and the harness connects to a remote Chrome instance instead.

## Handling the Self-Healing in Production

The main thing to think through in a deployed setup: `helpers.py` is being written to at runtime. That's fine locally, but in a containerised environment you need the harness directory on a writable volume, not baked into the image.

```dockerfile
# Mount harness as a volume so the agent can write domain skills
VOLUME ["/app/harness"]
ENV HARNESS_DIR=/app/harness
```

Also worth committing your `domain-skills/` directory to version control. Once the agent has figured out a tricky site's selectors and filed a skill, you want that persisted — otherwise it rediscovers the same things on every cold start.

## What I'd Build With This

**Competitor price monitor** — Point the agent at 5-10 competitor sites, have it extract pricing tables daily. When a site redesigns and breaks the old approach, the agent fixes its own helpers and keeps the pipeline running. No maintenance from me.

**End-to-end test agent for staging** — Instead of maintaining a Cypress/Playwright test suite that rots every sprint, have the agent run user journeys against staging on each deploy. It adapts when the UI changes rather than failing and getting ignored.

**Internal tooling automator** — Half of enterprise work is navigating SaaS products that don't have APIs. Expense filing, LinkedIn outreach, Jira updates. The `domain-skills/` contributor model means the agent learns the quirks of each platform once and reuses that knowledge.

I've been watching the browser automation space for years and the persistent problem has always been brittleness — you spend more time maintaining the automation than the automation saves you. Handing the maintenance task back to the LLM, and giving it write access to its own tools to do it, is the right approach. The 592-line codebase is a feature, not a limitation — I'd rather own something I can read in an afternoon than a framework I'm permanently dependent on.
