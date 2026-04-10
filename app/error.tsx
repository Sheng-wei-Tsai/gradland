'use client';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: replace with Sentry.captureException(error) once @sentry/nextjs is installed
    console.error('[GlobalError]', error.digest ?? error.message, error);

    // Best-effort server-side error report (fire-and-forget)
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        digest:  error.digest,
        url:     typeof window !== 'undefined' ? window.location.href : '',
      }),
    }).catch(() => { /* never throw from error boundary */ });
  }, [error]);

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      padding: '6rem 1.5rem 4rem', textAlign: 'center',
    }}>
      <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
      <h2 style={{
        fontFamily: "'Lora', serif", fontSize: '1.75rem', fontWeight: 700,
        color: 'var(--brown-dark)', marginBottom: '0.75rem',
      }}>
        Something went wrong
      </h2>
      <p style={{
        fontSize: '0.9rem', color: 'var(--text-secondary)',
        lineHeight: 1.7, marginBottom: '2rem',
      }}>
        An unexpected error occurred. Our team has been notified.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={reset}
          style={{
            background: 'var(--terracotta)', color: 'white', border: 'none',
            padding: '0.65rem 1.5rem', borderRadius: '10px',
            fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Try again
        </button>
        <a href="/" style={{
          border: '1px solid var(--parchment)', color: 'var(--brown-dark)',
          textDecoration: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px',
          fontSize: '0.92rem', fontWeight: 500,
        }}>
          Go home
        </a>
      </div>
    </div>
  );
}
