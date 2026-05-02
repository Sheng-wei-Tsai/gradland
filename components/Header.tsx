'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ThemeToggle from '@/components/ThemeToggle';
import { ReadinessScoreMini } from '@/components/ReadinessScore';
import { useState, useRef, useEffect } from 'react';
import EIcon, { EIconName } from '@/components/icons/EIcon';

/* ── Zone data ─────────────────────────────────────────────── */

const PREPARE_ITEMS = [
  { href: '/resume',         label: 'Resume Analyser', desc: 'AI feedback for AU IT roles',        icon: 'resume'        as EIconName },
  { href: '/cover-letter',   label: 'Cover Letter',    desc: 'GPT-4.1, AU English structure',      icon: 'pencil-letter' as EIconName },
  { href: '/interview-prep', label: 'Interview Prep',  desc: 'Alex mentor, company-specific Qs',  icon: 'target'        as EIconName },
  { href: '/learn',          label: 'Learning Paths',  desc: '5 AU IT career paths + spaced rep',  icon: 'books'         as EIconName },
  { href: '/learn/youtube',  label: 'YouTube Learning', desc: 'Gemini study guide from any video', icon: 'video'         as EIconName },
];

/* Left column of the Search mega-dropdown */
const SEARCH_DIRECT = [
  { href: '/jobs',         label: 'Job Search',   desc: 'Live AU jobs, working rights filter', icon: 'briefcase' as EIconName },
  { href: '/posts/githot', label: 'GitHub Hot',   desc: 'Trending repos daily',               icon: 'fire'      as EIconName },
  { href: '/digest',       label: 'Daily Digest', desc: 'Auto-generated daily summaries',     icon: 'newspaper' as EIconName },
  { href: '/posts',        label: 'All Posts',    desc: 'Blog, AI news, visa news',           icon: 'brush'     as EIconName },
];

/* AU Insights items — used for mobile Search drawer + active detection */
const AU_INSIGHTS_ITEMS = [
  { href: '/au-insights',                  label: 'AU Companies',   desc: 'Company tiers, culture & interview Qs', icon: 'trophy'   as EIconName },
  { href: '/au-insights?tab=salary',       label: 'Salary Checker', desc: 'Paste your offer → AI verdict',         icon: 'coin'     as EIconName },
  { href: '/au-insights?tab=skillmap',     label: 'Skill Map',      desc: 'Your skills → matching AU roles',       icon: 'map'      as EIconName },
  { href: '/au-insights?tab=sponsorship',  label: 'Visa Sponsors',  desc: 'Top 20 by 482 sponsorship volume',      icon: 'passport' as EIconName },
  { href: '/au-insights?tab=gradprograms', label: 'Grad Programs',  desc: 'Live status, deadlines, apply links',   icon: 'cap'      as EIconName },
  { href: '/au-insights?tab=visa',         label: 'Visa Guide',     desc: '482/SID — 6 steps, costs & timeline',  icon: 'plane'    as EIconName },
  { href: '/au-insights?tab=visa-news',    label: 'Visa News',      desc: 'Daily immigration & student visa updates', icon: 'newspaper' as EIconName },
];

/* Right column — compact AU Insights items for Search mega-menu */
const AU_MEGA_ITEMS = [
  { href: '/au-insights',                   label: 'Company Tiers',  icon: 'trophy'   as EIconName },
  { href: '/au-insights?tab=ecosystem',     label: 'IT Ecosystem',   icon: 'chart'    as EIconName },
  { href: '/au-insights?tab=market',        label: 'Job Market',     icon: 'coin'     as EIconName },
  { href: '/au-insights?tab=salary',        label: 'Salary Checker', icon: 'coin'     as EIconName },
  { href: '/au-insights?tab=skillmap',      label: 'Skill Map',      icon: 'map'      as EIconName },
  { href: '/au-insights?tab=gradprograms',  label: 'Grad Programs',  icon: 'cap'      as EIconName },
  { href: '/au-insights?tab=sponsorship',   label: 'Visa Sponsors',  icon: 'passport' as EIconName },
  { href: '/au-insights?tab=visa',          label: 'Visa Guide',     icon: 'plane'    as EIconName },
  { href: '/au-insights?tab=guide',         label: 'Career Guide',   icon: 'rocket'   as EIconName },
  { href: '/au-insights?tab=compare',       label: 'Compare',        icon: 'scale'    as EIconName },
];

