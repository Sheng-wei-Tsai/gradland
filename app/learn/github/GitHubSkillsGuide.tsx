'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GITHUB_LEVELS, ALL_GH_COURSES, TOTAL_GH_COURSES } from '@/lib/github-skills';
import type { GitHubCourse } from '@/lib/github-skills';

// ─── Storage ──────────────────────────────────────────────────
const STORAGE_KEY = 'github_skills_done';
function loadProgress(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')); }
  catch { return new Set(); }
}
function saveProgress(done: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
}

// ─── Ring ─────────────────────────────────────────────────────
function Ring({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--parchment)" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round" strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  );
}

// ─── Prereq tag ───────────────────────────────────────────────
function PrereqTag({ courseId }: { courseId: string }) {
  const course = ALL_GH_COURSES.find(c => c.id === courseId);
  if (!course) return null;
  return (
    <span style={{
      fontSize: '0.72rem', fontWeight: 600,
      background: 'rgba(31,136,61,0.1)', color: '#1f883d',
      border: '1px solid rgba(31,136,61,0.25)',
      padding: '0.15em 0.55em', borderRadius: '5px', whiteSpace: 'nowrap',
    }}>
      {course.emoji} {course.title}
    </span>
  );
}

// ─── Topic chip ───────────────────────────────────────────────
function TopicChip({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 600,
      background: 'var(--parchment)', color: 'var(--text-muted)',
      padding: '0.15em 0.5em', borderRadius: '4px',
    }}>
      {label}
    </span>
  );
}

