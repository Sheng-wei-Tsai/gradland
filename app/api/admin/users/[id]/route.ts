import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer, requireAdmin } from '@/lib/auth-server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PATCH /api/admin/users/[id] — update role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const role = body?.role;
  if (!['user', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select('id, full_name, email, role')
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ user: data });
}

// DELETE /api/admin/users/[id] — ban: delete all comments, set role to banned
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (id === admin.id) {
    return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
  }

  const sb = await createSupabaseServer();
  const { error: deleteError } = await sb.from('post_comments').delete().eq('user_id', id);
  if (deleteError) return NextResponse.json({ error: 'Failed to delete comments' }, { status: 500 });

  const { error: banError } = await sb.from('profiles').update({ role: 'banned' }).eq('id', id);
  if (banError) return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
