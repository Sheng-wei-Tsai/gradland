'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import UpgradeCTA from '@/components/UpgradeCTA';
import type {
  PathwayInput, PathwayAnalysis, PathwayResult, PathwayVerdict,
  AgeBracket, EnglishLevel, EducationLevel, StateCode,
} from '@/lib/visa-pathway';
import type { VisaStatus } from '@/lib/visa-rules';

// ── Static option lists ─────────────────────────────────────────────
const VISA_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: 'graduate', label: 'Graduate visa (485)' },
  { value: 'working',  label: 'Working visa (482 / TSS)' },
  { value: 'student',  label: 'Student visa (500)' },
  { value: 'outside',  label: 'Outside Australia' },
  { value: 'resident', label: 'Resident or citizen' },
  { value: 'unsure',   label: 'Not sure' },
];

const AGE_OPTIONS: { value: AgeBracket; label: string }[] = [
  { value: 'u25',   label: 'Under 25' },
  { value: '25-32', label: '25–32' },
  { value: '33-39', label: '33–39' },
  { value: '40-44', label: '40–44' },
  { value: '45+',   label: '45+' },
];

const ENGLISH_OPTIONS: { value: EnglishLevel; label: string }[] = [
  { value: 'competent',  label: 'Competent (IELTS 6 / PTE 50)' },
  { value: 'proficient', label: 'Proficient (IELTS 7 / PTE 65) — +10 pts' },
  { value: 'superior',   label: 'Superior (IELTS 8 / PTE 79) — +20 pts' },
];

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: 'doctorate',          label: 'Doctorate (PhD)' },
  { value: 'bachelor-or-master', label: 'Bachelor or Masters' },
  { value: 'diploma',            label: 'Diploma / Trade qualification' },
  { value: 'aqf-recognised',     label: 'Other AQF-recognised' },
  { value: 'other',              label: 'Not yet recognised' },
];

const STATE_OPTIONS: { value: StateCode; label: string }[] = [
  { value: 'NSW', label: 'NSW' },
  { value: 'VIC', label: 'VIC' },
  { value: 'QLD', label: 'QLD' },
  { value: 'WA',  label: 'WA'  },
  { value: 'SA',  label: 'SA'  },
  { value: 'TAS', label: 'TAS' },
  { value: 'ACT', label: 'ACT' },
  { value: 'NT',  label: 'NT'  },
];

const COMMON_ANZSCO: { code: string; label: string }[] = [
  { code: '261313', label: 'Software Engineer / Developer (261313)' },
  { code: '261312', label: 'Developer Programmer (261312)' },
  { code: '261311', label: 'Analyst Programmer (261311)' },
  { code: '261212', label: 'Web Developer (261212)' },
  { code: '261314', label: 'Software Tester (261314)' },
  { code: '261111', label: 'ICT Business Analyst (261111)' },
  { code: '261112', label: 'Systems Analyst (261112)' },
  { code: '262111', label: 'Database Administrator (262111)' },
  { code: '262112', label: 'ICT Security Specialist (262112)' },
  { code: '263111', label: 'Computer Network & Systems Engineer (263111)' },
  { code: '263213', label: 'ICT Systems Test Engineer (263213)' },
  { code: '135112', label: 'ICT Project Manager (135112)' },
];

// ── Helpers ──────────────────────────────────────────────────────────
function expYearsToBracket(years: number | null): number {
  if (years === null) return 0;
  return Math.max(0, Math.min(50, years));
}

const VERDICT_COLOUR: Record<PathwayVerdict, { fg: string; bg: string; bd: string; label: string }> = {
  'eligible':                  { fg: 'var(--jade)',      bg: 'rgba(30,122,82,0.07)', bd: 'rgba(30,122,82,0.3)',  label: 'Eligible now' },
  'eligible-with-nomination':  { fg: 'var(--jade)',      bg: 'rgba(30,122,82,0.07)', bd: 'rgba(30,122,82,0.3)',  label: 'Eligible with nomination' },
  'close':                     { fg: 'var(--gold)',      bg: 'rgba(200,138,20,0.07)', bd: 'rgba(200,138,20,0.3)', label: 'Close — gap to close' },
  'blocked':                   { fg: 'var(--terracotta)', bg: 'rgba(192,40,28,0.06)', bd: 'rgba(192,40,28,0.25)', label: 'Blocked' },
};

