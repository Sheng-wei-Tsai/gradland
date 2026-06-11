'use client';

import dynamic from 'next/dynamic';

const AIEngineerTerminal = dynamic(
  () => import('@/components/terminal/AIEngineerTerminal'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#07050f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontFamily: '"Courier New", monospace',
          fontSize: '0.85rem',
        }}
      >
        Loading terminal…
      </div>
    ),
  },
);

export default function AIEngineerShell() {
  return <AIEngineerTerminal />;
}
