'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Profile {
  id: string;
  role_title: string;
  visa_type: string;
  skills: string[];
  city: string;
  created_at: string;
}

interface Props {
  initialProfiles: Profile[];
  isLoggedIn: boolean;
  hasProfile: boolean;
}

const VISA_LABELS: Record<string, string> = {
  '485': '485 Graduate',
  '482':  '482 Sponsored',
  student: 'Student 500',
  pr:      'Permanent Resident',
  citizen: 'Citizen / NZ',
  other:   'Other Visa',
};

const CITIES = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Other'];
const VISAS  = ['485', '482', 'student', 'pr', 'citizen', 'other'];

function lookingDuration(createdAt: string): string {
  const ms    = Date.now() - new Date(createdAt).getTime();
  const days  = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days < 7)  return `${days} day${days !== 1 ? 's' : ''}`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

function SeekerCard({ profile }: { profile: Profile }) {
  const duration = lookingDuration(profile.created_at);
  const visaLabel = VISA_LABELS[profile.visa_type] ?? profile.visa_type;

  return (
    <div
      className="comic-card"
      style={{
        background: 'var(--warm-white)',
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.7rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div>
          <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>
            {profile.role_title}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {profile.city} · looking for {duration}
          </div>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2em 0.7em',
            borderRadius: '4px',
            border: '1.5px solid var(--parchment)',
            color: 'var(--text-secondary)',
            background: 'var(--cream)',
            whiteSpace: 'nowrap',
          }}
        >
          {visaLabel}
        </span>
      </div>

      {profile.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {profile.skills.slice(0, 8).map(skill => (
            <span
              key={skill}
              style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                padding: '0.18em 0.65em',
                borderRadius: '4px',
                background: 'rgba(30,122,82,0.08)',
                color: 'var(--jade)',
                border: '1.5px solid rgba(30,122,82,0.25)',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NetworkPageClient({ initialProfiles, isLoggedIn, hasProfile }: Props) {
  const [cityFilter, setCityFilter]  = useState('');
  const [visaFilter, setVisaFilter]  = useState('');
  const [roleSearch, setRoleSearch]  = useState('');

  const filtered = useMemo(() => {
    return initialProfiles.filter(p => {
      if (cityFilter && p.city !== cityFilter) return false;
      if (visaFilter && p.visa_type !== visaFilter) return false;
      if (roleSearch && !p.role_title.toLowerCase().includes(roleSearch.toLowerCase())) return false;
      return true;
    });
  }, [initialProfiles, cityFilter, visaFilter, roleSearch]);

  const activeFilters = [cityFilter, visaFilter, roleSearch].filter(Boolean).length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--ink)', marginBottom: '0.5rem' }}>
          The AU IT Job Seeker Network
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 540, marginBottom: '1.25rem' }}>
          Connect with international IT graduates in your city who are in the same situation.
          All profiles are anonymous — no names, no emails.
        </p>

        {!hasProfile && (
          <Link
            href="/dashboard/profile"
            style={{
              display: 'inline-block',
              padding: '0.65rem 1.4rem',
              background: 'var(--vermilion)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '8px',
              border: '2px solid var(--ink)',
              boxShadow: 'var(--panel-shadow)',
              textDecoration: 'none',
            }}
          >
            Join the network →
          </Link>
        )}
        {hasProfile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25em 0.75em', borderRadius: '4px', background: 'rgba(30,122,82,0.1)', color: 'var(--jade)', border: '1.5px solid rgba(30,122,82,0.3)' }}>
              ✓ Your profile is active
            </span>
            <Link href="/dashboard/profile" style={{ fontSize: '0.85rem', color: 'var(--vermilion)', textDecoration: 'underline' }}>
              Edit
            </Link>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="search-panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search role…"
            value={roleSearch}
            onChange={e => setRoleSearch(e.target.value)}
            style={{ flex: '1', minWidth: 160 }}
            aria-label="Search by role"
          />
          <select
            className="search-select search-select-lg"
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            aria-label="Filter by city"
          >
            <option value="">All cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="search-select search-select-lg"
            value={visaFilter}
            onChange={e => setVisaFilter(e.target.value)}
            aria-label="Filter by visa"
          >
            <option value="">All visas</option>
            {VISAS.map(v => <option key={v} value={v}>{VISA_LABELS[v]}</option>)}
          </select>
          {activeFilters > 0 && (
            <button
              onClick={() => { setCityFilter(''); setVisaFilter(''); setRoleSearch(''); }}
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.85rem',
                background: 'none',
                border: '1.5px solid var(--parchment)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontFamily: 'inherit',
              }}
            >
              Clear ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        {filtered.length === 0
          ? 'No active seekers match your filters'
          : `Showing ${filtered.length} active seeker${filtered.length !== 1 ? 's' : ''}${cityFilter ? ` in ${cityFilter}` : ''}`
        }
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="network-seeker-grid">
          {filtered.map(p => <SeekerCard key={p.id} profile={p} />)}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-muted)',
            border: '2px dashed var(--parchment)',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>No seekers found</div>
          <div style={{ fontSize: '0.88rem' }}>Try adjusting your filters, or be the first to join!</div>
          {!isLoggedIn && (
            <Link
              href="/login"
              style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--vermilion)', fontWeight: 700, textDecoration: 'underline' }}
            >
              Sign in to join →
            </Link>
          )}
        </div>
      )}

      {/* CTA footer */}
      {!isLoggedIn && filtered.length > 0 && (
        <div
          style={{
            marginTop: '2.5rem',
            padding: '1.5rem',
            background: 'var(--warm-white)',
            border: 'var(--panel-border)',
            borderRadius: '12px',
            boxShadow: 'var(--panel-shadow)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink)', marginBottom: '0.4rem' }}>
            Want to appear here?
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Create a free account and opt-in to the network. Your real name is never shown.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '0.65rem 1.4rem',
              background: 'var(--vermilion)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '8px',
              border: '2px solid var(--ink)',
              boxShadow: 'var(--panel-shadow)',
              textDecoration: 'none',
            }}
          >
            Get started for free →
          </Link>
        </div>
      )}
    </div>
  );
}
