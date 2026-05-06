'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthProvider';
import ThemeToggle from '@/components/ThemeToggle';
import LangToggle from '@/components/LangToggle';
import { ReadinessScoreMini } from '@/components/ReadinessScore';
import LogoMark from '@/components/icons/LogoMark';
import { useState, useRef, useEffect, useMemo } from 'react';
import EIcon, { EIconName } from '@/components/icons/EIcon';
import {
  TOOLS_MENU,
  INSIGHTS_MENU,
  ACCOUNT_LINKS,
  ALL_TOOLS_HREFS,
  ALL_INSIGHTS_HREFS,
  type NavItem,
} from '@/lib/nav';

type DesktopMenu = 'tools' | 'insights' | null;
type MobileSheet = 'tools' | 'insights' | 'account' | null;

/* ── Shared sub-components ──────────────────────────────────── */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      color: 'white', background: color, padding: '0.1em 0.45em', borderRadius: '4px',
      marginLeft: '0.4em', verticalAlign: 'middle',
    }}>{label}</span>
  );
}

function MegaItem({ item, label, desc, onClick }: { item: NavItem; label: string; desc: string; onClick: () => void }) {
  return (
    <Link href={item.href} onClick={onClick} role="menuitem" className="drop-item nav-focus"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
        padding: '0.55rem 0.6rem', borderRadius: '7px',
        textDecoration: 'none', transition: 'background 0.12s ease',
      }}>
      <div style={{
        width: '32px', height: '32px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '7px', background: 'rgba(192,40,28,0.07)',
        color: 'var(--terracotta)', marginTop: '1px',
      }}>
        <EIcon name={item.icon} size={16} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown-dark)', lineHeight: 1.3 }}>
          {label}
          {item.isNew   && <Badge label="NEW"   color="var(--vermilion)" />}
          {item.isDaily && <Badge label="DAILY" color="var(--jade)"      />}
        </div>
        <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', lineHeight: 1.35, marginTop: '2px' }}>{desc}</div>
      </div>
    </Link>
  );
}

