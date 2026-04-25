'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MermaidDiagram from '@/components/MermaidDiagram';
import { supabase } from '@/lib/supabase';

const ROADMAP_KEY = 'roadmap_images';

function loadRoadmapCache(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(ROADMAP_KEY) || '{}'); }
  catch { return {}; }
}

function saveRoadmapCache(cache: Record<string, string>) {
  localStorage.setItem(ROADMAP_KEY, JSON.stringify(cache));
}

function Shimmer({ w, h, radius = 8 }: { w: string; h: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: `${h}px`, borderRadius: `${radius}px`,
      background: 'linear-gradient(90deg, var(--parchment) 25%, #f5ece0 50%, var(--parchment) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}
import type { DashboardSummary } from '@/app/api/dashboard/summary/route';
import type { User } from '@supabase/supabase-js';

const ROLE_LABELS: Record<string, string> = {
  'frontend':      'Frontend Developer',
  'fullstack':     'Full Stack Developer',
  'backend':       'Backend Developer',
  'data-engineer': 'Data Engineer',
  'devops':        'DevOps / Cloud Engineer',
  'mobile':        'Mobile Developer',
  'qa':            'QA Engineer',
  'other':         'IT professional',
};

const VISA_STEP_NAMES: Record<number, string> = {
  1: 'Skills Assessment',
  2: 'Employer Sponsorship',
  3: 'Nomination',
  4: 'Visa Application',
  5: 'Biometrics & Health',
  6: 'Visa Grant',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const ROLE_TO_PREP: Record<string, string> = {
  'frontend':      'junior-frontend',
  'fullstack':     'junior-fullstack',
  'backend':       'junior-backend',
  'data-engineer': 'junior-data',
  'devops':        'junior-devops',
  'mobile':        'junior-mobile',
  'qa':            'junior-qa',
};

// Determine top next action from summary
function getNextAction(s: DashboardSummary): { emoji: string; title: string; body: string; href: string; cta: string } {
  if (!s.onboardingCompleted) return {
    emoji: '👋', title: 'Complete your profile',
    body:  '3 questions · 90 seconds. We\'ll personalise everything for you.',
    href:  '/dashboard', cta: 'Set up profile →',
  };
  // Active interview in pipeline — highest urgency
  if (s.interviewCount > 0) {
    const prepPath = s.onboardingRole ? (ROLE_TO_PREP[s.onboardingRole] ?? 'junior-fullstack') : 'junior-fullstack';
    return {
      emoji: '🎯', title: `Interview lined up — prep with Alex`,
      body:  `You have ${s.interviewCount} active interview${s.interviewCount > 1 ? 's' : ''}. Practice ${ROLE_LABELS[s.onboardingRole ?? ''] ?? 'your role'} questions now.`,
      href:  `/interview-prep/${prepPath}`, cta: 'Prep now →',
    };
  }
  if (s.visaStep) return {
    emoji: '🛂', title: `Visa Step ${s.visaStep.step} — ${VISA_STEP_NAMES[s.visaStep.step] ?? 'In Progress'}`,
    body:  s.visaStep.startedAt
      ? `Started ${new Date(s.visaStep.startedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}. Track your progress and documents.`
      : 'This step is in progress. Track your documents and timeline.',
    href:  '/dashboard/visa-tracker', cta: 'View tracker →',
  };
  if (s.reviewDue) return {
    emoji: '📚', title: 'Skill review due',
    body:  `Time to reinforce ${s.reviewDue.skillId.replace(/-/g, ' ')} — spaced repetition keeps it fresh.`,
    href:  `/learn/${s.reviewDue.pathId}`, cta: 'Review now →',
  };
  if (s.resumeStaleDays !== null && s.resumeStaleDays > 14) return {
    emoji: '📄', title: 'Resume getting stale',
    body:  `Last analysed ${s.resumeStaleDays} days ago. AU job market moves fast — update before applying.`,
    href:  '/dashboard/resume-analyser', cta: 'Analyse →',
  };
  // Fallback: prompt to search jobs
  return {
    emoji: '💼', title: 'Find matching jobs',
    body:  s.onboardingRole ? `Search for ${ROLE_LABELS[s.onboardingRole] ?? 'IT'} roles in Australia.` : 'Search IT roles across Australia.',
    href:  '/jobs', cta: 'Search jobs →',
  };
}

// Secondary "today" cards (everything except next action)
function getTodayCards(s: DashboardSummary, nextActionTitle: string) {
  const cards: Array<{ emoji: string; label: string; body: string; href: string }> = [];

  if (nextActionTitle !== 'Skill review due' && s.reviewDue) {
    cards.push({ emoji: '📚', label: 'Review due', body: s.reviewDue.skillId.replace(/-/g, ' '), href: `/learn/${s.reviewDue.pathId}` });
  }
  if (nextActionTitle !== 'Resume getting stale' && s.resumeStaleDays !== null && s.resumeStaleDays > 14) {
    cards.push({ emoji: '📄', label: 'Resume', body: `${s.resumeStaleDays}d old`, href: '/dashboard/resume-analyser' });
  }
  if (s.onboardingRole) {
    const path = `junior-${s.onboardingRole}`;
    cards.push({ emoji: '🎯', label: 'Interview prep', body: ROLE_LABELS[s.onboardingRole] ?? 'IT', href: `/interview-prep/${path}` });
  }
  cards.push({ emoji: '💼', label: 'Job search', body: s.applicationCount ? `${s.applicationCount} active` : 'Find roles', href: '/jobs' });

  return cards.slice(0, 3);
}

export default function PersonalisedHero({ user }: { user: User }) {
  const [summary,         setSummary]         = useState<DashboardSummary | null>(null);
  const [loadError,       setLoadError]       = useState(false);
  const [roadmapImage,    setRoadmapImage]    = useState<string | null>(null);
  const [roadmapLoading,  setRoadmapLoading]  = useState(false);
  const [roadmapError,    setRoadmapError]    = useState(false);
  const [token,           setToken]           = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setToken(session.access_token);
        const res = await fetch('/api/dashboard/summary', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) setSummary(await res.json());
        else setLoadError(true);
      } catch {
        setLoadError(true);
      }
    })();
  }, []);

  // Load cached roadmap from localStorage on mount
  useEffect(() => {
    if (!summary?.onboardingCompleted || !summary.onboardingRole) return;
    const cacheKey = `${summary.onboardingRole}_${summary.onboardingVisaStatus ?? 'other'}_${summary.onboardingJobStage ?? 'exploring'}`;
    const cached = loadRoadmapCache()[cacheKey];
    if (cached) setRoadmapImage(cached);
  }, [summary]);

  const generateRoadmap = useCallback(async () => {
    if (!summary?.onboardingRole || !token) return;
    setRoadmapLoading(true);
    setRoadmapError(false);
    try {
      const res = await fetch('/api/learn/roadmap-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          role:       summary.onboardingRole,
          visaStatus: summary.onboardingVisaStatus ?? 'other',
          jobStage:   summary.onboardingJobStage   ?? 'exploring',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setRoadmapError(true); return; }
      const updated = { ...loadRoadmapCache(), [data.cacheKey]: data.mermaidCode };
      saveRoadmapCache(updated);
      setRoadmapImage(data.mermaidCode);
    } catch {
      setRoadmapError(true);
    } finally {
      setRoadmapLoading(false);
    }
  }, [summary, token]);

  const name = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there';
  const nextAction = summary ? getNextAction(summary) : null;
  const todayCards = summary ? getTodayCards(summary, nextAction?.title ?? '') : [];

  return (
    <section style={{ paddingTop: '3rem', paddingBottom: '2.5rem' }}>
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {user.user_metadata?.avatar_url && (
          <Image src={user.user_metadata.avatar_url} alt="" width={40} height={40} style={{ borderRadius: '50%', flexShrink: 0 }} />
        )}
        <div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--brown-dark)', margin: 0 }}>
            {getGreeting()}, {name}.
          </h1>
          {summary?.onboardingRole && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Targeting: {ROLE_LABELS[summary.onboardingRole]}
            </p>
          )}
        </div>
      </div>

      {/* Next action hero card */}
      {loadError && (
        <div style={{
          background: 'var(--warm-white)', border: '1px solid var(--parchment)',
          borderLeft: '4px solid var(--terracotta)', borderRadius: '14px',
          padding: '1.2rem 1.4rem', marginBottom: '1rem',
        }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Couldn't load your dashboard. <Link href="/dashboard" style={{ color: 'var(--terracotta)', fontWeight: 600, textDecoration: 'none' }}>Go to dashboard →</Link>
          </p>
        </div>
      )}
      {!summary && !loadError && (
        <div style={{
          background: 'var(--warm-white)', border: '1px solid var(--parchment)',
          borderLeft: '4px solid var(--parchment)', borderRadius: '14px',
          padding: '1.2rem 1.4rem', marginBottom: '1rem',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <Shimmer w="120px" h={11} radius={4} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <Shimmer w="55%" h={18} radius={5} />
              <Shimmer w="75%" h={13} radius={4} />
            </div>
            <Shimmer w="90px" h={34} radius={99} />
          </div>
        </div>
      )}
      {nextAction ? (
        <div style={{
          background: 'var(--warm-white)',
          border: '1px solid var(--parchment)',
          borderLeft: '4px solid var(--terracotta)',
          borderRadius: '14px',
          padding: '1.2rem 1.4rem',
          marginBottom: '1rem',
        }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--terracotta)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            📍 Your next action
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: "'Lora', serif", fontWeight: 600, color: 'var(--brown-dark)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                {nextAction.emoji} {nextAction.title}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '46ch' }}>{nextAction.body}</p>
            </div>
            <Link href={nextAction.href} style={{
              padding: '0.45rem 1rem', borderRadius: '99px',
              background: 'var(--terracotta)', color: 'white',
              fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0,
            }}>
              {nextAction.cta}
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ height: '80px', background: 'var(--parchment)', borderRadius: '14px', marginBottom: '1rem', opacity: 0.5 }} />
      )}

      {/* Today strip */}
      {todayCards.length > 0 && (
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            ⚡ Today
          </p>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
            {todayCards.map(c => (
              <Link key={c.label} href={c.href} style={{
                flex: 1, minWidth: '140px',
                padding: '0.8rem 1rem',
                background: 'var(--warm-white)',
                border: '1px solid var(--parchment)',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'block',
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{c.emoji}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brown-dark)' }}>{c.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{c.body}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Progress strip */}
      {summary && (
        <div style={{ marginTop: '1rem', fontSize: '0.83rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>📊 Applications: <strong style={{ color: 'var(--brown-dark)' }}>{summary.applicationCount}</strong></span>
          <span>Interviews: <strong style={{ color: 'var(--brown-dark)' }}>{summary.interviewCount}</strong></span>
          <Link href="/dashboard" style={{ color: 'var(--terracotta)', textDecoration: 'none', fontWeight: 600, marginLeft: 'auto' }}>
            Full dashboard →
          </Link>
        </div>
      )}

      {/* Personalised Roadmap — only when onboarding complete */}
      {summary?.onboardingCompleted && summary.onboardingRole && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
              🗺 Your learning roadmap
            </p>
            {roadmapImage && (
              <button
                onClick={() => { setRoadmapImage(null); generateRoadmap(); }}
                style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                regenerate
              </button>
            )}
          </div>

          {roadmapImage ? (
            <MermaidDiagram chart={roadmapImage} />
          ) : roadmapLoading ? (
            <div style={{
              width: '100%', height: '180px',
              borderRadius: '12px', overflow: 'hidden',
              background: 'linear-gradient(90deg, var(--parchment) 25%, #f5ece0 50%, var(--parchment) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Generating your roadmap…</span>
            </div>
          ) : roadmapError ? (
            <div style={{ padding: '1rem', background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Couldn't generate roadmap. <button onClick={generateRoadmap} style={{ background: 'none', border: 'none', color: 'var(--terracotta)', cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>Try again</button>
            </div>
          ) : (
            <button
              onClick={generateRoadmap}
              style={{
                width: '100%', padding: '1rem',
                background: 'rgba(192,40,28,0.04)', border: '1px dashed var(--parchment)',
                borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600,
                color: 'var(--terracotta)', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ✨ Generate my personalised roadmap
            </button>
          )}
        </div>
      )}
    </section>
  );
}
