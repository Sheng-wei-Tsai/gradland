import { getAllClaudeCode } from '@/lib/posts';
import BlogList from '@/components/BlogList';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claude Code news — Gradland',
  description: 'Latest announcements from Claude, Claude Code, and Anthropic — auto-curated from anthropic.com and code.claude.com docs.',
};

export default function PostsClaudeCodeNewsPage() {
  const news = getAllClaudeCode();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--terracotta)', marginBottom: '0.5rem',
        }}>
          Auto-curated news
        </div>
        <h1 style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(1.9rem, 4.5vw, 2.6rem)',
          fontWeight: 700, color: 'var(--brown-dark)',
          marginBottom: '0.6rem',
        }}>
          Claude Code news
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.55, maxWidth: '640px' }}>
          Daily summaries of Claude / Anthropic announcements, new Claude Code docs pages, and research notes — pulled straight from official sources.
        </p>
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(192,40,28,0.06)',
          border: '1px solid rgba(192,40,28,0.20)',
          borderRadius: '10px',
          fontSize: '0.88rem',
          color: 'var(--brown-dark)',
        }}>
          🎮 Want to <strong>practice</strong> Claude Code features instead of just reading?
          {' '}
          <Link href="/learn/claude-skills" style={{ color: 'var(--vermilion)', textDecoration: 'none', fontWeight: 600 }}>
            Open the interactive Skill Tree →
          </Link>
        </div>
      </header>

      {news.length === 0 ? (
        <div style={{
          padding: '2rem 1.5rem',
          background: 'var(--warm-white)',
          border: 'var(--panel-border)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          No news items yet. The daily fetcher posts here as Anthropic and Claude Code ship updates.
        </div>
      ) : (
        <BlogList posts={news} tags={[]} />
      )}
    </div>
  );
}