function MegaColumn({ headerLabel, items, t, onItemClick }: {
  headerLabel: string;
  items:       NavItem[];
  t:           (key: string) => string;
  onItemClick: () => void;
}) {
  return (
    <div>
      <div style={{
        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        padding: '0.1rem 0.6rem 0.4rem', opacity: 0.75,
      }}>{headerLabel}</div>
      {items.map(item => (
        <MegaItem
          key={item.href}
          item={item}
          label={t(item.tKey)}
          desc={item.tDesc ? t(item.tDesc) : ''}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}

/* ── Main component ── */
export default function Header() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, loading, signOut } = useAuth();
  const t = useTranslations('nav');

  /* Read ?tab=... lazily on the client. Avoids useSearchParams() which forces
     a Suspense boundary on every page that mounts the Header. */
  const [currentTab, setCurrentTab] = useState('');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => setCurrentTab(new URLSearchParams(window.location.search).get('tab') ?? '');
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [pathname]);

  const [desktopMenu, setDesktopMenu] = useState<DesktopMenu>(null);
  const [avatarOpen,  setAvatarOpen]  = useState(false);
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null);

  const navRef    = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  /* Outside-click closes desktop menu */
  useEffect(() => {
    if (!desktopMenu) return;
    function h(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setDesktopMenu(null);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [desktopMenu]);

  /* Outside-click closes avatar */
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
    setDesktopMenu(null);
    setAvatarOpen(false);
    setMobileSheet(null);
  }, [pathname]);

  /* Lock body scroll when mobile sheet open */
  useEffect(() => {
    if (mobileSheet) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileSheet]);

  const handleSignOut = async () => { await signOut(); router.push('/'); };

  /* Active-state matching, including ?tab=... query params */
  const isActive = (href: string) => {
    const [path, qs] = href.split('?');
    if (path === '/') return pathname === '/';
    if (!pathname.startsWith(path)) return false;
    if (!qs) return pathname === path || pathname.startsWith(path + '/');
    // href has ?tab=foo — only active if current tab matches
    const targetTab = new URLSearchParams(qs).get('tab') ?? '';
    return currentTab === targetTab;
  };
  const isAnyActive = (hrefs: string[]) => hrefs.some(h => isActive(h));

  const toolsActive    = useMemo(() => isAnyActive(ALL_TOOLS_HREFS),    [pathname, currentTab]); // eslint-disable-line react-hooks/exhaustive-deps
  const insightsActive = useMemo(() => isAnyActive(ALL_INSIGHTS_HREFS), [pathname, currentTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const toolsOpen     = desktopMenu === 'tools';
  const insightsOpen  = desktopMenu === 'insights';

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
      {/* ─────────────────────────── DESKTOP TOP BAR ─────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.75rem 0', background: 'transparent' }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>

          {/* Logo */}
          <Link href="/" className="nav-focus brand-lockup" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: "'Lora', serif", fontWeight: 700, fontSize: '1.05rem',
            color: 'var(--brown-dark)', textDecoration: 'none', whiteSpace: 'nowrap',
            marginRight: '0.5rem',
          }} aria-label="TechPath AU — home">
            <LogoMark size={28} withShadow={false} decorative />
            TechPath
          </Link>

          <nav ref={navRef} className="desktop-nav" style={{
            background: 'rgba(253,245,228,0.88)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '2.5px solid rgba(20,10,5,0.18)', borderRadius: '8px',
            padding: '0.3rem 0.4rem',
            boxShadow: '3px 3px 0 rgba(20,10,5,0.14)',
            display: 'flex', gap: '0.35rem', alignItems: 'center',
          }}>

            {/* Tools — mega-menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDesktopMenu(m => m === 'tools' ? null : 'tools')}
                onKeyDown={e => { if (e.key === 'Escape') setDesktopMenu(null); }}
                aria-haspopup="true"
                aria-expanded={toolsOpen}
                className="nav-focus"
                style={{ ...navLink(toolsActive), border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3em' }}
              >
                {t('tools')} <Chevron open={toolsOpen} />
              </button>
              {toolsOpen && (
                <div role="menu" style={{
                  position: 'absolute', top: 'calc(100% + 10px)', left: '0',
                  width: 'min(540px, 92vw)', background: 'var(--warm-white)',
                  border: '2px solid var(--parchment)', borderRadius: '12px',
                  boxShadow: 'var(--panel-shadow), 0 16px 40px var(--shadow-color)',
                  padding: '0.75rem', zIndex: 60, overflow: 'hidden',
                }}>
                  <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--vermilion) 0%, var(--gold) 50%, var(--jade) 100%)', borderRadius: '2px', marginBottom: '0.6rem' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 1rem' }}>
                    <MegaColumn headerLabel={t(TOOLS_MENU.land.tKey)}  items={TOOLS_MENU.land.items}  t={t} onItemClick={() => setDesktopMenu(null)} />
                    <MegaColumn headerLabel={t(TOOLS_MENU.track.tKey)} items={TOOLS_MENU.track.items} t={t} onItemClick={() => setDesktopMenu(null)} />
                  </div>
                </div>
              )}
            </div>

            {/* Insights — mega-menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDesktopMenu(m => m === 'insights' ? null : 'insights')}
                onKeyDown={e => { if (e.key === 'Escape') setDesktopMenu(null); }}
                aria-haspopup="true"
                aria-expanded={insightsOpen}
                className="nav-focus"
                style={{ ...navLink(insightsActive), border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3em' }}
              >
                {t('insights')} <Chevron open={insightsOpen} />
              </button>
              {insightsOpen && (
                <div role="menu" style={{
                  position: 'absolute', top: 'calc(100% + 10px)', left: '0',
                  width: 'min(540px, 92vw)', background: 'var(--warm-white)',
                  border: '2px solid var(--parchment)', borderRadius: '12px',
                  boxShadow: 'var(--panel-shadow), 0 16px 40px var(--shadow-color)',
                  padding: '0.75rem', zIndex: 60, overflow: 'hidden',
                }}>
                  <div style={{ height: '2px', background: 'linear-gradient(90deg, var(--vermilion) 0%, var(--gold) 50%, var(--jade) 100%)', borderRadius: '2px', marginBottom: '0.6rem' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 1rem' }}>
                    <MegaColumn headerLabel={t(INSIGHTS_MENU.content.tKey)} items={INSIGHTS_MENU.content.items} t={t} onItemClick={() => setDesktopMenu(null)} />
                    <MegaColumn headerLabel={t(INSIGHTS_MENU.market.tKey)}  items={INSIGHTS_MENU.market.items}  t={t} onItemClick={() => setDesktopMenu(null)} />
                  </div>
                </div>
              )}
            </div>

            {/* Pricing — direct link */}
            <Link href="/pricing" className="nav-focus" style={navLink(isActive('/pricing'))}>{t('pricing')}</Link>
          </nav>

          <div style={{ flex: 1 }} />

          <LangToggle />
          <ThemeToggle />

          {/* Right-side CTAs */}
          {!loading && (
            <div ref={avatarRef} className="desktop-cta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {user ? (
                <ReadinessScoreMini>
                  <button onClick={() => setAvatarOpen(o => !o)} aria-label="Account menu" aria-expanded={avatarOpen} aria-haspopup="true" className="nav-focus" style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'var(--terracotta)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 600,
                    overflow: 'hidden', flexShrink: 0, border: 'none',
                    boxShadow: avatarOpen ? '0 0 0 2px rgba(192,40,28,0.5)' : 'none',
                    cursor: 'pointer', padding: 0, transition: 'box-shadow 0.15s ease',
                  }}>
                    {user.user_metadata?.avatar_url
                      ? <Image src={user.user_metadata.avatar_url} alt="avatar" width={36} height={36} priority style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : user.email?.[0].toUpperCase()}
                  </button>
                </ReadinessScoreMini>
              ) : (
                <>
                  <Link href="/login" className="nav-focus" style={{
                    padding: '0.45rem 1rem', borderRadius: '6px',
                    fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)',
                    textDecoration: 'none', border: '2px solid var(--parchment)',
                    background: 'transparent', whiteSpace: 'nowrap',
                  }}>{t('signIn')}</Link>
                  <Link href="/login" className="nav-focus" style={{
                    padding: '0.5rem 1.1rem', borderRadius: '6px',
                    fontSize: '0.85rem', fontWeight: 700, color: 'white',
                    background: 'var(--vermilion)', textDecoration: 'none',
                    boxShadow: '2px 2px 0 rgba(20,10,5,0.3)', whiteSpace: 'nowrap',
                    border: '2px solid var(--ink)',
                  }}>{t('startFree')} →</Link>
                </>
              )}

              {avatarOpen && user && (
                <div role="menu" style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: '210px', background: 'var(--warm-white)',
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: '2px solid var(--parchment)', borderRadius: '10px',
                  boxShadow: 'var(--panel-shadow), 0 12px 32px var(--shadow-color)',
                  padding: '0.5rem', zIndex: 60,
                }}>
                  <div style={{ padding: '0.3rem 0.6rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--parchment)', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                  {ACCOUNT_LINKS.map(item => (
                    <Link key={item.href} href={item.href} role="menuitem" className="drop-item nav-focus" onClick={() => setAvatarOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.55rem',
                      padding: '0.5rem 0.6rem', borderRadius: '6px',
                      textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, color: 'var(--brown-dark)',
                    }}>
                      <EIcon name={item.icon} size={14} style={{ color: 'var(--terracotta)' }} />
                      {t(item.tKey)}
                    </Link>
                  ))}
                  <div style={{ height: '1px', background: 'var(--parchment)', margin: '0.2rem 0.4rem' }} />
                  <button onClick={() => { setAvatarOpen(false); handleSignOut(); }} role="menuitem" className="drop-item nav-focus" style={{
                    width: '100%', padding: '0.45rem 0.6rem', borderRadius: '6px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)',
                    textAlign: 'left', fontFamily: 'inherit',
                  }}>{t('user_signOut')}</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ─────────────────────────── MOBILE BOTTOM NAV ─────────────────────────── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">

        {/* Backdrop */}
        {mobileSheet && (
          <div onClick={() => setMobileSheet(null)} aria-hidden="true" style={{
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)',
          }} />
        )}

        {/* Bottom sheet — Tools */}
        {mobileSheet === 'tools' && (
          <BottomSheet title={t('tools')} onClose={() => setMobileSheet(null)}>
            <BottomSheetSection
              title={t(TOOLS_MENU.land.tKey)}
              items={TOOLS_MENU.land.items}
              t={t}
              isActive={isActive}
              onItemClick={() => setMobileSheet(null)}
            />
            <BottomSheetSection
              title={t(TOOLS_MENU.track.tKey)}
              items={TOOLS_MENU.track.items}
              t={t}
              isActive={isActive}
              onItemClick={() => setMobileSheet(null)}
            />
          </BottomSheet>
        )}

        {/* Bottom sheet — Insights */}
        {mobileSheet === 'insights' && (
          <BottomSheet title={t('insights')} onClose={() => setMobileSheet(null)}>
            <BottomSheetSection
              title={t(INSIGHTS_MENU.content.tKey)}
              items={INSIGHTS_MENU.content.items}
              t={t}
              isActive={isActive}
              onItemClick={() => setMobileSheet(null)}
            />
            <BottomSheetSection
              title={t(INSIGHTS_MENU.market.tKey)}
              items={INSIGHTS_MENU.market.items}
              t={t}
              isActive={isActive}
              onItemClick={() => setMobileSheet(null)}
            />
          </BottomSheet>
        )}

        {/* Bottom sheet — Account */}
        {mobileSheet === 'account' && (
          <BottomSheet title={user ? (user.email ?? t('me')) : t('signIn')} onClose={() => setMobileSheet(null)}>
            {user ? (
              <>
                {ACCOUNT_LINKS.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileSheet(null)} className="bottom-sheet-item nav-focus" style={bottomSheetItemStyle(isActive(item.href))}>
                    <div style={bottomSheetIconStyle(isActive(item.href))}>
                      <EIcon name={item.icon} size={18} />
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: isActive(item.href) ? 'var(--terracotta)' : 'var(--brown-dark)' }}>
                      {t(item.tKey)}
                    </div>
                  </Link>
                ))}
                <button onClick={() => { setMobileSheet(null); handleSignOut(); }} className="nav-focus" style={{
                  ...bottomSheetItemStyle(false), background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                }}>
                  <div style={bottomSheetIconStyle(false)}><EIcon name="wave" size={18} /></div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>{t('user_signOut')}</div>
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileSheet(null)} className="nav-focus" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                padding: '1rem', borderRadius: '12px',
                background: 'var(--vermilion)', color: 'white', textDecoration: 'none',
                fontSize: '1rem', fontWeight: 700,
                boxShadow: '2px 2px 0 var(--ink)',
              }}>{t('startFree')} →</Link>
            )}
          </BottomSheet>
        )}

        {/* Tab bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          background: 'var(--warm-white)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '2.5px solid var(--parchment)', borderRadius: '8px',
          padding: '0.55rem 0.25rem', boxShadow: 'var(--panel-shadow)', width: '100%',
        }}>
          <MobileTabLink href="/" active={isActive('/')}                    label={t('home')}       icon="rocket"      />
          <MobileTabButton active={toolsActive}    open={mobileSheet === 'tools'}    onClick={() => setMobileSheet(s => s === 'tools'    ? null : 'tools')}    label={t('tools')}    icon="target"   />
          <MobileTabLink   href="/jobs"            active={isActive('/jobs')}                                       label={t('tools_jobs').split(' ').slice(0,2).join(' ')}  icon="briefcase" />
          <MobileTabButton active={insightsActive} open={mobileSheet === 'insights'} onClick={() => setMobileSheet(s => s === 'insights' ? null : 'insights')} label={t('insights')} icon="newspaper" />
          {user
            ? <MobileTabButton active={mobileSheet === 'account'} open={mobileSheet === 'account'} onClick={() => setMobileSheet(s => s === 'account' ? null : 'account')} label={t('me')} icon="person" />
            : <MobileTabButton active={mobileSheet === 'account'} open={mobileSheet === 'account'} onClick={() => setMobileSheet(s => s === 'account' ? null : 'account')} label={t('signIn')} icon="person" />
          }
        </div>
      </nav>
    </>
  );
}

/* ── Bottom sheet primitives ─────────────────────────────────────────── */

function BottomSheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{
      position: 'fixed', bottom: '5.5rem', left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 2.4rem)', maxWidth: '480px', maxHeight: '70vh', overflowY: 'auto',
      background: 'var(--warm-white)', border: '2.5px solid rgba(20,10,5,0.16)',
      borderRadius: '16px', padding: '0.75rem', zIndex: 95,
      boxShadow: '4px 4px 0 rgba(20,10,5,0.12), 0 -4px 32px rgba(44,31,20,0.1)',
      animation: 'sheetSlideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--vermilion) 0%, var(--gold) 50%, var(--jade) 100%)', borderRadius: '2px', marginBottom: '0.5rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.4rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>{title}</p>
        <button onClick={onClose} aria-label="Close" className="nav-focus" style={{
          width: '28px', height: '28px', borderRadius: '6px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: '1.1rem', fontFamily: 'inherit',
        }}>×</button>
      </div>
      {children}
    </div>
  );
}

