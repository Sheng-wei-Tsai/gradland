'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    // Read explicit data-theme attr first; fall back to system preference
    const attr = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    if (attr) {
      setTheme(attr);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setSpinning(true);
  };

  if (!theme) return <div style={{ width: '40px', height: '40px' }} />;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode (陽)' : 'Switch to dark mode (陰)'}
      title={isDark ? '陽 — Brisbane day mode' : '陰 — Night market mode'}
      onAnimationEnd={() => setSpinning(false)}
      className={spinning ? 'yin-yang-spin' : ''}
      style={{
        width: '40px', height: '40px',
        borderRadius: '50%',
        border: isDark
          ? '2px solid rgba(240,230,208,0.25)'
          : '2px solid rgba(20,10,5,0.2)',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        flexShrink: 0,
        padding: 0,
        boxShadow: isDark
          ? '0 0 12px rgba(240,230,208,0.1), 2px 2px 0 rgba(232,64,64,0.3)'
          : '2px 2px 0 rgba(20,10,5,0.2)',
      }}
    >
      <YinYangIcon isDark={isDark} />
    </button>
  );
}

function YinYangIcon({ isDark }: { isDark: boolean }) {
  // Light mode: yang (bright) dominant — white half on top
  // Dark mode:  yin (dark) dominant — black half visible, vermilion glow
  const yangColor  = isDark ? '#f0e6d0' : '#fdfef6';
  const yinColor   = isDark ? '#e84040' : '#140a05';
  const ringColor  = isDark ? 'rgba(240,230,208,0.5)' : 'rgba(20,10,5,0.7)';

  return (
    <svg
      viewBox="0 0 40 40"
      width="28"
      height="28"
      style={{ display: 'block', transition: 'all 0.3s ease' }}
    >
      {/* ── Full circle background (yin/dark side) ── */}
      <circle cx="20" cy="20" r="18" fill={yinColor} />

      {/* ── Yang half (bright teardrop) ──
          Path: start top-center → right large arc to bottom
                → left small arc back to center
                → left small arc from center to top */}
      <path
        d="M20,2 A18,18 0 0,1 20,38 A9,9 0 0,1 20,20 A9,9 0 0,0 20,2 Z"
        fill={yangColor}
      />

      {/* ── Small circles ── */}
      {/* Small yin dot (dark) in the yang (bright) half */}
      <circle cx="20" cy="11" r="4.5" fill={yinColor} />
      {/* Small yang dot (bright) in the yin (dark) half */}
      <circle cx="20" cy="29" r="4.5" fill={yangColor} />

      {/* ── Outer ring ── */}
      <circle
        cx="20" cy="20" r="18"
        fill="none"
        stroke={ringColor}
        strokeWidth="1.5"
      />
    </svg>
  );
}
