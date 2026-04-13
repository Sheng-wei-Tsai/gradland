---
title: "Auto-Generate SVG Technical Diagrams in Your Next.js App with fireworks-tech-graph"
date: "2026-04-13"
excerpt: "fireworks-tech-graph turns natural language into polished SVG diagrams via Claude Code. Here's how to wire it into a Next.js app with Supabase storage — real code, 8 diagram types, no hand-drawing."
tags: ["AI", "Next.js", "Supabase", "Claude", "Diagrams"]
coverEmoji: "🔥"
auto_generated: true
source_url: "https://github.com/yizhiyanhua-ai/fireworks-tech-graph"
---

fireworks-tech-graph hit 2,000 GitHub stars this week and it deserves the attention. It's a Claude Code skill that takes a plain English (or Chinese) description and spits out a publication-ready SVG — swim lanes, UML, multi-agent flows, the lot. If you're building any kind of AI app that needs to visualise architecture or system design, this is the missing piece you didn't know you could automate.

## What fireworks-tech-graph Actually Does

The repo ships as a Claude Code skill — meaning you drop it into your Claude Code setup and it becomes a callable capability. You describe a diagram in natural language, the skill classifies it against one of 14 diagram types, picks a visual style, and generates clean SVG. It then uses `rsvg-convert` to export a 1920px PNG.

The 7 visual styles cover most real-world needs:

- **Flat Icon** — white background, clean semantic arrows
- **Dark Terminal** — neon accents on dark, monospace font
- **Blueprint** — deep blue grid, cyan strokes
- **Notion Clean** — minimal white, single accent
- **Glassmorphism** — frosted glass cards on dark gradient
- **Claude Official** — warm cream, Anthropic brand colours
- **OpenAI Official** — pure white, OpenAI palette

The domain knowledge baked into the prompts is what makes this genuinely useful. It knows RAG pipelines, Mem0 memory architectures, multi-agent tool-call flows — the patterns you're actually drawing when building AI systems.

## Wiring It Into a Next.js API Route

The integration path is straightforward. You call Claude's API with the skill context, get SVG back in the response, then do whatever you want with it. Here's a Next.js API route that handles the full cycle — generate, upload to Supabase Storage, return the public URL:

```typescript
// app/api/generate-diagram/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { description, style = 1 } = await req.json();

  const systemPrompt = `You are a technical diagram generator.
  Output ONLY valid SVG markup — no markdown fences, no explanation.
  Use style ${style}. Supported styles: 1=Flat Icon, 2=Dark Terminal,
  3=Blueprint, 4=Notion Clean, 5=Glassmorphism, 6=Claude Official, 7=OpenAI Official.
  Width: 1920px. Include viewBox. Use semantic arrows and clear labels.`;

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: description }],
  });

  const svgContent = (message.content[0] as { type: string; text: string }).text;
  const fileName = `diagram-${Date.now()}.svg`;

  const { error } = await supabase.storage
    .from('diagrams')
    .upload(fileName, Buffer.from(svgContent), {
      contentType: 'image/svg+xml',
      cacheControl: '3600',
    });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from('diagrams')
    .getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl, svg: svgContent });
}
```

On the client side, you can render the SVG inline for instant preview while the Supabase URL is available for persistence:

```tsx
// components/DiagramGenerator.tsx
'use client';
import { useState } from 'react';

export default function DiagramGenerator() {
  const [svg, setSvg] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function generate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const description = (form.elements.namedItem('description') as HTMLInputElement).value;
    const style = (form.elements.namedItem('style') as HTMLSelectElement).value;

    const res = await fetch('/api/generate-diagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, style: parseInt(style) }),
    });

    const data = await res.json();
    setSvg(data.svg);
    setUrl(data.url);
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <form onSubmit={generate} className="flex flex-col gap-4">
        <textarea
          name="description"
          placeholder="Describe your diagram — e.g. 'RAG pipeline with vector DB, reranker, and LLM response layer'"
          className="border rounded p-3 h-32"
        />
        <select name="style" className="border rounded p-2">
          {[1,2,3,4,5,6,7].map(n => (
            <option key={n} value={n}>Style {n}</option>
          ))}
        </select>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded p-2">
          {loading ? 'Generating...' : 'Generate Diagram'}
        </button>
      </form>

      {svg && (
        <div className="mt-6">
          <div dangerouslySetInnerHTML={{ __html: svg }} />
          {url && <a href={url} className="text-blue-500 text-sm mt-2 block">Stored SVG →</a>}
        </div>
      )}
    </div>
  );
}
```

For the Supabase side, create a `diagrams` bucket with public read access. If you want PNG output instead of SVG, you'd need a server with `rsvg-convert` installed — a Dockerfile with `librsvg2-bin` handles that cleanly in a containerised deploy.

## Supported Diagram Types Worth Knowing

The 14 diagram types the skill understands include the ones you'll actually reach for:

- **System Architecture** — component boxes, data flows, external services
- **RAG Pipeline** — retrieval, embedding, reranking, generation stages
- **Multi-Agent** — agent roles, tool calls, orchestration layers
- **Mem0 Memory Architecture** — layered memory with swim lanes
- **Microservices** — service mesh, API gateways, databases
- **Full UML suite** — class, sequence, activity, state, use case, component, deployment, object, package, timing, interaction overview, communication, composite structure, profile

The AI/Agent domain types are the standout. The prompts encode enough structural knowledge that you get properly layered diagrams rather than generic boxes-and-arrows.

## What I'd Build With This

**1. Architecture docs generator for internal tooling** — hook it into your PR workflow. When a PR touches infrastructure files, trigger a diagram generation from the diff summary and attach it to the PR description automatically. Engineers get visual context without anyone drawing anything.

**2. AI system design interview tool** — build a web app where candidates describe a system and get an SVG diagram back in real time. Interviewers can see how candidates think through architecture, candidates can iterate verbally. The Blueprint or Dark Terminal styles look sharp in a coding-interview context.

**3. Documentation site plugin** — Next.js MDX site where you embed a `<Diagram>` component with a description prop. At build time, hit the API, store the SVG in Supabase, and the docs always have up-to-date diagrams that match whatever the description says. No Figma files rotting in a Notion page.

My take: the real value here isn't the SVG output itself — it's that diagram generation becomes a programmable step in a workflow rather than a manual task. The repo's domain knowledge around AI architectures is what separates it from just asking Claude to draw a box diagram. If you're shipping documentation tooling or any kind of AI dev tool, this belongs in your stack.