function BottomSheetSection({ title, items, t, isActive, onItemClick }: {
  title: string;
  items: NavItem[];
  t: (key: string) => string;
  isActive: (href: string) => boolean;
  onItemClick: () => void;
}) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.3rem 0.6rem 0.2rem', opacity: 0.7 }}>{title}</div>
      {items.map(item => {
        const active = isActive(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onItemClick} className="bottom-sheet-item nav-focus" style={bottomSheetItemStyle(active)}>
            <div style={bottomSheetIconStyle(active)}>
              <EIcon name={item.icon} size={18} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.93rem', fontWeight: 600, color: active ? 'var(--terracotta)' : 'var(--brown-dark)' }}>
                {t(item.tKey)}
                {item.isNew   && <Badge label="NEW"   color="var(--vermilion)" />}
                {item.isDaily && <Badge label="DAILY" color="var(--jade)"      />}
              </div>
              {item.tDesc && (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '1px' }}>{t(item.tDesc)}</div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function bottomSheetItemStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.6rem 0.75rem', borderRadius: '10px', textDecoration: 'none',
    background: active ? 'rgba(192,40,28,0.08)' : 'transparent',
    borderLeft: `3px solid ${active ? 'var(--vermilion)' : 'transparent'}`,
    marginBottom: '0.15rem', transition: 'background 0.12s ease',
  };
}

function bottomSheetIconStyle(active: boolean): React.CSSProperties {
  return {
    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
    background: active ? 'rgba(192,40,28,0.12)' : 'var(--parchment)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: active ? 'var(--terracotta)' : 'var(--text-muted)',
  };
}

/* ── Mobile tab primitives ───────────────────────────────────────────── */

function MobileTabLink({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: EIconName }) {
  return (
    <Link href={href} className="nav-focus" style={mobileTabStyle(active, false)}>
      <EIcon name={icon} size={18} style={{ color: active ? 'white' : 'var(--text-muted)' }} />
      <span style={{ fontSize: '0.6rem', fontWeight: active ? 600 : 500, color: active ? 'white' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
    </Link>
  );
}

function MobileTabButton({ active, open, onClick, label, icon }: {
  active: boolean; open: boolean; onClick: () => void; label: string; icon: EIconName;
}) {
  const highlight = active || open;
  return (
    <button onClick={onClick} aria-label={label} aria-expanded={open} aria-haspopup="true" className="nav-focus" style={{
      ...mobileTabStyle(highlight, false),
      background: highlight ? 'var(--vermilion)' : 'transparent',
      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    }}>
      <EIcon name={icon} size={18} style={{ color: highlight ? 'white' : 'var(--text-muted)' }} />
      <span style={{ fontSize: '0.6rem', fontWeight: highlight ? 600 : 500, color: highlight ? 'white' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

function mobileTabStyle(active: boolean, _open: boolean): React.CSSProperties {
  return {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
    textDecoration: 'none', padding: '0.35rem 0.5rem', borderRadius: '4px',
    background: active ? 'var(--vermilion)' : 'transparent',
    boxShadow: active ? '2px 2px 0 rgba(20,10,5,0.3)' : 'none',
    transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', minWidth: '44px',
  };
}
