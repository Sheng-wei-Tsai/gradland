import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/auth-server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body    = await req.json();
  const content = String(body.content ?? '').trim();
  if (!content || content.length > 2000) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }

  // RLS enforces owner-only; also scope in query
  const { data, error } = await sb
    .from('post_comments')
    .update({ content, edited_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select(`id, content, edited_at`)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  return NextResponse.json({ comment: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if admin
  const { data: profile } = await sb
    .from('profiles').select('role').eq('id', user.id).maybeSingle();
  const isAdmin = profile?.role === 'admin';

  const query = sb.from('post_comments').delete().eq('id', id);
  // Admin can delete any; regular user scoped to own
  const { error } = await (isAdmin ? query : query.eq('user_id', user.id));

  if (error) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  return NextResponse.json({ ok: true });
}
