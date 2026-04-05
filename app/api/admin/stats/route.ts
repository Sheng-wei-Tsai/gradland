import { NextResponse } from 'next/server';
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

export async function GET() {
  const sb = await adminSupabase();
  const admin = await requireAdmin(sb);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [users, comments, applications] = await Promise.all([
    sb.from('profiles').select('id', { count: 'exact', head: true }),
    sb.from('post_comments').select('id', { count: 'exact', head: true }),
    sb.from('job_applications').select('id', { count: 'exact', head: true }),
  ]);

  const { data: recentComments } = await sb
    .from('post_comments')
    .select('id, content, post_slug, created_at, profiles ( full_name )')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentUsers } = await sb
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    counts: {
      users:        users.count        ?? 0,
      comments:     comments.count     ?? 0,
      applications: applications.count ?? 0,
    },
    recentComments: recentComments ?? [],
    recentUsers:    recentUsers    ?? [],
  });
}
