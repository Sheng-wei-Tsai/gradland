import { getAllClaudeSkills, getClaudeSkillBySlug } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { format } from 'date-fns';
import Link from 'next/link';
import { Metadata } from 'next';
import rehypePrettyCode from 'rehype-pretty-code';
import LessonShell from '@/components/claude-skills/LessonShell';
import VideoDeepDive from '@/components/claude-skills/VideoDeepDive';

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
  return getAllClaudeSkills().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getClaudeSkillBySlug(slug);
  if (!lesson) return { title: 'Claude Code Skills' };
  const url = `${BASE_URL}/learn/claude-skills/${slug}`;
  return {
    title: lesson.title,
    description: lesson.excerpt,
    openGraph: {
      title: lesson.title,
      description: lesson.excerpt,
      type: 'article',
      url,
      publishedTime: lesson.date,
    },
    twitter: { card: 'summary_large_image', title: lesson.title, description: lesson.excerpt },
    alternates: { canonical: url },
  };
}

export default async function ClaudeSkillsLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getClaudeSkillBySlug(slug);
  if (!lesson) notFound();

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ paddingTop: '3rem', paddingBottom: '1rem' }}>
        <Link href="/learn/claude-skills" style={{
          fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem',
        }}>
          ← Skill Tree
        </Link>

        <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {lesson.category && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--terracotta)', background: 'rgba(192,40,28,0.08)',
              border: '1px solid rgba(192,40,28,0.25)',
              padding: '0.25em 0.75em', borderRadius: '5px',
            }}>
              {lesson.category}
            </span>
          )}
          {typeof lesson.tier === 'number' && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--jade)', background: 'rgba(30,122,82,0.08)',
              border: '1px solid rgba(30,122,82,0.25)',
              padding: '0.25em 0.75em', borderRadius: '5px',
            }}>
              Tier {lesson.tier}
            </span>
          )}
          {lesson.xpReward && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--gold)', background: 'rgba(200,138,20,0.10)',
              border: '1px solid rgba(200,138,20,0.30)',
              padding: '0.25em 0.75em', borderRadius: '5px',
            }}>
              {lesson.xpReward} XP
            </span>
          )}
        </div>

        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{lesson.coverEmoji}</div>

        <h1 className="animate-fade-up" style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(1.7rem, 4vw, 2.5rem)',
          fontWeight: 700, color: 'var(--brown-dark)',
          lineHeight: 1.2, marginBottom: '1rem',
        }}>
          {lesson.title}
        </h1>

        <div className="animate-fade-up delay-1" style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.8rem',
          alignItems: 'center', marginBottom: '1.5rem',
          color: 'var(--text-muted)', fontSize: '0.85rem',
        }}>
          <span>{format(new Date(lesson.date), 'd MMMM yyyy')}</span>
          <span>·</span>
          <span>{lesson.readingTime}</span>
        </div>
      </div>

      <article className="prose animate-fade-up delay-2" style={{ paddingBottom: '1rem' }}>
        <LessonShell
          slug={lesson.slug}
          xpReward={lesson.xpReward ?? 30}
          terminalScenario={lesson.terminalScenario}
          quiz={lesson.quiz}
        >
          <MDXRemote source={lesson.content} {...(mdxOptions as object)} />
        </LessonShell>
      </article>

      {lesson.videoIds && lesson.videoIds.length > 0 && (
        <VideoDeepDive videoIds={lesson.videoIds} />
      )}

      {lesson.docsUrl && (
        <div style={{
          margin: '2rem 0 4rem',
          padding: '1.1rem 1.4rem',
          background: 'var(--warm-white)',
          border: 'var(--panel-border)',
          borderRadius: '10px',
          boxShadow: 'var(--panel-shadow)',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Official docs
          </div>
          <a href={lesson.docsUrl} target="_blank" rel="noopener noreferrer" style={{
            color: 'var(--vermilion)', textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
          }}>
            {lesson.docsUrl} →
          </a>
        </div>
      )}
    </div>
  );
}
