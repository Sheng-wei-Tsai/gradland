'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
          minWidth: '130px',
          justifyContent: 'space-between',
          transition: 'border-color 0.18s ease, background 0.18s ease',
        }}
      >
        {/* Icon — bounces on hover, stays inside button */}
        <motion.span
          animate={hovered ? { scale: 1.18, rotate: -8 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          style={{ display: 'inline-flex', flexShrink: 0 }}
        >
          <CityIcon city={value} size={20} style={{ color: meta.color }} />
        </motion.span>

        {/* City name + landmark subtitle — fixed height, only opacity changes */}
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, lineHeight: 1 }}>
          <span>{value}</span>
          <motion.span
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.18 }}
            style={{
              fontSize: '0.6rem', color: meta.color, fontWeight: 600,
              letterSpacing: '0.04em', marginTop: '0.15rem', display: 'block',
            }}
          >
            {meta.landmark}
          </motion.span>
        </span>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{ display: 'inline-block', fontSize: '0.6rem', opacity: 0.5, flexShrink: 0 }}
        >
          ▼
        </motion.span>
      </button>

      {/* ── Dropdown ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select city"
            initial={{ opacity: 0, y: -4, scaleY: 0.94 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -3, scaleY: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
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
              transformOrigin: 'top',
              overflow: 'hidden',
            }}
          >
            {CITIES.map((city, i) => {
              const cm = CITY_META[city];
              const isSelected = city === value;
              return (
                <motion.li
                  key={city}
                  role="option"
                  aria-selected={isSelected}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => select(city)}
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
                  className="city-option"
                >
                  <CityIcon city={city} size={18} style={{ color: cm.color, flexShrink: 0 }} />
                  {city}
                  {isSelected && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: cm.color }}>✓</span>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
