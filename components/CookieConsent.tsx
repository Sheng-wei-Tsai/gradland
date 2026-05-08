'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_NAME = 'cookies-consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 12 months

type Choice = 'accepted' | 'essential';

function readConsent(): Choice | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)cookies-consent=([^;]+)/);
  if (!match) return null;
  const v = decodeURIComponent(match[1]);
  return v === 'accepted' || v === 'essential' ? v : null;
}

function writeConsent(choice: Choice) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${choice}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent('cookies-consent-changed', { detail: choice }));
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show banner only on first visit (no cookie yet)
    setOpen(readConsent() === null);

    // Re-open via global hook (e.g. footer "Cookie preferences" link)
    const reopen = () => setOpen(true);
    window.addEventListener('cookies-consent-reopen', reopen);
    return () => window.removeEventListener('cookies-consent-reopen', reopen);
  }, []);

  if (!open) return null;

  const choose = (choice: Choice) => {
    writeConsent(choice);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        right: '1rem',
        maxWidth: '420px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 1000,
        background: 'var(--warm-white)',
        border: 'var(--panel-border)',
        boxShadow: 'var(--panel-shadow)',
        borderRadius: '12px',
        padding: '1.1rem 1.25rem',
        color: 'var(--text-primary)',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <p
        style={{
          fontFamily: "'Lora', serif",
          fontWeight: 700,
          fontSize: '0.95rem',
          marginTop: 0,
          marginBottom: '0.5rem',
          color: 'var(--brown-dark)',
        }}
      >
        Cookies on Gradland
      </p>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
        Essential cookies keep you signed in. Analytics cookies help us count page views — they&apos;re
        anonymous and off until you say otherwise. See our{' '}
        <Link href="/cookies" style={{ color: 'var(--vermilion)', textDecoration: 'underline' }}>
          Cookies Policy
        </Link>
        .
      </p>
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          marginTop: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => choose('essential')}
          style={{
            flex: '1 1 140px',
            padding: '0.55rem 0.9rem',
            background: 'transparent',
            border: '2px solid var(--ink)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => choose('accepted')}
          style={{
            flex: '1 1 140px',
            padding: '0.55rem 0.9rem',
            background: 'var(--vermilion)',
            border: '2px solid var(--ink)',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: 'var(--panel-shadow)',
          }}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