const TRACK_ITEMS = [
  { href: '/dashboard',              label: 'Dashboard',    desc: 'Applications + career pipeline',     icon: 'chart'    as EIconName },
  { href: '/dashboard/visa-tracker', label: 'Visa Tracker', desc: '6-step 482 tracker, doc checklists', icon: 'passport' as EIconName },
];

/* Flat list for zone active detection */
const ALL_SEARCH_ITEMS = [...SEARCH_DIRECT, ...AU_INSIGHTS_ITEMS];

type Drawer = 'prepare' | 'me' | null;

/* ── Shared sub-components ──────────────────────────────────── */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DropPanel({ children }: { children: React.ReactNode }) {
  return (
    <div role="menu" style={{
      position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
      width: 'min(260px, 90vw)', background: 'var(--warm-white)',
      border: '2px solid var(--parchment)', borderRadius: '12px',
      boxShadow: 'var(--panel-shadow), 0 16px 40px var(--shadow-color)',
      padding: '0.5rem', zIndex: 60, overflow: 'hidden',
    }}>
      <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--vermilion) 0%, var(--gold) 50%, var(--jade) 100%)', borderRadius: '2px 2px 0 0', marginBottom: '0.4rem' }} />
      {children}
    </div>
  );
}

function DropItem({ href, icon, label, desc, onClick }: { href: string; icon: EIconName; label: string; desc: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} role="menuitem" className="drop-item"
      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.5rem 0.6rem', borderRadius: '7px', textDecoration: 'none', transition: 'background 0.12s ease' }}>
      <div style={{ width: '28px', height: '28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'rgba(192,40,28,0.07)', color: 'var(--terracotta)', marginTop: '1px' }}>
        <EIcon name={icon} size={15} />
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown-dark)', lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', lineHeight: 1.35, marginTop: '1px' }}>{desc}</div>
      </div>
    </Link>
  );
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.1rem 0.55rem 0.25rem', opacity: 0.7 }}>{label}</div>
  );
}

function GroupDivider() {
  return <div style={{ height: '1px', background: 'var(--parchment)', margin: '0.35rem 0.4rem' }} />;
}

/* Compact link for AU Insights items inside the Search mega-menu */
function MegaItem({ href, icon, label, onClick }: { href: string; icon: EIconName; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} role="menuitem" className="drop-item"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', borderRadius: '7px', textDecoration: 'none', transition: 'background 0.12s ease' }}>
      <EIcon name={icon} size={13} style={{ color: 'var(--terracotta)', flexShrink: 0 }} />
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brown-dark)', whiteSpace: 'nowrap' }}>{label}</span>
    </Link>
  );
}

