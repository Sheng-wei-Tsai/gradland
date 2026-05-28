'use client';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import PostCard from '@/components/PostCard';
import { Post } from '@/lib/posts';

const PAGE_SIZE = 8;

// ── Topic clusters ───────────────────────────────────────────────────────────
// Six curated topic chips replace the wall of 40+ flat tags. Each cluster
// owns its member tags; selecting a cluster filters posts that carry ANY
// tag in the cluster. Tags not in a cluster surface inside "All tags".
//
// The brush-stroke icon mark on each chip is purely visual — kept as inline
// SVG so it inherits currentColor and theme automatically.
type TopicId = 'ai' | 'lang' | 'models' | 'infra' | 'knowledge' | 'craft';

interface Topic {
  id: TopicId;
  label: string;
  /** Stroke shape that appears to the left of the label — sumi-e flourish. */
  mark: string;
  /** Tags whose presence (case-insensitive) means a post belongs here. */
  tags: string[];
}

const TOPICS: Topic[] = [
  {
    id: 'ai', label: 'AI Coding',
    mark: 'M2 12 q4 -8 10 -2 t10 0',
    tags: ['Claude', 'Claude Code', 'Cursor', 'Copilot', 'AI Agents', 'Agents', 'AI Tools', 'AI Tooling', 'Multi-Agent', 'MCP', 'AI'],
  },
  {
    id: 'lang', label: 'Languages',
    mark: 'M2 18 L8 6 L14 18 L20 6',
    tags: ['TypeScript', 'Python', 'Go', 'Next.js', 'Zig', 'Tailwind', 'React'],
  },
  {
    id: 'models', label: 'Models',
    mark: 'M3 12 a9 4 0 1 1 18 0 a9 4 0 1 1 -18 0',
    tags: ['LLM', 'LLMs', 'Local LLM', 'DeepSeek', 'OpenAI', 'Claude API', 'Anthropic'],
  },
  {
    id: 'infra', label: 'Infra & Tools',
    mark: 'M3 19 L21 19 M6 19 L6 9 M12 19 L12 5 M18 19 L18 11',
    tags: ['Self-Hosted', 'Self-Hosting', 'Open Source', 'Vercel', 'Supabase', 'Git', 'VS Code', 'CLI', 'Developer Tools', 'Developer Tooling', 'Browser Automation', 'Tools', 'Desktop', 'Electron Alternative'],
  },
  {
    id: 'knowledge', label: 'Knowledge',
    mark: 'M5 6 q7 -4 14 0 v12 q-7 -4 -14 0 z M12 6 v12',
    tags: ['Knowledge Graph', 'Knowledge Graphs', 'RAG', 'Memory', 'Documentation', 'Education', 'Diagrams'],
  },
  {
    id: 'craft', label: 'Engineering',
    mark: 'M3 12 L9 6 L9 18 L15 6 L15 18 L21 12',
    tags: ['Engineering', 'Architecture', 'Performance', 'Design Systems', 'Developer Productivity', 'Developer Experience', 'Security', 'Supply Chain', 'Observability', 'TTS', 'Design', 'UI'],
  },
];

const lc = (s: string) => s.toLowerCase().trim();

