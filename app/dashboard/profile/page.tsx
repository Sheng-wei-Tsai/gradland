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

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [onboardingRole, setOnboardingRole] = useState<string | null>(null);
  const [memberSince, setMemberSince]       = useState<string>('');

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
