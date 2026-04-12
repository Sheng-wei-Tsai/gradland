---
title: "Auto-Generate Production SVG Diagrams in Next.js with fireworks-tech-graph"
date: "2026-04-12"
excerpt: "fireworks-tech-graph hit 1,500+ stars this week for a reason — it turns plain English into publication-ready SVG/PNG technical diagrams via Claude Code skills. Here's how to wire it into your Next.js app right now."
tags: ["Claude", "Next.js", "AI", "Diagrams", "Python"]
coverEmoji: "🎆"
auto_generated: true
source_url: "https://github.com/yizhiyanhua-ai/fireworks-tech-graph"
---

fireworks-tech-graph landed 1,530 stars this week and I can see exactly why. Technical diagrams are one of those things that should've been automated years ago — instead we've all wasted hours in Lucidchart or draw.io nudging boxes around. This repo ships a Claude Code skill that takes a natural language description and spits out a 1920px SVG/PNG in seconds, with 7 visual styles and 14 diagram types including full UML support. If you're building any kind of AI app in Next.js, this slots straight in.

## What the skill actually does

The core flow is simple: you describe a system in plain English (or Chinese), the skill classifies the diagram type and style, generates the SVG programmatically, then exports a high-res PNG via `rsvg-convert`. No Mermaid, no Graphviz DSL to learn — just a prompt.

The 7 styles cover real use cases: flat icon for docs, dark terminal for dev tooling, blueprint for infrastructure, Notion-clean for internal wikis, glassmorphism for landing pages, and Claude/OpenAI official styles if you're building integrations showcasing those platforms. The 14 diagram types lean heavily on AI/Agent patterns — RAG pipelines, multi-agent flows, Mem0 memory architectures, tool call sequences — plus the full UML set (sequence, class, state, component, etc.).

A stable prompt recipe looks like this:

```text
Draw a Mem0 memory architecture diagram in style 2 (Dark Terminal).
Use swim lanes for: Input Layer, Memory Management, Storage Layer, Retrieval.
Show semantic arrows between components.
Export as mem0-dark.svg and mem0-dark.png.
```

The skill handles classification internally — you don't specify diagram type as a code enum, you just describe what you want.

## Wiring it into a Next.js API route

The practical integration is a Next.js API route that shells out to the Claude Code skill, then serves the generated SVG/PNG back to the client. Here's the pattern:

```typescript
// app/api/generate-diagram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const { prompt, style = 1, outputName = 'diagram' } = await req.json();

  const fullPrompt = `${prompt} Style ${style}. Export as ${outputName}.svg and ${outputName}.png.`;

  // Run the Claude Code skill via CLI
  const { stdout, stderr } = await execAsync(
    `claude -p "${fullPrompt.replace(/"/g, '\\"')}" --allowedTools computer`,
    { cwd: process.env.FIREWORKS_SKILL_DIR }
  );

  const svgPath = path.join(process.env.FIREWORKS_SKILL_DIR!, `${outputName}.svg`);
  const pngPath = path.join(process.env.FIREWORKS_SKILL_DIR!, `${outputName}.png`);

  const [svgContent, pngBuffer] = await Promise.all([
    fs.readFile(svgPath, 'utf-8'),
    fs.readFile(pngPath),
  ]);

  return NextResponse.json({
    svg: svgContent,
    png: `data:image/png;base64,${pngBuffer.toString('base64')}`,
    log: stdout,
  });
}
```

On the frontend, you render the SVG inline (fully scalable, copy-pasteable) and offer the PNG as a download:

```tsx
// components/DiagramViewer.tsx
'use client';
import { useState } from 'react';

export function DiagramViewer() {
  const [svg, setSvg] = useState<string | null>(null);
  const [png, setPng] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch('/api/generate-diagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style: 3 }),
    });
    const data = await res.json();
    setSvg(data.svg);
    setPng(data.png);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe your system architecture..."
        className="w-full h-32 p-3 border rounded font-mono text-sm"
      />
      <button onClick={generate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
        {loading ? 'Generating...' : 'Generate Diagram'}
      </button>
      {svg && (
        <div>
          <div dangerouslySetInnerHTML={{ __html: svg }} className="border rounded p-4 bg-white" />
          {png && (
            <a href={png} download="diagram.png" className="mt-2 inline-block text-sm text-blue-600 underline">
              Download PNG (1920px)
            </a>
          )}
        </div>
      )}
    </div>
  );
}
```

For production you'd want to write the files to a temp directory per request, clean them up after serving, and put this behind auth. But this is the working skeleton.

## What I'd build with this

**AI architecture documentation tool** — users describe their system in a chat interface, the app generates the architecture diagram live, and they can toggle between styles (blueprint for the infrastructure team, Notion-clean for the PM). Export to Confluence or Notion via their APIs. Solves a real problem every team has.

**GitHub README diagram bot** — a GitHub Action or webhook that watches for a `<!-- diagram: describe your system here -->` comment in a PR, generates the SVG, commits it to the repo, and updates the README. No more stale diagrams that don't match the actual code.

**AI agent visualiser** — if you're building multi-agent systems with LangGraph or similar, wire this up to auto-render the agent graph topology from your code structure. Every time your agent config changes, regenerate the flow diagram. Pair it with the multi-agent and tool-call diagram types — they're clearly the most polished ones in the repo.

The thing I keep coming back to with fireworks-tech-graph is that it picked the right abstraction level. Natural language in, production SVG out, multiple styles so it fits different contexts. The 7 styles aren't arbitrary — each one maps to a real publishing target. I'm already using the blueprint style for infra docs and the Claude official style for anything going into an Anthropic integration showcase. Worth having in your toolkit.
