'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { SKILL_PATHS } from '@/lib/skill-paths';
import { SKILL_CONTENT } from '@/lib/skill-content';

interface PathSummary {
  pathId:      string;
  enrolledAt:  string;
  checked:     number;
  total:       number;
  mastered:    number;
}

function totalTopicsForPath(pathId: string): number {
  const path = SKILL_PATHS.find(p => p.id === pathId);
  if (!path) return 0;
  return path.phases.flatMap(ph => ph.skills).reduce((sum, skill) => {
    const rich = SKILL_CONTENT[skill.id];
    return sum + (rich?.topics?.length ?? skill.topics.length);
  }, 0);
}

const PATH_COLORS: Record<string, string> = {
  'junior-frontend':  '#0ea5e9',
  'junior-fullstack': '#7c3aed',
  'junior-backend':   '#059669',
  'data-engineer':    '#d97706',
  'devops-cloud':     '#4338ca',
};

export default function DashboardLearnPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [paths, setPaths] = useState<PathSummary[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login?next=/dashboard/learn'); return; }

    async function load() {
      /* Enrolled paths */
      const { data: active } = await supabase
        .from('user_active_paths')
        .select('path_id, enrolled_at')
        .eq('user_id', user!.id)
        .order('enrolled_at', { ascending: false });

      if (!active || active.length === 0) { setFetching(false); return; }

      /* Skill progress per path */
      const { data: progress } = await supabase
        .from('skill_progress')
        .select('path_id, checked_topics, status')
        .eq('user_id', user!.id);

      const summaries: PathSummary[] = active.map(row => {
        const total   = totalTopicsForPath(row.path_id);
        const checked = (progress ?? [])
          .filter(p => p.path_id === row.path_id)
          .reduce((s, p) => s + (p.checked_topics?.length ?? 0), 0);
        const mastered = (progress ?? [])
          .filter(p => p.path_id === row.path_id && p.status === 'mastered').length;

        return { pathId: row.path_id, enrolledAt: row.enrolled_at, checked, total, mastered };
      });

      setPaths(summaries);
      setFetching(false);
    }

    load();
  }, [user, loading, router]);

  if (loading || fetching) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4.5rem 1.5rem' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: '6rem', borderRadius: '12px', background: 'var(--parchment)', marginBottom: '1rem', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>

      <section style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.5rem' }}>
          My Learning Paths
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Your enrolled paths and progress at a glance.
        </p>
      </section>

      {paths.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', borderRadius: '16px', border: '1.5px dashed var(--parchment)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🗺</p>
          <p style={{ fontWeight: 600, color: 'var(--brown-dark)', marginBottom: '0.4rem' }}>No paths enrolled yet</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Head to the Learn page and pick a career path to get started.
          </p>
          <Link href="/learn" style={{
            background: 'var(--terracotta)', color: 'white',
            padding: '0.5rem 1.3rem', borderRadius: '99px',
            textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600,
          }}>Browse paths →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '4rem' }}>
          {paths.map(summary => {
            const meta  = SKILL_PATHS.find(p => p.id === summary.pathId);
            if (!meta) return null;
            const pct   = summary.total > 0 ? Math.round((summary.checked / summary.total) * 100) : 0;
            const color = PATH_COLORS[summary.pathId] ?? 'var(--terracotta)';

            return (
              <div key={summary.pathId} style={{
                background: 'var(--warm-white)', border: '1.5px solid var(--parchment)',
                borderRadius: '14px', padding: '1.25rem 1.4rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{meta.emoji}</span>
                    <div>
                      <div style={{ fontFamily: "'Lora', serif", fontSize: '1rem', fontWeight: 700, color: 'var(--brown-dark)' }}>{meta.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {summary.checked} / {summary.total} topics · {summary.mastered} skills mastered
                      </div>
                    </div>
                  </div>
                  <Link href={`/learn/${summary.pathId}`} style={{
                    background: pct === 100 ? '#10b981' : 'var(--terracotta)',
                    color: 'white', padding: '0.38rem 1rem',
                    borderRadius: '99px', textDecoration: 'none',
                    fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {pct === 100 ? '✓ Completed' : pct > 0 ? 'Continue →' : 'Start →'}
                  </Link>
                </div>

                {/* Progress bar */}
                <div style={{ background: 'var(--parchment)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '99px',
                    width: `${pct}%`, background: color,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{meta.timeline}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: pct > 0 ? color : 'var(--text-muted)' }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
