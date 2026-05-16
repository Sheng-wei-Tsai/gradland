import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseService } from '@/lib/auth-server';

const VALID_ROLES = ['frontend', 'fullstack', 'backend', 'data-engineer', 'devops', 'mobile', 'qa', 'other'];
const VALID_VISA  = ['outside', 'student', 'graduate', 'working', 'resident', 'unsure'];
const VALID_STAGE = ['building', 'applying', 'interviews', 'offer'];

export async function POST(req: NextRequest) {
  // Auth via SSR cookie session (not Bearer token — tokens can leak in logs/referrers)
  const authSb = await createSupabaseServer();
  const { data: { user } } = await authSb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { role, visaStatus, jobStage, anzsco, experienceYears } = body as Record<string, unknown>;

  const roleStr       = typeof role            === 'string' ? role            : undefined;
  const visaStr       = typeof visaStatus      === 'string' ? visaStatus      : undefined;
  const stageStr      = typeof jobStage        === 'string' ? jobStage        : undefined;
  const anzscoStr     = typeof anzsco          === 'string' ? anzsco          : undefined;
  const experienceNum = typeof experienceYears === 'number' && Number.isFinite(experienceYears)
    ? Math.min(50, Math.max(0, Math.trunc(experienceYears)))
    : null;

  // Validate values (allow null/undefined to persist as null for skipped questions)
  if (roleStr   && !VALID_ROLES.includes(roleStr))  return NextResponse.json({ error: 'Invalid role' },       { status: 400 });
  if (visaStr   && !VALID_VISA.includes(visaStr))   return NextResponse.json({ error: 'Invalid visaStatus' }, { status: 400 });
  if (stageStr  && !VALID_STAGE.includes(stageStr)) return NextResponse.json({ error: 'Invalid jobStage' },   { status: 400 });
  // ANZSCO: 6-digit numeric code (DIBP); allow empty for "other" role
  if (anzscoStr && anzscoStr.length > 0 && !/^\d{6}$/.test(anzscoStr)) {
    return NextResponse.json({ error: 'Invalid anzsco' }, { status: 400 });
  }

  // Service role for the write (profiles table needs service role to bypass RLS on upsert)
  const sb = createSupabaseService();
  const { error } = await sb.from('profiles').upsert({
    id:                          user.id,
    onboarding_role:             roleStr   ?? null,
    onboarding_visa_status:      visaStr   ?? null,
    onboarding_job_stage:        stageStr  ?? null,
    onboarding_anzsco:           anzscoStr && anzscoStr.length > 0 ? anzscoStr : null,
    onboarding_experience_years: experienceNum,
    onboarding_completed:        true,
    onboarding_completed_at:     new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: 'Failed to save onboarding' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
