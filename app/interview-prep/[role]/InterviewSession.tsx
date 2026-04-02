'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { InterviewRole, getLevelFromXp, XP_LEVELS, STAGE_XP_VALUES } from '@/lib/interview-roles';

// ── Types ──────────────────────────────────────────────────────────────────

type Question = {
  id: string;
  text: string;
  scenario: string;
  focus: string;
  concepts: string[];
  framework: string;
};

type Stage = 'scene' | 'why' | 'guide' | 'practice' | 'debrief';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const STAGES: Stage[] = ['scene', 'why', 'guide', 'practice', 'debrief'];
const MENTOR_STAGES = new Set<Stage>(['scene', 'why', 'guide']);

const STAGE_LABELS: Record<Stage, string> = {
  scene:    'Scene',
  why:      'Why',
  guide:    'Guide',
  practice: 'Practice',
  debrief:  'Debrief',
};

function hashQuestion(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function extractScore(feedback: string): number | null {
  const m = feedback.match(/\*\*Score:\s*(\d+)\/100\*\*/);
  return m ? parseInt(m[1], 10) : null;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function InterviewSession({ role }: { role: InterviewRole }) {
  const { user } = useAuth();

  // Questions
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [loadingQ, setLoadingQ]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Progress
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [stage, setStage]                     = useState<Stage>('scene');
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());

  // Mentor narration (streaming)
  const [mentorText, setMentorText]           = useState('');
  const [mentorStreaming, setMentorStreaming]  = useState(false);
  const mentorAbortRef = useRef<AbortController | null>(null);

  // Practice
  const [userAnswer, setUserAnswer] = useState('');

  // Debrief
  const [feedback, setFeedback]     = useState('');
  const [score, setScore]           = useState<number | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError]   = useState<string | null>(null);

  // XP
  const [sessionXp, setSessionXp] = useState(0);
  const [totalXp, setTotalXp]     = useState(0);
  const [xpFlash, setXpFlash]     = useState<number | null>(null);
  const xpFlashTimer              = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Session complete
  const [sessionDone, setSessionDone] = useState(false);

  // Mentor chat
  const [chatOpen, setChatOpen]         = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]       = useState('');
  const [chatLoading, setChatLoading]   = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const currentQ = questions[currentIndex];

  // Question status helper
  function qStatus(idx: number): 'not-started' | 'in-progress' | 'complete' {
    if (completedStages.has(`${idx}-debrief`)) return 'complete';
    if (idx === currentIndex) return 'in-progress';
    if (STAGES.some(s => completedStages.has(`${idx}-${s}`))) return 'in-progress';
    return 'not-started';
  }

  // ── Load questions on mount ────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/interview/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId: role.id }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setQuestions(data.questions ?? []);
      })
      .catch(err => setFetchError(err instanceof Error ? err.message : 'Failed to load questions'))
      .finally(() => setLoadingQ(false));
  }, [role.id]);

  // Load user's existing XP
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('interview_xp')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data && typeof data.interview_xp === 'number') setTotalXp(data.interview_xp);
      });
  }, [user]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (xpFlashTimer.current) clearTimeout(xpFlashTimer.current);
      mentorAbortRef.current?.abort();
    };
  }, []);

  // ── Mentor narration — auto-trigger when entering mentor stages ────────

  useEffect(() => {
    if (!MENTOR_STAGES.has(stage) || !currentQ) return;

    mentorAbortRef.current?.abort();
    const abort = new AbortController();
    mentorAbortRef.current = abort;

    setMentorText('');
    setMentorStreaming(true);

    fetch('/api/interview/mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage,
        question:       currentQ.text,
        scenario:       currentQ.scenario,
        focus:          currentQ.focus,
        concepts:       currentQ.concepts,
        framework:      currentQ.framework,
        roleTitle:      role.title,
        companyExample: role.companies[0],
      }),
      signal: abort.signal,
    })
      .then(async res => {
        if (!res.ok || !res.body) {
          setMentorText('Unable to load this section — continue to the next stage.');
          setMentorStreaming(false);
          return;
        }
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setMentorText(text);
        }
        setMentorStreaming(false);
      })
      .catch(err => {
        if (err?.name !== 'AbortError') {
          setMentorText('Unable to load this section — continue to the next stage.');
          setMentorStreaming(false);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, currentIndex]);

  // ── XP helpers ─────────────────────────────────────────────────────────

  function awardXp(amount: number) {
    setSessionXp(prev => prev + amount);
    setTotalXp(prev => prev + amount);
    if (xpFlashTimer.current) clearTimeout(xpFlashTimer.current);
    setXpFlash(amount);
    xpFlashTimer.current = setTimeout(() => setXpFlash(null), 1500);
  }

  async function saveProgressToDb(q: Question, earnedScore: number | null, newTotalXp: number) {
    if (!user) return;

    const dbStage  = earnedScore !== null && earnedScore >= 90 ? 'mastered' : 'practiced';
    const xpEarned = STAGE_XP_VALUES.practice + (earnedScore !== null && earnedScore >= 90 ? 25 : 0);

    const { data: existing } = await supabase
      .from('interview_progress')
      .select('attempts')
      .eq('user_id', user.id)
      .eq('role_id', role.id)
      .eq('question_hash', hashQuestion(q.text))
      .maybeSingle();

    const attempts = (existing?.attempts ?? 0) + 1;

    await supabase.from('interview_progress').upsert(
      {
        user_id:           user.id,
        role_id:           role.id,
        question_hash:     hashQuestion(q.text),
        question_text:     q.text,
        stage:             dbStage,
        score:             earnedScore,
        xp_earned:         xpEarned,
        attempts,
        last_practiced_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,role_id,question_hash' }
    );

    await supabase.from('profiles').upsert(
      { id: user.id, interview_xp: newTotalXp, interview_level: getLevelFromXp(newTotalXp).current.level },
      { onConflict: 'id' }
    );
  }

  // ── Stage navigation ────────────────────────────────────────────────────

  function markCompleted(idx: number, s: Stage) {
    setCompletedStages(prev => new Set(prev).add(`${idx}-${s}`));
  }

  function advanceStage() {
    const stageIdx = STAGES.indexOf(stage);
    if (stageIdx >= STAGES.length - 1) return;
    const xpForStage = STAGE_XP_VALUES[stage];
    if (xpForStage > 0) awardXp(xpForStage);
    markCompleted(currentIndex, stage);
    setStage(STAGES[stageIdx + 1]);
  }

  async function submitAnswer() {
    if (!userAnswer.trim()) return;

    markCompleted(currentIndex, 'practice');
    setStage('debrief');

    if (!user) {
      setEvalError('Sign in to get AI feedback on your answers.');
      return;
    }

    setEvaluating(true);
    setFeedback('');
    setScore(null);
    setEvalError(null);

    const practiceXp      = STAGE_XP_VALUES.practice;
    const bonusXpIfPerfect = 25;
    awardXp(practiceXp);

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQ.text, answer: userAnswer, roleTitle: role.title }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Evaluation failed' }));
        throw new Error(err.error ?? 'Evaluation failed');
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setFeedback(full);
      }

      const extracted = extractScore(full);
      setScore(extracted);

      const bonusXp   = extracted !== null && extracted >= 90 ? bonusXpIfPerfect : 0;
      if (bonusXp > 0) awardXp(bonusXp);

      const newTotalXp = totalXp + practiceXp + bonusXp;
      await saveProgressToDb(currentQ, extracted, newTotalXp);
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  }

  function nextQuestion() {
    markCompleted(currentIndex, 'debrief');
    if (currentIndex >= questions.length - 1) {
      setSessionDone(true);
      return;
    }
    setCurrentIndex(i => i + 1);
    setStage('scene');
    setUserAnswer('');
    setFeedback('');
    setScore(null);
    setEvalError(null);
    setMentorText('');
  }

  // ── Mentor chat ─────────────────────────────────────────────────────────

  async function sendChatMessage() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, roleTitle: role.title }),
      });

      if (!res.ok || !res.body) throw new Error('Chat failed');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';

      setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setChatMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: reply };
          return next;
        });
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  // ── Level info ──────────────────────────────────────────────────────────

  const levelInfo = getLevelFromXp(totalXp);
  const nextLevel = levelInfo.next ?? XP_LEVELS[XP_LEVELS.length - 1];

  // ── Loading / error states ──────────────────────────────────────────────

  if (loadingQ) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generating your questions…</p>
      </div>
    );
  }

  if (fetchError || questions.length === 0) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--terracotta)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {fetchError ?? 'No questions generated.'}
        </p>
        <Link href="/interview-prep" style={{ color: 'var(--terracotta)', fontSize: '0.9rem' }}>
          ← Back to roles
        </Link>
      </div>
    );
  }

  // ── Session complete ────────────────────────────────────────────────────

  if (sessionDone) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '4.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{
          fontFamily: "'Lora', serif", fontSize: '1.8rem', fontWeight: 700,
          color: 'var(--brown-dark)', marginBottom: '0.5rem',
        }}>
          Session Complete!
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          You earned <strong style={{ color: 'var(--terracotta)' }}>+{sessionXp} XP</strong> this session.
        </p>

        <div style={{
          background: 'var(--warm-white)', border: '1px solid var(--parchment)',
          borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem',
        }}>
          <p style={{
            fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase',
            letterSpacing: '0.07em', marginBottom: '0.8rem',
          }}>
            Your Level
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{levelInfo.current.emoji}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)' }}>
              {levelInfo.current.title}
            </span>
          </div>
          <div style={{ background: 'var(--parchment)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '99px', background: 'var(--terracotta)',
              width: `${levelInfo.progress}%`, transition: 'width 0.8s ease',
            }} />
          </div>
          {levelInfo.next && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {totalXp} / {nextLevel.xpRequired} XP to {levelInfo.next.title}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={`/interview-prep/${role.id}`} style={{
            background: 'var(--terracotta)', color: 'white',
            padding: '0.6rem 1.4rem', borderRadius: '99px',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
          }}>
            Practice again
          </Link>
          <Link href="/interview-prep" style={{
            background: 'var(--parchment)', color: 'var(--brown-dark)',
            padding: '0.6rem 1.4rem', borderRadius: '99px',
            textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
          }}>
            Try another role
          </Link>
        </div>
      </div>
    );
  }

  // ── Main session UI ─────────────────────────────────────────────────────

  const isMentorStage = MENTOR_STAGES.has(stage);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem', paddingBottom: '6rem' }}>

      {/* Top bar */}
      <div style={{
        paddingTop: '2rem', paddingBottom: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <Link href="/interview-prep" style={{
            fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem',
          }}>
            ← Interview Prep
          </Link>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)' }}>
            {role.emoji} {role.title}
          </h2>
        </div>

        {/* XP badge */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: 'var(--warm-white)', border: '1px solid var(--parchment)',
            borderRadius: '99px', padding: '0.35rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1rem' }}>{levelInfo.current.emoji}</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                {levelInfo.current.title}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown-dark)', lineHeight: 1.2 }}>
                {totalXp} XP
              </div>
            </div>
          </div>
          {xpFlash !== null && (
            <div style={{
              position: 'absolute', top: '-1.5rem', right: 0,
              color: 'var(--terracotta)', fontWeight: 700, fontSize: '0.85rem',
              whiteSpace: 'nowrap', pointerEvents: 'none',
            }}>
              +{xpFlash} XP
            </div>
          )}
        </div>
      </div>

      {/* Mobile progress dots */}
      <div className="mobile-only" style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        {questions.map((_, i) => (
          <div key={i} style={{
            width: i === currentIndex ? '20px' : '8px', height: '8px',
            borderRadius: '99px',
            background: qStatus(i) === 'complete' ? 'var(--terracotta)' : i === currentIndex ? 'var(--brown-dark)' : 'var(--parchment)',
            transition: 'all 0.2s',
          }} />
        ))}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Layout: sidebar + main */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Question sidebar — desktop only */}
        <aside className="interview-sidebar" style={{
          width: '160px', flexShrink: 0,
          background: 'var(--warm-white)',
          border: '1px solid var(--parchment)',
          borderRadius: '14px', padding: '0.75rem',
          position: 'sticky', top: '5rem',
        }}>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem',
          }}>
            Questions
          </p>
          {questions.map((q, i) => {
            const status = qStatus(i);
            const isCurrent = i === currentIndex;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                padding: '0.45rem 0.5rem', borderRadius: '8px', marginBottom: '0.15rem',
                background: isCurrent ? 'rgba(192,40,28,0.07)' : 'transparent',
                cursor: 'default',
              }}>
                {/* Status dot */}
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '3px',
                  background: status === 'complete'    ? '#2D6A4F'
                             : status === 'in-progress' ? 'var(--terracotta)'
                             : 'var(--parchment)',
                  border: status === 'not-started' ? '1.5px solid rgba(0,0,0,0.15)' : 'none',
                }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: isCurrent ? 700 : 400,
                    color: isCurrent ? 'var(--brown-dark)' : 'var(--text-secondary)',
                    lineHeight: 1.2,
                  }}>
                    Q{i + 1}
                  </div>
                  <div style={{
                    fontSize: '0.63rem', color: 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: '110px',
                  }}>
                    {status === 'complete' ? '✓ Done' : isCurrent ? STAGE_LABELS[stage] : '—'}
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Stage tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', overflowX: 'auto' }}>
            {STAGES.map((s, i) => {
              const done   = completedStages.has(`${currentIndex}-${s}`);
              const active = s === stage;
              return (
                <div key={s} style={{
                  padding: '0.3rem 0.75rem', borderRadius: '99px',
                  fontSize: '0.75rem', fontWeight: 600,
                  whiteSpace: 'nowrap', flexShrink: 0,
                  background: active ? 'var(--brown-dark)' : done ? 'var(--terracotta)' : 'var(--parchment)',
                  color: active || done ? 'white' : 'var(--text-muted)',
                }}>
                  {done && !active ? '✓ ' : `${i + 1}. `}{STAGE_LABELS[s]}
                </div>
              );
            })}
          </div>

          {/* Main card */}
          <div style={{
            background: 'var(--warm-white)', border: '1px solid var(--parchment)',
            borderRadius: '16px', padding: '1.75rem',
          }}>
            {/* Question label + text */}
            <p style={{
              fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem',
            }}>
              Question {currentIndex + 1}
            </p>
            <h2 style={{
              fontFamily: "'Lora', serif", fontSize: '1.1rem', fontWeight: 700,
              color: 'var(--brown-dark)', lineHeight: 1.5, marginBottom: '1.5rem',
            }}>
              {currentQ.text}
            </h2>

            {/* ── Mentor stages (scene / why / guide) — streaming narration ── */}
            {isMentorStage && (
              <div>
                {/* Alex avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--terracotta)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    A
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown-dark)', lineHeight: 1.2 }}>
                      Alex Chen
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ex-Atlassian · Senior Dev · 8 yrs
                    </div>
                  </div>
                  {/* Stage context label */}
                  <div style={{
                    marginLeft: 'auto',
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: stage === 'scene' ? '#1D6FA4' : stage === 'why' ? '#C8922A' : '#2D6A4F',
                    background: stage === 'scene' ? '#1D6FA410' : stage === 'why' ? '#C8922A10' : '#2D6A4F10',
                    padding: '0.2em 0.6em', borderRadius: '4px',
                  }}>
                    {stage === 'scene' ? 'Setting the scene' : stage === 'why' ? 'The why' : 'The approach'}
                  </div>
                </div>

                {/* Thinking indicator */}
                {mentorStreaming && !mentorText && (
                  <div style={{
                    color: 'var(--text-muted)', fontSize: '0.88rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'var(--parchment)', borderRadius: '8px',
                  }}>
                    <span>Alex is thinking</span>
                    <span className="think-dot" style={{ display: 'inline-block' }}>·</span>
                    <span className="think-dot" style={{ display: 'inline-block' }}>·</span>
                    <span className="think-dot" style={{ display: 'inline-block' }}>·</span>
                  </div>
                )}

                {/* Streaming text */}
                {mentorText && (
                  <div style={{
                    color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.8,
                    padding: '0.75rem 1rem',
                    background: 'rgba(253,245,228,0.6)', borderRadius: '8px',
                    borderLeft: '3px solid var(--terracotta)',
                  }}>
                    {mentorText}
                    {mentorStreaming && <span className="stream-cursor" />}
                  </div>
                )}
              </div>
            )}

            {/* ── Practice stage ── */}
            {stage === 'practice' && (
              <div>
                <p style={{
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem',
                }}>
                  Your answer
                </p>
                {!user && (
                  <p style={{
                    fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem',
                    padding: '0.7rem 1rem', background: 'var(--parchment)', borderRadius: '8px',
                  }}>
                    Sign in to get AI feedback on your answer.
                  </p>
                )}
                <textarea
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here…"
                  rows={6}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.9rem 1rem', borderRadius: '10px',
                    border: '1.5px solid var(--parchment)',
                    background: 'var(--cream)', color: 'var(--brown-dark)',
                    fontSize: '0.9rem', lineHeight: 1.7, resize: 'vertical',
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
                {evalError && (
                  <p style={{ color: 'var(--terracotta)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {evalError}
                  </p>
                )}
              </div>
            )}

            {/* ── Debrief stage ── */}
            {stage === 'debrief' && (
              <div>
                <p style={{
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem',
                }}>
                  AI Feedback
                </p>

                {!user && evalError && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {evalError} You can still continue to the next question.
                  </p>
                )}

                {user && evaluating && !feedback && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Evaluating your answer…</p>
                )}

                {user && feedback && (
                  <>
                    {score !== null && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: score >= 90 ? '#10b98120' : score >= 70 ? '#f59e0b20' : '#ef444420',
                        color: score >= 90 ? '#059669' : score >= 70 ? '#d97706' : '#dc2626',
                        borderRadius: '99px', padding: '0.3rem 0.9rem',
                        fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem',
                      }}>
                        {score >= 90 ? '🏆' : score >= 70 ? '✓' : '↻'} Score: {score}/100
                        {score >= 90 && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}> +25 bonus XP!</span>
                        )}
                      </div>
                    )}
                    <div style={{
                      color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {feedback.replace(/\*\*Score:\s*\d+\/100\*\*\n?/, '')}
                    </div>
                  </>
                )}

                {user && evalError && !feedback && (
                  <p style={{ color: 'var(--terracotta)', fontSize: '0.85rem' }}>{evalError}</p>
                )}
              </div>
            )}

            {/* ── Action button ── */}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              {stage === 'practice' ? (
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim() || evaluating}
                  style={{
                    background: userAnswer.trim() && !evaluating ? 'var(--terracotta)' : 'var(--parchment)',
                    color: userAnswer.trim() && !evaluating ? 'white' : 'var(--text-muted)',
                    border: 'none', borderRadius: '99px', padding: '0.6rem 1.5rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    cursor: userAnswer.trim() && !evaluating ? 'pointer' : 'default',
                  }}
                >
                  {evaluating ? 'Evaluating…' : 'Submit for Feedback'}
                </button>
              ) : stage === 'debrief' ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  disabled={evaluating}
                  style={{
                    background: !evaluating ? 'var(--terracotta)' : 'var(--parchment)',
                    color: !evaluating ? 'white' : 'var(--text-muted)',
                    border: 'none', borderRadius: '99px', padding: '0.6rem 1.5rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    cursor: !evaluating ? 'pointer' : 'default',
                  }}
                >
                  {currentIndex >= questions.length - 1 ? 'Finish Session 🎉' : 'Next Question →'}
                </button>
              ) : (
                /* Mentor stage advance — enabled once streaming starts (allow skip) */
                <button
                  type="button"
                  onClick={advanceStage}
                  disabled={!mentorText && mentorStreaming}
                  style={{
                    background: mentorText || !mentorStreaming ? 'var(--terracotta)' : 'var(--parchment)',
                    color: mentorText || !mentorStreaming ? 'white' : 'var(--text-muted)',
                    border: 'none', borderRadius: '99px', padding: '0.6rem 1.5rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    cursor: mentorText || !mentorStreaming ? 'pointer' : 'default',
                  }}
                >
                  {STAGE_LABELS[STAGES[STAGES.indexOf(stage) + 1]]} →{' '}
                  <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>
                    +{STAGE_XP_VALUES[stage]} XP
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating mentor chat ───────────────────────────────────────────── */}

      <button
        type="button"
        onClick={() => setChatOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '5.5rem', right: '1.25rem',
          width: '50px', height: '50px', borderRadius: '50%',
          background: chatOpen ? 'var(--brown-dark)' : 'var(--terracotta)',
          color: 'white', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', boxShadow: '0 4px 16px rgba(44,31,20,0.25)',
          zIndex: 80,
        }}
        title="AI Mentor"
      >
        {chatOpen ? '✕' : '💬'}
      </button>

      {chatOpen && (
        <div style={{
          position: 'fixed', bottom: '7.5rem', right: '1.25rem',
          width: 'min(360px, calc(100vw - 2.5rem))',
          background: 'var(--warm-white)', border: '1px solid var(--parchment)',
          borderRadius: '16px', boxShadow: '0 8px 32px rgba(44,31,20,0.15)',
          display: 'flex', flexDirection: 'column', maxHeight: '420px',
          zIndex: 80, overflow: 'hidden',
        }}>
          <div style={{
            padding: '0.8rem 1rem', borderBottom: '1px solid var(--parchment)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'var(--terracotta)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.7rem',
            }}>
              A
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brown-dark)' }}>
              Ask Alex
            </span>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: '0.75rem 1rem',
            display: 'flex', flexDirection: 'column', gap: '0.6rem',
          }}>
            {chatMessages.length === 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>
                Ask me anything about this interview question or how to answer it.
              </p>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.role === 'user' ? 'var(--terracotta)' : 'var(--parchment)',
                color: msg.role === 'user' ? 'white' : 'var(--brown-dark)',
                borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                padding: '0.55rem 0.85rem',
                fontSize: '0.83rem', lineHeight: 1.6,
              }}>
                {msg.content || '…'}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          <div style={{
            padding: '0.75rem', borderTop: '1px solid var(--parchment)',
            display: 'flex', gap: '0.5rem',
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
              }}
              placeholder="Ask Alex…"
              style={{
                flex: 1, padding: '0.5rem 0.75rem', borderRadius: '99px',
                border: '1.5px solid var(--parchment)',
                background: 'var(--cream)', color: 'var(--brown-dark)',
                fontSize: '0.83rem', outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              type="button"
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || chatLoading}
              style={{
                background: chatInput.trim() && !chatLoading ? 'var(--terracotta)' : 'var(--parchment)',
                color: chatInput.trim() && !chatLoading ? 'white' : 'var(--text-muted)',
                border: 'none', borderRadius: '99px', padding: '0.5rem 0.9rem',
                fontSize: '0.83rem', fontWeight: 600,
                cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'default',
              }}
            >
              {chatLoading ? '…' : '↑'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
