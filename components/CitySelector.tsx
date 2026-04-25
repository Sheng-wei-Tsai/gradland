'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CityIcon from '@/components/icons/CityIcon';

const CITY_META: Record<string, { landmark: string; color: string }> = {
  Brisbane:  { landmark: 'Story Bridge',   color: '#c0281c' },
  Sydney:    { landmark: 'Opera House',     color: '#0369a1' },
  Melbourne: { landmark: 'Iconic Tram',     color: '#166534' },
  Perth:     { landmark: 'Black Swan',      color: '#374151' },
  Adelaide:  { landmark: 'Festival Centre', color: '#7c3aed' },
  Remote:    { landmark: 'Anywhere',        color: '#4b5563' },
  Australia: { landmark: 'Kangaroo',        color: '#b45309' },
};

const CITIES = Object.keys(CITY_META);

// Wide enough for longest city ("Melbourne"/"Australia") + icon + chevron + padding.
// Fixed so the button never resizes when the selection changes.
const TRIGGER_WIDTH = 164;

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
}

export default function CitySelector({ value, onChange }: CitySelectorProps) {
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const meta    = CITY_META[value] ?? CITY_META['Australia'];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const select = useCallback((city: string) => { onChange(city); setOpen(false); }, [onChange]);

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Trigger button ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`City: ${value}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.65rem 0.85rem 0.65rem 0.75rem',
          borderRadius: '10px',
          border: `1.5px solid ${hovered || open ? meta.color : 'var(--parchment)'}`,
          background: hovered || open ? `${meta.color}09` : 'var(--warm-white)',
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          fontFamily: 'inherit',
          cursor: 'pointer',
          width: `${TRIGGER_WIDTH}px`,
          flexShrink: 0,
          justifyContent: 'space-between',
          transition: 'border-color 0.18s ease, background 0.18s ease',
        }}
      >
        {/* Icon — no animation */}
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>
          <CityIcon city={value} size={20} style={{ color: meta.color }} />
        </span>

        {/* City name + landmark subtitle (CSS opacity fade, no motion) */}
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, lineHeight: 1, overflow: 'hidden' }}>
          <span style={{ whiteSpace: 'nowrap' }}>{value}</span>
          <span
            style={{
              fontSize: '0.6rem', color: meta.color, fontWeight: 600,
              letterSpacing: '0.04em', marginTop: '0.15rem', display: 'block',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.18s ease',
            }}
          >
            {meta.landmark}
          </span>
        </span>

        {/* Chevron — CSS rotate, no spring */}
        <span
          style={{
            display: 'inline-block', fontSize: '0.6rem', opacity: 0.5, flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ▼
        </span>
      </button>

      {/* ── Dropdown — simple opacity fade, no scale/spring/stagger ────── */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select city"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)', left: 0,
              minWidth: '100%',
              background: 'var(--warm-white)',
              border: '1.5px solid var(--parchment)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(20,10,5,0.12)',
              padding: '0.3rem',
              zIndex: 200,
              listStyle: 'none', margin: 0,
              overflow: 'hidden',
            }}
          >
            {CITIES.map((city) => {
              const cm = CITY_META[city];
              const isSelected = city === value;
              return (
                <li
                  key={city}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(city)}
                  className="city-option"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.55rem',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? cm.color : 'var(--text-secondary)',
                    background: isSelected ? `${cm.color}0d` : 'transparent',
                  }}
                >
                  <CityIcon city={city} size={18} style={{ color: cm.color, flexShrink: 0 }} />
                  {city}
                  {isSelected && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: cm.color }}>✓</span>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
