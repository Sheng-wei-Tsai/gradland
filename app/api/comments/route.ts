import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/auth-server';

const SLUG_RE = /^[a-z0-9-]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from('post_comments')
    .select(`
      id, post_slug, content, parent_id, edited_at, created_at,
      profiles ( full_name, avatar_url )
    `)
    .eq('post_slug', slug)
    .order('created_at', { ascending: true })
    .limit(500);

  if (error) return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  const slug      = String(body.post_slug ?? '').trim();
  const content   = String(body.content   ?? '').trim();
  const parent_id = body.parent_id ?? null;

  if (parent_id !== null && (typeof parent_id !== 'string' || !UUID_RE.test(parent_id))) {
    return NextResponse.json({ error: 'Invalid parent_id' }, { status: 400 });
  }

  if (!SLUG_RE.test(slug))            return NextResponse.json({ error: 'Invalid slug' },    { status: 400 });
  if (!content || content.length > 2000) return NextResponse.json({ error: 'Invalid content' }, { status: 400 });

  const { data, error } = await sb
    .from('post_comments')
    .insert({ post_slug: slug, user_id: user.id, content, parent_id })
    .select(`id, post_slug, content, parent_id, edited_at, created_at, profiles ( full_name, avatar_url )`)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  return NextResponse.json({ comment: data }, { status: 201 });
}
