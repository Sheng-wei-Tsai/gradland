import { NextResponse } from 'next/server';
import { requireAdmin, createSupabaseService } from '@/lib/auth-server';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sb = createSupabaseService();

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
