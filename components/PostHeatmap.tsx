'use client';
import { useMemo, useState, useEffect, useRef } from 'react';

interface Props { dates: string[] }

const CELL        = 11;
const GAP         = 2;
const STEP        = CELL + GAP;
const DAY_LABEL_W = 28;
const MONTH_H     = 16;
const DAY_LABELS  = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

type Cell = {
  date: string; count: number;
  isToday: boolean; isFuture: boolean; isOutOfRange: boolean;
};

// Returns CSS color string for SVG fill — vermilion-based intensity levels
function cellFill(count: number, isFuture: boolean, isOutOfRange: boolean): string {
  if (isFuture || isOutOfRange) return 'color-mix(in srgb, var(--vermilion) 4%, transparent)';
  if (count === 0) return 'color-mix(in srgb, var(--vermilion) 9%, transparent)';
  if (count === 1) return 'color-mix(in srgb, var(--vermilion) 28%, transparent)';
  if (count === 2) return 'color-mix(in srgb, var(--vermilion) 55%, transparent)';
  if (count === 3) return 'color-mix(in srgb, var(--vermilion) 78%, transparent)';
  return 'var(--vermilion)';
}

function formatDisplay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function localStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function localToday(): { today: Date; todayStr: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return { today, todayStr: localStr(today) };
}

function buildYearGrid(dates: string[], year: number) {
  const countMap: Record<string, number> = {};
  for (const d of dates) countMap[d] = (countMap[d] ?? 0) + 1;

  const { today, todayStr } = localToday();
  const jan1  = new Date(year, 0, 1);
  const start = new Date(jan1);
  start.setDate(jan1.getDate() - jan1.getDay());
  const end = new Date(year, 11, 31);

  const weeks: Cell[][] = [];
  const months: { label: string; col: number }[] = [];
  let cur = new Date(start), lastMonth = -1, col = 0;

  while (cur <= end) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = localStr(cur);
      const isOutOfRange = cur.getFullYear() !== year;
      if (d === 0 && !isOutOfRange && cur.getMonth() !== lastMonth) {
        months.push({ label: cur.toLocaleDateString('en-AU', { month: 'short' }), col });
        lastMonth = cur.getMonth();
      }
      week.push({
        date: iso,
        count: countMap[iso] ?? 0,
        isToday: iso === todayStr,
        isFuture: cur > today,
        isOutOfRange,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week); col++;
  }
  return { weeks, months };
}

function buildMonthGrid(dates: string[]) {
  const countMap: Record<string, number> = {};
  for (const d of dates) countMap[d] = (countMap[d] ?? 0) + 1;

  const { today, todayStr } = localToday();
  // Show prev month → current month → next month
  const rangeStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const rangeEnd   = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const start = new Date(rangeStart);
  start.setDate(rangeStart.getDate() - rangeStart.getDay());

  const weeks: Cell[][] = [];
  const months: { label: string; col: number }[] = [];
  let cur = new Date(start), lastMonth = -1, col = 0;

  while (cur <= rangeEnd) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = localStr(cur);
      const isOutOfRange = cur < rangeStart || cur > rangeEnd;
      if (d === 0 && !isOutOfRange && cur.getMonth() !== lastMonth) {
        months.push({ label: cur.toLocaleDateString('en-AU', { month: 'long' }), col });
        lastMonth = cur.getMonth();
      }
      week.push({
        date: iso,
        count: countMap[iso] ?? 0,
        isToday: iso === todayStr,
        isFuture: cur > today,
        isOutOfRange,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week); col++;
  }
  return { weeks, months };
}

function computeStats(dates: string[], year: number) {
  const countMap: Record<string, number> = {};
  for (const d of dates) countMap[d] = (countMap[d] ?? 0) + 1;

  const { today } = localToday();
  let streak = 0;
  const check = new Date(today);
  while (countMap[localStr(check)]) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  const totalYear = Object.entries(countMap)
    .filter(([d]) => d.startsWith(String(year)))
    .reduce((s, [, c]) => s + c, 0);

  return { streak, totalYear };
}

