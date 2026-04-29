'use client';

import { useState } from 'react';
import Link from 'next/link';
import MermaidDiagram from '@/components/MermaidDiagram';
import type { Diagram, DiagramTopic, DiagramDifficulty } from '@/lib/diagrams';
import type { StarterDiagram } from '@/data/starter-diagrams';

const DIAGRAM_TYPES = [
  { value: 'flowchart',    label: 'Flowchart',    hint: 'Steps, decisions, processes' },
  { value: 'sequence',     label: 'Sequence',     hint: 'Messages between parties over time' },
  { value: 'architecture', label: 'Architecture', hint: 'Components and how they connect' },
  { value: 'pyramid',      label: 'Pyramid',      hint: 'Layers, hierarchies, priorities' },
] as const;

const EXAMPLE_TOPICS = [
  'How OAuth 2.0 works',
  'How Kubernetes pods are scheduled',
  'How a database transaction commits',
  'How a CDN serves a request',
  'How RAG retrieves context for an LLM',
];

const TOPICS: DiagramTopic[] = [
  'Networking', 'Databases', 'System Design', 'DevOps',
  'Security', 'APIs', 'Distributed Systems', 'Frontend', 'Backend', 'AI/ML',
];

const DIFFICULTY_COLORS: Record<DiagramDifficulty, string> = {
  beginner:     'var(--jade)',
  intermediate: 'var(--gold)',
  advanced:     'var(--vermilion)',
};

interface Props {
  dailyDiagrams:   Diagram[];
  starterDiagrams: StarterDiagram[];
}

