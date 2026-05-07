'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function UsersTable() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        // Fetch full list via stats endpoint (recentUsers only has 5 — for full list we'd need a dedicated route)
        // For now use recentUsers; full list can be added if needed
        setUsers(d.recentUsers ?? []);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const setRole = async (id: string, role: string) => {
    setActing(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (data.user) setUsers(prev => prev.map(u => u.id === id ? { ...u, role: data.user.role } : u));
    setActing(null);
  };

  const banUser = async (id: string) => {
    if (!confirm('Delete all comments and ban this user?')) return;
    setActing(id);
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'banned' } : u));
    setActing(null);
  };

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <p style={{ marginBottom: '2rem', fontSize: '0.88rem' }}>
        <Link href="/admin" style={{ color: 'var(--terracotta)' }}>← Admin</Link>
      </p>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: '1.8rem', color: 'var(--brown-dark)', marginBottom: '2rem' }}>
        Users
      </h1>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--parchment)', textAlign: 'left' }}>
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--parchment)' }}>
                <td style={{ padding: '0.65rem 0.75rem', color: 'var(--brown-dark)', fontWeight: 500 }}>{u.full_name || '—'}</td>
                <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <span className={`role-pill role-pill-${u.role === 'admin' ? 'admin' : u.role === 'banned' ? 'banned' : 'user'}`}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{fmt(u.created_at)}</td>
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {u.role !== 'admin' && (
                      <button onClick={() => setRole(u.id, 'admin')} disabled={acting === u.id}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #d97706', color: '#d97706', background: 'transparent', cursor: 'pointer' }}>
                        Make admin
                      </button>
                    )}
                    {u.role === 'admin' && (
                      <button onClick={() => setRole(u.id, 'user')} disabled={acting === u.id}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid var(--parchment)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer' }}>
                        Remove admin
                      </button>
                    )}
                    {u.role !== 'banned' && (
                      <button onClick={() => banUser(u.id)} disabled={acting === u.id}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer' }}>
                        Ban
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
        Showing 5 most recent users. Full user list coming soon.
      </p>
    </div>
  );
}

export default function AdminUsersPage() {
  return <AdminGuard><UsersTable /></AdminGuard>;
}
