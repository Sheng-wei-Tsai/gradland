import { ImageResponse } from 'next/og';

export const alt  = 'Gradland — Career platform for international IT graduates';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Mirrors /public/logos/gradland-mark-light.svg via flat <div> blocks so Satori
// renders deterministically (no bezier curves).
function LogoBlock() {
  return (
    <div
      style={{
        width: 220,
        height: 220,
        borderRadius: 44,
        background: '#f5efe1',
        border: '3px solid #1a1410',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '8px 10px 0 #140a05',
      }}
    >
      {/* Sun */}
      <div style={{ position: 'absolute', top: 38, left: 156, width: 22, height: 22, borderRadius: 11, background: '#d4a04c' }} />
      {/* Three layered dunes anchored to bottom */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 136, background: '#e0a982', borderTopLeftRadius: 96, borderTopRightRadius: 96 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 104, background: '#d4a04c', borderTopLeftRadius: 80, borderTopRightRadius: 80 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 68, background: '#2d5f3f', borderTopLeftRadius: 64, borderTopRightRadius: 64 }} />
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
            GRADLAND · AU
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
