'use client';
import { Suspense, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import CompanyTiers from './CompanyTiers';
import ITEcosystem from './ITEcosystem';
import CareerGuide from './CareerGuide';
import Sponsorship from './Sponsorship';

function TabSkeleton() {
  return (
    <div style={{ paddingTop: '1rem' }}>
      {[80, 60, 90, 55, 70].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? '1.5rem' : '0.85rem',
          width: `${w}%`, borderRadius: '6px', marginBottom: '0.75rem',
          background: 'var(--parchment)', animation: 'pulse 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.08}s`,
        }} />
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ height: '6rem', borderRadius: '10px', background: 'var(--parchment)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
    </div>
  );
}

const JobMarketCharts   = dynamic(() => import('./JobMarketCharts'), { ssr: false, loading: () => <TabSkeleton /> });
const SalaryChecker     = dynamic(() => import('./salary-checker/SalaryChecker'), { ssr: false, loading: () => <TabSkeleton /> });
const GradProgramsContent = dynamic(
  () => import('./grad-programs/page').then(m => ({ default: m.GradProgramsContent })),
  { ssr: false, loading: () => <TabSkeleton /> }
);
const SkillMap      = dynamic(() => import('./SkillMap'), { ssr: false, loading: () => <TabSkeleton /> });
const VisaGuide     = dynamic(() => import('./VisaGuide'), { ssr: false, loading: () => <TabSkeleton /> });
const CompanyCompare = dynamic(() => import('./CompanyCompare'), { ssr: false, loading: () => <TabSkeleton /> });
const VisaNews       = dynamic(() => import('./VisaNews'), { ssr: false, loading: () => <TabSkeleton /> });

type Tab = 'tiers' | 'ecosystem' | 'guide' | 'sponsorship' | 'market' | 'salary' | 'gradprograms' | 'skillmap' | 'visa' | 'compare' | 'visa-news';

