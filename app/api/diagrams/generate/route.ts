import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireSubscription, checkEndpointRateLimit, recordUsage, rateLimitResponse } from '@/lib/subscription';

const ALLOWED_TYPES = ['flowchart', 'sequence', 'pyramid', 'architecture'] as const;
type DiagramType = typeof ALLOWED_TYPES[number];

const TYPE_RULES: Record<DiagramType, string> = {
  flowchart: `- Use "flowchart TD" or "flowchart LR" — whichever reads better.
- 4–8 nodes max. One arrow per relationship.
- For step-by-step topics use a linear flow with a feedback arrow back to the start.
- Highlight ONE focal node with: style X fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px`,
  sequence: `- Use "sequenceDiagram" with autonumber.
- 2–4 participants max, named with single capital letters where possible.
- Show the request/response round-trip — do not document failure paths in v1.
- Mix solid (->>) and dashed (-->>) arrows to show direction of data.`,
  pyramid: `- Use "flowchart TB" stacked top-to-bottom (top = narrowest, bottom = broadest).
- 3–5 layers max. One short label per layer (≤3 words).
- Highlight the apex with: style TOP fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px`,
  architecture: `- Use "flowchart TB" or "flowchart LR" arranged in layers (user → edge → app → data).
- 5–8 nodes max. Group related components on the same row.
- Use [(name)] for databases and {{name}} for queues.
- Highlight the central component with: style X fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px`,
};

export async function POST(req: NextRequest) {
  const auth = await requireSubscription();
  if (auth instanceof NextResponse) return auth;

  const ok = await checkEndpointRateLimit(auth.user.id, 'diagrams/generate');
  if (!ok) return rateLimitResponse();

  const body = await req.json().catch(() => null);
  if (!body?.topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 });
  }

  const topic = String(body.topic).slice(0, 200).trim();
  const rawType = String(body.type ?? 'flowchart').toLowerCase();
  const type: DiagramType = (ALLOWED_TYPES as readonly string[]).includes(rawType)
    ? (rawType as DiagramType)
    : 'flowchart';

  if (topic.length < 3) {
    return NextResponse.json({ error: 'topic must be at least 3 characters' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OpenAI API not configured' }, { status: 500 });

  const client = new OpenAI({ apiKey });

  const systemPrompt = `You are an editorial-quality technical diagram generator.
Your output is rendered with Mermaid. Output ONLY raw Mermaid code — no markdown
code fences, no commentary, no prose. Begin with the diagram-type keyword.

Design principles (non-negotiable):
- Deletion is the highest-quality move. Every node must earn its place.
- Short labels (≤5 words). Plain English. No jargon unless it is the topic itself.
- Reserve the accent colour for ONE focal node — the thing the reader should look at first.
- Single concept per diagram. Do not try to fit the whole stack in one chart.`;

  const userPrompt = `Make a ${type} diagram explaining: "${topic}".

Type-specific rules:
${TYPE_RULES[type]}

Output raw Mermaid only.`;

  try {
    const completion = await client.chat.completions.create({
      model:       'gpt-4o-mini',
      messages:    [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens:  600,
    });

    let mermaidCode = completion.choices[0]?.message?.content?.trim() ?? '';
    mermaidCode = mermaidCode
      .replace(/^```(?:mermaid)?\r?\n?/i, '')
      .replace(/\r?\n?```\s*$/, '')
      .trim();

    if (!mermaidCode) {
      return NextResponse.json({ error: 'No diagram returned' }, { status: 502 });
    }

    await recordUsage(auth.user.id, 'diagrams/generate');
    return NextResponse.json({ mermaid: mermaidCode, type, topic });
  } catch (err) {
    console.error('Diagram generation error:', err);
    return NextResponse.json({ error: 'Diagram generation failed' }, { status: 502 });
  }
}
