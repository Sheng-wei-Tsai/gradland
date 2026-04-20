'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CityIcon from '@/components/icons/CityIcon';

// ── Per-city theme ─────────────────────────────────────────────────────────
const CITY_META: Record<string, { landmark: string; color: string; gradient: string }> = {
  Brisbane:  { landmark: 'Story Bridge',    color: '#c0281c', gradient: 'linear-gradient(155deg,#7c1610 0%,#c0281c 60%,#e84040 100%)' },
  Sydney:    { landmark: 'Opera House',      color: '#0369a1', gradient: 'linear-gradient(155deg,#012a50 0%,#0369a1 60%,#38bdf8 100%)' },
  Melbourne: { landmark: 'Iconic Tram',      color: '#166534', gradient: 'linear-gradient(155deg,#052e16 0%,#166534 60%,#34d399 100%)' },
  Perth:     { landmark: 'Black Swan',       color: '#374151', gradient: 'linear-gradient(155deg,#111827 0%,#374151 60%,#9ca3af 100%)' },
  Adelaide:  { landmark: 'Festival Centre',  color: '#7c3aed', gradient: 'linear-gradient(155deg,#3b0764 0%,#7c3aed 60%,#c084fc 100%)' },
  Remote:    { landmark: 'Anywhere',         color: '#4b5563', gradient: 'linear-gradient(155deg,#1f2937 0%,#4b5563 60%,#9ca3af 100%)' },
  Australia: { landmark: 'Kangaroo Country', color: '#b45309', gradient: 'linear-gradient(155deg,#431407 0%,#b45309 60%,#f59e0b 100%)' },
};

// Pre-computed sparkle positions (no Math.random — SSR safe)
const SPARKLES = [
  { x: 16,  y: 14,  r: 2.5, delay: 0.0,  dur: 2.4 },
  { x: 104, y: 10,  r: 1.8, delay: 0.3,  dur: 2.8 },
  { x: 118, y: 58,  r: 2.2, delay: 0.15, dur: 2.2 },
  { x: 8,   y: 72,  r: 1.6, delay: 0.45, dur: 3.0 },
  { x: 100, y: 88,  r: 2.0, delay: 0.22, dur: 2.6 },
  { x: 22,  y: 100, r: 1.4, delay: 0.6,  dur: 2.9 },
];

const CITIES = Object.keys(CITY_META);

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  className?: string;
}

export default function CitySelector({ value, onChange, className }: CitySelectorProps) {
  const [open, setOpen]       = useState(false);
  const [hovered, setHovered] = useState(false);
  const [preview, setPreview] = useState<string | null>(null); // city being hovered in dropdown
  const wrapRef = useRef<HTMLDivElement>(null);

  const meta = CITY_META[value] ?? CITY_META['Australia'];
  const displayCity = preview ?? value;
  const displayMeta = CITY_META[displayCity] ?? meta;

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

  const select = useCallback((city: string) => {
    onChange(city);
    setOpen(false);
    setPreview(null);
  }, [onChange]);

  const showCard = hovered || open;

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Hover / open landmark card ───────────────────────────────────── */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '156px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: `0 20px 60px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.08)`,
              zIndex: 200,
              pointerEvents: 'none',
            }}
          >
            {/* Gradient background — animates on city change */}
            <motion.div
              key={displayCity}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                background: displayMeta.gradient,
                padding: '1.4rem 1rem 1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Floating sparkle dots */}
              {SPARKLES.map((s, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: s.dur, delay: s.delay, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    left: `${s.x}px`, top: `${s.y}px`,
                    width: `${s.r * 2}px`, height: `${s.r * 2}px`,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.65)',
                  }}
                />
              ))}

              {/* Pulsing outer ring */}
              <motion.div
                animate={{ scale: [1, 1.18, 1], opacity: [0.22, 0, 0.22] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  width: '118px', height: '118px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.5)',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%,-62%)',
                }}
              />
              {/* Inner glow ring */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.1, 0.35] }}
                transition={{ repeat: Infinity, duration: 2.6, delay: 0.4, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  width: '90px', height: '90px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.6)',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%,-62%)',
                }}
              />

              {/* City icon — bounces in, re-mounts on city change */}
              <motion.div
                key={displayCity + '-icon'}
                initial={{ scale: 0.45, rotate: -12, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 340, damping: 18, delay: 0.04 }}
                style={{ position: 'relative', zIndex: 2, marginBottom: '0.7rem' }}
              >
                <CityIcon
                  city={displayCity}
                  size={88}
                  style={{ color: 'rgba(255,255,255,0.93)', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))' }}
                />
              </motion.div>

              {/* City name */}
              <motion.div
                key={displayCity + '-name'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                style={{
                  fontFamily: "'Lora', serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'white',
                  letterSpacing: '-0.01em',
                  position: 'relative', zIndex: 2,
                  textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                }}
              >
                {displayCity}
              </motion.div>

              {/* Landmark name */}
              <motion.div
                key={displayCity + '-landmark'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18, duration: 0.2 }}
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.65)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginTop: '0.15rem',
                  position: 'relative', zIndex: 2,
                }}
              >
                {displayMeta.landmark}
              </motion.div>
            </motion.div>

            {/* Card caret */}
            <div style={{
              position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: `7px solid ${displayMeta.color}`,
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger button ────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPreview(null); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`City: ${value}`}
        className={className}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.65rem 0.85rem 0.65rem 1rem',
          borderRadius: '10px',
          border: open
            ? `1.5px solid ${meta.color}`
            : '1.5px solid var(--parchment)',
          background: 'var(--warm-white)',
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          fontFamily: 'inherit',
          cursor: 'pointer',
          minWidth: '130px',
          justifyContent: 'space-between',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? `0 0 0 3px ${meta.color}22` : 'none',
          position: 'relative',
          zIndex: 201,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CityIcon city={value} size={18} style={{ color: meta.color, flexShrink: 0 }} />
          {value}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{ display: 'inline-block', fontSize: '0.6rem', opacity: 0.6 }}
        >
          ▼
        </motion.span>
      </button>

      {/* ── City dropdown ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select city"
            initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              minWidth: '100%',
              background: 'var(--warm-white)',
              border: '1.5px solid var(--parchment)',
              borderRadius: '12px',
              boxShadow: '0 12px 40px rgba(20,10,5,0.14)',
              padding: '0.35rem',
              zIndex: 201,
              listStyle: 'none',
              margin: 0,
              transformOrigin: 'top',
              overflow: 'hidden',
            }}
          >
            {CITIES.map((city, i) => {
              const cm = CITY_META[city];
              const isSelected = city === value;
              const isHov = preview === city;
              return (
                <motion.li
                  key={city}
                  role="option"
                  aria-selected={isSelected}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onMouseEnter={() => setPreview(city)}
                  onMouseLeave={() => setPreview(null)}
                  onClick={() => select(city)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isHov || isSelected ? cm.color : 'var(--text-secondary)',
                    background: isHov
                      ? `${cm.color}12`
                      : isSelected
                      ? `${cm.color}09`
                      : 'transparent',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <CityIcon city={city} size={20} style={{ color: cm.color, flexShrink: 0 }} />
                  {city}
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      style={{ marginLeft: 'auto', fontSize: '0.75rem', color: cm.color }}
                    >
                      ✓
                    </motion.span>
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
