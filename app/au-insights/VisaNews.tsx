'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Post } from '@/lib/posts';

const SOURCE_LABELS: Record<string, string> = {
  'home-affairs':        'Home Affairs',
  'abf':                 'Border Force',
  'acs':                 'ACS',
  'study-international': 'Study Intl.',
  'migration-alliance':  'Migration Alliance',
  'universities-au':     'Universities AU',
};

const SOURCE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'home-affairs':        { color: '#0369a1', bg: 'rgba(3,105,161,0.1)',   border: 'rgba(3,105,161,0.25)' },
  'abf':                 { color: '#0c4a6e', bg: 'rgba(12,74,110,0.1)',   border: 'rgba(12,74,110,0.25)' },
  'acs':                 { color: '#065f46', bg: 'rgba(6,95,70,0.1)',     border: 'rgba(6,95,70,0.25)' },
  'study-international': { color: '#4338ca', bg: 'rgba(67,56,202,0.1)',   border: 'rgba(67,56,202,0.25)' },
  'migration-alliance':  { color: '#9333ea', bg: 'rgba(147,51,234,0.1)',  border: 'rgba(147,51,234,0.25)' },
  'universities-au':     { color: '#b45309', bg: 'rgba(180,83,9,0.1)',    border: 'rgba(180,83,9,0.25)' },
};

const VISA_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  '482':     { bg: '#fef3c7', color: '#92400e' },
  '189':     { bg: '#d1fae5', color: '#065f46' },
  '190':     { bg: '#dbeafe', color: '#1e40af' },
  '485':     { bg: '#ede9fe', color: '#4c1d95' },
  '491':     { bg: '#fce7f3', color: '#9d174d' },
  '500':     { bg: '#e0f2fe', color: '#0c4a6e' },
  'PR':      { bg: '#f0fdf4', color: '#14532d' },
  '186':     { bg: '#fff7ed', color: '#7c2d12' },
  '187':     { bg: '#fdf2f8', color: '#701a75' },
  'skilled': { bg: '#f1f5f9', color: '#334155' },
  'general': { bg: '#f8fafc', color: '#475569' },
};

export default function VisaNews() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/visa-news')
      .then(r => r.json())
      .then((data: Post[]) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ paddingTop: '1rem' }}>
        {[80, 60, 90].map((w, i) => (
          <div key={i} style={{
            height: i === 0 ? '4rem' : '3.5rem',
            width: `${w}%`, borderRadius: '10px', marginBottom: '0.75rem',
            background: 'var(--parchment)', animation: 'pulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.08}s`,
          }} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{
        padding: '3rem 1.5rem', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.9rem',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📰</div>
        <p>No visa news yet — the daily pipeline will populate this section automatically.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Check back tomorrow or run <code>npx tsx scripts/fetch-visa-news.ts</code> locally.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Disclaimer */}
      <div style={{
        background: 'rgba(239,246,255,0.6)', border: '1px solid #93c5fd',
        borderRadius: '8px', padding: '0.7rem 1rem',
        fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.5,
        marginBottom: '1.5rem',
      }}>
        <strong>General information only.</strong> For your specific situation, always consult a{' '}
        <a href="https://www.mara.gov.au/consumer-information/find-a-registered-migration-agent/" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', fontWeight: 600 }}>
          MARA-registered migration agent
        </a>.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {posts.map(post => {
          const src = SOURCE_COLORS[post.visaSource ?? ''] ?? SOURCE_COLORS['home-affairs'];
          const srcLabel = SOURCE_LABELS[post.visaSource ?? ''] ?? 'Official Source';
          const visaTypes = post.visaTypes ?? [];

          return (
            <Link
              key={post.slug}
              href={`/visa-news/${post.slug}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <article style={{
                background: 'var(--warm-white)', border: '1px solid var(--parchment)',
                borderRadius: '10px', padding: '1rem 1.2rem',
                borderLeft: `3px solid ${src.border}`,
                transition: 'box-shadow 0.18s ease',
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
              >
                {/* Source + date row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: src.color, background: src.bg, border: `1px solid ${src.border}`,
                    padding: '0.15em 0.6em', borderRadius: '4px',
                  }}>
                    {srcLabel}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {format(new Date(post.date), 'd MMM yyyy')}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: "'Lora', serif", fontSize: '0.98rem', fontWeight: 700,
                  color: 'var(--brown-dark)', lineHeight: 1.35, marginBottom: '0.4rem',
                }}>
                  {post.coverEmoji && <span style={{ marginRight: '0.4rem' }}>{post.coverEmoji}</span>}
                  {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <p style={{
                    fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                    marginBottom: visaTypes.length > 0 ? '0.6rem' : 0,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {post.excerpt}
                  </p>
                )}

                {/* Visa type chips */}
                {visaTypes.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                    {visaTypes.slice(0, 5).map(vt => {
                      const chip = VISA_CHIP_COLORS[vt] ?? VISA_CHIP_COLORS.general;
                      return (
                        <span key={vt} style={{
                          fontSize: '0.68rem', fontWeight: 700,
                          background: chip.bg, color: chip.color,
                          padding: '0.15em 0.5em', borderRadius: '3px',
                        }}>
                          {vt === 'PR' ? 'PR' : `${vt}`}
                        </span>
                      );
                    })}
                  </div>
                )}
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