/* ── Main component ── */
export default function Header() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, loading, signOut } = useAuth();

  const [openMenu,     setOpenMenu]    = useState<'prepare' | 'search' | 'track' | null>(null);
  const [avatarOpen,   setAvatarOpen]  = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<Drawer>(null);

  const navRef    = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  /* Close nav dropdowns on outside click */
  useEffect(() => {
    if (!openMenu) return;
    function h(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [openMenu]);

  /* Close avatar on outside click */
  useEffect(() => {
    if (!avatarOpen) return;
    function h(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [avatarOpen]);

  /* Close everything on route change */
  useEffect(() => {
    setOpenMenu(null);
    setAvatarOpen(false);
    setMobileDrawer(null);
  }, [pathname]);

  const handleSignOut = async () => { await signOut(); router.push('/'); };

  const isActive = (href: string) => {
    const path = href.split('?')[0];
    return path === '/' ? pathname === '/' : pathname.startsWith(path);
  };
  const isZoneActive = (items: { href: string }[]) => items.some(i => isActive(i.href));

  const prepareOpen = openMenu === 'prepare';
  const searchOpen  = openMenu === 'search';
  const trackOpen   = openMenu === 'track';

  /* Desktop nav link style */
  const navLink = (active: boolean): React.CSSProperties => ({
    padding: '0.3em 0.9em', borderRadius: '4px',
    fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.2, textDecoration: 'none',
    background: active ? 'var(--vermilion)' : 'transparent',
    color: active ? 'white' : 'var(--text-secondary)',
    boxShadow: active ? '2px 2px 0 rgba(20,10,5,0.3)' : 'none',
    transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', whiteSpace: 'nowrap',
  });

  return (
    <>
      {/* ── Top bar ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.75rem 0', background: 'transparent' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

          <nav ref={navRef} className="desktop-nav" style={{
            background: 'rgba(253,245,228,0.88)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '2.5px solid rgba(20,10,5,0.18)', borderRadius: '8px',
            padding: '0.3rem 0.4rem',
            boxShadow: '3px 3px 0 rgba(20,10,5,0.14)',
            display: 'flex', gap: '0.35rem', alignItems: 'center',
          }}>
            <Link href="/" style={navLink(isActive('/'))}>Home</Link>

            {/* Prepare — dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpenMenu(m => m === 'prepare' ? null : 'prepare')}
                onKeyDown={e => { if (e.key === 'Escape') setOpenMenu(null); }}
                aria-haspopup="true"
                aria-expanded={prepareOpen}
                style={{ ...navLink(isZoneActive(PREPARE_ITEMS)), border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3em' }}
              >
                Prepare <Chevron open={prepareOpen} />
              </button>
              {prepareOpen && (
                <DropPanel>
                  {PREPARE_ITEMS.map(item => (
                    <DropItem key={item.href} {...item} onClick={() => setOpenMenu(null)} />
                  ))}
                </DropPanel>
              )}
            </div>

            {/* Search — mega-dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpenMenu(m => m === 'search' ? null : 'search')}
                onKeyDown={e => { if (e.key === 'Escape') setOpenMenu(null); }}
                aria-haspopup="true"
                aria-expanded={searchOpen}
                style={{ ...navLink(isZoneActive(ALL_SEARCH_ITEMS)), border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3em' }}
              >
                Search <Chevron open={searchOpen} />
              </button>
              {searchOpen && (
                <div role="menu" style={{
                  position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
                  width: 'min(440px, 92vw)', background: 'var(--warm-white)',
                  border: '2px solid var(--parchment)', borderRadius: '12px',
                  boxShadow: 'var(--panel-shadow), 0 16px 40px var(--shadow-color)',
                  padding: '0.6rem', zIndex: 60, overflow: 'hidden',
                }}>
                  <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--vermilion) 0%, var(--gold) 50%, var(--jade) 100%)', borderRadius: '2px 2px 0 0', marginBottom: '0.5rem' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 0.75rem' }}>
                    {/* Left: direct links */}
                    <div>
                      <GroupLabel label="Find roles" />
                      {SEARCH_DIRECT.map(item => (
                        <DropItem key={item.href} {...item} onClick={() => setOpenMenu(null)} />
                      ))}
                    </div>
                    {/* Right: AU Insights */}
                    <div>
                      <GroupLabel label="AU Insights" />
                      {AU_MEGA_ITEMS.map(item => (
                        <MegaItem key={item.href} {...item} onClick={() => setOpenMenu(null)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Track — dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpenMenu(m => m === 'track' ? null : 'track')}
                onKeyDown={e => { if (e.key === 'Escape') setOpenMenu(null); }}
                aria-haspopup="true"
                aria-expanded={trackOpen}
                style={{ ...navLink(isZoneActive(TRACK_ITEMS)), border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3em' }}
              >
                Track <Chevron open={trackOpen} />
              </button>
              {trackOpen && (
                <DropPanel>
                  {TRACK_ITEMS.map(item => (
                    <DropItem key={item.href} {...item} onClick={() => setOpenMenu(null)} />
                  ))}
                </DropPanel>
              )}
            </div>
          </nav>

          <ThemeToggle />
        </div>

        {/* Avatar — absolute far right */}
        {!loading && (
          <div ref={avatarRef} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }}>
            {user ? (
              <ReadinessScoreMini>
                <button onClick={() => setAvatarOpen(o => !o)} aria-label="Account menu" aria-expanded={avatarOpen} aria-haspopup="true" style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'var(--terracotta)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 600,
                  overflow: 'hidden', flexShrink: 0, border: 'none',
                  boxShadow: avatarOpen ? '0 0 0 2px rgba(192,40,28,0.5)' : 'none',
                  cursor: 'pointer', padding: 0, transition: 'box-shadow 0.15s ease',
                }}>
                  {user.user_metadata?.avatar_url
                    ? <Image src={user.user_metadata.avatar_url} alt="avatar" width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user.email?.[0].toUpperCase()}
                </button>
              </ReadinessScoreMini>
            ) : (
              <Link href="/login" style={{
                background: 'var(--terracotta)', border: 'none', borderRadius: '99px',
                padding: '0.35rem 1.1rem', fontSize: '0.83rem', fontWeight: 600,
                color: 'white', cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(180,60,40,0.2)',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>Sign in</Link>
            )}

            {avatarOpen && user && (
              <div role="menu" className="content-dropdown" style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                width: '200px', background: 'var(--warm-white)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                border: '2px solid var(--parchment)', borderRadius: '10px',
                boxShadow: 'var(--panel-shadow), 0 12px 32px var(--shadow-color)',
                padding: '0.5rem', zIndex: 60,
              }}>
                <div style={{ padding: '0.3rem 0.6rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--parchment)', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
                {[
                  { href: '/dashboard',              label: 'Dashboard' },
                  { href: '/dashboard/visa-tracker', label: 'Visa Tracker' },
                  { href: '/pricing',                label: 'Upgrade to Pro' },
                  { href: '/about',                  label: 'About' },
                ].map(({ href, label }) => (
                  <AvatarLink key={href} href={href} label={label} onClick={() => setAvatarOpen(false)} />
                ))}
                <div style={{ height: '1px', background: 'var(--parchment)', margin: '0.2rem 0.4rem' }} />
                <button onClick={() => { setAvatarOpen(false); handleSignOut(); }} role="menuitem" style={{
                  width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)',
                  textAlign: 'left', transition: 'background 0.12s ease', fontFamily: 'inherit',
                }}
                            className="drop-item"
                >Sign out</button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">

        {/* Drawer backdrop */}
        {mobileDrawer && (
          <div onClick={() => setMobileDrawer(null)} aria-hidden="true" style={{
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)',
          }} />
        )}

        {/* Prepare drawer */}
        {mobileDrawer === 'prepare' && (
          <MobileDrawer title="Prepare" onClose={() => setMobileDrawer(null)}>
            {PREPARE_ITEMS.map(item => (
              <MobileDrawerItem key={item.href} {...item} active={isActive(item.href)} onClick={() => setMobileDrawer(null)} />
            ))}
          </MobileDrawer>
        )}

        {/* Me drawer */}
        {mobileDrawer === 'me' && (
          <div style={{
            position: 'fixed', bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)',
            width: 'calc(100% - 2.4rem)', maxWidth: '420px',
            background: 'var(--warm-white)', border: '2px solid var(--parchment)',
            borderRadius: '20px', padding: '0.75rem', zIndex: 95,
            boxShadow: 'var(--panel-shadow), 0 -4px 32px var(--shadow-color)',
          }}>
            {user ? (
              <>
                <div style={{ padding: '0.3rem 0.75rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--parchment)', marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
                {[
                  { href: '/dashboard',              label: 'Dashboard',      icon: 'chart'     as EIconName },
                  { href: '/dashboard/visa-tracker', label: 'Visa Tracker',   icon: 'passport'  as EIconName },
                  { href: '/pricing',                label: 'Upgrade to Pro', icon: 'sparkles'  as EIconName },
                  { href: '/about',                  label: 'About',          icon: 'wave'      as EIconName },
                ].map(({ href, label, icon }) => (
                  <MobileDrawerItem key={href} href={href} icon={icon} label={label} desc="" active={isActive(href)} onClick={() => setMobileDrawer(null)} />
                ))}
                <div style={{ height: '1px', background: 'var(--parchment)', margin: '0.3rem 0.5rem' }} />
                <button onClick={() => { setMobileDrawer(null); handleSignOut(); }} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.75rem', borderRadius: '10px',
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <EIcon name="wave" size={18} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-muted)' }}>Sign out</span>
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileDrawer(null)} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '12px',
                textDecoration: 'none', background: 'var(--vermilion)',
              }}>
                <EIcon name="person" size={18} style={{ color: 'white' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>Sign in</span>
              </Link>
            )}
          </div>
        )}

        {/* Main tab bar — Home | Search | Prepare | Me */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          background: 'var(--warm-white)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '2.5px solid var(--parchment)', borderRadius: '8px',
          padding: '0.55rem 0.25rem', boxShadow: 'var(--panel-shadow)', width: '100%',
        }}>
          <MobileTab href="/" active={isActive('/')} label="Home" icon={<IconHome active={isActive('/')} />} />

          {/* Search → direct link to /jobs */}
          <MobileTab href="/jobs" active={isActive('/jobs') || isZoneActive(ALL_SEARCH_ITEMS)} label="Search" icon={<IconSearch active={isActive('/jobs') || isZoneActive(ALL_SEARCH_ITEMS)} />} />

          {/* Prepare → drawer */}
          <MobileDrawerTab
            label="Prepare"
            active={isZoneActive(PREPARE_ITEMS)}
            open={mobileDrawer === 'prepare'}
            onClick={() => setMobileDrawer(d => d === 'prepare' ? null : 'prepare')}
            icon={<IconLearn active={isZoneActive(PREPARE_ITEMS) || mobileDrawer === 'prepare'} />}
          />

          {/* Me */}
          {!loading && (
            user ? (
              <button
                onClick={() => setMobileDrawer(d => d === 'me' ? null : 'me')}
                aria-label="Account menu"
                aria-expanded={mobileDrawer === 'me'}
                aria-haspopup="true"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                  padding: '0.35rem 0.5rem', borderRadius: '4px',
                  background: mobileDrawer === 'me' ? 'var(--vermilion)' : 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s', minWidth: '44px',
                }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden',
                  background: mobileDrawer === 'me' ? 'white' : 'var(--vermilion)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, color: 'white',
                }}>
                  {user.user_metadata?.avatar_url
                    ? <Image src={user.user_metadata.avatar_url} alt="" width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user.email?.[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 500, color: mobileDrawer === 'me' ? 'white' : 'var(--text-muted)' }}>Me</span>
              </button>
            ) : (
              <Link href="/login" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                padding: '0.35rem 0.5rem', borderRadius: '4px', textDecoration: 'none',
                background: isActive('/login') ? 'var(--vermilion)' : 'transparent',
                transition: 'all 0.15s', minWidth: '44px',
              }}>
                <IconAbout active={isActive('/login')} />
                <span style={{ fontSize: '0.6rem', fontWeight: 500, color: isActive('/login') ? 'white' : 'var(--text-muted)' }}>Sign in</span>
              </Link>
            )
          )}
        </div>
      </nav>
    </>
  );
}

/* ── Avatar popover link ── */
function AvatarLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} role="menuitem" className="drop-item" style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.45rem 0.6rem', borderRadius: '6px',
      textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, color: 'var(--brown-dark)',
      transition: 'background 0.12s ease',
    }}>{label}</Link>
  );
}

