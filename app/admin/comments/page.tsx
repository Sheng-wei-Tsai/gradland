'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';

interface CommentRow {
  id: string;
  content: string;
  post_slug: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CommentsTable() {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setComments(d.recentComments ?? []);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    setDeleting(id);
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (res.ok) setComments(prev => prev.filter(c => c.id !== id));
    setDeleting(null);
  };

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <p style={{ marginBottom: '2rem', fontSize: '0.88rem' }}>
        <Link href="/admin" style={{ color: 'var(--terracotta)' }}>← Admin</Link>
      </p>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: '1.8rem', color: 'var(--brown-dark)', marginBottom: '2rem' }}>
        Comments
      </h1>

      {comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No comments yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map(c => (
            <div key={c.id} style={{
              background: 'var(--warm-white)', border: '1px solid var(--parchment)',
              borderRadius: '10px', padding: '1rem 1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <strong style={{ color: 'var(--brown-dark)' }}>{c.profiles?.full_name ?? 'Unknown'}</strong>
                  {' '}on{' '}
                  <Link href={`/blog/${c.post_slug}`} style={{ color: 'var(--terracotta)' }}>{c.post_slug}</Link>
                  {' · '}{fmt(c.created_at)}
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--brown-dark)', lineHeight: 1.5 }}>
                  {c.content}
                </p>
              </div>
              <button
                onClick={() => deleteComment(c.id)}
                disabled={deleting === c.id}
                style={{
                  flexShrink: 0, fontSize: '0.78rem', padding: '0.3rem 0.7rem',
                  border: '1px solid var(--vermilion)', color: 'var(--vermilion)', background: 'transparent',
                  borderRadius: '6px', cursor: 'pointer',
                }}
              >
                {deleting === c.id ? '…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
        Showing 5 most recent comments. Full list coming soon.
      </p>
    </div>
  );
}

export default function AdminCommentsPage() {
  return <AdminGuard><CommentsTable /></AdminGuard>;
}
