import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/auth-server';

export async function GET() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await sb
    .from('visa_tracker')
    .select('employer, occupation, started_at, steps')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json(data ?? { employer: '', occupation: '', started_at: null, steps: {} });
}

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { employer?: string; occupation?: string; started_at?: string; steps?: Record<string, unknown> };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }

  const startedAt = body.started_at ?? null;
  if (startedAt !== null && !/^\d{4}-\d{2}-\d{2}$/.test(startedAt)) {
    return NextResponse.json({ error: 'Invalid started_at format' }, { status: 400 });
  }

  const { error } = await sb.from('visa_tracker').upsert(
    {
      user_id:    user.id,
      employer:   body.employer   ? body.employer.trim().slice(0, 100)   : null,
      occupation: body.occupation ? body.occupation.trim().slice(0, 100) : null,
      started_at: startedAt,
      steps:      body.steps      ?? {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
