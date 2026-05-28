import { getAllClaudeCode, getClaudeCodeBySlug } from '@/lib/posts';
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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gradland.au';

export async function generateStaticParams() {
  return getAllClaudeCode().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getClaudeCodeBySlug(slug);
  if (!post) return { title: 'Claude Code news' };
  const url = `${BASE_URL}/claude-code/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url,
      publishedTime: post.date,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
    alternates: { canonical: url },
  };
}

export default async function ClaudeCodeNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getClaudeCodeBySlug(slug);
  if (!post) notFound();

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: 'Henry Tsai', url: `${BASE_URL}/about` },
    publisher: { '@type': 'Organization', name: 'Gradland', url: BASE_URL },
    url: `${BASE_URL}/claude-code/${post.slug}`,
  });

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div style={{ paddingTop: '3rem', paddingBottom: '1.5rem' }}>
        <Link href="/posts/claude-code" style={{
          fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '2rem',
        }}>
          ← Claude Code news
        </Link>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--terracotta)', background: 'rgba(192,40,28,0.08)',
            border: '1px solid rgba(192,40,28,0.25)',
            padding: '0.25em 0.75em', borderRadius: '5px',
          }}>
            Anthropic news
          </span>
        </div>

        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{post.coverEmoji}</div>

        <h1 className="animate-fade-up" style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 700, color: 'var(--brown-dark)',
          lineHeight: 1.2, marginBottom: '1rem',
        }}>
          {post.title}
        </h1>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.8rem',
          alignItems: 'center', marginBottom: '1.5rem',
          color: 'var(--text-muted)', fontSize: '0.85rem',
        }}>
          <span>{format(new Date(post.date), 'd MMMM yyyy')}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
      </div>

      <article className="prose" style={{ paddingBottom: '2rem' }}>
        <MDXRemote source={post.content} {...(mdxOptions as object)} />
      </article>

      {post.sourceUrl && (
        <div style={{
          margin: '1rem 0 3rem',
          padding: '1rem 1.2rem',
          background: 'var(--warm-white)',
          border: 'var(--panel-border)',
          borderRadius: '10px',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Read the original
          </div>
          <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" style={{
            color: 'var(--vermilion)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-all',
          }}>
            {post.sourceUrl} →
          </a>
        </div>
      )}

      <div style={{
        margin: '1rem 0 5rem',
        padding: '1.2rem 1.4rem',
        background: 'linear-gradient(135deg, rgba(192,40,28,0.06), rgba(200,138,20,0.06))',
        border: 'var(--panel-border)',
        borderRadius: '12px',
      }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brown-dark)', marginBottom: '0.4rem' }}>
          🎮 Try the feature, don&apos;t just read about it
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '0.8rem' }}>
          The interactive Skill Tree lets you practice every Claude Code command in a fake terminal, take a quiz, and earn XP.
        </p>
        <Link href="/learn/claude-skills" style={{
          display: 'inline-block',
          background: 'var(--terracotta)', color: 'white',
          padding: '0.55rem 1.1rem', borderRadius: '10px',
          fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
        }}>
          Open Skill Tree →
        </Link>
      </div>
    </div>
  );
}
