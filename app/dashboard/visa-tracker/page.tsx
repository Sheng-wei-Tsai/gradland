'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

// ── Step data (mirrors VisaGuide.tsx) ──────────────────────────────────────────
interface StepDef {
  number: number;
  title: string;
  who: 'You' | 'Employer' | 'DHA';
  timeRange: string;
  cost: string;
  description: string;
  documents: string[];
  tips: string[];
  watchOuts: string[];
}

const STEPS: StepDef[] = [
  {
    number: 1, title: 'Skills Assessment (ACS)', who: 'You',
    timeRange: '8–12 weeks', cost: '~$530',
    description: 'ACS assesses whether your qualifications and experience meet the standard for your nominated ANZSCO occupation.',
    documents: ['Degree transcripts + English translation', 'Employment reference letters (company letterhead)', 'Position descriptions for each role', 'Passport copy'],
    tips: ['Apply for the correct ANZSCO code (most ICT roles: 261xx or 262xx).', 'Gather all documents before applying — incomplete applications are common delays.'],
    watchOuts: ['ACS assessment is valid for 12 months — time it carefully.', 'Negative assessments can be appealed but add months.'],
  },
  {
    number: 2, title: 'Employer Becomes Standard Business Sponsor', who: 'Employer',
    timeRange: '1–8 weeks', cost: '~$420 (employer pays)',
    description: 'Your employer must be approved as a Standard Business Sponsor by the Department of Home Affairs before nominating you.',
    documents: ['Business registration documents', 'Financial statements', 'Evidence of operating business'],
    tips: ['Ask HR if the company is already an accredited sponsor — most Tier 1 companies are, cutting this to ~1 week.'],
    watchOuts: ['SBS approval is not transferable between employers.', 'Startups may face extra scrutiny about business viability.'],
  },
  {
    number: 3, title: 'Nomination', who: 'Employer',
    timeRange: '4–12 weeks', cost: '~$330 + SAF levy (employer pays)',
    description: 'Employer nominates you for a specific position. The role must be on the Skills in Demand occupation list. SAF levy applies.',
    documents: ['Position description', 'Organisation chart', 'Labour Market Testing evidence (if required)', 'SAF levy payment'],
    tips: ['Salary must meet TSMIT (~$73,150 AUD in 2025).', 'SAF levy is $1,200–$1,800/year — employer pays upfront.'],
    watchOuts: ['Your occupation MUST be on the CSOL/STSOL — confirm before starting.', 'Labour Market Testing requires the role to have been advertised for 4 weeks.'],
  },
  {
    number: 4, title: 'Visa Application Lodgement', who: 'You',
    timeRange: 'Same day', cost: '~$3,115',
    description: 'Lodge your 482 / Skills in Demand visa application via ImmiAccount. Pay the visa application charge at lodgement.',
    documents: ['ACS skills assessment', 'Nomination approval (or lodge simultaneously)', 'Passport', 'English test results (IELTS/PTE)', 'Relationship evidence (if including family)'],
    tips: ['Include all family members in the same application.', 'Bridging visa A is granted immediately if you\'re already in Australia.'],
    watchOuts: ['The $3,115 fee is non-refundable.', 'Secondary applicants (family) each incur ~$1,040.'],
  },
  {
    number: 5, title: 'Health & Character Checks', who: 'You',
    timeRange: '2–4 weeks', cost: '~$300–$500',
    description: 'DHA will request health examinations and police clearances from all countries you\'ve lived in for 12+ months.',
    documents: ['Health examination results (panel physician)', 'Police clearance certificates (all applicable countries)', 'Chest X-ray results'],
    tips: ['Book a panel physician appointment immediately when requested — popular clinics book out 2–3 weeks.'],
    watchOuts: ['Police certificates from some countries take 6–8 weeks — request early.', 'Undisclosed health conditions can lead to refusal.'],
  },
  {
    number: 6, title: 'Visa Grant', who: 'DHA',
    timeRange: '4–24 weeks (median ~8 weeks ICT)', cost: 'No additional cost',
    description: 'DHA reviews your complete application. ICT occupations typically receive priority processing.',
    documents: ['No new documents typically required'],
    tips: ['ICT roles receive priority processing under the Skills in Demand stream.', 'You can work for the sponsoring employer on your Bridging Visa while waiting.'],
    watchOuts: ['Do not resign before visa is granted, not just lodged.', 'Complex health/character cases can extend to 6+ months.'],
  },
];

