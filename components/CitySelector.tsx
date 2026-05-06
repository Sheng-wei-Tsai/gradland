'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CityIcon from '@/components/icons/CityIcon';

const CITIES = [
  'Brisbane',
  'Sydney',
  'Melbourne',
  'Perth',
  'Adelaide',
  'Remote',
  'Australia',
] as const;

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
}

export default function CitySelector({ value, onChange }: CitySelectorProps) {
  const [open,         setOpen]         = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const listRef  = useRef<HTMLUListElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* When listbox opens, focus it and pre-select the current city */
  useEffect(() => {
    if (open) {
      const idx = CITIES.indexOf(value as (typeof CITIES)[number]);
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
        aria-label={`Location: ${value}. Press to change.`}
      >
        <span className="city-trigger__icon" aria-hidden="true">
          <CityIcon city={value} size={18} />
        </span>

        <span className="city-trigger__label">
          <span className="city-trigger__caption">Location</span>
          <span className="city-trigger__value">{value}</span>
        </span>

        <span
          className="city-trigger__chevron"
          aria-hidden="true"
          data-open={open ? 'true' : 'false'}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* ── Dropdown listbox ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            role="listbox"
            aria-label="Select location"
            aria-activedescendant={activeDescendant}
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="city-dropdown"
          >
            {CITIES.map((city, idx) => {
              const isSelected = city === value;
              const isFocused  = idx === focusedIndex;
              return (
                <li
                  key={city}
                  id={`city-opt-${city}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(city)}
                  className={`city-option${isFocused ? ' city-option--focused' : ''}${isSelected ? ' city-option--selected' : ''}`}
                >
                  <span className="city-option__icon" aria-hidden="true">
                    <CityIcon city={city} size={16} />
                  </span>
                  <span className="city-option__name">{city}</span>
                  {isSelected && (
                    <svg
                      className="city-option__check"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M2 6.5 L5 9.5 L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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
