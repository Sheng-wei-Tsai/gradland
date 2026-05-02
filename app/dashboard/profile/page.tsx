'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ReadinessScore from '@/components/ReadinessScore';
import { supabase } from '@/lib/supabase';

const ROLE_LABELS: Record<string, string> = {
  frontend:      'Frontend Developer',
  fullstack:     'Full-Stack Developer',
  backend:       'Backend Developer',
  'data-engineer': 'Data Engineer',
  devops:        'DevOps / Cloud',
  mobile:        'Mobile Developer',
  qa:            'QA Engineer',
};

type NetworkProfile = {
  role_title: string;
  visa_type:  string;
  skills:     string[];
  city:       string;
};

const VISA_OPTIONS = [
  { value: '485', label: '485 — Graduate' },
  { value: '482', label: '482 — Employer Sponsored' },
  { value: 'student', label: 'Student visa' },
  { value: 'pr', label: 'Permanent Resident' },
  { value: 'citizen', label: 'Citizen' },
  { value: 'other', label: 'Other' },
];

const CITY_OPTIONS = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Other'];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [onboardingRole, setOnboardingRole] = useState<string | null>(null);
  const [memberSince, setMemberSince]       = useState<string>('');

  // Community network state
  const [networkProfile, setNetworkProfile]   = useState<NetworkProfile | null>(null);
  const [networkLoading, setNetworkLoading]   = useState(true);
  const [showNetworkForm, setShowNetworkForm] = useState(false);
  const [networkSaving, setNetworkSaving]     = useState(false);
  const [networkError, setNetworkError]       = useState('');

  // Form fields
  const [nRole,   setNRole]   = useState('');
  const [nVisa,   setNVisa]   = useState('485');
  const [nSkills, setNSkills] = useState('');
  const [nCity,   setNCity]   = useState('Sydney');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('onboarding_role, created_at')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setOnboardingRole(data?.onboarding_role ?? null);
        if (data?.created_at) {
          setMemberSince(new Date(data.created_at).toLocaleDateString('en-AU', {
            month: 'long', year: 'numeric',
          }));
        } else {
          setMemberSince(new Date(user.created_at).toLocaleDateString('en-AU', {
            month: 'long', year: 'numeric',
          }));
        }
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/network/profile')
      .then(r => r.ok ? r.json() : null)
      .then((data: NetworkProfile | null) => {
        setNetworkProfile(data);
        if (data) populateForm(data);
      })
      .catch(() => {})
      .finally(() => setNetworkLoading(false));
  }, [user]);

  function populateForm(p: NetworkProfile) {
    setNRole(p.role_title);
    setNVisa(p.visa_type);
    setNSkills(p.skills.join(', '));
    setNCity(p.city);
  }

  async function handleSaveNetwork(e: React.FormEvent) {
    e.preventDefault();
    setNetworkError('');
    const role_title = nRole.trim().slice(0, 100);
    if (!role_title) { setNetworkError('Role title is required.'); return; }

    const skills = nSkills
      .split(',')
      .map(s => s.trim().slice(0, 50))
      .filter(Boolean)
      .slice(0, 20);

    setNetworkSaving(true);
    try {
      const res = await fetch('/api/network/profile', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role_title, visa_type: nVisa, skills, city: nCity }),
      });
      if (!res.ok) throw new Error('save failed');
      const saved: NetworkProfile = await res.json();
      setNetworkProfile(saved);
      setShowNetworkForm(false);
    } catch {
      setNetworkError('Could not save. Please try again.');
    } finally {
      setNetworkSaving(false);
    }
  }

  async function handleLeaveNetwork() {
    setNetworkSaving(true);
    try {
      await fetch('/api/network/profile', { method: 'DELETE' });
      setNetworkProfile(null);
      setShowNetworkForm(false);
      setNRole(''); setNVisa('485'); setNSkills(''); setNCity('Sydney');
    } catch {
      // silently ignore — profile still visible until next load
    } finally {
      setNetworkSaving(false);
    }
  }

  if (authLoading || !user) return null;

  const avatarUrl  = user.user_metadata?.avatar_url as string | undefined;
  const fullName   = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? '';
  const initials   = fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
      {/* Back link */}
      <Link href="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem' }}>
        ← Dashboard
      </Link>

      <h1 style={{ fontFamily: "'Lora', serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '1.5rem' }}>
        My Profile
      </h1>

      {/* ── Identity card ─────────────────────────────────────── */}
      <div style={{ background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '14px', padding: '1.4rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={64}
              height={64}
              style={{ borderRadius: '50%', border: '2px solid var(--parchment)', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--vermilion)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', fontWeight: 700, flexShrink: 0,
              border: '2px solid var(--parchment)',
            }}>
              {initials}
            </div>
          )}
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)' }}>{fullName}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{user.email}</div>
            {onboardingRole && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                {ROLE_LABELS[onboardingRole] ?? onboardingRole}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--parchment)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Stat label="Member since" value={memberSince || '—'} />
          <Stat label="Auth provider" value={user.app_metadata?.provider === 'google' ? 'Google' : 'Email'} />
        </div>
      </div>

      {/* ── Readiness Score ───────────────────────────────────── */}
      <ReadinessScore />

      {/* ── Community Network ────────────────────────────────── */}
      <div style={{ background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '14px', padding: '1.4rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1rem', fontWeight: 600, color: 'var(--brown-dark)', margin: 0 }}>
            Community Network
          </h2>
          {!networkLoading && networkProfile && (
            <span style={{ fontSize: '0.73rem', background: 'rgba(30,122,82,0.12)', color: 'var(--jade)', padding: '0.15rem 0.55rem', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.03em' }}>
              Active
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          Share your role, visa, skills, and city anonymously so other seekers can find you — no name, no email.
        </p>

        {networkLoading ? (
          /* Skeleton shimmer */
          <div style={{ height: 36, background: 'var(--parchment)', borderRadius: 8, opacity: 0.45 }} />

        ) : networkProfile && !showNetworkForm ? (
          /* Profile summary view */
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem 1.5rem', marginBottom: '0.9rem' }}>
              <NetworkChip label="Role"   value={networkProfile.role_title} />
              <NetworkChip label="Visa"   value={networkProfile.visa_type.toUpperCase()} />
              <NetworkChip label="City"   value={networkProfile.city} />
              <NetworkChip
                label="Skills"
                value={
                  networkProfile.skills.length
                    ? networkProfile.skills.slice(0, 3).join(', ') + (networkProfile.skills.length > 3 ? ' …' : '')
                    : '—'
                }
              />
            </div>
            <div style={{ display: 'flex', gap: '0.55rem' }}>
              <button
                onClick={() => { populateForm(networkProfile); setShowNetworkForm(true); }}
                style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: '1.5px solid var(--parchment)', background: 'var(--warm-white)', color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Edit
              </button>
              <button
                onClick={handleLeaveNetwork}
                disabled={networkSaving}
                style={{ padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--vermilion)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Leave network
              </button>
            </div>
          </>

        ) : (showNetworkForm || !networkProfile) ? (
          /* Join / edit form */
          <form onSubmit={handleSaveNetwork} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Role title
              </label>
              <input
                className="search-input"
                type="text"
                value={nRole}
                onChange={e => setNRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                maxLength={100}
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Visa type
                </label>
                <select
                  className="search-select"
                  value={nVisa}
                  onChange={e => setNVisa(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {VISA_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  City
                </label>
                <select
                  className="search-select"
                  value={nCity}
                  onChange={e => setNCity(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {CITY_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Skills <span style={{ textTransform: 'none', fontStyle: 'italic' }}>(comma-separated)</span>
              </label>
              <input
                className="search-input"
                type="text"
                value={nSkills}
                onChange={e => setNSkills(e.target.value)}
                placeholder="e.g. React, TypeScript, AWS"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {networkError && (
              <p style={{ fontSize: '0.83rem', color: 'var(--vermilion)', margin: 0 }}>{networkError}</p>
            )}

            <div style={{ display: 'flex', gap: '0.55rem', marginTop: '0.1rem' }}>
              <button
                type="submit"
                disabled={networkSaving}
                style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', border: 'none', background: 'var(--vermilion)', color: 'white', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {networkSaving ? 'Saving…' : (networkProfile ? 'Save changes' : 'Join network')}
              </button>
              {showNetworkForm && (
                <button
                  type="button"
                  onClick={() => { setShowNetworkForm(false); setNetworkError(''); }}
                  style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1.5px solid var(--parchment)', background: 'var(--warm-white)', color: 'var(--text-primary)', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : null}
      </div>

      {/* ── Account actions ───────────────────────────────────── */}
      <div style={{ background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '14px', padding: '1.4rem' }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1rem', fontWeight: 600, color: 'var(--brown-dark)', marginBottom: '1rem' }}>
          Account
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <ActionRow href="/onboarding" label="Update career goal & role" />
          <ActionRow href="/pricing" label="Manage subscription" />
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--brown-dark)', marginTop: '0.15rem' }}>{value}</div>
    </div>
  );
}

function NetworkChip({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.1rem' }}>{value}</div>
    </div>
  );
}

function ActionRow({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.6rem 0', borderBottom: '1px solid var(--parchment)',
      textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.9rem',
    }}>
      {label}
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>→</span>
    </Link>
  );
}
