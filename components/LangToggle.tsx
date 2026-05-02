'use client';
import { useLang } from '@/components/LangProvider';

export default function LangToggle() {
  const { locale, setLocale } = useLang();
  const isZh = locale === 'zh-TW';

  const toggle = () => setLocale(isZh ? 'en' : 'zh-TW');

  return (
    <button
      onClick={toggle}
      aria-label={isZh ? 'Switch to English' : '切換至繁體中文'}
      title={isZh ? 'Switch to English' : '切換至繁體中文'}
      style={{
        display: 'flex', alignItems: 'center',
        height: '40px', borderRadius: '20px',
        border: '2px solid rgba(20,10,5,0.2)',
        background: 'transparent',
        cursor: 'pointer', flexShrink: 0, padding: '0 2px',
        boxShadow: '2px 2px 0 rgba(20,10,5,0.2)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        gap: 0,
      }}
    >
      <LangPill label="EN"  active={!isZh} />
      <LangPill label="繁"  active={isZh}  />
    </button>
  );
}

function LangPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '32px', height: '32px', borderRadius: '16px',
      fontSize: label === '繁' ? '0.82rem' : '0.75rem',
      fontWeight: 700, letterSpacing: '0.03em',
      background: active ? 'var(--vermilion)' : 'transparent',
      color: active ? 'white' : 'var(--text-muted)',
      transition: 'background 0.18s ease, color 0.18s ease',
      userSelect: 'none',
    }}>
      {label}
    </span>
  );
}