// ─── Course accordion card ────────────────────────────────────
function CourseCard({
  course, idx, levelColor, levelColorRgb, isDone, isOpen,
  onToggleOpen, onToggleDone, onMarkDoneNext,
}: {
  course: GitHubCourse;
  idx: number;
  levelColor: string;
  levelColorRgb: string;
  isDone: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleDone: () => void;
  onMarkDoneNext: () => void;
}) {
  return (
    <div style={{
      border: `1.5px solid ${isOpen ? `rgba(${levelColorRgb},0.38)` : 'var(--parchment)'}`,
      borderRadius: '12px', overflow: 'hidden',
      background: 'var(--warm-white)',
      boxShadow: isOpen ? `0 2px 12px rgba(${levelColorRgb},0.09)` : 'none',
      transition: 'all 0.2s ease',
    }}>
      {/* Header row */}
      <button
        onClick={onToggleOpen}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem',
          padding: '1rem 1.1rem', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Done / number circle */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isDone ? 'rgba(30,122,82,0.12)' : isOpen ? levelColor : 'var(--parchment)',
          color: isDone ? 'var(--jade)' : isOpen ? 'white' : 'var(--text-muted)',
          fontSize: isDone ? '0.9rem' : '0.78rem', fontWeight: 700,
          border: isDone ? '1.5px solid var(--jade)' : 'none',
          transition: 'all 0.2s ease',
        }}>
          {isDone ? '✓' : idx + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>{course.emoji}</span>
            <span style={{
              fontWeight: 700, fontSize: '0.92rem',
              color: isDone ? 'var(--jade)' : 'var(--brown-dark)',
              textDecoration: isDone ? 'line-through' : 'none',
            }}>
              {course.title}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            {course.duration}
          </div>
        </div>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div style={{ padding: '0 1.1rem 1.2rem', borderTop: `1px solid rgba(${levelColorRgb},0.15)` }}>

          {/* Description */}
          <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '1rem 0 0.9rem' }}>
            {course.description}
          </p>

          {/* What you'll learn */}
          <div style={{
            background: `rgba(${levelColorRgb},0.05)`,
            border: `1px solid rgba(${levelColorRgb},0.19)`,
            borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '0.85rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: levelColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
              📖 What you&apos;ll learn
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {course.whatYoullLearn.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start' }}>
                  <span style={{ color: levelColor, fontWeight: 700, fontSize: '0.75rem', marginTop: '0.2rem', flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What you'll build */}
          <div style={{
            background: 'rgba(200,138,20,0.07)',
            border: '1px solid rgba(200,138,20,0.25)',
            borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.85rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>
              🔨 What you&apos;ll build
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {course.whatYoullBuild}
            </p>
          </div>

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
                Prerequisites
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {course.prerequisites.map(id => <PrereqTag key={id} courseId={id} />)}
              </div>
            </div>
          )}

          {/* Topics */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.1rem' }}>
            {course.topics.map(t => <TopicChip key={t} label={t} />)}
          </div>

          {/* Footer: Start on GitHub + Mark complete */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
            <a
              href={course.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="github-skills-start-link"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 1rem', borderRadius: '99px',
                background: '#1f883d', color: 'white',
                fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
              }}
            >
              Start on GitHub →
            </a>

            <button
              onClick={() => {
                onToggleDone();
                if (!isDone) onMarkDoneNext();
              }}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '99px', fontSize: '0.82rem',
                fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: isDone ? 'rgba(30,122,82,0.12)' : levelColor,
                color: isDone ? 'var(--jade)' : 'white',
                transition: 'all 0.2s ease',
              }}
            >
              {isDone ? '✓ Completed' : 'Mark complete →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function GitHubSkillsGuide() {
  const [done,        setDone]        = useState<Set<string>>(new Set());
  const [activeLevel, setActiveLevel] = useState(0);
  const [openCourse,  setOpenCourse]  = useState<string | null>(GITHUB_LEVELS[0].courses[0].id);
  const [mounted,     setMounted]     = useState(false);
  const levelRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); setDone(loadProgress()); }, []);

  /* Scroll active level tab to far-left on change */
  useEffect(() => {
    const row = levelRowRef.current;
    if (!row) return;
    const active = row.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (!active) return;
    const rowLeft = row.getBoundingClientRect().left;
    const btnLeft = active.getBoundingClientRect().left;
    row.scrollBy({ left: btnLeft - rowLeft - 12, behavior: 'smooth' });
  }, [activeLevel]);

  const toggleDone = useCallback((id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveProgress(next);
      return next;
    });
  }, []);

  const totalDone  = mounted ? ALL_GH_COURSES.filter(c => done.has(c.id)).length : 0;
  const overallPct = Math.round((totalDone / TOTAL_GH_COURSES) * 100);
  const level      = GITHUB_LEVELS[activeLevel];

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem', paddingBottom: '6rem' }}>

      {/* ── Hero ── */}
      <section style={{ paddingTop: '4.5rem', paddingBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1f883d', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Interactive Guide — Official GitHub Skills Courses
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, color: 'var(--brown-dark)', lineHeight: 1.15, marginBottom: '0.75rem' }}>
              GitHub Skills Learning Guide
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '50ch' }}>
              {TOTAL_GH_COURSES} official hands-on courses across 6 levels — from Git basics to Copilot, Actions &amp; DevSecOps. Each course is a GitHub template repo with automated step-checking. Tick each course as you complete it.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <a href="https://skills.github.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#1f883d', fontWeight: 600, textDecoration: 'none' }}>
                GitHub Skills ↗
              </a>
              <a href="https://docs.github.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#1f883d', fontWeight: 600, textDecoration: 'none' }}>
                GitHub Docs ↗
              </a>
              <a href="https://github.com/skills" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#1f883d', fontWeight: 600, textDecoration: 'none' }}>
                Skills org ↗
              </a>
            </div>
          </div>

          {/* Overall progress ring */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <Ring pct={overallPct} color="#1f883d" size={80} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)', lineHeight: 1 }}>{overallPct}%</span>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{totalDone}/{TOTAL_GH_COURSES} done</div>
          </div>
        </div>
      </section>

      {/* ── Level tabs ── */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: '2px', width: '3rem', background: 'linear-gradient(to right, transparent, var(--cream))', pointerEvents: 'none', zIndex: 1 }} />
        <div ref={levelRowRef} style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px', paddingRight: '2rem' }}>
          {GITHUB_LEVELS.map((lv, i) => {
            const lvDone = mounted ? lv.courses.filter(c => done.has(c.id)).length : 0;
            const lvPct  = Math.round((lvDone / lv.courses.length) * 100);
            const active = activeLevel === i;
            return (
              <button
                key={lv.id}
                data-active={active ? 'true' : 'false'}
                onClick={() => { setActiveLevel(i); setOpenCourse(lv.courses[0].id); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 1.1rem', borderRadius: '99px', flexShrink: 0,
                  background: active ? lv.color : 'var(--warm-white)',
                  color: active ? 'white' : 'var(--text-secondary)',
                  border: active ? 'none' : '1px solid var(--parchment)',
                  fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s ease',
                  boxShadow: active ? '2px 2px 0 rgba(20,10,5,0.2)' : 'none',
                }}
              >
                <span>{lv.badge}</span>
                <span>{lv.title}</span>
                <span style={{
                  fontSize: '0.7rem', padding: '0.1em 0.45em', borderRadius: '99px',
                  background: active ? 'rgba(255,255,255,0.22)' : 'var(--parchment)',
                  color: active ? 'white' : 'var(--text-muted)', fontWeight: 700,
                }}>
                  {lvPct}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Level header ── */}
      <div style={{
        background: level.bg, borderRadius: '12px',
        padding: '1rem 1.2rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{level.badge}</div>
        <div>
          <div style={{ fontWeight: 700, color: level.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{level.title}</div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{level.summary}</div>
        </div>
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          {(() => {
            const lvDone = mounted ? level.courses.filter(c => done.has(c.id)).length : 0;
            const lvPct  = Math.round((lvDone / level.courses.length) * 100);
            return (
              <div style={{ textAlign: 'center' }}>
                <Ring pct={lvPct} color={level.color} size={44} />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {lvDone}/{level.courses.length}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Courses accordion ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {level.courses.map((course, idx) => (
          <CourseCard
            key={course.id}
            course={course}
            idx={idx}
            levelColor={level.color}
            levelColorRgb={level.colorRgb}
            isDone={mounted && done.has(course.id)}
            isOpen={openCourse === course.id}
            onToggleOpen={() => setOpenCourse(openCourse === course.id ? null : course.id)}
            onToggleDone={() => toggleDone(course.id)}
            onMarkDoneNext={() => {
              const next = level.courses[idx + 1];
              if (next) setTimeout(() => setOpenCourse(next.id), 300);
            }}
          />
        ))}
      </div>

      {/* ── Level complete banner ── */}
      {mounted && level.courses.every(c => done.has(c.id)) && (
        <div style={{
          marginTop: '1.5rem', padding: '1.2rem', borderRadius: '12px',
          background: level.bg, border: `1.5px solid rgba(${level.colorRgb},0.25)`, textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🎉</div>
          <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, color: level.color, marginBottom: '0.3rem' }}>
            {level.title} complete!
          </div>
          {activeLevel < GITHUB_LEVELS.length - 1 && (
            <button
              onClick={() => {
                setActiveLevel(a => a + 1);
                setOpenCourse(GITHUB_LEVELS[activeLevel + 1].courses[0].id);
              }}
              style={{
                marginTop: '0.5rem', padding: '0.5rem 1.4rem', borderRadius: '99px',
                background: level.color, color: 'white', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 600, fontSize: '0.88rem',
              }}
            >
              Continue to {GITHUB_LEVELS[activeLevel + 1].title} {GITHUB_LEVELS[activeLevel + 1].badge}
            </button>
          )}
          {activeLevel === GITHUB_LEVELS.length - 1 && (
            <div style={{ fontSize: '0.88rem', color: level.color, fontWeight: 600 }}>
              You&apos;ve completed all {TOTAL_GH_COURSES} GitHub Skills courses. Ship something great. 🚀
            </div>
          )}
        </div>
      )}
    </div>
  );
}
