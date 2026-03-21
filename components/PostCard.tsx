'use client';
import Link from 'next/link';
import { Post } from '@/lib/posts';
import { format } from 'date-fns';

export default function PostCard({ post, index = 0, basePath = '/blog' }: { post: Post; index?: number; basePath?: string }) {
  return (
    <Link href={`${basePath}/${post.slug}`} style={{ textDecoration: 'none' }}>
      <article
        className={`animate-fade-up delay-${Math.min(index + 1, 4)}`}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px var(--shadow-color)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,98,58,0.25)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--parchment)';
        }}
        style={{
          background:    'var(--warm-white)',
          border:        '1px solid var(--parchment)',
          borderRadius:  '16px',
          padding:       '1.6rem 1.8rem',
          display:       'flex',
          gap:           '1.4rem',
          alignItems:    'flex-start',
          transition:    'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
          cursor:        'pointer',
        }}
      >
        {/* Emoji — fixed width column */}
        <div style={{
          fontSize:   '1.65rem',
          lineHeight: 1,
          flexShrink: 0,
          width:      '2.2rem',
          paddingTop: '0.15rem',
        }}>
          {post.coverEmoji}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>

          {/* Date + reading time */}
          <div style={{
            fontSize:      '0.76rem',
            color:         'var(--text-muted)',
            letterSpacing: '0.02em',
          }}>
            {format(new Date(post.date), 'd MMM yyyy')}
            <span style={{ margin: '0 0.4rem', opacity: 0.5 }}>·</span>
            {post.readingTime}
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Lora', serif",
            fontSize:   '1.08rem',
            fontWeight: 700,
            color:      'var(--brown-dark)',
            lineHeight: 1.35,
            margin:     0,
          }}>
            {post.title}
          </h2>

          {/* Excerpt */}
          <p style={{
            color:              'var(--text-secondary)',
            fontSize:           '0.86rem',
            lineHeight:         1.65,
            margin:             0,
            overflow:           'hidden',
            display:            '-webkit-box',
            WebkitLineClamp:    2,
            WebkitBoxOrient:    'vertical',
          }}>
            {post.excerpt}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.1rem' }}>
              {post.tags.map(tag => (
                <span key={tag} style={{
                  fontSize:        '0.72rem',
                  fontWeight:      500,
                  color:           'var(--brown-light)',
                  background:      'var(--parchment)',
                  padding:         '0.18em 0.65em',
                  borderRadius:    '99px',
                  letterSpacing:   '0.01em',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
