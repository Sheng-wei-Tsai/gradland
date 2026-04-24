import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function adminSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );
}

async function requireAdmin(sb: Awaited<ReturnType<typeof adminSupabase>>) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  return profile?.role === 'admin' ? user : null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PATCH /api/admin/users/[id] — update role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const sb = await adminSupabase();
  const admin = await requireAdmin(sb);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const role = body.role;
  if (!['user', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const { data, error } = await sb
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select('id, full_name, email, role')
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ user: data });
}

// DELETE /api/admin/users/[id] — ban: delete all comments, set role to banned
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const sb = await adminSupabase();
  const admin = await requireAdmin(sb);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Prevent self-ban
  if (id === admin.id) {
    return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
  }

  await sb.from('post_comments').delete().eq('user_id', id);
  await sb.from('profiles').update({ role: 'banned' }).eq('id', id);

  return NextResponse.json({ ok: true });
}
