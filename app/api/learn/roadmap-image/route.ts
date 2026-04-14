import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireSubscription, checkEndpointRateLimit, recordUsage, rateLimitResponse } from '@/lib/subscription';

const VALID_ROLES = ['frontend', 'fullstack', 'backend', 'data-engineer', 'devops', 'mobile', 'qa', 'other'];
const VALID_VISA  = ['student-500', 'graduate-485', 'sponsored-482', 'pr', 'citizen', 'other'];
const VALID_STAGE = ['exploring', 'studying', 'building', 'applying', 'interviewing'];

const ROLE_LABELS: Record<string, string> = {
  'frontend':      'Frontend Developer',
  'fullstack':     'Full Stack Developer',
  'backend':       'Backend Developer',
  'data-engineer': 'Data Engineer',
  'devops':        'DevOps / Cloud Engineer',
  'mobile':        'Mobile Developer',
  'qa':            'QA Engineer',
  'other':         'IT Professional',
};

const STAGE_LABELS: Record<string, string> = {
  'exploring':    'Exploring options',
  'studying':     'Studying / upskilling',
  'building':     'Building portfolio',
  'applying':     'Actively applying',
  'interviewing': 'In interview process',
};

export async function POST(req: NextRequest) {
  const auth = await requireSubscription();
  if (auth instanceof NextResponse) return auth;

  const ok = await checkEndpointRateLimit(auth.user.id, 'learn/roadmap-image');
  if (!ok) return rateLimitResponse();

  const body = await req.json().catch(() => null);
  if (!body?.role) return NextResponse.json({ error: 'role is required' }, { status: 400 });

  const role       = VALID_ROLES.includes(body.role)       ? String(body.role)       : 'other';
  const visaStatus = VALID_VISA.includes(body.visaStatus)   ? String(body.visaStatus) : 'other';
  const jobStage   = VALID_STAGE.includes(body.jobStage)    ? String(body.jobStage)   : 'exploring';

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OpenAI API not configured' }, { status: 500 });

  const client     = new OpenAI({ apiKey });
  const roleLabel  = ROLE_LABELS[role]  ?? 'IT Professional';
  const stageLabel = STAGE_LABELS[jobStage] ?? 'Getting started';

  const systemPrompt = `You are a career roadmap diagram generator. Output ONLY valid Mermaid diagram code — no markdown fences, no explanation. Start directly with the diagram type keyword.`;

  const userPrompt = `Create a Mermaid flowchart roadmap for an international IT graduate in Australia targeting: ${roleLabel}.
Current stage: ${stageLabel}.

Show a step-by-step journey from their current stage to "Land First AU IT Job".
Include 5–7 milestones. Each milestone node should be short (≤6 words).
Add key actions as smaller nodes branching off each milestone (2–3 each).
Use flowchart TD layout.
Keep it practical and specific to the ${roleLabel} role in the Australian job market.

Output raw Mermaid only, starting with "flowchart"`;

  try {
    const completion = await client.chat.completions.create({
      model:       'gpt-4o-mini',
      messages:    [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens:  700,
    });

    let mermaidCode = completion.choices[0]?.message?.content?.trim() ?? '';
    mermaidCode = mermaidCode
      .replace(/^```(?:mermaid)?\n?/i, '')
      .replace(/\n?```$/, '')
      .trim();

    if (!mermaidCode) {
      return NextResponse.json({ error: 'No roadmap returned' }, { status: 502 });
    }

    await recordUsage(auth.user.id, 'learn/roadmap-image');
    return NextResponse.json({
      mermaidCode,
      cacheKey: `${role}_${visaStatus}_${jobStage}`,
    });
  } catch (err) {
    console.error('Roadmap generation error:', err);
    return NextResponse.json({ error: 'Roadmap generation failed' }, { status: 502 });
  }
}
