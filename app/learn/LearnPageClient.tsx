'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { SkillPath } from '@/lib/skill-paths';
import PathProgress from './PathProgress';

const LS_KEY = 'techpath_enrolled_paths';

/* ── Framer variants — use string easing to satisfy TS ─────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const stepVariant = (delay: number) => ({
  hidden:  { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { delay, duration: 0.38, ease: 'easeOut' as const } },
  exit:    { opacity: 0, x: -8,  transition: { duration: 0.12 } },
});

const arrowVariant = (delay: number) => ({
  hidden:  { scaleY: 0, opacity: 0 },
  visible: { scaleY: 1, opacity: 1, transition: { delay, duration: 0.22, ease: 'easeOut' as const } },
  exit:    { scaleY: 0, opacity: 0, transition: { duration: 0.1 } },
});

const pathCardVariant = (delay: number) => ({
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay, type: 'spring' as const, stiffness: 300, damping: 26 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.12 } },
});

/* ── Static data ─────────────────────────────────────────────── */
const STEPS = [
  { n: '1', label: 'Tick a skill',      body: 'Check it off when you feel confident with the material.' },
  { n: '2', label: 'Build the project', body: 'Each skill has a small project. Building is how you really learn.' },
  { n: '3', label: 'Get reminded',      body: 'You\'ll get a browser notification at day 3 and day 7 to review.' },
  { n: '4', label: 'Review five times', body: 'After five reviews spread over 30 days, it\'s marked as mastered.' },
];

const demandColor: Record<string, string> = {
  'Very High': '#10b981', 'High': '#f59e0b', 'Medium': '#6b7280',
};

const PATH_ACCENTS: Record<string, { bg: string; border: string; accent: string }> = {
  'junior-frontend':  { bg: 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)', border: '#0ea5e9', accent: '#38bdf8' },
  'junior-fullstack': { bg: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)', border: '#7c3aed', accent: '#a78bfa' },
  'junior-backend':   { bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', border: '#059669', accent: '#34d399' },
  'data-engineer':    { bg: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)', border: '#d97706', accent: '#fbbf24' },
  'devops-cloud':     { bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', border: '#4338ca', accent: '#818cf8' },
};

/* ── Helpers ──────────────────────────────────────────────────── */
function getEnrolledLocal(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); } catch { return []; }
}
function saveEnrolledLocal(paths: string[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(paths)); } catch { /* SSR/private */ }
}

