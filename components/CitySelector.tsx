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
  const [open,         setOpen]         = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const listRef  = useRef<HTMLUListElement>(null);
  const meta     = CITY_META[value] ?? CITY_META['Australia'];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // When the listbox opens, focus it and pre-select the current city
  useEffect(() => {
    if (open) {
      const idx = CITIES.indexOf(value);
      setFocusedIndex(idx >= 0 ? idx : 0);
      listRef.current?.focus();
    } else {
      setFocusedIndex(-1);
    }
  }, [open, value]);

  const select = useCallback((city: string) => { onChange(city); setOpen(false); }, [onChange]);

  function handleListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, CITIES.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0) select(CITIES[focusedIndex]);
    }
  }

  const activeDescendant = open && focusedIndex >= 0 ? `city-opt-${CITIES[focusedIndex]}` : undefined;

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Trigger button ──────────────────────────────────────────────── */}
      <button
        type="button"
        className={`city-trigger${open ? ' city-trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`City: ${value}`}
        style={{
          '--city-color': meta.color,
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.65rem 0.85rem 0.65rem 0.75rem',
          borderRadius: '10px',
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          fontFamily: 'inherit',
          cursor: 'pointer',
          width: `${TRIGGER_WIDTH}px`,
          flexShrink: 0,
          justifyContent: 'space-between',
        } as React.CSSProperties}
      >
        {/* Icon */}
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>
          <CityIcon city={value} size={20} style={{ color: meta.color }} />
        </span>

        {/* City name + landmark subtitle (CSS opacity fade) */}
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, lineHeight: 1, overflow: 'hidden' }}>
          <span style={{ whiteSpace: 'nowrap' }}>{value}</span>
          <span
            className="city-landmark"
            style={{
              fontSize: '0.6rem', color: meta.color, fontWeight: 600,
              letterSpacing: '0.04em', marginTop: '0.15rem', display: 'block',
            }}
          >
            {meta.landmark}
          </span>
        </span>

        {/* Chevron — CSS rotate */}
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

      {/* ── Dropdown listbox ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
            aria-label="Select city"
            aria-activedescendant={activeDescendant}
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
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
              outline: 'none',
            }}
          >
            {CITIES.map((city, idx) => {
              const cm = CITY_META[city];
              const isSelected = city === value;
              const isFocused  = idx === focusedIndex;
              return (
                <li
                  key={city}
                  id={`city-opt-${city}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(city)}
                  className={`city-option${isFocused ? ' city-option--focused' : ''}`}
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
