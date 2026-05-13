import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const role       = (searchParams.get('role')       ?? 'Software Engineer').slice(0, 60);
  const score      = Math.min(100, Math.max(0, parseInt(searchParams.get('score') ?? '0', 10)));
  const xp         = Math.max(0, parseInt(searchParams.get('xp') ?? '0', 10));
  const level      = Math.min(10, Math.max(1, parseInt(searchParams.get('level') ?? '1', 10)));
  const levelTitle = (searchParams.get('levelTitle') ?? 'Beginner').slice(0, 30);

  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  const scoreColor = score >= 75 ? '#1e7a52' : score >= 60 ? '#c88a14' : '#c0281c';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: '#fdf5e4',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'Georgia, "Times New Roman", serif',
          position: 'relative',
        }}
      >
        {/* Top bar accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: '#c0281c', display: 'flex' }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '44px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#c0281c', letterSpacing: '3px' }}>GRADLAND</div>
          <div style={{ fontSize: '16px', color: '#7a5030' }}>AI Interview Coach</div>
        </div>

        {/* Role */}
        <div style={{ fontSize: '54px', fontWeight: 700, color: '#140a05', textAlign: 'center', marginBottom: '36px', lineHeight: 1.15 }}>
          {role}
        </div>

        {/* Score big */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '96px', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '36px', color: '#7a5030' }}>/100</span>
        </div>

        {/* Score bar */}
        <div style={{ width: '500px', height: '16px', background: '#e8d5a8', borderRadius: '99px', marginBottom: '44px', display: 'flex' }}>
          <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: '99px', display: 'flex' }} />
        </div>

        {/* XP + level row */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#c0281c' }}>+{xp} XP</span>
          <span style={{ fontSize: '16px', color: '#e8d5a8' }}>●</span>
          <span style={{ fontSize: '28px', fontWeight: 600, color: '#3d1c0e' }}>Level {level} · {levelTitle}</span>
        </div>

        {/* Date */}
        <div style={{ fontSize: '20px', color: '#7a5030', marginBottom: '44px' }}>{date}</div>

        {/* Footer */}
        <div style={{ fontSize: '17px', color: '#7a5030', fontStyle: 'italic' }}>
          Certified by Alex AI Interview Coach
        </div>

        {/* Bottom bar accent */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px', background: '#c0281c', display: 'flex' }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
