import { getAllClaudeSkills } from '@/lib/posts';
import SkillTree from '@/components/claude-skills/SkillTree';
import StatsBanner from '@/components/claude-skills/StatsBanner';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claude Code Skill Tree — Gradland',
  description: 'Play through every Claude Code command in a fake terminal, take a short quiz, watch curated videos, and earn XP. Skill tree gates lessons by prerequisite.',
};

export default function ClaudeSkillsHubPage() {
  const lessons = getAllClaudeSkills();

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--terracotta)', marginBottom: '0.5rem',
        }}>
          Interactive skill tree
        </div>
        <h1 style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 700, color: 'var(--brown-dark)',
          marginBottom: '0.6rem',
        }}>
          Master Claude Code, one skill at a time 🌳
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.55, maxWidth: '720px' }}>
          Click a node to open a lesson. Pass the terminal challenge + ace the quiz to unlock the next tier. Each skill also links to community deep-dive videos.
        </p>
        <div style={{ marginTop: '0.9rem' }}>
          <Link href="/posts/claude-code" style={{
            fontSize: '0.85rem', color: 'var(--vermilion)', textDecoration: 'none', fontWeight: 600,
          }}>
            Just want news? →
          </Link>
        </div>
      </header>

      <StatsBanner />

      {lessons.length === 0 ? (
        <div style={{
          padding: '2rem 1.5rem',
          background: 'var(--warm-white)',
          border: 'var(--panel-border)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          The skill tree is being seeded. Check back soon — the daily generator publishes a new node here every day.
        </div>
      ) : (
        <SkillTree lessons={lessons} />
      )}
    </div>
  );
}
