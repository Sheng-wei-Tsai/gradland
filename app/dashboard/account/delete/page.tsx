'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const router  = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value,   setValue]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const confirmed = value === 'DELETE';

  async function handleDelete() {
    if (!confirmed) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      if (!res.ok) throw new Error('Deletion failed. Please try again or contact support.');
      router.push('/?deleted=1');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      padding: '4rem 1.5rem', color: 'var(--text-primary)',
    }}>
      <h1 style={{
        fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 700,
        color: 'var(--brown-dark)', marginBottom: '0.5rem',
      }}>
        Delete account
      </h1>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
        This will permanently delete your account within 30 days as required by the
        AU Privacy Act. The following will happen immediately:
      </p>

      <ul style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 2, marginBottom: '2rem', paddingLeft: '1.25rem' }}>
        <li>Your active Pro subscription will be cancelled</li>
        <li>Your comments will be deleted</li>
        <li>Your profile and saved data will be soft-deleted</li>
        <li>You will be signed out of all sessions</li>
      </ul>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Type <strong>DELETE</strong> to confirm:
      </p>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="DELETE"
        autoComplete="off"
        style={{
          width: '100%', padding: '0.6rem 0.75rem',
          border: '2px solid var(--parchment)', borderRadius: '8px',
          fontSize: '0.95rem', fontFamily: 'inherit',
          background: 'var(--warm-white)', color: 'var(--text-primary)',
          marginBottom: '1.25rem', boxSizing: 'border-box',
          outline: confirmed ? '2px solid var(--vermilion)' : undefined,
        }}
      />

      {error && (
        <p style={{ fontSize: '0.85rem', color: 'var(--vermilion)', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleDelete}
          disabled={!confirmed || loading}
          style={{
            background: confirmed ? 'var(--vermilion)' : 'var(--parchment)',
            color: confirmed ? 'white' : 'var(--text-muted)',
            border: 'none', borderRadius: '10px',
            padding: '0.65rem 1.5rem', fontSize: '0.92rem',
            fontWeight: 600, cursor: confirmed && !loading ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Deleting…' : 'Delete my account'}
        </button>

        <Link href="/dashboard/profile" style={{
          border: '1px solid var(--parchment)', color: 'var(--brown-dark)',
          textDecoration: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px',
          fontSize: '0.92rem', fontWeight: 500,
        }}>
          Cancel
        </Link>
      </div>
    </div>
  );
}
