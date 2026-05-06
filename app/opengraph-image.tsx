import { ImageResponse } from 'next/og';

export const alt  = 'TechPath AU — Career platform for international IT graduates';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function LogoBlock() {
  return (
    <div
      style={{
        width: 220,
        height: 220,
        borderRadius: 44,
        background: '#f5edd6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 36,
        position: 'relative',
        boxShadow: '8px 10px 0 #140a05',
      }}
    >
      <div style={{ width: 132, height: 32, borderRadius: 8, background: '#c0281c' }} />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '18px solid transparent',
          borderRight: '18px solid transparent',
          borderTop: '108px solid #c0281c',
        }}
      />
      <div style={{ position: 'absolute', top: 44, right: 26, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: 6, background: '#c0281c' }} />
        <div style={{ width: 6, height: 6, borderRadius: 6, background: '#c0281c' }} />
        <div style={{ width: 6, height: 6, borderRadius: 6, background: '#c0281c' }} />
      </div>
    </div>
  );
}

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '80px 96px',
          background: '#fdf5e4',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 8,
            background: 'linear-gradient(90deg, #c0281c 0%, #c88a14 50%, #1e7a52 100%)',
            display: 'flex',
          }}
        />

        <LogoBlock />

        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 64, maxWidth: 760 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#c0281c', letterSpacing: '0.08em', marginBottom: 20, display: 'flex' }}>
            TECHPATH · AU
          </div>
          <div style={{ fontSize: 80, fontWeight: 700, color: '#140a05', lineHeight: 1.05, marginBottom: 22, display: 'flex' }}>
            Land your first IT job in Australia.
          </div>
          <div style={{ width: 80, height: 5, borderRadius: 3, background: '#c0281c', marginBottom: 28, display: 'flex' }} />
          <div style={{ fontSize: 26, color: '#3d1c0e', lineHeight: 1.45, display: 'flex' }}>
            Resume analyser · Interview prep · Visa tracker · Salary checker · Aggregated AU IT jobs
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
