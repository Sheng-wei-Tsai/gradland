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
  'home-affairs':        { color: 'var(--jade)',      bg: 'rgba(30,122,82,0.10)',  border: 'rgba(30,122,82,0.25)' },
  'abf':                 { color: 'var(--jade)',      bg: 'rgba(30,122,82,0.08)',  border: 'rgba(30,122,82,0.20)' },
  'acs':                 { color: 'var(--jade)',      bg: 'rgba(30,122,82,0.10)',  border: 'rgba(30,122,82,0.25)' },
  'study-international': { color: 'var(--gold)',      bg: 'rgba(200,138,20,0.10)', border: 'rgba(200,138,20,0.25)' },
  'migration-alliance':  { color: 'var(--vermilion)', bg: 'rgba(192,40,28,0.10)',  border: 'rgba(192,40,28,0.25)' },
  'universities-au':     { color: 'var(--gold)',      bg: 'rgba(200,138,20,0.10)', border: 'rgba(200,138,20,0.25)' },
};

const VISA_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  '482':     { bg: 'rgba(200,138,20,0.12)', color: 'var(--gold)' },
  '189':     { bg: 'rgba(30,122,82,0.12)',  color: 'var(--jade)' },
  '190':     { bg: 'rgba(30,122,82,0.10)',  color: 'var(--jade)' },
  '485':     { bg: 'rgba(61,28,14,0.08)',   color: 'var(--text-secondary)' },
  '491':     { bg: 'rgba(200,138,20,0.10)', color: 'var(--gold)' },
  '500':     { bg: 'rgba(61,28,14,0.06)',   color: 'var(--text-muted)' },
  'PR':      { bg: 'rgba(30,122,82,0.14)',  color: 'var(--jade)' },
  '186':     { bg: 'rgba(200,138,20,0.12)', color: 'var(--gold)' },
  '187':     { bg: 'rgba(200,138,20,0.10)', color: 'var(--gold)' },
  'skilled': { bg: 'rgba(61,28,14,0.08)',   color: 'var(--text-secondary)' },
  'general': { bg: 'rgba(61,28,14,0.06)',   color: 'var(--text-muted)' },
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
        background: 'rgba(30,122,82,0.06)', border: '1px solid rgba(30,122,82,0.25)',
        borderRadius: '8px', padding: '0.7rem 1rem',
        fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5,
        marginBottom: '1.5rem',
      }}>
        <strong>General information only.</strong> For your specific situation, always consult a{' '}
        <a href="https://www.mara.gov.au/consumer-information/find-a-registered-migration-agent/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--jade)', fontWeight: 600 }}>
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
              <article className="visa-news-article-card" style={{
                background: 'var(--warm-white)', border: '1px solid var(--parchment)',
                borderRadius: '10px', padding: '1rem 1.2rem',
                borderLeft: `3px solid ${src.border}`,
              }}>
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
