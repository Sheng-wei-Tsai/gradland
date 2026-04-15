'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { GapAnalysisResult, MissingSkill } from '@/app/api/gap-analysis/route';

interface Props {
  jobId:       string;
  jobTitle:    string;
  company:     string;
  description: string;
  isLoggedIn:  boolean;
}

const PATH_LABELS: Record<string, string> = {
  'junior-frontend':  'Frontend',
  'junior-fullstack':  'Full Stack',
  'junior-backend':    'Backend',
  'data-engineer':     'Data Engineering',
  'devops-cloud':      'DevOps / Cloud',
};

// ── Match ring SVG ────────────────────────────────────────────────────────────

function MatchRing({ percent }: { percent: number }) {
  const r = 22, stroke = 5;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);
  const colour = percent >= 70 ? 'var(--jade)' : percent >= 40 ? 'var(--gold)' : 'var(--vermilion)';

  return (
    <svg width={54} height={54} viewBox="0 0 54 54" style={{ flexShrink: 0 }}>
      <circle cx={27} cy={27} r={r} fill="none" stroke="var(--parchment)" strokeWidth={stroke} />
      <circle
        cx={27} cy={27} r={r} fill="none"
        stroke={colour} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 27 27)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x={27} y={31} textAnchor="middle"
        style={{ fontSize: '11px', fontWeight: 700, fill: colour, fontFamily: 'inherit' }}>
        {percent}%
      </text>
    </svg>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function GapAnalysisPanel({ jobId, jobTitle, company, description, isLoggedIn }: Props) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<GapAnalysisResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  async function analyse() {
    if (result) { setOpen(o => !o); return; }
    if (!isLoggedIn) { setOpen(true); return; }

    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gap-analysis', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ jobId, title: jobTitle, company, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Analysis failed');
        return;
      }
      setResult(data as GapAnalysisResult);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  const btnLabel = result ? (open ? 'Hide gap' : `Gap ${result.matchPercent}%`) : '🔍 Skill gap';

  return (
    <div>
      {/* Trigger button */}
      <button
        onClick={analyse}
        style={{
          display:       'inline-flex',
          alignItems:    'center',
          gap:           '0.3rem',
          padding:       '0.3rem 0.7rem',
          background:    result ? 'rgba(30,122,82,0.08)' : 'rgba(200,138,20,0.08)',
          border:        `1px solid ${result ? 'var(--jade)' : 'var(--gold)'}`,
          borderRadius:  '20px',
          fontSize:      '0.75rem',
          fontWeight:    600,
          color:         result ? 'var(--jade)' : 'var(--amber)',
          cursor:        'pointer',
          fontFamily:    'inherit',
          transition:    'background 0.15s',
        }}
      >
        {result && <span style={{ fontSize: '0.7rem' }}>{result.matchPercent}%</span>}
        {btnLabel}
      </button>

      {/* Expandable panel */}
      {open && (
        <div style={{
          marginTop:    '0.75rem',
          padding:      '1rem 1.1rem',
          background:   'var(--cream)',
          border:       '1px solid var(--parchment)',
          borderRadius: '10px',
          fontSize:     '0.82rem',
        }}>
          {/* Not logged in */}
          {!isLoggedIn && (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              <Link href="/login" style={{ color: 'var(--vermilion)', fontWeight: 600 }}>Sign in</Link>
              {' '}to analyse how well your skills match this role.
            </p>
          )}

          {/* Loading */}
          {isLoggedIn && loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid var(--parchment)',
                borderTopColor: 'var(--gold)',
                animation: 'spin 0.7s linear infinite',
                flexShrink: 0,
              }} />
              Extracting skills from job description…
            </div>
          )}

          {/* Error */}
          {isLoggedIn && !loading && error && (
            <p style={{ color: 'var(--vermilion)', margin: 0 }}>
              {error}{' '}
              <button onClick={() => { setResult(null); analyse(); }}
                style={{ background: 'none', border: 'none', color: 'var(--vermilion)', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
                Try again
              </button>
            </p>
          )}

          {/* Result */}
          {isLoggedIn && !loading && result && (
            <div>
              {/* Header row: ring + summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <MatchRing percent={result.matchPercent} />
                <div>
                  <p style={{ margin: '0 0 0.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {result.matchPercent >= 70
                      ? 'Strong match — apply with confidence'
                      : result.matchPercent >= 40
                      ? 'Partial match — some upskilling needed'
                      : 'Skills gap — focus on learning path first'}
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                    {result.matchedSkills.length} of {result.allJdSkills.length} required skills matched
                    {result.cached && <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>(cached)</span>}
                  </p>
                </div>
              </div>

              {/* Matched skills */}
              {result.matchedSkills.length > 0 && (
                <div style={{ marginBottom: '0.8rem' }}>
                  <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--jade)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    ✓ You have these
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {result.matchedSkills.map(s => (
                      <span key={s} style={{
                        padding: '0.15rem 0.55rem', borderRadius: '20px',
                        background: 'rgba(30,122,82,0.1)', color: 'var(--jade)',
                        border: '1px solid rgba(30,122,82,0.25)', fontWeight: 600,
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {result.missingSkills.length > 0 && (
                <div style={{ marginBottom: '0.8rem' }}>
                  <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'var(--vermilion)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    ✗ Gaps to close
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {result.missingSkills.map((s: MissingSkill) => (
                      <Link key={s.skillId} href={s.learnUrl}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.15rem 0.55rem', borderRadius: '20px',
                          background: 'rgba(192,40,28,0.07)', color: 'var(--vermilion)',
                          border: '1px solid rgba(192,40,28,0.2)', fontWeight: 600,
                          textDecoration: 'none', fontSize: '0.75rem',
                        }}>
                        {s.name}
                        <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>→ Learn</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended paths */}
              {result.recommendedPaths.length > 0 && (
                <div style={{ paddingTop: '0.6rem', borderTop: '1px solid var(--parchment)' }}>
                  <p style={{ margin: '0 0 0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Recommended learning paths:
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {result.recommendedPaths.map(pathId => (
                      <Link key={pathId} href={`/learn/${pathId}`}
                        style={{
                          padding: '0.25rem 0.7rem', borderRadius: '20px',
                          background: 'rgba(200,138,20,0.1)', color: 'var(--amber)',
                          border: '1px solid rgba(200,138,20,0.25)',
                          fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                        }}>
                        {PATH_LABELS[pathId] ?? pathId}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
