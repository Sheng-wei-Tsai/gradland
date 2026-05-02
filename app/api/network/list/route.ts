import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/auth-server';

const VALID_CITIES = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Other'] as const;
const VALID_VISAS  = ['485', '482', 'student', 'pr', 'citizen', 'other'] as const;

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const city = searchParams.get('city') ?? '';
  const visa = searchParams.get('visa') ?? '';
  const role = searchParams.get('role')?.trim().slice(0, 100) ?? '';

  const sb = await createSupabaseServer();

  let query = sb
    .from('anonymous_profiles')
    .select('id, role_title, visa_type, skills, city, created_at')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (city && (VALID_CITIES as readonly string[]).includes(city)) {
    query = query.eq('city', city);
  }
  if (visa && (VALID_VISAS as readonly string[]).includes(visa)) {
    query = query.eq('visa_type', visa);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to load profiles' }, { status: 500 });
  }

  let profiles = data ?? [];

  if (role) {
    const needle = role.toLowerCase();
    profiles = profiles.filter(p =>
      p.role_title.toLowerCase().includes(needle),
    );
  }

  return NextResponse.json(profiles);
}
