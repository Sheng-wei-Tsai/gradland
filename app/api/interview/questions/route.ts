import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { getRoleById } from '@/lib/interview-roles';

export async function POST(req: NextRequest) {
  let body: { roleId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const { roleId } = body;
  if (!roleId) {
    return new Response(JSON.stringify({ error: 'Missing roleId' }), { status: 400 });
  }

  const role = getRoleById(roleId);
  if (!role) {
    return new Response(JSON.stringify({ error: 'Unknown role' }), { status: 400 });
  }

  const prompt = `Generate the 10 most commonly asked interview questions for a ${role.title} role in Australia at companies like ${role.companies.slice(0, 3).join(', ')}.

Topics to cover: ${role.topics.join(', ')}.

Return ONLY a valid JSON object in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "id": "q1",
      "text": "The interview question here?",
      "scenario": "A brief real-world scenario at an Australian tech company where this question would come up (1-2 sentences, specific and concrete)",
      "focus": "What this question is really testing (one sentence)",
      "concepts": ["key concept 1", "key concept 2", "key concept 3"],
      "framework": "How to structure a strong answer (2-3 sentences describing the approach, not a sample answer)"
    }
  ]
}

Requirements:
- Mix technical and behavioural questions (60% technical, 40% behavioural)
- Realistic questions that Australian tech companies actually ask at ${role.difficulty} level
- Exactly 10 questions`;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content ?? '{"questions":[]}';
    return new Response(raw, { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('OpenAI questions error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to generate questions';
    return new Response(JSON.stringify({ error: msg }), { status: 502 });
  }
}
