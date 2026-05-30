'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import TerminalSim from './TerminalSim';
import Quiz from './Quiz';
import type { TerminalScenario, QuizQuestion } from '@/lib/posts';

interface Props {
  slug:              string;
  xpReward:          number;
  terminalScenario?: TerminalScenario;
  quiz?:             QuizQuestion[];
  /** MDX body, already pre-rendered as ReactNode by the server. */
  children:          React.ReactNode;
}

interface ProgressRow {
  terminal_passed: boolean;
  quiz_score:      number;
  quiz_total:      number;
  xp_earned:       number;
}

interface UserStats {
  total_xp:        number;
  current_streak:  number;
  longest_streak:  number;
  lessons_completed: number;
}

export default function LessonShell({ slug, xpReward, terminalScenario, quiz, children }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [progress,   setProgress]   = useState<ProgressRow | null>(null);
  const [stats,      setStats]      = useState<UserStats | null>(null);
  const [terminalOk, setTerminalOk] = useState(false);
  const [quizScore,  setQuizScore]  = useState<{ score: number; total: number } | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);

  // Load prior progress
  useEffect(() => {
    if (!user) { setProgress(null); return; }
    supabase
      .from('claude_code_lesson_progress')
      .select('terminal_passed, quiz_score, quiz_total, xp_earned')
      .eq('user_id', user.id)
      .eq('lesson_slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProgress(data);
          if (data.terminal_passed) setTerminalOk(true);
          if (data.quiz_total > 0)  setQuizScore({ score: data.quiz_score, total: data.quiz_total });
        }
      });
    supabase
      .from('claude_code_user_stats')
      .select('total_xp, current_streak, longest_streak, lessons_completed')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setStats(data); });
  }, [user, slug]);

  const persist = async (
    nextTerminal: boolean,
    nextQuiz: { score: number; total: number } | null,
  ) => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    // Use DB-loaded progress as fallback for quiz values so a terminal-only
    // re-attempt doesn't erase a previously earned quiz score from the DB row.
    const effectiveQuiz = nextQuiz ?? (progress ? { score: progress.quiz_score, total: progress.quiz_total } : null);
    const quizScoreVal  = effectiveQuiz?.score ?? 0;
    const quizTotalVal  = effectiveQuiz?.total ?? 0;
    const perfectQuiz   = quizTotalVal > 0 && quizScoreVal === quizTotalVal;
    // Math.max ensures XP never decreases on re-attempts (e.g. lower quiz score on retry).
    const xpEarned      = Math.max(
      progress?.xp_earned ?? 0,
      (nextTerminal ? Math.round(xpReward * 0.4) : 0) +
      (perfectQuiz  ? Math.round(xpReward * 0.6) : 0),
    );

    const { error } = await supabase
      .from('claude_code_lesson_progress')
      .upsert({
        user_id:         user.id,
        lesson_slug:     slug,
        terminal_passed: nextTerminal,
        quiz_score:      quizScoreVal,
        quiz_total:      quizTotalVal,
        xp_earned:       xpEarned,
        attempts:        1,
      }, { onConflict: 'user_id,lesson_slug' });

    setSaving(false);
    if (error) { setSaveError('Failed to save progress. Please try again.'); return; }

    setProgress({
      terminal_passed: nextTerminal,
      quiz_score:      quizScoreVal,
      quiz_total:      quizTotalVal,
      xp_earned:       xpEarned,
    });

    // Refresh stats — trigger updated the row server-side.
    const { data } = await supabase
      .from('claude_code_user_stats')
      .select('total_xp, current_streak, longest_streak, lessons_completed')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setStats(data);
  };

  const handleTerminalPass = () => {
    setTerminalOk(true);
    persist(true, quizScore);
  };

  const handleQuizSubmit = (score: number, total: number) => {
    setQuizScore({ score, total });
    persist(terminalOk, { score, total });
  };

  return (
    <>
      {children}

      {terminalScenario && (
        <section>
          <h2 style={{
            fontFamily: "'Lora', serif",
            fontSize: '1.4rem',
            color: 'var(--brown-dark)',
            marginTop: '2rem',
            marginBottom: '0.4rem',
          }}>
            Try it yourself
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.6rem' }}>
            Type the command in the fake terminal. Nothing leaves your browser.
          </p>
          <TerminalSim scenario={terminalScenario} onPass={handleTerminalPass} passed={terminalOk} />
        </section>
      )}

      {quiz && quiz.length > 0 && (
        <section>
          <Quiz
            questions={quiz}
            onSubmit={handleQuizSubmit}
            previousScore={progress && progress.quiz_total > 0
              ? { score: progress.quiz_score, total: progress.quiz_total }
              : undefined}
          />
        </section>
      )}

      <ProgressBar
        authLoading={authLoading}
        signedIn={!!user}
        xpReward={xpReward}
        terminalOk={terminalOk}
        quizScore={quizScore}
        stats={stats}
        saving={saving}
        saveError={saveError}
      />
    </>
  );
}

