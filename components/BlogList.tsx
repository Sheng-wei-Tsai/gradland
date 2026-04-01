'use client';
import { useState, useMemo } from 'react';
import PostCard from '@/components/PostCard';
import { Post } from '@/lib/posts';

export default function BlogList({ posts, tags }: { posts: Post[]; tags: string[] }) {
  const [query,     setQuery]     = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

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
      {/* Search + filter bar */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
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
              paddingLeft: '2.5rem', paddingRight: '2.5rem',
              paddingTop: '0.65rem', paddingBottom: '0.65rem',
              background:  'var(--warm-white)',
              border:      'var(--panel-border)',
              borderRadius: '6px',
              boxShadow:   '3px 3px 0 var(--ink)',
              fontSize:    '0.9rem',
              color:       'var(--text-primary)',
              outline:     'none',
              fontFamily:  'inherit',
              transition:  'box-shadow 0.15s ease',
            }}
            onFocus={e => {
              e.target.style.boxShadow = '3px 3px 0 var(--vermilion)';
              e.target.style.borderColor = 'var(--vermilion)';
            }}
            onBlur={e => {
              e.target.style.boxShadow = '3px 3px 0 var(--ink)';
              e.target.style.borderColor = '';
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '1.1rem',
                padding: '0.1rem', lineHeight: 1, fontFamily: 'inherit',
              }}
            >×</button>
          )}
        </div>

        {/* Tag filters */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            <button
              onClick={() => setActiveTag(null)}
              style={{
                fontSize: '0.76rem', fontWeight: 700,
                padding: '0.22em 0.85em', borderRadius: '4px',
                border: '2px solid var(--ink)',
                boxShadow: activeTag === null ? '2px 2px 0 var(--ink)' : 'none',
                background: activeTag === null ? 'var(--vermilion)' : 'var(--warm-white)',
                color:      activeTag === null ? 'white' : 'var(--brown-mid)',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.12s cubic-bezier(0.34,1.56,0.64,1)',
                transform:  activeTag === null ? 'translate(-1px,-1px)' : 'none',
              }}
            >All</button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                style={{
                  fontSize: '0.76rem', fontWeight: 700,
                  padding: '0.22em 0.85em', borderRadius: '4px',
                  border: '2px solid var(--ink)',
                  boxShadow: activeTag === tag ? '2px 2px 0 var(--ink)' : 'none',
                  background: activeTag === tag ? 'var(--vermilion)' : 'var(--warm-white)',
                  color:      activeTag === tag ? 'white' : 'var(--brown-mid)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.12s cubic-bezier(0.34,1.56,0.64,1)',
                  transform:  activeTag === tag ? 'translate(-1px,-1px)' : 'none',
                }}
              >{tag}</button>
            ))}
          </div>
        )}
      </div>

      {/* Post list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '4rem' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 2rem',
            background: 'var(--warm-white)',
            border: 'var(--panel-border)',
            boxShadow: 'var(--panel-shadow)',
            borderRadius: '8px',
          }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem', color: 'var(--text-muted)' }}>
              No posts match &ldquo;{query || activeTag}&rdquo;
            </p>
            <button
              onClick={() => { setQuery(''); setActiveTag(null); }}
              style={{
                marginTop: '0.8rem', background: 'none',
                border: 'none', color: 'var(--vermilion)',
                cursor: 'pointer', fontSize: '0.88rem',
                fontFamily: 'inherit', fontWeight: 600,
              }}
            >Clear filters →</button>
          </div>
        ) : (
          filtered.map((post, i) => <PostCard key={post.slug} post={post} index={i} />)
        )}

        {(query || activeTag) && filtered.length > 0 && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '0.5rem' }}>
            {filtered.length} of {posts.length} posts
          </p>
        )}
      </div>
    </>
  );
}