/* ── Mobile drawer wrapper ── */
function MobileDrawer({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 2.4rem)', maxWidth: '420px',
      background: 'var(--warm-white)', border: '2.5px solid rgba(20,10,5,0.16)',
      borderRadius: '16px', padding: '0.75rem', zIndex: 95,
      boxShadow: '4px 4px 0 rgba(20,10,5,0.12), 0 -4px 32px rgba(44,31,20,0.1)',
    }}>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--vermilion) 0%, var(--gold) 50%, var(--jade) 100%)', borderRadius: '2px', marginBottom: '0.5rem' }} />
      <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.3rem' }}>{title}</p>
      {children}
    </div>
  );
}

/* ── Mobile drawer item ── */
function MobileDrawerItem({ href, icon, label, desc, active, onClick }: {
  href: string; icon: EIconName; label: string; desc: string; active: boolean; onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.6rem 0.75rem', borderRadius: '10px', textDecoration: 'none',
      background: active ? 'rgba(192,40,28,0.08)' : 'transparent',
      borderLeft: `3px solid ${active ? 'var(--vermilion)' : 'transparent'}`,
      marginBottom: '0.15rem', transition: 'background 0.12s ease',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
        background: active ? 'rgba(192,40,28,0.12)' : 'var(--parchment)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? 'var(--terracotta)' : 'var(--text-muted)',
      }}>
        <EIcon name={icon} size={18} />
      </div>
      <div>
        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: active ? 'var(--terracotta)' : 'var(--brown-dark)' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '1px' }}>{desc}</div>}
      </div>
    </Link>
  );
}

