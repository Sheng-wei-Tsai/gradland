'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { AdminJobListing } from '@/app/api/admin/job-listings/route';

type Filter = 'all' | 'pending' | 'active' | 'expired';

const STATUS_COLOURS: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(200,138,20,0.12)', color: 'var(--gold)'     },
  active:  { bg: 'rgba(30,122,82,0.12)',  color: 'var(--jade)'     },
  expired: { bg: 'rgba(120,104,88,0.12)', color: 'var(--text-muted)' },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function JobListingsAdminClient() {
  const [listings, setListings] = useState<AdminJobListing[]>([]);
  const [filter,   setFilter]   = useState<Filter>('pending');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/job-listings')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(d => { setListings(d.listings ?? []); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function action(id: string, act: 'approve' | 'reject' | 'extend') {
    setBusy(id + act);
    try {
      const r = await fetch('/api/admin/job-listings', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, action: act }),
      });
      if (!r.ok) throw new Error(await r.text());
      load();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  }

  const visible = filter === 'all' ? listings : listings.filter(l => l.status === filter);

  const countOf = (s: Filter) =>
    s === 'all' ? listings.length : listings.filter(l => l.status === s).length;

  const pending = countOf('pending');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Admin
        </Link>
      </div>

      <h1 style={{ fontFamily: "'Lora', serif", fontSize: '2rem', color: 'var(--brown-dark)', marginBottom: '0.4rem' }}>
        Job Listings
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Approve or reject paid listings from <Link href="/post-a-role" style={{ color: 'var(--terracotta)' }}>/post-a-role</Link>.
        {pending > 0 && (
          <span style={{ marginLeft: '0.75rem', background: 'rgba(192,40,28,0.12)', color: 'var(--vermilion)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem' }}>
            {pending} pending
          </span>
        )}
      </p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['pending', 'active', 'expired', 'all'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.35rem 0.9rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600,
              border: filter === f ? '2px solid var(--ink)' : '2px solid var(--parchment)',
              background: filter === f ? 'var(--ink)' : 'var(--warm-white)',
              color: filter === f ? 'var(--cream)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({countOf(f)})
          </button>
        ))}
      </div>

      {error && (
        <p style={{ color: 'var(--vermilion)', background: 'rgba(192,40,28,0.08)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}

      {!loading && visible.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No {filter === 'all' ? '' : filter + ' '}listings.</p>
      )}

      {visible.map(l => {
        const sc = STATUS_COLOURS[l.status] ?? STATUS_COLOURS.expired;
        return (
          <div key={l.id} style={{
            background: 'var(--warm-white)',
            border: '1px solid var(--parchment)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Info */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brown-dark)' }}>{l.title}</span>
                  <span style={{ ...sc, fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {l.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  {l.company} · {l.location} · {l.job_type}
                  {l.salary ? ` · ${l.salary}` : ''}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Contact: <a href={`mailto:${l.contact_email}`} style={{ color: 'var(--terracotta)' }}>{l.contact_email}</a>
                  {' · '} Submitted: {fmt(l.created_at)}
                  {l.status !== 'pending' && ` · Expires: ${fmt(l.expires_at)}`}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  <a href={l.apply_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terracotta)' }}>
                    {l.apply_url.slice(0, 60)}{l.apply_url.length > 60 ? '…' : ''}
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {l.status === 'pending' && (
                  <>
                    <ActionButton
                      label="Approve"
                      variant="success"
                      disabled={busy !== null}
                      loading={busy === l.id + 'approve'}
                      onClick={() => action(l.id, 'approve')}
                    />
                    <ActionButton
                      label="Reject"
                      variant="danger"
                      disabled={busy !== null}
                      loading={busy === l.id + 'reject'}
                      onClick={() => action(l.id, 'reject')}
                    />
                  </>
                )}
                {(l.status === 'active' || l.status === 'expired') && (
                  <ActionButton
                    label="Extend 30d"
                    variant="secondary"
                    disabled={busy !== null}
                    loading={busy === l.id + 'extend'}
                    onClick={() => action(l.id, 'extend')}
                  />
                )}
              </div>
            </div>

            {/* Description excerpt */}
            <p style={{
              fontSize: '0.83rem', color: 'var(--text-secondary)',
              marginTop: '0.75rem', borderTop: '1px solid var(--parchment)', paddingTop: '0.6rem',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {l.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ActionButton({ label, variant, disabled, loading, onClick }: {
  label:    string;
  variant:  'success' | 'danger' | 'secondary';
  disabled: boolean;
  loading:  boolean;
  onClick:  () => void;
}) {
  const colours = {
    success:   { bg: 'var(--jade)',      border: 'var(--jade)',      color: 'white' },
    danger:    { bg: 'var(--vermilion)', border: 'var(--vermilion)', color: 'white' },
    secondary: { bg: 'var(--warm-white)',border: 'var(--parchment)', color: 'var(--text-secondary)' },
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
        border: `1px solid ${colours.border}`,
        background: colours.bg, color: colours.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.65 : 1,
        minWidth: '80px',
      }}
    >
      {loading ? '…' : label}
    </button>
  );
}
