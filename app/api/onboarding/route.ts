import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const VALID_ROLES = ['frontend', 'fullstack', 'backend', 'data-engineer', 'devops', 'mobile', 'qa', 'other'];
const VALID_VISA  = ['outside', 'student', 'graduate', 'working', 'resident', 'unsure'];
const VALID_STAGE = ['building', 'applying', 'interviews', 'offer'];

export async function POST(req: NextRequest) {
  // Verify auth via Bearer token
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: { user }, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { role, visaStatus, jobStage } = body as Record<string, string | undefined>;

  // Validate values (allow null/undefined to persist as null for skipped questions)
  if (role       && !VALID_ROLES.includes(role))       return NextResponse.json({ error: 'Invalid role' },       { status: 400 });
  if (visaStatus && !VALID_VISA.includes(visaStatus))  return NextResponse.json({ error: 'Invalid visaStatus' }, { status: 400 });
  if (jobStage   && !VALID_STAGE.includes(jobStage))   return NextResponse.json({ error: 'Invalid jobStage' },   { status: 400 });

  const { error } = await sb.from('profiles').upsert({
    id:                      user.id,
    onboarding_role:         role          ?? null,
    onboarding_visa_status:  visaStatus    ?? null,
    onboarding_job_stage:    jobStage      ?? null,
    onboarding_completed:    true,
    onboarding_completed_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
