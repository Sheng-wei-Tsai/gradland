import { Metadata } from 'next';
import Link from 'next/link';
import { INTERVIEW_ROLES } from '@/lib/interview-roles';
import CompanyLinks from '@/components/CompanyLinks';

export const metadata: Metadata = {
  title: 'Interview — Australian IT Job Tools',
  description: 'Resume analyser, cover letter generator, and AI interview prep for Australian IT roles.',
};

const demandColor: Record<string, string> = {
  'Very High': '#10b981',
  'High':      '#f59e0b',
  'Medium':    '#6b7280',
};

const difficultyColor: Record<string, string> = {
  'Entry':  '#3b82f6',
  'Mid':    '#8b5cf6',
  'Senior': '#ef4444',
};

const TOOLS = [
  {
    href:    '/resume',
    emoji:   '📄',
    label:   'Resume Analyser',
    desc:    'Paste your resume — get AU-specific AI feedback on format, keywords, and what recruiters actually look for.',
    cta:     'Analyse my resume',
    accent:  '#10b981',
    bg:      'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
    border:  '#059669',
    tag:     'AI-powered',
  },
  {
    href:    '/cover-letter',
    emoji:   '✉️',
    label:   'Cover Letter',
    desc:    'GPT-4.1 writes your cover letter in AU English — tailored to the job description, ready to send.',
    cta:     'Generate cover letter',
    accent:  '#f59e0b',
    bg:      'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
    border:  '#d97706',
    tag:     'GPT-4.1',
  },
  {
    href:    '/interview-prep',
    emoji:   '🎯',
    label:   'Interview Prep',
    desc:    'Practice 10 real questions per role. AI mentor Alex gives scored feedback. Earn XP as you improve.',
    cta:     'Start practising',
    accent:  '#818cf8',
    bg:      'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    border:  '#4338ca',
    tag:     'Gamified',
  },
];

export default function InterviewPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* Header */}
      <section style={{ paddingTop: '4.5rem', paddingBottom: '2.5rem' }}>
        <h1 className="animate-fade-up" style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700,
          color: 'var(--brown-dark)', lineHeight: 1.15, marginBottom: '0.9rem',
        }}>
          Land the Job
        </h1>
        <p className="animate-fade-up delay-1" style={{
          color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '54ch',
        }}>
          Three tools to take you from application to offer — built specifically for Australian IT roles.
        </p>
      </section>

      {/* Tool cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '3.5rem' }}>
        {TOOLS.map(tool => (
          <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              background: tool.bg,
              border: `1px solid ${tool.border}`,
              borderRadius: '14px',
              padding: '1.4rem 1.5rem 1.6rem',
              height: '100%', display: 'flex', flexDirection: 'column',
              position: 'relative', overflow: 'hidden',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}>
              {/* Glow */}
              <div style={{ position: 'absolute', top: '-20px', right: '20px', width: '80px', height: '80px', borderRadius: '50%', background: `${tool.accent}30`, filter: 'blur(20px)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{tool.emoji}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: tool.accent, background: `${tool.accent}20`, padding: '0.2em 0.6em', borderRadius: '5px', letterSpacing: '0.04em' }}>
                    {tool.tag}
                  </span>
                </div>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  {tool.label}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(248,250,252,0.7)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {tool.desc}
                </p>
              </div>
              <span style={{
                display: 'inline-block', alignSelf: 'flex-start',
                background: tool.accent, color: '#0f172a',
                padding: '0.4rem 1rem', borderRadius: '99px',
                fontSize: '0.8rem', fontWeight: 700,
              }}>
                {tool.cta} →
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--parchment)' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          🎯 Practice by Role
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--parchment)' }} />
      </div>

      {/* How it works */}
      <section className="animate-fade-up" style={{
        borderTop: '1px solid var(--parchment)',
        borderBottom: '1px solid var(--parchment)',
        padding: '1.5rem 0', marginBottom: '2.5rem',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.2rem' }}>
          {[
            { n: '1', label: 'Pick a role',      body: 'Choose the job type you\'re targeting in the Australian market.' },
            { n: '2', label: 'Study the Qs',     body: 'Read each question, understand the key concepts, and see a framework.' },
            { n: '3', label: 'Write + get AI feedback', body: 'Write your answer, then get streamed AI feedback with a score.' },
            { n: '4', label: 'Earn XP',           body: 'Progress through levels from Beginner to Interview Ready.' },
          ].map(item => (
            <div key={item.n} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontFamily: "'Lora', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--terracotta)' }}>
                {item.n}.
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--brown-dark)' }}>{item.label}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{item.body}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Role grid */}
      <section style={{ paddingBottom: '5rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>
          Choose a role
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {INTERVIEW_ROLES.map(role => (
            <Link key={role.id} href={`/interview-prep/${role.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                background: 'var(--warm-white)',
                border: '1px solid var(--parchment)',
                borderRadius: '14px',
                padding: '1.4rem',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{role.emoji}</span>
                    <div>
                      <h3 style={{ fontFamily: "'Lora', serif", fontSize: '0.97rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.2rem' }}>
                        {role.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: difficultyColor[role.difficulty], background: `${difficultyColor[role.difficulty]}15`, padding: '0.15em 0.5em', borderRadius: '4px' }}>
                          {role.difficulty}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: demandColor[role.demand], background: `${demandColor[role.demand]}15`, padding: '0.15em 0.5em', borderRadius: '4px' }}>
                          {role.demand} Demand
                        </span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0, marginTop: '0.15rem' }}>→</span>
                </div>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.9rem' }}>
                  {role.description}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.9rem' }}>
                  <div>
                    <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Salary</div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--brown-dark)' }}>{role.salaryRange}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Questions</div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--brown-dark)' }}>{role.questionCount} questions</div>
                  </div>
                </div>
                <CompanyLinks companies={role.companies} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
