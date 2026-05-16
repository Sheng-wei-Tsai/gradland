'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const PathwayPlanner = dynamic(() => import('./PathwayPlanner'), { ssr: false });

export default function VisaPathwayPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem', paddingBottom: '5rem' }}>
      <div style={{ paddingTop: '2.5rem' }}>
        <Link href="/dashboard" style={{
          fontSize: '0.85rem', color: 'var(--terracotta)',
          textDecoration: 'none', fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        }}>
          ← Dashboard
        </Link>
      </div>
      <div style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <span style={{
          display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
          color: 'var(--terracotta)', background: 'rgba(192,40,28,0.08)',
          border: '1px solid rgba(192,40,28,0.25)', borderRadius: '99px',
          padding: '0.18rem 0.7rem', marginBottom: '0.9rem',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Pro feature
        </span>
        <h1 style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 700,
          color: 'var(--brown-dark)', lineHeight: 1.15, marginBottom: '0.7rem',
        }}>
          Your Visa Pathway to PR
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '56ch', marginBottom: '0.5rem' }}>
          One question every international grad asks: <em>"Which visa actually gets me to permanent residency, and how long does it take?"</em>
          {' '}Answer in 60 seconds. We score you against the live points test plus 482 / 186 / 491 employer pathways and tell you the fastest realistic route.
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          A migration agent charges $300+ to do this. Built into Pro.
        </p>
      </div>

      <PathwayPlanner />

      <div style={{
        marginTop: '3rem', background: 'var(--warm-white)', border: '1px solid var(--parchment)',
        borderRadius: '8px', padding: '0.9rem 1rem',
        fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        <strong>Disclaimer:</strong> This is a planning tool, not migration advice. Visa rules change with each annual budget;
        the engine reflects rules as of the 2025–26 program year (CSIT A$76,515; CSOL active from 7 Dec 2024). For binding
        guidance, consult a registered migration agent (MARA). Always cross-check at{' '}
        <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terracotta)' }}>
          immi.homeaffairs.gov.au
        </a>.
      </div>
    </div>
  );
}
