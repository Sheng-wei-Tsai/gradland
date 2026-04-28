'use client';

import { useState } from 'react';
import Link from 'next/link';
import MermaidDiagram from '@/components/MermaidDiagram';
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

interface Props {
  diagrams: StarterDiagram[];
}

export default function DiagramPageClient({ diagrams }: Props) {
  const [topic, setTopic]   = useState('');
  const [type, setType]     = useState<string>('flowchart');
  const [mermaid, setMermaid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 3) return;

    setLoading(true);
    setError(null);
    setAuthError(null);
    setMermaid(null);
    setCopied(false);

    try {
      const res = await fetch('/api/diagrams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), type }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setAuthError('Sign in to generate diagrams.');
      } else if (res.status === 402 || res.status === 403) {
        setAuthError('Upgrade to Pro to generate your own diagrams.');
      } else if (res.status === 429) {
        setError('Daily limit reached. Try again tomorrow.');
      } else if (!res.ok) {
        setError(data.error || 'Could not generate this diagram. Try a different topic or type.');
      } else if (data.mermaid) {
        setMermaid(String(data.mermaid));
      } else {
        setError('Empty response. Try again.');
      }
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* ── Generator section ───────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--warm-white)',
          border: 'var(--panel-border)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '3rem',
          boxShadow: 'var(--panel-shadow)',
        }}
      >
        <h2
          style={{
            fontFamily: "'Lora', serif",
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            marginBottom: '0.4rem',
          }}
        >
          Generate a diagram
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0, marginBottom: '1.2rem' }}>
          Type any technical concept. Pick a diagram type. We&apos;ll render it with Mermaid.
        </p>

        <form onSubmit={handleGenerate}>
          <label
            htmlFor="diagram-topic"
            style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}
          >
            Topic
          </label>
          <input
            id="diagram-topic"
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. How OAuth 2.0 works"
            maxLength={200}
            style={{
              width: '100%',
              padding: '0.7rem 0.9rem',
              fontSize: '0.95rem',
              border: '1px solid var(--parchment)',
              borderRadius: '8px',
              background: 'var(--cream)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              marginBottom: '0.4rem',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {EXAMPLE_TOPICS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                style={{
                  padding: '0.25rem 0.7rem',
                  fontSize: '0.78rem',
                  border: '1px solid var(--parchment)',
                  borderRadius: '99px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <label
            htmlFor="diagram-type"
            style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}
          >
            Type
          </label>
          <div
            role="radiogroup"
            aria-label="Diagram type"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem', marginBottom: '1.2rem' }}
          >
            {DIAGRAM_TYPES.map(t => {
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setType(t.value)}
                  style={{
                    padding: '0.6rem 0.8rem',
                    border: active ? '2px solid var(--vermilion)' : '1px solid var(--parchment)',
                    borderRadius: '10px',
                    background: active ? 'var(--cream)' : 'transparent',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.label}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t.hint}</div>
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading || topic.trim().length < 3}
            style={{
              padding: '0.75rem 1.4rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              border: 'var(--panel-border)',
              borderRadius: '10px',
              background: loading ? 'var(--parchment)' : 'var(--vermilion)',
              color: loading ? 'var(--text-muted)' : 'white',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: loading ? 'none' : 'var(--panel-shadow)',
            }}
          >
            {loading ? 'Generating…' : 'Generate diagram'}
          </button>
        </form>

        {authError && (
          <div
            role="alert"
            style={{
              marginTop: '1.2rem',
              padding: '0.9rem 1.1rem',
              border: '1px solid var(--parchment)',
              borderRadius: '10px',
              background: 'var(--cream)',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            {authError}{' '}
            <Link href="/login" style={{ color: 'var(--vermilion)', fontWeight: 700 }}>
              Sign in →
            </Link>
            {authError.toLowerCase().includes('upgrade') && (
              <>
                {' '}
                or{' '}
                <Link href="/pricing" style={{ color: 'var(--vermilion)', fontWeight: 700 }}>
                  see plans →
                </Link>
              </>
            )}
          </div>
        )}

        {error && !authError && (
          <div
            role="alert"
            style={{
              marginTop: '1.2rem',
              padding: '0.9rem 1.1rem',
              border: '1px solid var(--parchment)',
              borderRadius: '10px',
              background: 'var(--cream)',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            {error}
          </div>
        )}

        {mermaid && (
          <div style={{ marginTop: '1.5rem' }}>
            <MermaidDiagram chart={mermaid} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '-0.5rem' }}>
              <button
                type="button"
                onClick={() => copyToClipboard(mermaid)}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  border: '1px solid var(--parchment)',
                  borderRadius: '8px',
                  background: 'var(--warm-white)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {copied ? '✓ Copied' : 'Copy Mermaid source'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      <section>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2
            style={{
              fontFamily: "'Lora', serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: '0.3rem',
            }}
          >
            Concepts, drawn well
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
            Four hand-crafted starter diagrams covering IT, AI, software development, and fullstack architecture.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {diagrams.map(d => (
            <article
              key={d.id}
              id={d.id}
              style={{
                background: 'var(--warm-white)',
                border: 'var(--panel-border)',
                borderRadius: '14px',
                padding: '1.6rem',
                boxShadow: 'var(--panel-shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '99px',
                    background: 'var(--cream)',
                    color: 'var(--vermilion)',
                    border: '1px solid var(--parchment)',
                  }}
                >
                  {d.category}
                </span>
                <span aria-hidden style={{ fontSize: '1.1rem' }}>{d.emoji}</span>
              </div>

              <h3
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginBottom: '0.4rem',
                }}
              >
                {d.title}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
                {d.description}
              </p>

              <MermaidDiagram chart={d.mermaid} />

              <div>
                <h4
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    margin: 0,
                    marginBottom: '0.6rem',
                  }}
                >
                  Why it matters
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {d.takeaways.map((t, i) => (
                    <li key={i} style={{ marginBottom: '0.3rem' }}>{t}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => copyToClipboard(d.mermaid)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    border: '1px solid var(--parchment)',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Copy Mermaid source
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
