'use client';
import { useState } from 'react';
import type { QuizQuestion } from '@/lib/posts';

interface Props {
  questions: QuizQuestion[];
  /** Fires with (score, total) when user submits the quiz. */
  onSubmit:  (score: number, total: number) => void;
  /** Locks quiz once submitted server-side. */
  locked?:   boolean;
  /** Previous score, if user already attempted. */
  previousScore?: { score: number; total: number };
}

export default function Quiz({ questions, onSubmit, locked, previousScore }: Props) {
  const [selected,  setSelected]  = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(!!locked);
  const [revealed,  setRevealed]  = useState(!!locked);

  const allAnswered = questions.every((_, i) => typeof selected[i] === 'number');

  const handleSubmit = () => {
    if (!allAnswered || submitted) return;
    const score = questions.reduce(
      (acc, q, i) => acc + (selected[i] === q.answer ? 1 : 0),
      0,
    );
    setSubmitted(true);
    setRevealed(true);
    onSubmit(score, questions.length);
  };

  const score = questions.reduce(
    (acc, q, i) => acc + (selected[i] === q.answer ? 1 : 0),
    0,
  );

  return (
    <div style={{
      background: 'var(--warm-white)',
      border: 'var(--panel-border)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: 'var(--panel-shadow)',
      margin: '1.5rem 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
        <span style={{ fontSize: '1.4rem' }}>🎯</span>
        <h3 style={{ margin: 0, fontFamily: "'Lora', serif", fontSize: '1.15rem', color: 'var(--brown-dark)' }}>
          Quick quiz — check your understanding
        </h3>
        {previousScore && !submitted && (
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Last attempt: {previousScore.score} / {previousScore.total}
          </span>
        )}
      </div>

      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontWeight: 600,
            color: 'var(--brown-dark)',
            marginBottom: '0.6rem',
            fontSize: '0.95rem',
          }}>
            {i + 1}. {q.q}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {q.options.map((opt, j) => {
              const isSelected = selected[i] === j;
              const isCorrect  = j === q.answer;
              const showState  = revealed;
              const bg =
                showState && isCorrect             ? 'rgba(30,122,82,0.12)' :
                showState && isSelected && !isCorrect ? 'rgba(232,64,64,0.10)' :
                isSelected                          ? 'rgba(192,40,28,0.08)' :
                'transparent';
              const border =
                showState && isCorrect             ? '1.5px solid var(--jade)' :
                showState && isSelected && !isCorrect ? '1.5px solid var(--vermilion)' :
                isSelected                          ? '1.5px solid var(--terracotta)' :
                '1.5px solid var(--parchment)';

              return (
                <button
                  key={j}
                  onClick={() => !submitted && setSelected(prev => ({ ...prev, [i]: j }))}
                  disabled={submitted}
                  style={{
                    textAlign: 'left',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '8px',
                    border,
                    background: bg,
                    color: 'var(--brown-dark)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    cursor: submitted ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt}
                  {showState && isCorrect && <span style={{ marginLeft: '0.5rem', color: 'var(--jade)' }}>✓</span>}
                  {showState && isSelected && !isCorrect && <span style={{ marginLeft: '0.5rem', color: 'var(--vermilion)' }}>✗</span>}
                </button>
              );
            })}
          </div>
          {revealed && (
            <div style={{
              marginTop: '0.6rem',
              padding: '0.6rem 0.9rem',
              background: 'rgba(122,80,48,0.06)',
              border: '1px solid var(--parchment)',
              borderRadius: '8px',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              {q.explanation}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          style={{
            background: allAnswered ? 'var(--terracotta)' : 'var(--parchment)',
            color: allAnswered ? 'white' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '10px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: allAnswered ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
        >
          Submit answers
        </button>
      ) : (
        <div style={{
          padding: '0.85rem 1.1rem',
          background: score === questions.length ? 'rgba(30,122,82,0.10)' : 'rgba(232,64,64,0.08)',
          border: `1px solid ${score === questions.length ? 'var(--jade)' : 'rgba(232,64,64,0.35)'}`,
          borderRadius: '10px',
          fontWeight: 600,
          color: score === questions.length ? 'var(--jade)' : 'var(--vermilion)',
        }}>
          {score === questions.length
            ? `🎉 Perfect score — ${score} / ${questions.length}. XP awarded.`
            : `${score} / ${questions.length}. Re-read the lesson and try again later for full XP.`}
        </div>
      )}
    </div>
  );
}
