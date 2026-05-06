import { getAllCareerEdge, getCareerEdgeBySlug } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { format } from 'date-fns';
import Link from 'next/link';
import { Metadata } from 'next';
import rehypePrettyCode from 'rehype-pretty-code';

const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: { dark: 'github-dark-dimmed', light: 'github-light' },
        keepBackground: false,
        defaultLang: 'plaintext',
      }],
    ],
  },
};

const PILLAR_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'ai-screening':         { label: 'AI Screening Defence',  color: '#c0281c', bg: 'rgba(192,40,28,0.08)',   border: 'rgba(192,40,28,0.25)' },
  'fluency-without-debt': { label: 'AI Fluency',            color: '#1e7a52', bg: 'rgba(30,122,82,0.08)',   border: 'rgba(30,122,82,0.25)' },
  'eval-driven-projects': { label: 'Eval-Driven Projects',  color: '#c88a14', bg: 'rgba(200,138,20,0.08)',  border: 'rgba(200,138,20,0.25)' },
  'pr-pathway':           { label: 'PR Pathway',            color: '#7a5030', bg: 'rgba(122,80,48,0.08)',   border: 'rgba(122,80,48,0.25)' },
  'interview-defence':    { label: 'Interview Defence',     color: '#7a3030', bg: 'rgba(122,48,48,0.08)',   border: 'rgba(122,48,48,0.25)' },
  'tools-deep-dive':      { label: 'Tools Deep-Dive',       color: '#3d5a80', bg: 'rgba(61,90,128,0.08)',   border: 'rgba(61,90,128,0.25)' },
};

const TOOL_LABELS: Record<string, string> = {
  '/resume':         'Resume Analyser',
  '/interview-prep': 'Interview Prep',
  '/learn':          'Learning Paths',
  '/au-insights':    'AU Insights',
  '/jobs':           'Job Search',
  '/dashboard':      'Dashboard',
};

export async function generateStaticParams() {
  return getAllCareerEdge().map(p => ({ slug: p.slug }));
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://henrysdigitallife.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getCareerEdgeBySlug(slug);
  if (!post) return { title: 'Career Edge' };
  const url = `${BASE_URL}/career-edge/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url,
      publishedTime: post.date,
      authors: ['Henry Tsai'],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
    alternates: { canonical: url },
  };
}

export default async function CareerEdgePostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getCareerEdgeBySlug(slug);
  if (!post) notFound();

  const pillar = PILLAR_META[post.pillar ?? ''] ?? null;
  const toolLabel = post.crossLink ? TOOL_LABELS[post.crossLink] ?? post.crossLink : null;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ paddingTop: '3rem', paddingBottom: '1.5rem' }}>
        <Link href="/posts/career-edge" style={{
          fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '2rem',
        }}>
          ← Career Edge
        </Link>

        {pillar && (
          <div style={{ marginBottom: '1rem' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: pillar.color, background: pillar.bg,
              border: `1px solid ${pillar.border}`,
              padding: '0.25em 0.75em', borderRadius: '5px',
            }}>
              {pillar.label}
            </span>
            {post.visaPathway && (
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)', background: 'transparent',
                border: '1px solid var(--parchment)',
                padding: '0.25em 0.75em', borderRadius: '5px',
                marginLeft: '0.5rem',
              }}>
                Visa: {post.visaPathway}
              </span>
            )}
          </div>
        )}

        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{post.coverEmoji}</div>

        <h1 className="animate-fade-up" style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 700, color: 'var(--brown-dark)',
          lineHeight: 1.2, marginBottom: '1rem',
        }}>
          {post.title}
        </h1>

        <div className="animate-fade-up delay-1" style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.8rem',
          alignItems: 'center', marginBottom: '1.5rem',
          color: 'var(--text-muted)', fontSize: '0.85rem',
        }}>
          <span>{format(new Date(post.date), 'd MMMM yyyy')}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
      </div>

      <article className="prose animate-fade-up delay-2" style={{ paddingBottom: '2rem' }}>
        <MDXRemote source={post.content} {...(mdxOptions as object)} />
      </article>

      {post.crossLink && toolLabel && (
        <div style={{
          margin: '2rem 0',
          padding: '1.25rem 1.5rem',
          background: 'var(--warm-white)',
          border: 'var(--panel-border)',
          borderRadius: '6px',
          boxShadow: 'var(--panel-shadow)',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Apply this on TechPath
          </div>
          <Link href={post.crossLink} style={{
            color: 'var(--vermilion)', textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem',
          }}>
            Open {toolLabel} →
          </Link>
        </div>
      )}

      <div style={{
        borderTop: '1px solid var(--parchment)', paddingTop: '2rem', paddingBottom: '5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link href="/posts/career-edge" style={{ color: 'var(--vermilion)', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← All Career Edge
        </Link>
        <span style={{ fontFamily: "'Caveat', cursive", color: 'var(--brown-light)', fontSize: '1.1rem' }}>
          Get the role 🎯
        </span>
      </div>
    </div>
  );
}
