import type { Metadata } from 'next';
import Link from 'next/link';
import ClaudeLabShell from './ClaudeLabShell';

export const metadata: Metadata = {
  title: 'Claude Lab — Interactive AI Terminal | Gradland',
  description:
    'Learn Claude, Claude Code, and AI workflows through 15 interactive missions in a browser-based terminal. No setup required.',
};

export default function ClaudeLabPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07050f',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Terminal chrome bar ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 1rem',
          background: '#0f0b1a',
          borderBottom: '1px solid #1a1430',
          flexShrink: 0,
        }}
      >
        {/* Traffic-light dots + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--vermilion)', display: 'inline-block' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--jade)', display: 'inline-block' }} />
          <span
            style={{
              marginLeft: '0.6rem',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontFamily: '"Courier New", monospace',
            }}
          >
            claude-lab — ~/missions
          </span>
        </div>
        <Link
          href="/learn"
          style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: '"Courier New", monospace', textDecoration: 'none' }}
        >
          ← learn
        </Link>
      </div>

      {/* ── Terminal body — loaded client-side only ─────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0.25rem' }}>
        <ClaudeLabShell />
      </div>
    </div>
  );
}