/* ── Animated arrow between steps ───────────────────────────── */
function StepArrow({ delay }: { delay: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
      <motion.div
        variants={arrowVariant(delay)}
        initial="hidden" animate="visible" exit="exit"
        style={{ transformOrigin: 'top', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ width: '2px', height: '24px', background: 'var(--terracotta)', opacity: 0.5, borderRadius: '1px' }} />
        <svg width="10" height="6" viewBox="0 0 10 6" style={{ marginTop: '-1px' }}>
          <path d="M0 0L5 6L10 0" fill="var(--terracotta)" fillOpacity={0.5} />
        </svg>
      </motion.div>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────── */
export default function LearnPageClient({ paths }: { paths: SkillPath[] }) {
  const router = useRouter();
  const { user } = useAuth();

  const [howOpen,   setHowOpen]   = useState(false);
  const [pathsOpen, setPathsOpen] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolled,  setEnrolled]  = useState<string[]>([]);

  const roadmapRef = useRef<HTMLElement>(null);

  /* Load enrolled paths */
  useEffect(() => {
    if (user) {
      supabase.from('user_active_paths').select('path_id').eq('user_id', user.id)
        .then(({ data }) => { if (data) setEnrolled(data.map(r => r.path_id)); });
    } else {
      setEnrolled(getEnrolledLocal());
    }
  }, [user]);

  /* Migrate localStorage → Supabase on sign-in */
  useEffect(() => {
    if (!user) return;
    const local = getEnrolledLocal();
    if (local.length === 0) return;
    supabase.from('user_active_paths')
      .upsert(local.map(path_id => ({ user_id: user.id, path_id })), { onConflict: 'user_id,path_id', ignoreDuplicates: true })
      .then(() => saveEnrolledLocal([]));
  }, [user]);

  async function enroll(pathId: string) {
    if (enrolling) return;
    setEnrolling(pathId);
    setEnrolled(prev => prev.includes(pathId) ? prev : [...prev, pathId]);
    if (user) {
      await supabase.from('user_active_paths')
        .upsert({ user_id: user.id, path_id: pathId }, { onConflict: 'user_id,path_id', ignoreDuplicates: true });
    } else {
      saveEnrolledLocal([...new Set([...getEnrolledLocal(), pathId])]);
    }
    router.push(`/learn/${pathId}`);
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.section variants={fadeUp} initial="hidden" animate="visible"
        style={{ paddingTop: '4.5rem', paddingBottom: '2.5rem' }}
      >
        <h1 style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700,
          color: 'var(--brown-dark)', lineHeight: 1.15, marginBottom: '1rem',
        }}>
          IT Career Pathways
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '52ch' }}>
          Skill roadmaps for landing your first IT job in Australia. Tick off what you know,
          get reminded to review at the right intervals, and actually make it stick.
        </p>
      </motion.section>

      {/* ── How it works (accordion) ─────────────────────────── */}
      <motion.section variants={fadeUp} initial="hidden" animate="visible"
        style={{ marginBottom: '2.5rem' }}
      >
        <motion.button
          onClick={() => setHowOpen(o => !o)}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            background: 'var(--warm-white)',
            border: `1.5px solid ${howOpen ? 'var(--terracotta)' : 'var(--parchment)'}`,
            borderRadius: howOpen ? '12px 12px 0 0' : '12px',
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'border-color 0.2s, border-radius 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⚙️</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--brown-dark)' }}>How it works</span>
          </div>
          <motion.svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            animate={{ rotate: howOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <path d="M3 5L7 9L11 5" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {howOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                border: '1.5px solid var(--terracotta)', borderTop: 'none',
                borderRadius: '0 0 12px 12px',
                padding: '1.4rem 1.5rem 1.5rem',
                background: 'var(--warm-white)',
              }}>
                {/* Vertical steps with animated arrows */}
                {STEPS.map((step, i) => {
                  const stepDelay  = i * 0.38;
                  const arrowDelay = i * 0.38 + 0.28;
                  return (
                    <div key={step.n}>
                      <motion.div
                        variants={stepVariant(stepDelay)}
                        initial="hidden" animate="visible" exit="exit"
                        style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                      >
                        <span style={{
                          fontFamily: "'Lora', serif", fontSize: '1rem', fontWeight: 700,
                          color: 'var(--terracotta)', minWidth: '1.4rem', paddingTop: '1px',
                        }}>{step.n}.</span>
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.2rem' }}>
                            {step.label}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                            {step.body}
                          </div>
                        </div>
                      </motion.div>

                      {i < STEPS.length - 1 && <StepArrow delay={arrowDelay} />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ── IT Roadmap — path picker ──────────────────────────── */}
      <motion.section
        ref={roadmapRef}
        variants={fadeUp} initial="hidden" animate="visible"
        style={{ scrollMarginTop: '90px', marginBottom: '3rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
              🗺 IT Roadmap
            </p>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--brown-dark)', lineHeight: 1.2 }}>
              Choose your career path
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              5 paths built for the Australian IT market. Structured, skill-by-skill, with spaced repetition.
            </p>
          </div>
          <motion.button
            onClick={() => setPathsOpen(o => !o)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.55rem 1.2rem', borderRadius: '99px',
              background: pathsOpen ? 'var(--terracotta)' : 'var(--warm-white)',
              color: pathsOpen ? 'white' : 'var(--text-secondary)',
              border: pathsOpen ? 'none' : '1.5px solid var(--parchment)',
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: pathsOpen ? '2px 2px 0 rgba(20,10,5,0.25)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            {pathsOpen ? 'Hide paths' : 'Browse paths →'}
          </motion.button>
        </div>

        {/* Expanded: dark path cards */}
        <AnimatePresence>
          {pathsOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              {paths.map((path, i) => {
                const acc = PATH_ACCENTS[path.id] ?? { bg: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '#475569', accent: '#94a3b8' };
                const isEnrolled = enrolled.includes(path.id);
                const isLoading  = enrolling === path.id;
                const totalSkills = path.phases.flatMap(p => p.skills).length;

                return (
                  <motion.div key={path.id} variants={pathCardVariant(i * 0.08)} initial="hidden" animate="visible" exit="exit">
                    <motion.button
                      onClick={() => enroll(path.id)}
                      whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                      disabled={!!enrolling}
                      style={{
                        width: '100%', textAlign: 'left', cursor: enrolling ? 'wait' : 'pointer',
                        background: acc.bg,
                        border: `2px solid ${isEnrolled ? acc.accent : acc.border}`,
                        borderRadius: '14px', padding: '1.3rem 1.5rem',
                        fontFamily: 'inherit', position: 'relative', overflow: 'hidden',
                        boxShadow: isEnrolled ? `0 4px 20px ${acc.border}50` : 'none',
                        transition: 'box-shadow 0.2s ease',
                      }}
                    >
                      <div style={{ position: 'absolute', top: '-15px', right: '20px', width: '80px', height: '80px', borderRadius: '50%', background: `${acc.accent}20`, filter: 'blur(20px)', pointerEvents: 'none' }} />
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.4rem' }}>{path.emoji}</span>
                            <span style={{ fontFamily: "'Lora', serif", fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{path.title}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: demandColor[path.demand], background: `${demandColor[path.demand]}20`, padding: '0.15em 0.55em', borderRadius: '4px' }}>
                              {path.demand} Demand
                            </span>
                            {isEnrolled && (
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: acc.accent, background: `${acc.accent}20`, padding: '0.15em 0.55em', borderRadius: '4px' }}>
                                ✓ Enrolled
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.83rem', color: 'rgba(248,250,252,0.7)', lineHeight: 1.55, marginBottom: '0.85rem', maxWidth: '52ch' }}>
                            {path.description}
                          </p>
                          <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {[
                              { label: 'Timeline',   val: path.timeline },
                              { label: 'Avg salary', val: path.avgSalary },
                              { label: 'Skills',     val: `${totalSkills} total` },
                            ].map(stat => (
                              <div key={stat.label}>
                                <div style={{ fontSize: '0.62rem', color: 'rgba(248,250,252,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{stat.val}</div>
                              </div>
                            ))}
                            <PathProgress pathId={path.id} />
                          </div>
                        </div>
                        <motion.span
                          animate={isLoading ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                          transition={isLoading ? { repeat: Infinity, duration: 0.7 } : {}}
                          style={{ background: acc.accent, color: '#0f172a', padding: '0.4rem 1.1rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}
                        >
                          {isLoading ? '…' : isEnrolled ? 'Continue →' : 'Start →'}
                        </motion.span>
                      </div>
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed: compact list */}
        {!pathsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--parchment)', borderRadius: '14px', overflow: 'hidden' }}
          >
            {paths.map((path, i) => (
              <motion.div key={path.id} whileHover={{ backgroundColor: 'var(--parchment)' }}
                style={{ background: 'var(--warm-white)', padding: '1.1rem 1.4rem', borderBottom: i < paths.length - 1 ? '1px solid var(--parchment)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => { setPathsOpen(true); setTimeout(() => enroll(path.id), 350); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{path.emoji}</span>
                    <div>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--brown-dark)' }}>{path.title}</span>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: 700, color: demandColor[path.demand] }}>{path.demand}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <PathProgress pathId={path.id} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* ── Claude Code + YouTube — stacked vertically ─────────── */}
      <motion.section variants={fadeUp} initial="hidden" animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingBottom: '5rem' }}
      >
        {/* Claude Code card */}
        <Link href="/learn/claude-code" style={{ textDecoration: 'none' }}>
          <motion.div
            initial="rest" whileHover="hover" whileTap={{ scale: 0.99 }}
            style={{
              background: 'linear-gradient(135deg, #431407 0%, #7c2d12 55%, #c2410c 100%)',
              border: '1px solid #ea580c', borderRadius: '14px',
              padding: '1.4rem 1.6rem', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: '-10px', right: '40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(234,88,12,0.3)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            {/* Claude logo — slides in on hover */}
            <motion.div
              variants={{ rest: { x: 18, opacity: 0 }, hover: { x: 0, opacity: 0.2 } }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ position: 'absolute', top: '1rem', right: '1.3rem', pointerEvents: 'none' }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="white" />
                {/* Anthropic asterisk / star mark */}
                {[0,45,90,135].map(deg => (
                  <rect key={deg} x="29.5" y="10" width="5" height="44" rx="2.5" fill="#c2410c"
                    transform={`rotate(${deg} 32 32)`} />
                ))}
              </svg>
            </motion.div>
            <div style={{ position: 'relative', flex: 1 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fed7aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                New — Interactive Guide
              </p>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: '1.05rem', fontWeight: 700, color: '#fff7ed', marginBottom: '0.3rem' }}>
                Master Claude Code
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#fdba74', lineHeight: 1.55, marginBottom: '0.7rem' }}>
                30 hands-on lessons from install to building AI-powered dev tools.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                {['🌱 Foundation', '⚡ Core Skills', '🔥 Power User', '🏆 Master'].map(tag => (
                  <span key={tag} style={{ fontSize: '0.68rem', fontWeight: 600, color: '#fed7aa', background: 'rgba(255,255,255,0.1)', padding: '0.2em 0.55em', borderRadius: '5px' }}>{tag}</span>
                ))}
              </div>
            </div>
            <span style={{ alignSelf: 'flex-start', background: '#ea580c', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 12px rgba(234,88,12,0.4)', position: 'relative' }}>
              Start learning →
            </span>
          </motion.div>
        </Link>

        {/* YouTube card */}
        <Link href="/learn/youtube" style={{ textDecoration: 'none' }}>
          <motion.div
            initial="rest" whileHover="hover" whileTap={{ scale: 0.99 }}
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
              border: '1px solid #334155', borderRadius: '14px',
              padding: '1.4rem 1.6rem', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: '-10px', right: '40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,0,0,0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            {/* YouTube logo — slides in on hover */}
            <motion.div
              variants={{ rest: { x: 18, opacity: 0 }, hover: { x: 0, opacity: 0.22 } }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ position: 'absolute', top: '1rem', right: '1.3rem', pointerEvents: 'none' }}
            >
              <svg width="64" height="46" viewBox="0 0 64 46" fill="none">
                <rect width="64" height="46" rx="10" fill="#FF0000" />
                <polygon points="26,13 26,33 44,23" fill="white" />
              </svg>
            </motion.div>
            <div style={{ flex: 1, position: 'relative' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Video Learning
              </p>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.3rem' }}>
                Learn from YouTube
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: '1.2rem' }}>
                Paste any YouTube URL — Gemini builds your study guide + quiz.
              </p>
            </div>
            <span style={{ alignSelf: 'flex-start', background: 'var(--terracotta)', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600 }}>
              Start learning →
            </span>
          </motion.div>
        </Link>

        {/* GitHub Skills card */}
        <Link href="/learn/github" style={{ textDecoration: 'none' }}>
          <motion.div
            initial="rest" whileHover="hover" whileTap={{ scale: 0.99 }}
            style={{
              background: 'linear-gradient(135deg, #0d1117 0%, #161b22 55%, #1f2a1b 100%)',
              border: '1px solid #238636', borderRadius: '14px',
              padding: '1.4rem 1.6rem', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: '-10px', right: '40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(35,134,54,0.25)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            {/* GitHub Octocat mark — slides in on hover */}
            <motion.div
              variants={{ rest: { x: 18, opacity: 0 }, hover: { x: 0, opacity: 0.18 } }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ position: 'absolute', top: '0.8rem', right: '1.2rem', pointerEvents: 'none' }}
            >
              <svg width="64" height="64" viewBox="0 0 16 16" fill="white">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </motion.div>
            <div style={{ position: 'relative', flex: 1 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3fb950', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Official Courses — 37 Total
              </p>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: '1.05rem', fontWeight: 700, color: '#f0f6fc', marginBottom: '0.3rem' }}>
                GitHub Skills Guide
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#8b949e', lineHeight: 1.55, marginBottom: '0.7rem' }}>
                All 37 official GitHub Skills courses — from Git basics to Copilot, Actions &amp; DevSecOps.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                {['🌱 Foundation', '⚡ Collaboration', '🔧 Actions', '🤖 Copilot'].map(tag => (
                  <span key={tag} style={{ fontSize: '0.68rem', fontWeight: 600, color: '#3fb950', background: 'rgba(63,185,80,0.12)', padding: '0.2em 0.55em', borderRadius: '5px' }}>{tag}</span>
                ))}
              </div>
            </div>
            <span style={{ alignSelf: 'flex-start', background: '#238636', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 12px rgba(35,134,54,0.4)', position: 'relative' }}>
              Start learning →
            </span>
          </motion.div>
        </Link>

        {/* Visual System Design card */}
        <Link href="/learn/diagrams" style={{ textDecoration: 'none' }}>
          <motion.div
            initial="rest" whileHover="hover" whileTap={{ scale: 0.99 }}
            style={{
              background: 'linear-gradient(135deg, #0c1a2e 0%, #1a2744 55%, #0f2233 100%)',
              border: '1px solid #3b6ea8', borderRadius: '14px',
              padding: '1.4rem 1.6rem', position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: '-10px', right: '40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(59,110,168,0.25)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            {/* Diagram icon — slides in on hover */}
            <motion.div
              variants={{ rest: { x: 18, opacity: 0 }, hover: { x: 0, opacity: 0.18 } }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ position: 'absolute', top: '1rem', right: '1.3rem', pointerEvents: 'none' }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="8" width="20" height="12" rx="3" fill="white" />
                <rect x="36" y="8" width="20" height="12" rx="3" fill="white" />
                <rect x="22" y="44" width="20" height="12" rx="3" fill="white" />
                <line x1="18" y1="20" x2="32" y2="44" stroke="white" strokeWidth="2.5" />
                <line x1="46" y1="20" x2="32" y2="44" stroke="white" strokeWidth="2.5" />
              </svg>
            </motion.div>
            <div style={{ position: 'relative', flex: 1 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7eb8f7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Daily Diagrams — Updated Every Day
              </p>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: '1.05rem', fontWeight: 700, color: '#e8f4ff', marginBottom: '0.3rem' }}>
                Visual System Design
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#8db8d8', lineHeight: 1.55, marginBottom: '0.7rem' }}>
                Software engineering concepts explained with Mermaid diagrams. CDN, OAuth, databases, microservices — ByteByteGo style.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                {['🌐 Networking', '🗄️ Databases', '⚙️ System Design', '🔐 Security'].map(tag => (
                  <span key={tag} style={{ fontSize: '0.68rem', fontWeight: 600, color: '#7eb8f7', background: 'rgba(126,184,247,0.1)', padding: '0.2em 0.55em', borderRadius: '5px' }}>{tag}</span>
                ))}
              </div>
            </div>
            <span style={{ alignSelf: 'flex-start', background: '#3b6ea8', color: 'white', padding: '0.5rem 1.1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 2px 12px rgba(59,110,168,0.4)', position: 'relative' }}>
              Explore diagrams →
            </span>
          </motion.div>
        </Link>
      </motion.section>

    </div>
  );
}
