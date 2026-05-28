'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/lib/posts';

interface Props {
  lessons: Post[];
}

interface ProgressRow {
  lesson_slug:     string;
  terminal_passed: boolean;
  quiz_score:      number;
  quiz_total:      number;
}

const NODE_RADIUS  = 44;
const CANVAS_WIDTH = 1900;
const TIER_LABELS  = ['Foundation', 'Daily flow', 'Power', 'Mastery'];
const TIER_Y       = [80, 320, 600, 880];

type NodeState = 'locked' | 'available' | 'done';

function stateColors(state: NodeState) {
  if (state === 'done') {
    return { fill: 'var(--jade)', stroke: 'var(--brown-dark)', text: 'white', shadow: '0 4px 12px rgba(30,122,82,0.30)' };
  }
  if (state === 'available') {
    return { fill: 'var(--warm-white)', stroke: 'var(--terracotta)', text: 'var(--brown-dark)', shadow: '0 4px 12px rgba(192,40,28,0.18)' };
  }
  return { fill: '#e8e0d0', stroke: '#b8a988', text: '#888272', shadow: 'none' };
}

export default function SkillTree({ lessons }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [progressBySlug, setProgressBySlug] = useState<Record<string, ProgressRow>>({});

  useEffect(() => {
    if (!user) { setProgressBySlug({}); return; }
    supabase
      .from('claude_code_lesson_progress')
      .select('lesson_slug, terminal_passed, quiz_score, quiz_total')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const map: Record<string, ProgressRow> = {};
        (data ?? []).forEach(row => { map[row.lesson_slug] = row; });
        setProgressBySlug(map);
      });
  }, [user]);

  /**
   * A lesson is "done" when its terminal is passed AND quiz is full marks.
   * That matches the LessonShell XP-award logic.
   */
  const doneSet = useMemo(() => {
    const s = new Set<string>();
    for (const lesson of lessons) {
      const p = progressBySlug[lesson.slug];
      if (p && p.terminal_passed && p.quiz_total > 0 && p.quiz_score === p.quiz_total) {
        s.add(lesson.slug);
      }
    }
    return s;
  }, [progressBySlug, lessons]);

  const nodeState = (lesson: Post): NodeState => {
    if (doneSet.has(lesson.slug)) return 'done';
    const prereqs = lesson.prerequisites ?? [];
    if (prereqs.length === 0) return 'available';
    const allDone = prereqs.every(slug => doneSet.has(slug));
    return allDone ? 'available' : 'locked';
  };

  // Map slug → position (use frontmatter, fall back to fan layout if missing)
  const positionFor = (lesson: Post, idx: number) => {
    if (lesson.position) return lesson.position;
    const tier = lesson.tier ?? 1;
    const y = TIER_Y[Math.min(tier - 1, TIER_Y.length - 1)];
    return { x: 120 + (idx % 10) * 200, y };
  };

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    lessons.forEach((l, i) => map.set(l.slug, positionFor(l, i)));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons]);

  const maxY = Math.max(...Array.from(positions.values()).map(p => p.y), 1000) + 160;

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      overflowY: 'hidden',
      background: 'linear-gradient(180deg, #fffef6 0%, #fdf5e4 100%)',
      border: 'var(--panel-border)',
      borderRadius: '14px',
      boxShadow: 'var(--panel-shadow)',
    }}>
      <svg
        viewBox={`0 0 ${CANVAS_WIDTH} ${maxY}`}
        style={{ display: 'block', width: '100%', minWidth: '900px', height: maxY * 0.55 }}
        role="img"
        aria-label="Claude Code skill tree"
      >
        {/* Tier guide rows */}
        {TIER_Y.map((y, i) => (
          <g key={y}>
            <line x1={0} y1={y + NODE_RADIUS + 60} x2={CANVAS_WIDTH} y2={y + NODE_RADIUS + 60} stroke="#e8d5a8" strokeDasharray="4 8" strokeWidth={1} />
            <text x={16} y={y + 6} fontSize={13} fontWeight={700} fill="var(--text-muted)" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {TIER_LABELS[i]}
            </text>
          </g>
        ))}

        {/* Prerequisite lines */}
        {lessons.flatMap(lesson => {
          const to = positions.get(lesson.slug);
          if (!to) return [];
          return (lesson.prerequisites ?? []).map(prereqSlug => {
            const from = positions.get(prereqSlug);
            if (!from) return null;
            const done = doneSet.has(prereqSlug) && doneSet.has(lesson.slug);
            return (
              <line
                key={`${prereqSlug}-${lesson.slug}`}
                x1={from.x} y1={from.y + NODE_RADIUS / 2}
                x2={to.x}   y2={to.y - NODE_RADIUS / 2}
                stroke={done ? 'var(--jade)' : '#c9b794'}
                strokeWidth={done ? 2.5 : 1.6}
                strokeDasharray={done ? '0' : '6 6'}
              />
            );
          });
        })}

        {/* Nodes */}
        {lessons.map(lesson => {
          const pos = positions.get(lesson.slug)!;
          const state = nodeState(lesson);
          const colors = stateColors(state);
          return (
            <g
              key={lesson.slug}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => state !== 'locked' && router.push(`/learn/claude-skills/${lesson.slug}`)}
              style={{ cursor: state === 'locked' ? 'not-allowed' : 'pointer' }}
            >
              <circle r={NODE_RADIUS} fill={colors.fill} stroke={colors.stroke} strokeWidth={3} />
              <text x={0} y={-4} textAnchor="middle" fontSize={11} fontWeight={700} fill={colors.text}>
                {(lesson.shortLabel ?? lesson.title).slice(0, 12)}
              </text>
              <text x={0} y={14} textAnchor="middle" fontSize={10} fill={colors.text} opacity={0.75}>
                {lesson.xpReward ?? 30} XP
              </text>
              {state === 'done' && (
                <g transform={`translate(${NODE_RADIUS - 12}, ${-NODE_RADIUS + 12})`}>
                  <circle r={11} fill="var(--jade)" stroke="white" strokeWidth={2} />
                  <text x={0} y={4} textAnchor="middle" fontSize={12} fill="white" fontWeight={700}>✓</text>
                </g>
              )}
              {state === 'locked' && (
                <g transform={`translate(${NODE_RADIUS - 12}, ${-NODE_RADIUS + 12})`}>
                  <circle r={11} fill="#b8a988" stroke="white" strokeWidth={2} />
                  <text x={0} y={4} textAnchor="middle" fontSize={11} fill="white">🔒</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <Legend />
    </div>
  );
}

function Legend() {
  return (
    <div style={{
      display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'center',
      padding: '0.75rem 1rem',
      borderTop: '1px solid var(--parchment)',
      fontSize: '0.78rem', color: 'var(--text-muted)',
    }}>
      <LegendItem fill="var(--warm-white)" stroke="var(--terracotta)" label="Available" />
      <LegendItem fill="#e8e0d0" stroke="#b8a988" label="Locked — finish prerequisite" />
      <LegendItem fill="var(--jade)" stroke="var(--brown-dark)" label="Done" />
      <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
        Solid lines = path completed. Dashed = next step.
      </span>
    </div>
  );
}

function LegendItem({ fill, stroke, label }: { fill: string; stroke: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{
        display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%',
        background: fill, border: `2px solid ${stroke}`,
      }} />
      {label}
    </span>
  );
}