// ── Component ────────────────────────────────────────────────────────
export default function PathwayPlanner() {
  const { user, loading: authLoading } = useAuth();

  // Form state
  const [currentVisa,     setCurrentVisa]     = useState<VisaStatus>('graduate');
  const [anzsco,          setAnzsco]          = useState<string>('261313');
  const [ageBracket,      setAgeBracket]      = useState<AgeBracket>('25-32');
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [englishLevel,    setEnglishLevel]    = useState<EnglishLevel>('proficient');
  const [educationLevel,  setEducationLevel]  = useState<EducationLevel>('bachelor-or-master');
  const [salary,          setSalary]          = useState<number>(85_000);
  const [state,           setState]           = useState<StateCode>('NSW');

  // Result + UI state
  const [analysis,    setAnalysis]    = useState<PathwayAnalysis | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [needsPro,    setNeedsPro]    = useState(false);
  const [needsAuth,   setNeedsAuth]   = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Pre-fill from profile
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setProfileLoaded(true); return; }
    let cancelled = false;
    fetch('/api/dashboard/summary')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data) { setProfileLoaded(true); return; }
        const v = data.onboardingVisaStatus as VisaStatus | null;
        if (v) setCurrentVisa(v);
        const code = data.onboardingAnzsco as string | null;
        if (code && /^\d{6}$/.test(code)) setAnzsco(code);
        const yrs = data.onboardingExperienceYrs as number | null;
        if (typeof yrs === 'number') setExperienceYears(expYearsToBracket(yrs));
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    setNeedsPro(false);
    setNeedsAuth(false);

    const payload: PathwayInput = {
      currentVisa, anzsco, ageBracket, experienceYears,
      englishLevel, educationLevel, salary, state,
    };

    try {
      const res = await fetch('/api/visa/pathway', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (res.status === 401) { setNeedsAuth(true); return; }
      if (res.status === 403) { setNeedsPro(true); return; }
      if (res.status === 429) { setError('Daily limit reached — try again in 24 hours.'); return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Request failed (${res.status})`);
        return;
      }

      const data = await res.json() as { analysis: PathwayAnalysis };
      setAnalysis(data.analysis);
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [currentVisa, anzsco, ageBracket, experienceYears, englishLevel, educationLevel, salary, state]);

  // ── Auth gate ──────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div style={infoCardStyle}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.5rem' }}>
          Sign in to plan your pathway
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          The Visa Pathway Planner needs your profile to give an accurate result. Sign in or create a free account first.
        </p>
        <Link href="/login" style={primaryLinkStyle}>Sign in →</Link>
      </div>
    );
  }

  // ── Pro upgrade gate ───────────────────────────────────────────────
  if (needsPro) {
    return (
      <UpgradeCTA
        headline="Pathway Planner is a Pro feature"
        body="Pro unlocks the full points-test breakdown, all five visa subclasses (189 / 190 / 491 / 482 / 186), state nomination matching, PR timeline projection, and 100 daily AI calls across every Gradland tool."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Form */}
      <div style={cardStyle}>
        <p style={sectionLabelStyle}>Your situation</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
          <Field label="Current visa">
            <select value={currentVisa} onChange={e => setCurrentVisa(e.target.value as VisaStatus)} style={inputStyle}>
              {VISA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Occupation (ANZSCO)">
            <select value={anzsco} onChange={e => setAnzsco(e.target.value)} style={inputStyle}>
              {COMMON_ANZSCO.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Age">
            <select value={ageBracket} onChange={e => setAgeBracket(e.target.value as AgeBracket)} style={inputStyle}>
              {AGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Years of skilled experience">
            <input
              type="number" min={0} max={50}
              value={experienceYears}
              onChange={e => setExperienceYears(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
              style={inputStyle}
            />
          </Field>
          <Field label="English level">
            <select value={englishLevel} onChange={e => setEnglishLevel(e.target.value as EnglishLevel)} style={inputStyle}>
              {ENGLISH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Highest qualification">
            <select value={educationLevel} onChange={e => setEducationLevel(e.target.value as EducationLevel)} style={inputStyle}>
              {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Current / offered salary (AUD)">
            <input
              type="number" min={0} max={1_000_000} step={1000}
              value={salary}
              onChange={e => setSalary(Math.max(0, Math.min(1_000_000, Number(e.target.value) || 0)))}
              style={inputStyle}
            />
          </Field>
          <Field label="Target state">
            <select value={state} onChange={e => setState(e.target.value as StateCode)} style={inputStyle}>
              {STATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>

        {!profileLoaded && user && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.6rem 0 0' }}>
            Loading your profile…
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
          <button onClick={submit} disabled={submitting} style={submitting ? disabledBtnStyle : primaryBtnStyle}>
            {submitting ? 'Analysing…' : 'Analyse my pathway →'}
          </button>
        </div>

        {needsAuth && (
          <p style={{ fontSize: '0.85rem', color: 'var(--terracotta)', marginTop: '0.7rem' }}>
            Session expired — <Link href="/login" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>sign in again</Link> to continue.
          </p>
        )}
        {error && (
          <p role="alert" style={{ fontSize: '0.85rem', color: 'var(--terracotta)', marginTop: '0.7rem' }}>
            {error}
          </p>
        )}
      </div>

      {/* Results */}
      {analysis && <ResultsView analysis={analysis} />}
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brown-dark)' }}>{label}</span>
      {children}
    </label>
  );
}

function ResultsView({ analysis }: { analysis: PathwayAnalysis }) {
  const top = analysis.topPick;
  const topColours = VERDICT_COLOUR[top.verdict];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* Top pick */}
      <div style={{ ...cardStyle, borderColor: topColours.bd, background: topColours.bg }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: topColours.fg, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.4rem' }}>
          Recommended path
        </p>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--brown-dark)', margin: '0 0 0.6rem' }}>
          {top.visaName}
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--brown-dark)', lineHeight: 1.65, margin: '0 0 0.8rem' }}>
          {analysis.summary}
        </p>
        <div style={{ background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '8px', padding: '0.7rem 0.9rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }}>
            Next step
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--brown-dark)', lineHeight: 1.55 }}>
            {top.next}
          </span>
        </div>
      </div>

      {/* All pathways */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        <p style={sectionLabelStyle}>All pathways scored</p>
        {analysis.pathways.map(p => <PathwayCard key={p.visa} pathway={p} />)}
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', margin: 0 }}>
        Analysis run {new Date(analysis.computedAt).toLocaleString('en-AU')}
      </p>
    </div>
  );
}

function PathwayCard({ pathway }: { pathway: PathwayResult }) {
  const c = VERDICT_COLOUR[pathway.verdict];
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: `1.5px solid ${c.bd}`, borderRadius: '12px',
      background: 'var(--warm-white)', overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.85rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'inherit', gap: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brown-dark)' }}>
            {pathway.visaName}
          </span>
          {pathway.pointsScore !== null && pathway.pointsRequired !== null && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {pathway.pointsScore} / {pathway.pointsRequired} points
            </span>
          )}
        </div>
        <span style={{
          fontSize: '0.75rem', fontWeight: 700, color: c.fg,
          padding: '0.18rem 0.6rem', borderRadius: '99px',
          background: c.bg, border: `1px solid ${c.bd}`,
          flexShrink: 0,
        }}>
          {c.label}
        </span>
        <span aria-hidden="true" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--parchment)' }}>
          <div style={{ paddingTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {pathway.missing.length > 0 && (
              <div>
                <span style={miniLabelStyle}>What's needed</span>
                <ul style={{ margin: '0.3rem 0 0', paddingLeft: '1.1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {pathway.missing.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}
            <div>
              <span style={miniLabelStyle}>Next action</span>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', color: 'var(--brown-dark)', lineHeight: 1.6 }}>
                {pathway.next}
              </p>
            </div>
            {pathway.timeToEligibility && (
              <div>
                <span style={miniLabelStyle}>Timeline</span>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {pathway.timeToEligibility}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: 'var(--warm-white)',
  border: '1px solid var(--parchment)',
  borderRadius: '12px',
  padding: '1.3rem',
};

const infoCardStyle: React.CSSProperties = {
  ...cardStyle,
  textAlign: 'center',
  padding: '2.5rem 1.5rem',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.1em', margin: '0 0 0.9rem',
};

const miniLabelStyle: React.CSSProperties = {
  fontSize: '0.68rem', fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px',
  border: '1px solid var(--parchment)', background: 'var(--warm-white)',
  fontSize: '0.9rem', color: 'var(--brown-dark)', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '0.7rem 1.5rem', borderRadius: '99px',
  background: 'var(--terracotta)', color: 'white',
  border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
  fontFamily: 'inherit', boxShadow: '3px 3px 0 var(--ink)',
};

const disabledBtnStyle: React.CSSProperties = {
  ...primaryBtnStyle,
  background: 'var(--parchment)', color: 'var(--text-muted)',
  cursor: 'not-allowed', boxShadow: 'none',
};

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.65rem 1.4rem', borderRadius: '99px',
  background: 'var(--terracotta)', color: 'white',
  fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
  fontFamily: 'inherit', boxShadow: '3px 3px 0 var(--ink)',
};