export default function BlogList({ posts, tags }: { posts: Post[]; tags: string[] }) {
  const [query,         setQuery]        = useState('');
  const [activeTopic,   setActiveTopic]  = useState<TopicId | null>(null);
  const [activeTag,     setActiveTag]    = useState<string | null>(null);
  const [allTagsOpen,   setAllTagsOpen]  = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [visibleCount,  setVisibleCount] = useState(PAGE_SIZE);
  const [loading,       setLoading]      = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  // ── Derived: tag → post count (memoised once per posts change) ────────────
  const tagCounts = useMemo(() => {
    const m = new Map<string, number>();
    posts.forEach(p => p.tags.forEach(t => m.set(t, (m.get(t) ?? 0) + 1)));
    return m;
  }, [posts]);

  const topicCounts = useMemo(() => {
    const m = new Map<TopicId, number>();
    for (const topic of TOPICS) {
      const wanted = new Set(topic.tags.map(lc));
      const count = posts.filter(p => p.tags.some(t => wanted.has(lc(t)))).length;
      m.set(topic.id, count);
    }
    return m;
  }, [posts]);

  // Tags not part of any cluster — surfaced in "All tags" disclosure so they
  // remain reachable without polluting the default view.
  const otherTags = useMemo(() => {
    const claimed = new Set(TOPICS.flatMap(t => t.tags.map(lc)));
    return tags
      .filter(t => !claimed.has(lc(t)))
      .sort((a, b) => (tagCounts.get(b) ?? 0) - (tagCounts.get(a) ?? 0));
  }, [tags, tagCounts]);

  // Top 5 matching tags for the search dropdown — shown only while focused
  // with a non-empty query. Lets users jump from typing a keyword to a
  // structured tag filter without scanning the full list.
  const tagSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tags
      .filter(t => t.toLowerCase().includes(q))
      .sort((a, b) => (tagCounts.get(b) ?? 0) - (tagCounts.get(a) ?? 0))
      .slice(0, 5);
  }, [query, tags, tagCounts]);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = posts;

    if (activeTag) {
      result = result.filter(p => p.tags.some(t => lc(t) === lc(activeTag)));
    } else if (activeTopic) {
      const wanted = new Set(TOPICS.find(t => t.id === activeTopic)!.tags.map(lc));
      result = result.filter(p => p.tags.some(t => wanted.has(lc(t))));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [posts, activeTopic, activeTag, query]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeTopic, activeTag, query]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;

  const loadMore = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount(c => c + PAGE_SIZE);
      setLoading(false);
    }, 320);
  }, []);

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

  // Close the search dropdown when clicking outside.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!searchWrapRef.current?.contains(e.target as Node)) setSearchFocused(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Cmd/Ctrl-K focus shortcut — keyboard-first finders are table stakes now.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        (searchWrapRef.current?.querySelector('input') as HTMLInputElement | null)?.focus();
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onPickTopic = (id: TopicId) => {
    setActiveTag(null);
    setActiveTopic(prev => prev === id ? null : id);
  };

  const onPickTag = (tag: string) => {
    setActiveTopic(null);
    setActiveTag(prev => prev === tag ? null : tag);
    setSearchFocused(false);
  };

  const clearAll = () => { setActiveTag(null); setActiveTopic(null); setQuery(''); };
  const hasFilter = Boolean(activeTag || activeTopic || query.trim());
  const activeChipLabel = activeTag ?? (activeTopic && TOPICS.find(t => t.id === activeTopic)?.label) ?? null;

  return (
    <>
      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div ref={searchWrapRef} style={{ position: 'relative' }}>
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
            placeholder="Search by title, topic, or keyword…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            style={{
              width: '100%',
              paddingLeft: '2.5rem', paddingRight: '5.5rem',
              paddingTop: '0.7rem', paddingBottom: '0.7rem',
              background: 'var(--warm-white)', border: 'var(--panel-border)',
              borderRadius: '8px', boxShadow: '3px 3px 0 var(--ink)',
              fontSize: '0.92rem', color: 'var(--text-primary)',
              outline: 'none', fontFamily: 'inherit', transition: 'box-shadow 0.15s ease',
            }}
          />
          {/* Kbd hint — disappears when typing, just like macOS Spotlight. */}
          {!query && (
            <kbd
              aria-hidden="true"
              style={{
                position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                fontFamily: 'inherit', fontSize: '0.68rem', fontWeight: 600,
                color: 'var(--text-muted)', background: 'var(--parchment)',
                border: '1.5px solid var(--ink)', borderRadius: '4px',
                padding: '0.12rem 0.45rem', letterSpacing: '0.04em',
                pointerEvents: 'none',
              }}
            >⌘ K</kbd>
          )}
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search"
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', padding: '0.1rem', lineHeight: 1, fontFamily: 'inherit' }}>×</button>
          )}

          {/* Inline tag suggestions while typing — jump straight to a structured filter. */}
          {searchFocused && tagSuggestions.length > 0 && (
            <div
              role="listbox"
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: 'var(--warm-white)',
                border: 'var(--panel-border)', borderRadius: '8px',
                boxShadow: '3px 3px 0 var(--ink)',
                padding: '0.45rem', zIndex: 10,
                display: 'flex', flexDirection: 'column', gap: '0.15rem',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.2rem 0.6rem 0.4rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Jump to topic
              </div>
              {tagSuggestions.map(t => (
                <button
                  key={t}
                  role="option"
                  onClick={() => onPickTag(t)}
                  style={{
                    textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '0.45rem 0.6rem', borderRadius: '6px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--parchment)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{t}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {tagCounts.get(t) ?? 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Topic clusters — 6 chips replace the wall of tags ─────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {TOPICS.map(topic => {
            const count = topicCounts.get(topic.id) ?? 0;
            const active = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => onPickTopic(topic.id)}
                aria-pressed={active}
                style={topicChipStyle(active)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d={topic.mark} />
                </svg>
                <span>{topic.label}</span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '99px',
                  background: active ? 'rgba(255,255,255,0.22)' : 'var(--parchment)',
                  color: active ? 'rgba(255,255,255,0.92)' : 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{count}</span>
              </button>
            );
          })}

          {/* All tags disclosure — power users keep their long-tail access */}
          <button
            onClick={() => setAllTagsOpen(o => !o)}
            aria-expanded={allTagsOpen}
            style={{
              fontSize: '0.78rem', fontWeight: 600,
              padding: '0.4em 0.85em',
              border: 'none', background: 'transparent',
              color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
              borderBottom: '1.5px dashed var(--text-muted)',
              borderRadius: 0,
              lineHeight: 1.2,
            }}
          >
            {allTagsOpen ? 'Hide tags' : `All tags (${tags.length})`}
          </button>
        </div>

        {/* ── Active filter as a removable chip ─────────────────────────────── */}
        {hasFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Filtering
            </span>
            {activeChipLabel && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.25em 0.55em 0.25em 0.85em',
                fontSize: '0.78rem', fontWeight: 700,
                background: 'var(--vermilion)', color: 'white',
                borderRadius: '99px', border: '2px solid var(--ink)',
                boxShadow: '2px 2px 0 var(--ink)',
              }}>
                {activeChipLabel}
                <button
                  onClick={() => { setActiveTag(null); setActiveTopic(null); }}
                  aria-label={`Remove filter ${activeChipLabel}`}
                  style={{
                    background: 'rgba(255,255,255,0.22)', border: 'none', color: 'white',
                    width: '18px', height: '18px', borderRadius: '50%',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', lineHeight: 1, padding: 0,
                  }}
                >×</button>
              </span>
            )}
            {query.trim() && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.25em 0.55em 0.25em 0.85em',
                fontSize: '0.78rem', fontWeight: 600,
                background: 'var(--warm-white)', color: 'var(--text-primary)',
                borderRadius: '99px', border: '2px solid var(--ink)',
              }}>
                “{query}”
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  style={{
                    background: 'var(--parchment)', border: 'none', color: 'var(--ink)',
                    width: '18px', height: '18px', borderRadius: '50%',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', lineHeight: 1, padding: 0,
                  }}
                >×</button>
              </span>
            )}
            <button
              onClick={clearAll}
              style={{
                fontSize: '0.78rem', fontWeight: 600, color: 'var(--vermilion)',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                padding: '0.25em 0', textDecoration: 'underline', textDecorationThickness: '1.5px',
                textUnderlineOffset: '3px',
              }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Full tag list — only when explicitly opened ───────────────────── */}
        {allTagsOpen && (
          <div
            style={{
              padding: '1rem 1.1rem',
              background: 'var(--warm-white)',
              border: 'var(--panel-border)', borderRadius: '8px',
              boxShadow: '3px 3px 0 var(--ink)',
              display: 'flex', flexDirection: 'column', gap: '0.85rem',
            }}
          >
            {TOPICS.map(topic => {
              const groupTags = topic.tags
                .filter(t => tags.some(real => lc(real) === lc(t)))
                .sort((a, b) => (tagCounts.get(b) ?? 0) - (tagCounts.get(a) ?? 0));
              if (groupTags.length === 0) return null;
              return (
                <div key={topic.id}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    {topic.label}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {groupTags.map(t => (
                      <button key={t} onClick={() => onPickTag(t)} style={miniTagStyle(activeTag === t)}>
                        {t} <span style={{ opacity: 0.55, fontWeight: 500 }}>{tagCounts.get(t) ?? 0}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {otherTags.length > 0 && (
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Other
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {otherTags.map(t => (
                    <button key={t} onClick={() => onPickTag(t)} style={miniTagStyle(activeTag === t)}>
                      {t} <span style={{ opacity: 0.55, fontWeight: 500 }}>{tagCounts.get(t) ?? 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Result count ─────────────────────────────────────────────────── */}
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        {hasFilter
          ? `${filtered.length} of ${posts.length} posts`
          : `${posts.length} posts`}
      </p>

      {/* ── Post list ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--warm-white)', border: 'var(--panel-border)', boxShadow: 'var(--panel-shadow)', borderRadius: '8px' }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.4rem', color: 'var(--text-muted)' }}>
              Nothing matches that filter
            </p>
            <button onClick={clearAll} style={{ marginTop: '0.8rem', background: 'none', border: 'none', color: 'var(--vermilion)', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit', fontWeight: 600 }}>
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

      {hasMore && (
        <div style={{ paddingTop: '2rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div ref={sentinelRef} style={{ height: '1px', width: '100%' }} />
          {loading ? (
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

function topicChipStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
    fontSize: '0.85rem', fontWeight: 600,
    padding: '0.42em 0.95em 0.42em 0.75em',
    borderRadius: '999px',
    border: '2px solid var(--ink)',
    background: active ? 'var(--vermilion)' : 'var(--warm-white)',
    color: active ? 'white' : 'var(--text-primary)',
    boxShadow: active ? '3px 3px 0 var(--ink)' : '2px 2px 0 rgba(20,10,5,0.12)',
    transform: active ? 'translate(-1px,-1px)' : 'none',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'transform 0.12s cubic-bezier(0.34,1.56,0.64,1), background 0.15s ease, box-shadow 0.15s ease',
  };
}

function miniTagStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: '0.74rem', fontWeight: 600,
    padding: '0.22em 0.6em',
    borderRadius: '99px',
    border: `1.5px solid ${active ? 'var(--vermilion)' : 'var(--ink)'}`,
    background: active ? 'var(--vermilion)' : 'transparent',
    color: active ? 'white' : 'var(--text-primary)',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.1s ease',
  };
}
