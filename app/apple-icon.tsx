import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#140a05',
        }}
      >
        <div
          style={{
            width: 152,
            height: 152,
            borderRadius: 32,
            background: '#f5edd6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 28,
            position: 'relative',
            boxShadow: '6px 8px 0 #140a05',
          }}
        >
          <div
            style={{
              width: 110,
              height: 26,
              borderRadius: 6,
              background: '#c0281c',
              marginBottom: 0,
            }}
          />
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '78px solid #c0281c',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 32,
              right: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ width: 4, height: 4, borderRadius: 4, background: '#c0281c' }} />
            <div style={{ width: 4, height: 4, borderRadius: 4, background: '#c0281c' }} />
            <div style={{ width: 4, height: 4, borderRadius: 4, background: '#c0281c' }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
