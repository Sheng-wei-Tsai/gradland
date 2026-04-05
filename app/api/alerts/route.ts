import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Cookie: cookies().toString() },
      },
    },
  );
}

export async function GET() {
  const sb = serverClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await sb
    .from('job_alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ alerts: data });
}

export async function POST(req: NextRequest) {
  const sb = serverClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const keywords  = String(body.keywords  ?? '').trim().slice(0, 200);
  const location  = String(body.location  ?? 'Brisbane').trim().slice(0, 100);
  const full_time = Boolean(body.full_time);
  const frequency = ['daily', 'weekly'].includes(body.frequency) ? body.frequency : 'weekly';

  if (!keywords) return NextResponse.json({ error: 'keywords required' }, { status: 400 });

  const { data, error } = await sb
    .from('job_alerts')
    .insert({ user_id: user.id, keywords, location, full_time, frequency })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ alert: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const sb = serverClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await sb
    .from('job_alerts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // RLS double-check

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