export default function DiagramsPageClient({ dailyDiagrams, starterDiagrams }: Props) {
  const [tab, setTab] = useState<'browse' | 'generate'>('browse');

  // browse state
  const [filterTopic,      setFilterTopic]      = useState<DiagramTopic | 'All'>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<DiagramDifficulty | 'All'>('All');
  const [copiedSlug,       setCopiedSlug]       = useState<string | null>(null);

  // generate state
  const [topic,    setTopic]    = useState('');
  const [type,     setType]     = useState<string>('flowchart');
  const [mermaid,  setMermaid]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);

  // Combine daily + starters, daily first
  const allDiagrams: Array<{ id: string; title: string; date: string; topic: string; difficulty: string; mermaid: string; excerpt: string }> = [
    ...dailyDiagrams.map(d => ({ ...d, id: d.slug, excerpt: d.excerpt })),
    ...starterDiagrams.map(d => ({ id: d.id, title: d.title, date: '', topic: d.category, difficulty: 'beginner', mermaid: d.mermaid, excerpt: d.description })),
  ];

  const filtered = allDiagrams.filter(d => {
    if (filterTopic !== 'All' && d.topic !== filterTopic) return false;
    if (filterDifficulty !== 'All' && d.difficulty !== filterDifficulty) return false;
    return true;
  });

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSlug(id);
      setTimeout(() => setCopiedSlug(null), 1500);
    } catch { /* ignore */ }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 3) return;
    setLoading(true); setError(null); setAuthError(null); setMermaid(null); setCopied(false);
    try {
      const res  = await fetch('/api/diagrams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), type }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401)            setAuthError('Sign in to generate diagrams.');
      else if (res.status === 402 || res.status === 403) setAuthError('Upgrade to Pro to generate your own diagrams.');
      else if (res.status === 429)       setError('Daily limit reached. Try again tomorrow.');
      else if (!res.ok)                  setError(data.error || 'Could not generate. Try a different topic or type.');
      else if (data.mermaid)             setMermaid(String(data.mermaid));
      else                               setError('Empty response. Try again.');
    } catch { setError('Network error. Check your connection.'); }
    finally { setLoading(false); }
  }

  async function copyGenerated(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* ignore */ }
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ paddingTop: '3.5rem', paddingBottom: '2rem' }}>
        <Link href="/learn" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Learn
        </Link>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 700, color: 'var(--brown-dark)', marginTop: '0.8rem', marginBottom: '0.4rem' }}>
          Visual System Design
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.55, maxWidth: '52ch' }}>
          Software engineering concepts explained with Mermaid diagrams — updated daily. Inspired by ByteByteGo.
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--parchment)', paddingBottom: '0' }}>
        {(['browse', 'generate'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.55rem 1.2rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${tab === t ? 'var(--vermilion)' : 'transparent'}`,
              color: tab === t ? 'var(--vermilion)' : 'var(--text-muted)',
              cursor: 'pointer',
              marginBottom: '-2px',
              textTransform: 'capitalize',
            }}
          >
            {t === 'browse' ? `Browse (${allDiagrams.length})` : 'Generate'}
          </button>
        ))}
      </div>

      {/* ── Browse tab ───────────────────────────────────────────── */}
      {tab === 'browse' && (
        <div style={{ paddingBottom: '5rem' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <FilterChip label="All topics" active={filterTopic === 'All'} onClick={() => setFilterTopic('All')} />
            {TOPICS.map(t => (
              <FilterChip key={t} label={t} active={filterTopic === t} onClick={() => setFilterTopic(t)} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {(['All', 'beginner', 'intermediate', 'advanced'] as const).map(d => (
              <FilterChip key={d} label={d === 'All' ? 'All levels' : d} active={filterDifficulty === d} onClick={() => setFilterDifficulty(d)} accent={d !== 'All' ? DIFFICULTY_COLORS[d as DiagramDifficulty] : undefined} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No diagrams match that filter yet.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {filtered.map(d => (
              <article
                key={d.id}
                style={{ background: 'var(--warm-white)', border: 'var(--panel-border)', borderRadius: '14px', padding: '1.6rem', boxShadow: 'var(--panel-shadow)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.2rem 0.6rem', borderRadius: '99px', background: 'var(--cream)', color: 'var(--vermilion)', border: '1px solid var(--parchment)' }}>
                    {d.topic}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0.2rem 0.6rem', borderRadius: '99px', background: 'var(--cream)', border: '1px solid var(--parchment)', color: DIFFICULTY_COLORS[d.difficulty as DiagramDifficulty] ?? 'var(--text-muted)' }}>
                    {d.difficulty}
                  </span>
                  {d.date && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{d.date}</span>
                  )}
                </div>

                <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
                  {d.title}
                </h2>
                {d.excerpt && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.55 }}>
                    {d.excerpt}
                  </p>
                )}

                <MermaidDiagram chart={d.mermaid} />

                <button
                  type="button"
                  onClick={() => copyToClipboard(d.mermaid, d.id)}
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit', border: '1px solid var(--parchment)', borderRadius: '8px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '-0.5rem' }}
                >
                  {copiedSlug === d.id ? '✓ Copied' : 'Copy Mermaid source'}
                </button>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ── Generate tab ─────────────────────────────────────────── */}
      {tab === 'generate' && (
        <div style={{ paddingBottom: '5rem' }}>
          <section style={{ background: 'var(--warm-white)', border: 'var(--panel-border)', borderRadius: '14px', padding: '1.5rem', boxShadow: 'var(--panel-shadow)' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
              Generate a diagram
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 1.2rem' }}>
              Type any technical concept. Pick a diagram type. We&apos;ll render it with Mermaid.
            </p>

            <form onSubmit={handleGenerate}>
              <label htmlFor="diagram-topic" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Topic
              </label>
              <input
                id="diagram-topic"
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. How OAuth 2.0 works"
                maxLength={200}
                style={{ width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.95rem', border: '1px solid var(--parchment)', borderRadius: '8px', background: 'var(--cream)', color: 'var(--text-primary)', fontFamily: 'inherit', marginBottom: '0.4rem' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {EXAMPLE_TOPICS.map(t => (
                  <button key={t} type="button" onClick={() => setTopic(t)} style={{ padding: '0.25rem 0.7rem', fontSize: '0.78rem', border: '1px solid var(--parchment)', borderRadius: '99px', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'inherit', cursor: 'pointer' }}>
                    {t}
                  </button>
                ))}
              </div>

              <label htmlFor="diagram-type" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Type
              </label>
              <div role="radiogroup" aria-label="Diagram type" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', marginBottom: '1.2rem' }}>
                {DIAGRAM_TYPES.map(t => {
                  const active = type === t.value;
                  return (
                    <button key={t.value} type="button" role="radio" aria-checked={active} onClick={() => setType(t.value)}
                      style={{ padding: '0.6rem 0.8rem', border: active ? '2px solid var(--vermilion)' : '1px solid var(--parchment)', borderRadius: '10px', background: active ? 'var(--cream)' : 'transparent', color: 'var(--text-primary)', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.label}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t.hint}</div>
                    </button>
                  );
                })}
              </div>

              <button type="submit" disabled={loading || topic.trim().length < 3}
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'inherit', border: 'var(--panel-border)', borderRadius: '10px', background: loading ? 'var(--parchment)' : 'var(--vermilion)', color: loading ? 'var(--text-muted)' : 'white', cursor: loading ? 'wait' : 'pointer', boxShadow: loading ? 'none' : 'var(--panel-shadow)' }}>
                {loading ? 'Generating…' : 'Generate diagram'}
              </button>
            </form>

            {authError && (
              <div role="alert" style={{ marginTop: '1.2rem', padding: '0.9rem 1.1rem', border: '1px solid var(--parchment)', borderRadius: '10px', background: 'var(--cream)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {authError}{' '}
                <Link href="/login" style={{ color: 'var(--vermilion)', fontWeight: 700 }}>Sign in →</Link>
                {authError.toLowerCase().includes('upgrade') && <>{' '}or <Link href="/pricing" style={{ color: 'var(--vermilion)', fontWeight: 700 }}>see plans →</Link></>}
              </div>
            )}
            {error && !authError && (
              <div role="alert" style={{ marginTop: '1.2rem', padding: '0.9rem 1.1rem', border: '1px solid var(--parchment)', borderRadius: '10px', background: 'var(--cream)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{error}</div>
            )}
            {mermaid && (
              <div style={{ marginTop: '1.5rem' }}>
                <MermaidDiagram chart={mermaid} />
                <button type="button" onClick={() => copyGenerated(mermaid)}
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit', border: '1px solid var(--parchment)', borderRadius: '8px', background: 'var(--warm-white)', color: 'var(--text-primary)', cursor: 'pointer', marginTop: '-0.5rem' }}>
                  {copied ? '✓ Copied' : 'Copy Mermaid source'}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick, accent }: { label: string; active: boolean; onClick: () => void; accent?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.3rem 0.75rem',
        fontSize: '0.78rem',
        fontWeight: active ? 700 : 500,
        fontFamily: 'inherit',
        border: active ? `1.5px solid ${accent ?? 'var(--vermilion)'}` : '1px solid var(--parchment)',
        borderRadius: '99px',
        background: active ? 'var(--cream)' : 'transparent',
        color: active ? (accent ?? 'var(--vermilion)') : 'var(--text-muted)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
