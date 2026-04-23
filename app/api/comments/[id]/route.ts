import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer, requireAdmin } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  return NextResponse.json({ comment: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if admin using shared helper
  const admin = await requireAdmin();
  const isAdmin = !!admin;

  const query = sb.from('post_comments').delete().eq('id', id);
  // Admin can delete any; regular user scoped to own
  const { error } = await (isAdmin ? query : query.eq('user_id', user.id));

  if (error) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  return NextResponse.json({ ok: true });
}
