'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

interface Stats {
  total_xp:          number;
  current_streak:    number;
  longest_streak:    number;
  lessons_completed: number;
}

export default function StatsBanner() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) { setStats(null); return; }
    supabase
      .from('claude_code_user_stats')
      .select('total_xp, current_streak, longest_streak, lessons_completed')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setStats(data); });
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <div style={{
        margin: '0 0 2rem',
        padding: '1.2rem 1.4rem',
        background: 'linear-gradient(135deg, rgba(192,40,28,0.06), rgba(200,138,20,0.06))',
        border: 'var(--panel-border)',
        borderRadius: '14px',
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--brown-dark)', marginBottom: '0.35rem' }}>
          Learn Claude Code, one tip a day
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.85rem', lineHeight: 1.55 }}>
          Each lesson has a hands-on terminal challenge and a short quiz. Sign in to earn XP, build a streak, and unlock badges.
        </div>
        <Link href="/login?next=/learn/claude-skills" style={{
          display: 'inline-block',
          background: 'var(--terracotta)', color: 'white',
          padding: '0.55rem 1.1rem', borderRadius: '10px',
          fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
        }}>
          Sign in to start →
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      margin: '0 0 2rem',
      padding: '1rem 1.2rem',
      background: 'var(--warm-white)',
      border: 'var(--panel-border)',
      borderRadius: '14px',
      boxShadow: 'var(--panel-shadow)',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem',
    }}>
      <Stat label="Total XP"   value={stats?.total_xp ?? 0} />
      <Divider />
      <Stat label="Streak"     value={`🔥 ${stats?.current_streak ?? 0}`} sub={stats && stats.longest_streak > 0 ? `best ${stats.longest_streak}` : undefined} />
      <Divider />
      <Stat label="Completed"  value={stats?.lessons_completed ?? 0} />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--brown-dark)' }}>
        {value}
        {sub && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem', marginLeft: '0.4rem' }}>({sub})</span>}
      </div>
    </div>
  );
}

function Divider() {
  return <span style={{ width: '1px', height: '32px', background: 'var(--parchment)' }} />;
}