/* ── Mobile tab button (for drawer zones) ── */
function MobileDrawerTab({ label, active, open, onClick, icon }: {
  label: string; active: boolean; open: boolean; onClick: () => void; icon: React.ReactNode;
}) {
  const highlight = active || open;
  return (
    <button onClick={onClick} aria-label={label} aria-expanded={open} aria-haspopup="true" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
      padding: '0.35rem 0.5rem', borderRadius: '4px',
      background: highlight ? 'var(--vermilion)' : open ? 'rgba(192,40,28,0.07)' : 'transparent',
      boxShadow: highlight ? '2px 2px 0 rgba(20,10,5,0.3)' : 'none',
      border: open && !active ? '1px solid rgba(192,40,28,0.3)' : '1px solid transparent',
      cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', minWidth: '44px',
    }}>
      {icon}
      <span style={{ fontSize: '0.6rem', fontWeight: highlight ? 600 : 500, color: highlight ? 'white' : 'var(--text-muted)' }}>{label}</span>
    </button>
  );
}

/* ── Comic-style SVG icons ─────────────────────────────────────────────────
   Design language: 2.5px brush strokes · round caps/joins · ink-blob accent
   dots · one character detail per icon that feels hand-drawn, not generic.
─────────────────────────────────────────────────────────────────────────── */
function IconHome({ active }: { active: boolean }) {
  const c = active ? 'white' : 'var(--text-muted)';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 11.5L12 3L21 11.5" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 10V21H9.5V14.5H14.5V21H19V10" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 6.5V4" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="17" cy="3" r="1.3" fill={c}/>
    </svg>
  );
}

