import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireSubscription, checkEndpointRateLimit, recordUsage, rateLimitResponse } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  const auth = await requireSubscription();
  if (auth instanceof NextResponse) return auth;

  const ok = await checkEndpointRateLimit(auth.user.id, 'learn/diagram');
  if (!ok) return rateLimitResponse();

  const body = await req.json().catch(() => null);
  if (!body?.skillId || !body?.skillName || !body?.pathId) {
    return NextResponse.json({ error: 'skillId, skillName, and pathId are required' }, { status: 400 });
  }

  const skillId   = String(body.skillId).slice(0, 80);
  const skillName = String(body.skillName).slice(0, 100);
  const pathId    = String(body.pathId).slice(0, 80);
  const topics    = Array.isArray(body.topics)
    ? (body.topics as unknown[]).slice(0, 10).map(t => String(t).slice(0, 80))
    : [];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OpenAI API not configured' }, { status: 500 });

  const client = new OpenAI({ apiKey });
  const topicList = topics.length > 0 ? topics.join(', ') : skillName;

  const systemPrompt = `You are a technical diagram generator. Output ONLY valid Mermaid diagram code — no markdown fences, no explanation, no prose. Start directly with the diagram type keyword.`;

  const userPrompt = `Create a Mermaid diagram that explains "${skillName}" for a beginner developer.
Topics to cover: ${topicList}.

Rules:
- Use flowchart TD or LR — whichever is cleaner for this topic
- 5–10 nodes max, short labels (≤5 words each)
- Arrows show relationships or step order
- For step-by-step topics (e.g. "how HTTP works") use a linear flow
- For concept topics (e.g. "CSS Box Model") use a hub-and-spoke layout
- No subgraphs unless clearly needed
- Output raw Mermaid only, starting with "flowchart"`;

  try {
    const completion = await client.chat.completions.create({
      model:       'gpt-4o-mini',
      messages:    [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens:  500,
    });

    let mermaidCode = completion.choices[0]?.message?.content?.trim() ?? '';
    // Strip accidental markdown fences
    mermaidCode = mermaidCode
      .replace(/^```(?:mermaid)?\n?/i, '')
      .replace(/\n?```$/, '')
      .trim();

    if (!mermaidCode) {
      return NextResponse.json({ error: 'No diagram returned' }, { status: 502 });
    }

    await recordUsage(auth.user.id, 'learn/diagram');
    return NextResponse.json({ mermaidCode, skillId, pathId });
  } catch (err) {
    console.error('Diagram generation error:', err);
    return NextResponse.json({ error: 'Diagram generation failed' }, { status: 502 });
  }
}