function ProgressBar({
  authLoading, signedIn, xpReward, terminalOk, quizScore, stats, saving, saveError,
}: {
  authLoading: boolean;
  signedIn:    boolean;
  xpReward:    number;
  terminalOk:  boolean;
  quizScore:   { score: number; total: number } | null;
  stats:       UserStats | null;
  saving:      boolean;
  saveError:   string | null;
}) {
  const perfectQuiz = quizScore && quizScore.score === quizScore.total;
  const fullEarn = terminalOk && perfectQuiz;

  if (authLoading) return null;

  if (!signedIn) {
    return (
      <div style={{
        marginTop: '2rem',
        padding: '1.1rem 1.3rem',
        background: 'var(--warm-white)',
        border: 'var(--panel-border)',
        borderRadius: '12px',
        boxShadow: 'var(--panel-shadow)',
      }}>
        <div style={{ fontWeight: 600, color: 'var(--brown-dark)', marginBottom: '0.35rem' }}>
          Sign in to save your XP and streak
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.8rem' }}>
          Lesson worth <strong>{xpReward} XP</strong>. Daily streak unlocks badges.
        </div>
        <Link href={`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/learn/claude-skills')}`} style={{
          display: 'inline-block',
          background: 'var(--terracotta)', color: 'white',
          padding: '0.55rem 1.1rem', borderRadius: '10px',
          fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
        }}>
          Sign in to track progress →
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      position: 'sticky',
      bottom: '1rem',
      marginTop: '2rem',
      padding: '1rem 1.2rem',
      background: 'var(--warm-white)',
      border: 'var(--panel-border)',
      borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(44,31,20,0.12)',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.2rem',
    }}>
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Lesson XP</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: fullEarn ? 'var(--jade)' : 'var(--brown-dark)' }}>
          {fullEarn ? `+${xpReward}` : `${terminalOk ? Math.round(xpReward * 0.4) : 0} / ${xpReward}`}
        </div>
      </div>
      <Divider />
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total XP</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stats?.total_xp ?? 0}</div>
      </div>
      <Divider />
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Streak</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          🔥 {stats?.current_streak ?? 0}
          {stats && stats.longest_streak > stats.current_streak && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.82rem', marginLeft: '0.4rem' }}>
              (best {stats.longest_streak})
            </span>
          )}
        </div>
      </div>
      <Divider />
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Completed</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stats?.lessons_completed ?? 0}</div>
      </div>

      {saving && (
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Saving…</span>
      )}
      {saveError && (
        <span style={{ marginLeft: 'auto', color: 'var(--vermilion)', fontSize: '0.82rem' }}>
          {saveError}
        </span>
      )}
    </div>
  );
}

function Divider() {
  return <span style={{ width: '1px', height: '28px', background: 'var(--parchment)' }} />;
}