/* Magnifier — Search */
function IconSearch({ active }: { active: boolean }) {
  const c = active ? 'white' : 'var(--text-muted)';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke={c} strokeWidth="2.5"/>
      <path d="M15.5 15.5L20.5 20.5" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="10.5" cy="10.5" r="2.5" fill={c} opacity="0.35"/>
    </svg>
  );
}

/* Open book — Prepare */
function IconLearn({ active }: { active: boolean }) {
  const c = active ? 'white' : 'var(--text-muted)';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4.5L5 5.5V19.5L12 18.5V4.5Z" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M12 4.5L19 5.5V19.5L12 18.5V4.5Z" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M7.5 9H10.5M7.5 11.5H9.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15.5 8.5L16 10L17.5 10L16.3 11L16.8 12.5L15.5 11.6L14.2 12.5L14.7 11L13.5 10L15 10Z" fill={c}/>
    </svg>
  );
}

function IconAbout({ active }: { active: boolean }) {
  const c = active ? 'white' : 'var(--text-muted)';
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4.5" stroke={c} strokeWidth="2.5"/>
      <path d="M4.5 21C4.5 17 8 14 12 14C16 14 19.5 17 19.5 21" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="10.3" cy="8" r="1" fill={c}/>
      <circle cx="13.7" cy="8" r="1" fill={c}/>
    </svg>
  );
}

/* ── Desktop tab link ── */
function MobileTab({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
      textDecoration: 'none', padding: '0.35rem 0.5rem', borderRadius: '4px',
      background: active ? 'var(--vermilion)' : 'transparent',
      boxShadow: active ? '2px 2px 0 rgba(20,10,5,0.3)' : 'none',
      transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', minWidth: '44px',
    }}>
      {icon}
      <span style={{ fontSize: '0.6rem', fontWeight: active ? 600 : 500, color: active ? 'white' : 'var(--text-muted)' }}>
        {label}
      </span>
    </Link>
  );
}
