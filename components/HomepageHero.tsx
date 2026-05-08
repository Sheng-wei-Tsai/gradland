'use client';
import { useAuth } from '@/components/AuthProvider';
import PersonalisedHero from '@/components/PersonalisedHero';
import PublicHero from '@/components/PublicHero';

function Shimmer({ w, h, radius = 8 }: { w: string; h: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: `${h}px`, borderRadius: `${radius}px`,
      background: 'linear-gradient(90deg, var(--parchment) 25%, var(--warm-white) 50%, var(--parchment) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function HeroSkeleton() {
  return (
    <section style={{ paddingTop: '3rem', paddingBottom: '2.5rem' }}>
      {/* Greeting row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--parchment)', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Shimmer w="180px" h={20} radius={6} />
          <Shimmer w="120px" h={13} radius={4} />
        </div>
      </div>

      {/* Next action card */}
      <div style={{
        background: 'var(--warm-white)', border: '1px solid var(--parchment)',
        borderLeft: '4px solid var(--parchment)', borderRadius: '14px',
        padding: '1.2rem 1.4rem', marginBottom: '1rem',
      }}>
        <Shimmer w="120px" h={11} radius={4} />
        <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <Shimmer w="60%" h={18} radius={5} />
            <Shimmer w="80%" h={13} radius={4} />
          </div>
          <Shimmer w="90px" h={34} radius={99} />
        </div>
      </div>

      {/* Today strip */}
      <div style={{ display: 'flex', gap: '0.7rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, padding: '0.8rem 1rem',
            background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: '12px',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            <Shimmer w="28px" h={22} radius={4} />
            <Shimmer w="70%" h={12} radius={4} />
            <Shimmer w="50%" h={11} radius={4} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomepageHero() {
  const { user, loading } = useAuth();

  if (loading) return <HeroSkeleton />;
  if (user) return <PersonalisedHero user={user} />;
  return <PublicHero />;
}
