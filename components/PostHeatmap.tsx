'use client';
import { useMemo, useState, useRef } from 'react';

interface Props { dates: string[] }

const CELL        = 11;
const GAP         = 2;
const STEP        = CELL + GAP;
const DAY_LABEL_W = 28;
const MONTH_H     = 16;
const DAY_LABELS  = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function cellColor(count: number, isFuture: boolean, isOutOfYear: boolean): string {
  if (isFuture || isOutOfYear) return 'rgba(196,98,58,0.04)';
  if (count === 0) return 'rgba(196,98,58,0.09)';
  if (count === 1) return 'rgba(196,98,58,0.28)';
  if (count === 2) return 'rgba(196,98,58,0.55)';
  if (count === 3) return 'rgba(196,98,58,0.78)';
  return '#c4623a';
}

function formatDisplay(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function buildYearGrid(dates: string[], year: number) {
  const countMap: Record<string, number> = {};
  for (const d of dates) countMap[d] = (countMap[d] ?? 0) + 1;

  // Start from Sunday on or before Jan 1
  const jan1 = new Date(year, 0, 1);
  const start = new Date(jan1);
  start.setDate(jan1.getDate() - jan1.getDay());

  const end = new Date(year, 11, 31);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  type Cell = { date: string; count: number; isToday: boolean; isFuture: boolean; isOutOfYear: boolean };
  const weeks: Cell[][] = [];
  const months: { label: string; col: number }[] = [];

  let cur = new Date(start);
  let lastMonth = -1;
  let col = 0;

  while (cur <= end) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cur.toISOString().split('T')[0];
      const isOutOfYear = cur.getFullYear() !== year;
      if (d === 0 && !isOutOfYear && cur.getMonth() !== lastMonth) {
        months.push({ label: cur.toLocaleDateString('en-AU', { month: 'short' }), col });
        lastMonth = cur.getMonth();
      }
      week.push({ date: iso, count: countMap[iso] ?? 0, isToday: iso === todayStr, isFuture: cur > today, isOutOfYear });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
    col++;
  }

  // Streak
  let streak = 0;
  const check = new Date(today);
  while (countMap[check.toISOString().split('T')[0]]) {
    streak++;
    check.setDate(check.getDate() - 1);
  }

  const totalYear = Object.entries(countMap)
    .filter(([d]) => d.startsWith(String(year)))
    .reduce((s, [, c]) => s + c, 0);

  return { weeks, months, streak, totalYear };
}

export default function PostHeatmap({ dates }: Props) {
  const year = new Date().getFullYear();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    text: string; count: number; x: number; y: number;
  } | null>(null);

  const { weeks, months, streak, totalYear } = useMemo(
    () => buildYearGrid(dates, year), [dates, year]
  );

  const svgW = DAY_LABEL_W + weeks.length * STEP;
  const svgH = MONTH_H + 7 * STEP;

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem',
      }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.35rem', color: 'var(--brown-dark)', margin: 0 }}>
          Writing activity
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
          {streak > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--terracotta)', fontWeight: 600 }}>
              {streak} day streak
            </span>
          )}
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {totalYear} post{totalYear !== 1 ? 's' : ''} in {year}
          </span>
        </div>
      </div>

      {/* Full-width SVG — no card, no scroll, scales to container */}
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        >
          {/* Month labels */}
          {months.map((m, i) => (
            <text key={i} x={DAY_LABEL_W + m.col * STEP} y={MONTH_H - 3}
              fontSize={9} fill="var(--text-muted)">
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((label, i) =>
            label ? (
              <text key={i} x={DAY_LABEL_W - 4} y={MONTH_H + i * STEP + CELL - 1}
                fontSize={9} fill="var(--text-muted)" textAnchor="end">
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
                width={CELL} height={CELL} rx={2}
                fill={cellColor(cell.count, cell.isFuture, cell.isOutOfYear)}
                stroke={cell.isToday ? '#c4623a' : 'none'}
                strokeWidth={cell.isToday ? 1.5 : 0}
                style={{ cursor: cell.count > 0 ? 'pointer' : 'default' }}
                onMouseEnter={e => {
                  if (!cell.count || cell.isFuture || cell.isOutOfYear) return;
                  const svg = svgRef.current;
                  if (!svg) return;
                  const pt = svg.createSVGPoint();
                  pt.x = e.clientX; pt.y = e.clientY;
                  const { x, y } = pt.matrixTransform(svg.getScreenCTM()!.inverse());
                  setTooltip({ text: formatDisplay(cell.date), count: cell.count, x, y });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))
          )}

          {/* Tooltip */}
          {tooltip && (() => {
            const TW = 108;
            const clampedX = Math.max(TW / 2, Math.min(tooltip.x, svgW - TW / 2));
            return (
              <g>
                <rect
                  x={clampedX - TW / 2} y={tooltip.y - 38}
                  width={TW} height={30} rx={5}
                  fill="var(--brown-dark)"
                />
                <text x={clampedX} y={tooltip.y - 22} fontSize={10} fontWeight={700}
                  fill="#c4623a" textAnchor="middle">
                  {tooltip.count} post{tooltip.count > 1 ? 's' : ''}
                </text>
                <text x={clampedX} y={tooltip.y - 11} fontSize={8.5}
                  fill="var(--cream)" opacity={0.8} textAnchor="middle">
                  {tooltip.text}
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Legend */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '4px', marginTop: '0.3rem',
        }}>
          <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginRight: '2px' }}>Less</span>
          {[0, 1, 2, 3, 4].map(n => (
            <div key={n} style={{
              width: '10px', height: '10px', borderRadius: '2px',
              background: cellColor(n, false, false),
            }} />
          ))}
          <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginLeft: '2px' }}>More</span>
        </div>
      </div>
    </div>
  );
}
