'use client';
import { useState, useMemo } from 'react';
import PostCard from '@/components/PostCard';
import { Post } from '@/lib/posts';

export default function BlogList({ posts, tags }: { posts: Post[]; tags: string[] }) {
  const [query,      setQuery]      = useState('');
  const [activeTag,  setActiveTag]  = useState<string | null>(null);

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

  return (
    <>
      {/* Search + tag bar */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{
              position: 'absolute', left: '0.9rem', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search posts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.4rem', paddingRight: '1rem',
              paddingTop: '0.6rem', paddingBottom: '0.6rem',
              background: 'var(--warm-white)',
              border: '1px solid var(--parchment)',
              borderRadius: '9px',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.15s',
              fontFamily: 'inherit',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
            onBlur={e => (e.target.style.borderColor = 'var(--parchment)')}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '1rem', padding: '0.1rem',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Tag pills */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            <button
              onClick={() => setActiveTag(null)}
              style={{
                fontSize: '0.78rem', fontWeight: 500,
                padding: '0.2em 0.8em', borderRadius: '99px',
                border: '1px solid var(--parchment)',
                background: activeTag === null ? 'var(--terracotta)' : 'var(--parchment)',
                color: activeTag === null ? 'white' : 'var(--brown-mid)',
                cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                fontFamily: 'inherit',
              }}
            >
              All
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                style={{
                  fontSize: '0.78rem', fontWeight: 500,
                  padding: '0.2em 0.8em', borderRadius: '99px',
                  border: '1px solid var(--parchment)',
                  background: activeTag === tag ? 'var(--terracotta)' : 'var(--parchment)',
                  color: activeTag === tag ? 'white' : 'var(--brown-mid)',
                  cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '4rem' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 2rem',
            background: 'var(--warm-white)', borderRadius: '14px',
            border: '1px dashed var(--parchment)',
          }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.3rem', color: 'var(--brown-light)' }}>
              No posts match "{query || activeTag}"
            </p>
            <button
              onClick={() => { setQuery(''); setActiveTag(null); }}
              style={{
                marginTop: '0.8rem', background: 'none',
                border: 'none', color: 'var(--terracotta)',
                cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit',
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((post, i) => <PostCard key={post.slug} post={post} index={i} />)
        )}

        {/* Result count when filtering */}
        {(query || activeTag) && filtered.length > 0 && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '0.5rem' }}>
            {filtered.length} of {posts.length} posts
          </p>
        )}
      </div>
    </>
  );
}