const WHO_COLORS: Record<string, string> = {
  You:      'var(--terracotta)',
  Employer: 'var(--jade)',
  DHA:      'var(--gold)',
};

// ── Step state types ──────────────────────────────────────────────────────────
type StepStatus = 'not_started' | 'in_progress' | 'completed';
interface StepState {
  status:      StepStatus;
  completedAt?: string;
  docs:        string[];   // checked document labels
  notes:       string;
}
type StepsMap = Record<string, StepState>;

function emptySteps(): StepsMap {
  return Object.fromEntries(
    STEPS.map(s => [String(s.number), { status: 'not_started' as StepStatus, docs: [], notes: '' }])
  );
}

// ── Estimate total weeks from a step index ────────────────────────────────────
const STEP_WEEKS_MID = [10, 4, 8, 0, 3, 12]; // midpoints
function estimateWeeksRemaining(completedCount: number): number {
  return STEP_WEEKS_MID.slice(completedCount).reduce((a, b) => a + b, 0);
}

// ── Debounced save ────────────────────────────────────────────────────────────
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(payload: object) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fetch('/api/visa-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, 800);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VisaTrackerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [employer,    setEmployer]    = useState('');
  const [occupation,  setOccupation]  = useState('');
  const [startedAt,   setStartedAt]   = useState('');
  const [steps,       setSteps]       = useState<StepsMap>(emptySteps());
  const [expanded,    setExpanded]    = useState<number | null>(null);
  const [dataLoaded,  setDataLoaded]  = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/visa-tracker')
      .then(r => r.json())
      .then(d => {
        if (d.error) return;
        if (d.employer)   setEmployer(d.employer);
        if (d.occupation) setOccupation(d.occupation);
        if (d.started_at) setStartedAt(d.started_at);
        if (d.steps && Object.keys(d.steps).length) setSteps({ ...emptySteps(), ...d.steps });
        setDataLoaded(true);
      })
      .catch(() => setDataLoaded(true));
  }, [user]);

  const save = useCallback((overrides?: Partial<{ employer: string; occupation: string; started_at: string; steps: StepsMap }>) => {
    debouncedSave({
      employer:   overrides?.employer   ?? employer,
      occupation: overrides?.occupation ?? occupation,
      started_at: overrides?.started_at ?? startedAt,
      steps:      overrides?.steps      ?? steps,
    });
  }, [employer, occupation, startedAt, steps]);

  const setStepStatus = (num: number, status: StepStatus) => {
    const next = {
      ...steps,
      [String(num)]: {
        ...steps[String(num)],
        status,
        completedAt: status === 'completed' ? new Date().toISOString().slice(0, 10) : steps[String(num)].completedAt,
      },
    };
    setSteps(next); save({ steps: next });
  };

  const toggleDoc = (num: number, doc: string) => {
    const cur = steps[String(num)];
    const docs = cur.docs.includes(doc) ? cur.docs.filter(d => d !== doc) : [...cur.docs, doc];
    const next = { ...steps, [String(num)]: { ...cur, docs } };
    setSteps(next); save({ steps: next });
  };

  const setNotes = (num: number, notes: string) => {
    const next = { ...steps, [String(num)]: { ...steps[String(num)], notes } };
    setSteps(next); save({ steps: next });
  };

  if (loading || !user) return null;

  const completedCount = STEPS.filter(s => steps[String(s.number)]?.status === 'completed').length;
  const inProgressStep = STEPS.find(s => steps[String(s.number)]?.status === 'in_progress');
  const nextUnstarted  = STEPS.find(s => steps[String(s.number)]?.status === 'not_started');
  const weeksLeft      = estimateWeeksRemaining(completedCount);

  const estGrantDate = (() => {
    if (!startedAt) return null;
    const d = new Date(startedAt);
    d.setDate(d.getDate() + weeksLeft * 7);
    return d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
  })();

  const statusIcon = (s: StepStatus) =>
    s === 'completed' ? '✅' : s === 'in_progress' ? '🔄' : '⬜';

  const statusLabel = (s: StepStatus) =>
    s === 'completed' ? 'Completed' : s === 'in_progress' ? 'In progress' : 'Not started';

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      <style>{`
        .step-card { transition: box-shadow 0.15s; }
        .step-card:hover { box-shadow: 0 2px 12px rgba(20,10,5,0.07); }
        input[type=text], input[type=date], textarea {
          font-family: inherit; font-size: 0.88rem;
          border: 1px solid var(--parchment); border-radius: 8px;
          background: var(--warm-white); color: var(--brown-dark);
          padding: 0.5rem 0.75rem; outline: none; width: 100%; box-sizing: border-box;
        }
        input[type=text]:focus, input[type=date]:focus, textarea:focus {
          border-color: var(--terracotta);
        }
      `}</style>

      {/* Header */}
      <div style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          <Link href="/dashboard" style={{ color: 'var(--terracotta)', textDecoration: 'none' }}>← Dashboard</Link>
          {' · '}
          <Link href="/au-insights?tab=visa" style={{ color: 'var(--terracotta)', textDecoration: 'none' }}>482 Visa Guide</Link>
        </p>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.4rem' }}>
          Visa Journey Tracker
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Track your 482 / Skills in Demand visa — step by step.
        </p>
      </div>

      {/* Overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
        {[
          { label: 'Steps completed', value: `${completedCount} / ${STEPS.length}`, color: 'var(--jade)' },
          { label: 'Weeks remaining (est.)', value: weeksLeft > 0 ? `~${weeksLeft}w` : 'Done!', color: 'var(--terracotta)' },
          { label: 'Est. grant', value: estGrantDate ?? '—', color: '#8b5cf6' },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Profile inputs */}
      <div style={{ background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Your details
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Employer</label>
            <input type="text" value={employer} placeholder="Company name"
              onChange={e => { setEmployer(e.target.value); save({ employer: e.target.value }); }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Occupation (ANZSCO)</label>
            <input type="text" value={occupation} placeholder="e.g. Software Engineer"
              onChange={e => { setOccupation(e.target.value); save({ occupation: e.target.value }); }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Journey start date</label>
            <input type="date" value={startedAt}
              onChange={e => { setStartedAt(e.target.value); save({ started_at: e.target.value }); }} />
          </div>
        </div>
      </div>

      {/* Current focus banner */}
      {(inProgressStep ?? nextUnstarted) && completedCount < STEPS.length && (
        <div style={{
          background: 'rgba(200,138,20,0.12)', border: '1px solid rgba(200,138,20,0.35)', borderRadius: '10px',
          padding: '0.85rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.85rem',
          color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <span>📍</span>
          <span>
            <strong>Current focus:</strong>{' '}
            Step {(inProgressStep ?? nextUnstarted)!.number} — {(inProgressStep ?? nextUnstarted)!.title}
            {' '}· {(inProgressStep ?? nextUnstarted)!.timeRange} · {(inProgressStep ?? nextUnstarted)!.cost}
          </span>
        </div>
      )}
      {completedCount === STEPS.length && (
        <div style={{ background: 'rgba(30,122,82,0.08)', border: '1px solid rgba(30,122,82,0.35)', borderRadius: '10px', padding: '0.85rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--jade)' }}>
          🎉 <strong>Congratulations!</strong> All steps completed. Welcome to Australia! 🇦🇺
        </div>
      )}

      {/* Step list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {STEPS.map((step, idx) => {
          const state   = steps[String(step.number)] ?? { status: 'not_started' as StepStatus, docs: [], notes: '' };
          const isOpen  = expanded === step.number;
          const isLocked = idx > 0 && steps[String(STEPS[idx - 1].number)]?.status === 'not_started';

          const prevStep = idx > 0 ? STEPS[idx - 1] : null;

          return (
            <div key={step.number} className="step-card" style={{
              background: 'var(--warm-white)', border: '1px solid var(--parchment)',
              borderRadius: '12px', overflow: 'hidden',
              opacity: isLocked ? 0.55 : 1,
            }}>
              {/* Step header — click to expand */}
              <button
                onClick={() => !isLocked && setExpanded(isOpen ? null : step.number)}
                title={isLocked && prevStep ? `Complete Step ${prevStep.number}: ${prevStep.title} first` : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  width: '100%', padding: '1rem 1.1rem', background: 'none', border: 'none',
                  cursor: isLocked ? 'not-allowed' : 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{statusIcon(state.status)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--brown-dark)', fontSize: '0.92rem' }}>
                      Step {step.number}: {step.title}
                    </span>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.15em 0.55em', borderRadius: '5px',
                      background: `${WHO_COLORS[step.who]}18`, color: WHO_COLORS[step.who],
                    }}>
                      {step.who}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {step.timeRange} · {step.cost}
                    {state.status === 'completed' && state.completedAt && (
                      <span style={{ marginLeft: '0.5rem', color: 'var(--jade)' }}>· Completed {state.completedAt}</span>
                    )}
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                  {isLocked
                    ? <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--parchment)', padding: '0.15em 0.5em', borderRadius: '5px' }}>🔒 locked</span>
                    : (isOpen ? '▲' : '▼')
                  }
                </span>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ padding: '0 1.1rem 1.25rem', borderTop: '1px solid var(--parchment)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.7, margin: '1rem 0' }}>
                    {step.description}
                  </p>

                  {/* Status control */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {(['not_started', 'in_progress', 'completed'] as StepStatus[]).map(s => (
                      <button key={s} onClick={() => setStepStatus(step.number, s)} style={{
                        padding: '0.35rem 0.85rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600,
                        border: state.status === s ? 'none' : '1px solid var(--parchment)',
                        background: state.status === s
                          ? s === 'completed' ? 'var(--jade)' : s === 'in_progress' ? 'var(--terracotta)' : 'var(--text-muted)'
                          : 'var(--warm-white)',
                        color: state.status === s ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                        {statusIcon(s)} {statusLabel(s)}
                      </button>
                    ))}
                  </div>

                  {/* Document checklist */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                      Documents checklist
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {step.documents.map(doc => {
                        const checked = state.docs.includes(doc);
                        return (
                          <label key={doc} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                            cursor: 'pointer', fontSize: '0.84rem', color: checked ? 'var(--text-muted)' : 'var(--text-secondary)',
                            textDecoration: checked ? 'line-through' : 'none',
                          }}>
                            <input type="checkbox" checked={checked} onChange={() => toggleDoc(step.number, doc)}
                              style={{ marginTop: '0.15rem', accentColor: 'var(--terracotta)', flexShrink: 0 }} />
                            {doc}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tips + watch-outs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(30,122,82,0.08)', borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--jade)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>💡 Tips</div>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                        {step.tips.map((t, i) => (
                          <li key={i} style={{ fontSize: '0.8rem', color: 'var(--jade)', lineHeight: 1.5, marginBottom: '0.25rem' }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ background: 'rgba(200,138,20,0.08)', borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>⚠️ Watch out</div>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                        {step.watchOuts.map((w, i) => (
                          <li key={i} style={{ fontSize: '0.8rem', color: 'var(--gold)', lineHeight: 1.5, marginBottom: '0.25rem' }}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Notes</label>
                    <textarea
                      value={state.notes}
                      onChange={e => setNotes(step.number, e.target.value)}
                      placeholder="Add notes, dates, contacts…"
                      rows={2}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cost summary */}
      <div style={{ background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '12px', padding: '1.25rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Estimated cost breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.4rem 1rem', fontSize: '0.83rem', alignItems: 'baseline' }}>
          {[
            ['ACS Skills Assessment',    'You',      '~$530'],
            ['Visa Application Charge',  'You',      '~$3,115'],
            ['Health Examinations',      'You',      '~$300–$500'],
            ['Police Certificates',      'You',      '~$50–$150'],
            ['SBS Sponsorship Fee',      'Employer', '~$420'],
            ['Nomination Fee',           'Employer', '~$330'],
            ['SAF Levy (2-year visa)',    'Employer', '~$2,400–$3,600'],
          ].map(([item, payer, amount]) => (
            <React.Fragment key={item}>
              <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
              <span style={{ color: WHO_COLORS[payer] ?? 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600, textAlign: 'right' }}>{payer}</span>
              <span style={{ fontWeight: 600, color: 'var(--brown-dark)', textAlign: 'right' }}>{amount}</span>
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--parchment)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--brown-dark)' }}>Your total cost</span>
          <span style={{ color: 'var(--terracotta)' }}>~$3,995–$4,295</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.6, marginTop: '1.5rem' }}>
        This tracker is for personal organisation only — not legal advice. Processing times and fees change.
        Always verify with the{' '}
        <a href="https://immi.homeaffairs.gov.au" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terracotta)' }}>
          Department of Home Affairs
        </a>
        {' '}and consider consulting a registered migration agent (MARN).
      </p>
    </div>
  );
}

// Forward declare React for JSX.Fragment
import React from 'react';
