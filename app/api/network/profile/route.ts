import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/auth-server';

const VALID_VISA_TYPES = ['485', '482', 'student', 'pr', 'citizen', 'other'] as const;
const VALID_CITIES = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Other'] as const;

type VisaType = typeof VALID_VISA_TYPES[number];
type City     = typeof VALID_CITIES[number];

export async function GET() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await sb
    .from('anonymous_profiles')
    .select('role_title, visa_type, skills, city, created_at, is_hired, hired_company, hired_skills, hired_message')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json(data ?? null);
}

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const role_title = typeof body.role_title === 'string' ? body.role_title.trim().slice(0, 100) : '';
  const visa_type  = body.visa_type as string;
  const city       = body.city as string;
  const skills: string[] = Array.isArray(body.skills)
    ? (body.skills as unknown[])
        .filter((s): s is string => typeof s === 'string')
        .map(s => s.trim().slice(0, 50))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  if (!role_title) {
    return NextResponse.json({ error: 'role_title is required' }, { status: 400 });
  }
  if (!VALID_VISA_TYPES.includes(visa_type as VisaType)) {
    return NextResponse.json({ error: 'Invalid visa_type' }, { status: 400 });
  }
  if (!VALID_CITIES.includes(city as City)) {
    return NextResponse.json({ error: 'Invalid city' }, { status: 400 });
  }

  // Referral board fields (optional)
  const is_hired      = body.is_hired === true;
  const hired_company = is_hired && typeof body.hired_company === 'string'
    ? body.hired_company.trim().slice(0, 100)
    : null;
  const hired_skills: string[] = is_hired && Array.isArray(body.hired_skills)
    ? (body.hired_skills as unknown[])
        .filter((s): s is string => typeof s === 'string')
        .map(s => s.trim().slice(0, 50))
        .filter(Boolean)
        .slice(0, 20)
    : [];
  const hired_message = is_hired && typeof body.hired_message === 'string'
    ? body.hired_message.trim().slice(0, 280)
    : null;

  const { data, error } = await sb
    .from('anonymous_profiles')
    .upsert(
      {
        user_id: user.id,
        role_title,
        visa_type,
        skills,
        city,
        is_hired,
        hired_company,
        hired_skills,
        hired_message,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('role_title, visa_type, skills, city, is_hired, hired_company, hired_skills, hired_message')
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await sb.from('anonymous_profiles').delete().eq('user_id', user.id);
  if (error) return NextResponse.json({ error: 'Failed to leave network' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
