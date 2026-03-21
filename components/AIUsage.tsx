'use client';
import { useEffect, useState, useCallback } from 'react';

interface Tool {
  name: string;
  plan: string;
  usage: number;
  limit: number;
  resetAt: string;
  accent: string;
}

interface UsageData {
  updatedAt: string;
  tools: Tool[];
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function resetCountdown(iso: string): string {
  const diff = Math.floor((new Date(iso).getTime() - Date.now()) / 1000);
  if (diff <= 0) return 'Resetting soon';
  if (diff < 3600) return `Resets in ${Math.floor(diff / 60)}m`;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return m > 0 ? `Resets in ${h}h ${m}m` : `Resets in ${h}h`;
}

function ProgressBar({ pct, accent }: { pct: number; accent: string }) {
  return (
    <div style={{ height: '6px', background: 'var(--parchment)', borderRadius: '99px', overflow: 'hidden', flex: 1 }}>
      <div style={{
        height: '100%', width: `${Math.min(pct, 100)}%`,
        background: accent, borderRadius: '99px',
        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </div>
  );
}

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export default function AIUsage() {
  const [data, setData]       = useState<UsageData | null>(null);
  const [tick, setTick]       = useState(0); // forces countdown re-render
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-usage', { cache: 'no-store' });
      if (res.ok) {
        setData(await res.json());
        setLastFetch(new Date());
      }
    } catch { /* silently fail */ }
  }, []);

  // Initial fetch + auto-refresh every 30 min
  useEffect(() => {
    fetchData();
    const refreshId = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(refreshId);
  }, [fetchData]);

  // Tick every minute to update countdowns + "updated X ago"
  useEffect(() => {
    const tickId = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(tickId);
  }, []);

  if (!data) return null;

  return (
    <section style={{ marginBottom: '3rem' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.4rem',
      }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.35rem', color: 'var(--brown-dark)', margin: 0 }}>
          AI usage today
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Updated {timeAgo(data.updatedAt)}
          </span>
          <button
            onClick={fetchData}
            title="Refresh"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 0.2rem',
              lineHeight: 1,
            }}
          >
            ↻
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--warm-white)', border: '1px solid var(--parchment)',
        borderRadius: '14px', padding: '1.1rem 1.3rem',
        display: 'flex', flexDirection: 'column', gap: '1rem',
      }}>
        {data.tools.map(tool => {
          const pct = Math.round((tool.usage / tool.limit) * 100);
          return (
            <div key={tool.name}>
              {/* Top row: name + plan left, pct + reset right — all on one line */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '0.45rem', gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--brown-dark)', whiteSpace: 'nowrap' }}>
                    {tool.name}
                  </span>
                  <span style={{
                    fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap',
                    background: 'var(--parchment)', borderRadius: '99px', padding: '0.12em 0.55em',
                  }}>
                    {tool.plan}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: tool.accent, whiteSpace: 'nowrap' }}>
                    {pct}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {resetCountdown(tool.resetAt)}
                  </span>
                </div>
              </div>
              <ProgressBar pct={pct} accent={tool.accent} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
