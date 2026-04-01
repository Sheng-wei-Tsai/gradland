import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SYSTEM = `You are an expert technical interviewer for Australian IT companies. Evaluate the candidate's answer honestly and constructively.

Your response must follow this exact format — no deviations:
**Score: X/100**

[2-3 sentences of specific feedback on what was good and what was weak]

**What to improve:**
- [specific suggestion 1]
- [specific suggestion 2]

Keep it concise. Australian tone is fine. Be encouraging but honest.`;

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let body: { question?: string; answer?: string; roleTitle?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const { question, answer, roleTitle } = body;
  if (!question || !answer || !roleTitle) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const userPrompt = `Role: ${roleTitle}
Question: ${question}
Candidate's answer: ${answer.slice(0, 2000)}

Evaluate this answer now.`;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: 350,
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

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('OpenAI evaluate error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to evaluate answer';
    return new Response(JSON.stringify({ error: msg }), { status: 502 });
  }
}