export default function PostHeatmap({ dates }: Props) {
  const year = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    text: string; count: number; x: number; y: number;
  } | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { weeks, months } = useMemo(
    () => isMobile ? buildMonthGrid(dates) : buildYearGrid(dates, year),
    [dates, year, isMobile]
  );
  const { streak, totalYear } = useMemo(() => computeStats(dates, year), [dates, year]);

  const svgW = DAY_LABEL_W + weeks.length * STEP;
  const svgH = MONTH_H + 7 * STEP;

  function showTooltip(e: React.MouseEvent | React.TouchEvent, cell: Cell) {
    if (!cell.count || cell.isFuture || cell.isOutOfRange) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);

    // Clamp x so tooltip stays within container (tooltip is ~120px wide)
    const rawX = clientX - rect.left;
    const clampedX = Math.max(60, Math.min(rawX, rect.width - 60));
    // Place above the cell; if too close to top, place below instead
    const rawY = clientY - rect.top;
    const y = rawY < 60 ? rawY + 24 : rawY - 52;

    setTooltip({ text: formatDisplay(cell.date), count: cell.count, x: clampedX, y });
    if ('touches' in e) {
      tooltipTimeout.current = setTimeout(() => setTooltip(null), 2000);
    }
  }

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Section header — matches new ink-square style */}
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', marginBottom: '0.75rem',
        flexWrap: 'wrap', gap: '0.4rem',
      }}>
        <h2 style={{
          fontFamily: "'Lora', serif", fontSize: '1.4rem',
          color: 'var(--brown-dark)', margin: 0, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{
            display: 'inline-block', width: '12px', height: '12px',
            background: 'var(--jade)', borderRadius: '2px',
            border: '2px solid var(--ink)',
            boxShadow: '1px 1px 0 var(--ink)',
            flexShrink: 0,
          }} />
          Writing activity
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
          {streak > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--vermilion)', fontWeight: 700 }}>
              {streak} day streak 🔥
            </span>
          )}
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {totalYear} post{totalYear !== 1 ? 's' : ''} in {year}
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          background: 'var(--warm-white)',
          border: 'var(--panel-border)',
          borderRadius: '8px',
          boxShadow: 'var(--panel-shadow)',
          padding: '1rem',
        }}
        onClick={() => setTooltip(null)}
      >
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          {/* Month labels */}
          {months.map((m, i) => (
            <text
              key={i}
              x={DAY_LABEL_W + m.col * STEP}
              y={MONTH_H - 3}
              fontSize={isMobile ? 8 : 9}
              fill="var(--text-muted)"
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((label, i) =>
            label ? (
              <text
                key={i}
                x={DAY_LABEL_W - 4}
                y={MONTH_H + i * STEP + CELL - 1}
                fontSize={9}
                fill="var(--text-muted)"
                textAnchor="end"
              >
                {label}
              </text>
            ) : null
          )}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((cell, di) => (
              <rect
                key={`${wi}-${di}`}
                x={DAY_LABEL_W + wi * STEP}
                y={MONTH_H + di * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                fill={cellFill(cell.count, cell.isFuture, cell.isOutOfRange)}
                stroke={cell.isToday ? 'var(--vermilion)' : 'none'}
                strokeWidth={cell.isToday ? 1.5 : 0}
                style={{ cursor: cell.count > 0 ? 'pointer' : 'default' }}
                onMouseEnter={e => { e.stopPropagation(); showTooltip(e, cell); }}
                onMouseLeave={() => { if (!('ontouchstart' in window)) setTooltip(null); }}
                onTouchStart={e => { e.stopPropagation(); showTooltip(e, cell); }}
              />
            ))
          )}
        </svg>

        {/* Tooltip — clamped to container bounds */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            background: 'var(--ink)',
            color: 'var(--cream)',
            border: '2px solid var(--vermilion)',
            borderRadius: '4px',
            padding: '0.35em 0.8em',
            pointerEvents: 'none',
            zIndex: 30,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            boxShadow: '3px 3px 0 var(--vermilion)',
          }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--vermilion)', lineHeight: 1.3 }}>
              {tooltip.count} post{tooltip.count > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.3 }}>
              {tooltip.text}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', gap: '4px', marginTop: '0.5rem',
        }}>
          <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginRight: '2px' }}>Less</span>
          {[0, 1, 2, 3, 4].map(n => (
            <div key={n} style={{
              width: '10px', height: '10px', borderRadius: '2px',
              background: cellFill(n, false, false),
              border: n === 4 ? '1px solid color-mix(in srgb, var(--vermilion) 40%, transparent)' : 'none',
            }} />
          ))}
          <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginLeft: '2px' }}>More</span>
        </div>
      </div>
    </div>
  );
}