const SECTIONS: {
  id: Tab; emoji: string; label: string; desc: string; tag: string;
  bg: string; border: string; accent: string;
}[] = [
  { id: 'tiers',        emoji: '🏆', label: 'Company Tiers',  tag: 'Rankings',    desc: 'God Tier to Avoid — ranked by eng culture, growth & comp',          bg: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)', border: '#d97706', accent: '#fbbf24' },
  { id: 'ecosystem',    emoji: '🗂', label: 'IT Ecosystem',   tag: 'Overview',    desc: 'How the 4 layers of AU IT connect — and which one to target',        bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', border: '#4338ca', accent: '#818cf8' },
  { id: 'sponsorship',  emoji: '🛂', label: 'Visa Sponsors',  tag: 'Visa',        desc: 'Top 20 IT companies ranked by 482 visa sponsorship volume',          bg: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)', border: '#0ea5e9', accent: '#38bdf8' },
  { id: 'guide',        emoji: '🚀', label: 'Career Guide',   tag: 'Strategy',    desc: 'Grad programs, resume rules, job market, offers & career path',      bg: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)', border: '#7c3aed', accent: '#a78bfa' },
  { id: 'market',       emoji: '📊', label: 'Job Market',     tag: 'Data',        desc: 'ABS vacancy trends, ACS salary benchmarks, QILT graduate outcomes',  bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', border: '#059669', accent: '#34d399' },
  { id: 'salary',       emoji: '💰', label: 'Salary Checker', tag: 'Tools',       desc: 'Paste your offer — AI verdict + negotiation script you can send now', bg: 'linear-gradient(135deg, #14532d 0%, #166534 100%)', border: '#16a34a', accent: '#4ade80' },
  { id: 'gradprograms', emoji: '🎓', label: 'Grad Programs',  tag: 'Listings',    desc: 'Every major AU IT grad program — live status, deadlines, apply links', bg: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)', border: '#ea580c', accent: '#fb923c' },
  { id: 'skillmap',     emoji: '🗺', label: 'Skill Map',      tag: 'Interactive', desc: 'Select your skills → matching AU roles, salaries & what to learn next', bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '#475569', accent: '#94a3b8' },
  { id: 'visa',         emoji: '🛫', label: 'Visa Guide',     tag: '482 / SID',   desc: '6 steps, timelines, costs, tips & watch-outs for ICT workers',        bg: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)', border: '#3b82f6', accent: '#60a5fa' },
  { id: 'compare',      emoji: '⚖️', label: 'Compare',        tag: 'Side-by-side', desc: 'Pick 2–3 companies — comp, culture, WFH, interview difficulty, visa', bg: 'linear-gradient(135deg, #3b0764 0%, #581c87 100%)', border: '#9333ea', accent: '#c084fc' },
  { id: 'visa-news',   emoji: '📰', label: 'Visa News',      tag: 'Live',         desc: 'Daily immigration updates — 482, student visa, PR pathways',           bg: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)', border: '#0ea5e9', accent: '#38bdf8' },
];

const VALID_TABS = new Set<Tab>(SECTIONS.map(s => s.id));

function AUInsightsContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const tabParam = params.get('tab') as Tab | null;
  const activeTab: Tab = tabParam && VALID_TABS.has(tabParam) ? tabParam : 'tiers';
  const contentRef = useRef<HTMLDivElement>(null);

  /* Preload all chunks immediately after mount */
  useEffect(() => {
    import('./JobMarketCharts');
    import('./salary-checker/SalaryChecker');
    import('./grad-programs/page');
    import('./SkillMap');
    import('./VisaGuide');
    import('./CompanyCompare');
    import('./VisaNews');
  }, []);

  const pillRowRef = useRef<HTMLDivElement>(null);

  /* Scroll active pill to left edge of the row */
  useEffect(() => {
    const row = pillRowRef.current;
    if (!row) return;
    const active = row.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (!active) return;
    const rowLeft  = row.getBoundingClientRect().left;
    const btnLeft  = active.getBoundingClientRect().left;
    row.scrollBy({ left: btnLeft - rowLeft - 12, behavior: 'smooth' });
  }, [activeTab]);

  const setActiveTab = useCallback((tab: Tab) => {
    const p = new URLSearchParams(params.toString());
    p.set('tab', tab);
    router.push(`?${p.toString()}`, { scroll: false });
    /* Smooth scroll to content */
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [params, router]);

  const active = SECTIONS.find(s => s.id === activeTab)!;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* Header */}
      <section style={{ paddingTop: '4.5rem', paddingBottom: '2.5rem' }}>
        <h1 style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700,
          color: 'var(--brown-dark)', lineHeight: 1.15, marginBottom: '0.9rem',
        }}>
          Australian IT Career Insights
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '55ch' }}>
          Practical, opinionated guides to landing and growing an IT career in Australia —
          the things your university didn't teach you.
        </p>
      </section>

      {/* Section pill row */}
      <div style={{ position: 'relative', marginBottom: '2.5rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: '2px', width: '3rem', background: 'linear-gradient(to right, transparent, var(--bg, #faf7f2))', pointerEvents: 'none', zIndex: 1 }} />
        <div ref={pillRowRef} style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px', paddingRight: '2rem' }}>
          {SECTIONS.map(sec => {
            const isActive = sec.id === activeTab;
            return (
              <button
                key={sec.id}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => setActiveTab(sec.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.5rem 1rem', borderRadius: '99px', flexShrink: 0,
                  background: isActive ? sec.bg : 'var(--warm-white)',
                  border: `1.5px solid ${isActive ? sec.border : 'var(--parchment)'}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? `2px 2px 0 rgba(20,10,5,0.2), 0 0 12px ${sec.border}50` : 'none',
                }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{sec.emoji}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? '#f8fafc' : 'var(--brown-dark)', whiteSpace: 'nowrap' }}>{sec.label}</span>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.03em',
                  color: isActive ? sec.accent : 'var(--text-muted)',
                  background: isActive ? `rgba(255,255,255,0.18)` : 'var(--parchment)',
                  padding: '0.15em 0.5em', borderRadius: '99px',
                }}>{sec.tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ scrollMarginTop: '80px' }}>
        {/* Active section header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          marginBottom: '1.5rem', paddingBottom: '1rem',
          borderBottom: `2px solid ${active.border}`,
        }}>
          <span style={{ fontSize: '1.4rem' }}>{active.emoji}</span>
          <div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '0.1rem' }}>
              {active.label}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{active.desc}</p>
          </div>
        </div>

        {activeTab === 'tiers'        && <CompanyTiers />}
        {activeTab === 'ecosystem'    && <ITEcosystem />}
        {activeTab === 'sponsorship'  && <Sponsorship />}
        {activeTab === 'guide'        && <CareerGuide />}
        {activeTab === 'market'       && <JobMarketCharts />}
        {activeTab === 'salary'       && (
          <div style={{ paddingBottom: '4rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem', lineHeight: 1.5 }}>
              International grads accept offers 15–30% below market on average. Don&apos;t be one of them.
            </p>
            <SalaryChecker />
            <div style={{ marginTop: '3rem', background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '8px', padding: '0.9rem 1rem', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong>Data sources:</strong> Salary ranges from ACS / Think & Grow Australian Tech Salary Guide 2025
              and ACS Information Age (ia.acs.org.au). All figures are base salary in AUD — superannuation (11.5%) is additional.
              Verify current rates on{' '}
              <a href="https://www.seek.com.au/career-advice/salary-insights" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terracotta)' }}>
                SEEK Salary Insights
              </a>{' '}before negotiating.
            </div>
          </div>
        )}
        {activeTab === 'gradprograms' && <GradProgramsContent />}
        {activeTab === 'skillmap'     && <SkillMap />}
        {activeTab === 'visa'         && <VisaGuide />}
        {activeTab === 'compare'      && <CompanyCompare />}
        {activeTab === 'visa-news'    && <VisaNews />}
      </div>

    </div>
  );
}

export default function AUInsightsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4.5rem 1.5rem', color: 'var(--text-muted)' }}>Loading…</div>}>
      <AUInsightsContent />
    </Suspense>
  );
}
