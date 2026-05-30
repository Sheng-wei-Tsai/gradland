import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { COMPANY_INTEL } from '@/lib/interview-roles';
import { requireSubscription, recordUsage, checkEndpointRateLimit, rateLimitResponse } from '@/lib/subscription';
import { sanitizeUserText, wrapUserContent, assertSameOrigin } from '@/lib/safety';

type MentorStage = 'scene' | 'why' | 'guide' | 'reality' | 'followup';

const ALEX_SYSTEM = `You are Alex Chen, a senior software developer with 8 years of experience at Australian tech companies including Atlassian. You're helping someone prepare for Australian IT job interviews.

Your style:
- First person, warm but direct
- Concise — never more than 130 words per response
- Mention real Australian companies naturally where relevant
- No bullet points — conversational prose only
- Never restate the interview question word-for-word — build on it`;

interface MentorData {
  stage: MentorStage;
  question: string;
  scenario?: string;
  focus?: string;
  concepts?: string[];
  framework?: string;
  roleTitle: string;
  companyExample?: string;
  userAnswer?: string;  // used for followup stage
}

function buildPrompt(d: MentorData): string {
  const companyIntel = d.companyExample ? COMPANY_INTEL[d.companyExample] : undefined;
  const companyContext = companyIntel
    ? `At ${d.companyExample}, interviews follow this process: ${companyIntel.process}. Their style: ${companyIntel.style}.`
    : '';

  switch (d.stage) {
    case 'scene':
      return `You are coaching someone preparing for a ${d.roleTitle} interview. The question is: "${d.question}"

Context: ${d.scenario ?? 'a real-world team at an Australian tech company'}
${companyContext}

In 2-3 short sentences, paint a vivid picture of when this situation actually comes up in Australian tech teams. Be concrete and specific — not generic advice. End with why nailing this answer matters for getting the job.`;

    case 'why':
      return `Interview question: "${d.question}"
What it tests: ${d.focus ?? '(see question)'}
Key concepts: ${d.concepts?.join(', ') ?? '(see question)'}
${companyContext}

In 2-3 sentences, tell the candidate exactly what the interviewer at a company like ${d.companyExample ?? 'Atlassian'} is looking for. Be direct about what separates a good answer from a great one.`;

    case 'guide':
      return `Interview question: "${d.question}"
Answer framework: ${d.framework ?? '(structure a clear, relevant response)'}
${companyIntel ? `Insider tip for ${d.companyExample}: ${companyIntel.tip}` : ''}

In 3-4 sentences, give your personal take on structuring the perfect answer. Share one specific tip you'd whisper to a junior dev right before they walked in. Make it actionable.`;

    case 'reality':
      return `Interview question: "${d.question}"
Role: ${d.roleTitle}

You've seen hundreds of candidates answer this question. In 3-4 sentences, share the 2-3 most common mistakes candidates make — especially international candidates. Be specific about cultural assumptions, over-qualification anxiety, or underselling patterns you've seen. End with ONE short recovery phrase they can memorise for when they feel they've gone off track.`;

    case 'followup':
      return `Original interview question: "${d.question}"
Candidate's answer:
${wrapUserContent('userAnswer', d.userAnswer ?? '')}

As an interviewer, generate ONE specific follow-up question you'd ask next. Make it probing and specific to what the candidate actually said — not a generic follow-up. Keep it to one sentence. Don't explain it, just ask the question.`;
  }
}

export async function POST(req: NextRequest) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSubscription();
  if (auth instanceof NextResponse) return auth;

  const withinLimit = await checkEndpointRateLimit(auth.user.id, 'interview/mentor');
  if (!withinLimit) return rateLimitResponse();

  let body: MentorData;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const { stage, question, roleTitle } = body;
  if (!stage || !question || !roleTitle) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!['scene', 'why', 'guide', 'reality', 'followup'].includes(stage)) {
    return new Response(JSON.stringify({ error: 'Invalid stage' }), { status: 400 });
  }

  const knownCompanies = new Set(Object.keys(COMPANY_INTEL));

  const safeBody: MentorData = {
    ...body,
    roleTitle:      sanitizeUserText(roleTitle, { maxLength: 100, allowNewlines: false }).clean,
    question:       sanitizeUserText(question,  { maxLength: 500, allowNewlines: false }).clean,
    userAnswer:     body.userAnswer != null
      ? sanitizeUserText(body.userAnswer, { maxLength: 800 }).clean
      : body.userAnswer,
    scenario:       body.scenario != null
      ? sanitizeUserText(body.scenario, { maxLength: 200, allowNewlines: false }).clean
      : undefined,
    focus:          body.focus != null
      ? sanitizeUserText(body.focus, { maxLength: 200, allowNewlines: false }).clean
      : undefined,
    framework:      body.framework != null
      ? sanitizeUserText(body.framework, { maxLength: 200, allowNewlines: false }).clean
      : undefined,
    concepts:       Array.isArray(body.concepts)
      ? body.concepts.slice(0, 10).map(c => sanitizeUserText(c, { maxLength: 60, allowNewlines: false }).clean)
      : undefined,
    companyExample: typeof body.companyExample === 'string' && knownCompanies.has(body.companyExample)
      ? body.companyExample
      : undefined,
  };

  const userPrompt = buildPrompt(safeBody);

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API not configured' }), { status: 503 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ALEX_SYSTEM },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 200,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    void recordUsage(auth.user.id, 'interview/mentor');
    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to generate narration' }), { status: 502 });
  }
}
