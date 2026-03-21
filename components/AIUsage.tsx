'use client';
import usageData from '@/data/ai-usage.json';

function ProgressBar({ pct, accent }: { pct: number; accent: string }) {
  return (
    <div style={{
      height: '6px',
      background: 'var(--parchment)',
      borderRadius: '99px',
      overflow: 'hidden',
      flex: 1,
    }}>
      <div style={{
        height: '100%',
        width: `${Math.min(pct, 100)}%`,
        background: accent,
        borderRadius: '99px',
        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </div>
  );
}

export default function AIUsage() {
  const { tools, updatedAt } = usageData;

  const updatedDate = new Date(updatedAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <section style={{ marginBottom: '3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.4rem',
      }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.35rem', color: 'var(--brown-dark)', margin: 0 }}>
          AI usage today
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Updated {updatedDate}
        </span>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--warm-white)',
        border: '1px solid var(--parchment)',
        borderRadius: '14px',
        padding: '1.1rem 1.3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {tools.map(tool => {
          const pct = Math.round((tool.usage / tool.limit) * 100);
          return (
            <div key={tool.name}>
              {/* Tool name + plan + pct */}
              <div style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between', marginBottom: '0.45rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.88rem', fontWeight: 600,
                    color: 'var(--brown-dark)',
                  }}>
                    {tool.name}
                  </span>
                  <span style={{
                    fontSize: '0.7rem', color: 'var(--text-muted)',
                    background: 'var(--parchment)', borderRadius: '99px',
                    padding: '0.1em 0.55em',
                  }}>
                    {tool.plan}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: tool.accent }}>
                    {pct}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {tool.resetLabel}
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
