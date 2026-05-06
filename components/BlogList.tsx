'use client';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import PostCard from '@/components/PostCard';
import { Post } from '@/lib/posts';

const PAGE_SIZE = 8;

export default function BlogList({ posts, tags }: { posts: Post[]; tags: string[] }) {
  const [query,        setQuery]        = useState('');
  const [activeTag,    setActiveTag]    = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading,      setLoading]      = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let result = posts;
    if (activeTag) result = result.filter(p => p.tags.includes(activeTag));
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [posts, activeTag, query]);

  // Reset pagination when filter/search changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeTag, query]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;

  const loadMore = useCallback(() => {
    setLoading(true);
    // Small delay so the spinner is visible before the DOM update
    setTimeout(() => {
      setVisibleCount(c => c + PAGE_SIZE);
      setLoading(false);
    }, 320);
  }, []);

  // IntersectionObserver — auto-load when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && !loading) loadMore(); },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <>
      {/* Search + filter bar */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          {/* Comic-style search: bold lens + crosshair detail + thick handle */}
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
            style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
          >
            <circle cx="10.5" cy="10.5" r="7" strokeWidth="2.5"/>
            <line x1="10.5" y1="6.5" x2="10.5" y2="14.5" strokeWidth="1.2" opacity="0.5"/>
            <line x1="6.5" y1="10.5" x2="14.5" y2="10.5" strokeWidth="1.2" opacity="0.5"/>
            <circle cx="10.5" cy="10.5" r="1.3" fill="currentColor" strokeWidth="0"/>
            <path d="M16 16L21 21" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search posts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.5rem', paddingRight: '2.5rem',
              paddingTop: '0.65rem', paddingBottom: '0.65rem',
              background: 'var(--warm-white)', border: 'var(--panel-border)',
              borderRadius: '6px', boxShadow: '3px 3px 0 var(--ink)',
              fontSize: '0.9rem', color: 'var(--text-primary)',
              outline: 'none', fontFamily: 'inherit', transition: 'box-shadow 0.15s ease',
            }}
            onFocus={e => { e.target.style.boxShadow = '3px 3px 0 var(--vermilion)'; e.target.style.borderColor = 'var(--vermilion)'; }}
            onBlur={e =>  { e.target.style.boxShadow = '3px 3px 0 var(--ink)';      e.target.style.borderColor = ''; }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', padding: '0.1rem', lineHeight: 1, fontFamily: 'inherit' }}>×</button>
          )}
        </div>

        {/* Tag filters */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            <button onClick={() => setActiveTag(null)} style={tagBtn(activeTag === null)}>All</button>
            {tags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} style={tagBtn(activeTag === tag)}>{tag}</button>
            ))}
          </div>
        )}
      </div>

      {/* Post count */}
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        {(query || activeTag)
          ? `${filtered.length} of ${posts.length} posts`
          : `${posts.length} posts`
        }
      </p>

      {/* Post list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--warm-white)', border: 'var(--panel-border)', boxShadow: 'var(--panel-shadow)', borderRadius: '8px' }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem', color: 'var(--text-muted)' }}>
              No posts match &ldquo;{query || activeTag}&rdquo;
            </p>
            <button onClick={() => { setQuery(''); setActiveTag(null); }} style={{ marginTop: '0.8rem', background: 'none', border: 'none', color: 'var(--vermilion)', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit', fontWeight: 600 }}>
              Clear filters →
            </button>
          </div>
        ) : (
          visible.map((post, i) => (
            <PostCard
              key={`${post.source}-${post.slug}`}
              post={post}
              index={i}
              basePath={post.source === 'digest' ? '/digest' : post.source === 'githot' ? '/githot' : post.source === 'ai-news' ? '/ai-news' : post.source === 'visa-news' ? '/visa-news' : post.source === 'career-edge' ? '/career-edge' : '/blog'}
            />
          ))
        )}
      </div>

      {/* Infinite scroll sentinel + Load More button */}
      {hasMore && (
        <div style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          {/* Invisible sentinel — IntersectionObserver watches this */}
          <div ref={sentinelRef} style={{ height: '1px', width: '100%' }} />

          {loading ? (
            /* Spinner dots */
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 1, 2].map(d => (
                <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--terracotta)', animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite` }} />
              ))}
            </div>
          ) : (
            <button onClick={loadMore} className="blog-load-more-btn" style={{
              padding: '0.6rem 1.6rem', borderRadius: '99px',
              background: 'var(--warm-white)',
              borderWidth: '2px', borderStyle: 'solid',
              boxShadow: '2px 2px 0 rgba(20,10,5,0.12)',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}>
              Load {Math.min(PAGE_SIZE, remaining)} more
              <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({remaining} remaining)
              </span>
            </button>
          )}
        </div>
      )}

      {/* End of list */}
      {!hasMore && filtered.length > 0 && (
        <div style={{ textAlign: 'center', padding: '2.5rem 0 4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem', marginBottom: '0.25rem' }}>You&apos;ve read it all ☕</div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'var(--terracotta)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', fontWeight: 600 }}>
            Back to top ↑
          </button>
        </div>
      )}
    </>
  );
}

function tagBtn(active: boolean): React.CSSProperties {
  return {
    fontSize: '0.76rem', fontWeight: 700,
    padding: '0.22em 0.85em', borderRadius: '4px',
    border: '2px solid var(--ink)',
    boxShadow: active ? '2px 2px 0 var(--ink)' : 'none',
    background: active ? 'var(--vermilion)' : 'var(--warm-white)',
    color: active ? 'white' : 'var(--brown-mid)',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.12s cubic-bezier(0.34,1.56,0.64,1)',
    transform: active ? 'translate(-1px,-1px)' : 'none',
  };
}

