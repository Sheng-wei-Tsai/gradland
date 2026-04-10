'use client';

interface Step {
  emoji:  string;
  title:  string;
  desc:   string;
  href:   string;
  cta:    string;
  done:   boolean;
}

interface Props {
  hasResume:    boolean;
  hasSkills:    boolean;
  hasInterview: boolean;
  hasJob:       boolean;
  onboardingDone: boolean;
}

export default function GettingStartedChecklist({ hasResume, hasSkills, hasInterview, hasJob, onboardingDone }: Props) {
  const steps: Step[] = [
    {
      emoji: '👤',
      title: 'Set up your profile',
      desc:  'Tell us your target role & visa status so we can personalise everything.',
      href:  '/dashboard',
      cta:   'Set up →',
      done:  onboardingDone,
    },
    {
      emoji: '📄',
      title: 'Analyse your resume',
      desc:  'Get an AI score against the AU IT market and a list of fixes to make before your next application.',
      href:  '/dashboard/resume-analyser',
      cta:   'Upload →',
      done:  hasResume,
    },
    {
      emoji: '💼',
      title: 'Search for your first job',
      desc:  'Browse thousands of AU IT roles with working rights filters.',
      href:  '/jobs',
      cta:   'Search →',
      done:  hasJob,
    },
    {
      emoji: '🎯',
      title: 'Run an interview prep session',
      desc:  'Practice with Alex, your AI mentor. Get scored on real-world questions for your target role.',
      href:  '/interview-prep',
      cta:   'Start →',
      done:  hasInterview,
    },
    {
      emoji: '📚',
      title: 'Start a learning path',
      desc:  'Pick Frontend, Backend, Data Engineer or DevOps. Spaced repetition keeps skills fresh.',
      href:  '/learn',
      cta:   'Begin →',
      done:  hasSkills,
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div style={{
      background: 'var(--warm-white)',
      border: '1px solid var(--parchment)',
      borderRadius: '16px',
      padding: '1.4rem',
      marginBottom: '2rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1rem', fontWeight: 700, color: 'var(--brown-dark)', margin: 0 }}>
            Get started — {completedCount}/{steps.length} complete
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Complete these to activate your personalised dashboard.
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--terracotta)', lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>done</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '5px', background: 'var(--parchment)', borderRadius: 99, marginBottom: '1.2rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--terracotta)', borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.85rem',
            padding: '0.75rem 0.9rem',
            borderRadius: '10px',
            background: step.done ? 'rgba(30,122,82,0.05)' : 'white',
            border: `1px solid ${step.done ? 'rgba(30,122,82,0.18)' : 'var(--parchment)'}`,
            opacity: step.done ? 0.7 : 1,
          }}>
            {/* Status indicator */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step.done ? 'rgba(30,122,82,0.12)' : 'var(--parchment)',
              fontSize: step.done ? '0.85rem' : '1rem',
              border: step.done ? '1.5px solid rgba(30,122,82,0.3)' : 'none',
            }}>
              {step.done ? '✓' : step.emoji}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.85rem', fontWeight: 600,
                color: step.done ? 'var(--jade)' : 'var(--brown-dark)',
                textDecoration: step.done ? 'line-through' : 'none',
              }}>
                {step.title}
              </div>
              {!step.done && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem', lineHeight: 1.4 }}>
                  {step.desc}
                </div>
              )}
            </div>

            {/* CTA */}
            {!step.done && (
              <a href={step.href} style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '99px',
                background: 'var(--terracotta)',
                color: 'white',
                fontSize: '0.78rem', fontWeight: 600,
                textDecoration: 'none', flexShrink: 0,
              }}>
                {step.cta}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
