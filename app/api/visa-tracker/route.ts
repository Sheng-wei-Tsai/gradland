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
    .maybeSingle();

  return NextResponse.json(data ?? { employer: '', occupation: '', started_at: null, steps: {} });
}

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { employer?: string; occupation?: string; started_at?: string; steps?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }

  const startedAt = body.started_at ?? null;
  if (startedAt !== null && !/^\d{4}-\d{2}-\d{2}$/.test(startedAt)) {
    return NextResponse.json({ error: 'Invalid started_at format' }, { status: 400 });
  }

  const rawSteps = body.steps ?? {};
  if (typeof rawSteps !== 'object' || Array.isArray(rawSteps) || rawSteps === null) {
    return NextResponse.json({ error: 'steps must be a plain object' }, { status: 400 });
  }
  if (JSON.stringify(rawSteps).length > 4096) {
    return NextResponse.json({ error: 'steps payload too large' }, { status: 400 });
  }
  for (const k of Object.keys(rawSteps)) {
    if (!/^[1-9]\d*$/.test(k)) {
      return NextResponse.json({ error: 'steps keys must be positive integers' }, { status: 400 });
    }
  }
  const steps = rawSteps as Record<string, unknown>;

  const { error } = await sb.from('visa_tracker').upsert(
    {
      user_id:    user.id,
      employer:   body.employer   ? body.employer.trim().slice(0, 100)   : null,
      occupation: body.occupation ? body.occupation.trim().slice(0, 100) : null,
      started_at: startedAt,
      steps,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) return NextResponse.json({ error: 'Failed to save tracker' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
