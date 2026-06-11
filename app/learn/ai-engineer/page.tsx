import type { Metadata } from 'next';
import Link from 'next/link';
import AIEngineerShell from './AIEngineerShell';

export const metadata: Metadata = {
  title: 'AI Engineer Lab — The AI Engineering Workflow | Gradland',
  description:
    'Learn the modern AI engineering workflow — Plan/Execute/Clear, PRDs, decomposition, feedback loops, and AFK agents — through 15 interactive terminal missions. Free, no setup required.',
};

export default function AIEngineerPage() {
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
            ai-engineer-lab — ~/workflow
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
        <AIEngineerShell />
      </div>

      {/* ── Methodology credit ──────────────────────────────────── */}
      <div
        style={{
          padding: '0.4rem 1rem 0.55rem',
          background: '#0f0b1a',
          borderTop: '1px solid #1a1430',
          flexShrink: 0,
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          fontFamily: '"Courier New", monospace',
        }}
      >
        Original Gradland content. Methodology concepts inspired by the{' '}
        <a
          href="https://www.aihero.dev/cohorts/ai-coding-for-real-engineers-m0k0w"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--gold)' }}
        >
          AI Coding for Real Engineers
        </a>{' '}
        methodology by Matt Pocock.
      </div>
    </div>
  );
}
