import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Brand mark for iOS / macOS home screens. Mirrors the layered horizon design
// in /public/logos/gradland-mark-light.svg using flat <div> blocks so Satori
// renders it deterministically (no bezier curves).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:  '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0805',
        }}
      >
        <div
          style={{
            width: 152,
            height: 152,
            borderRadius: 32,
            background: '#f5efe1',
            border: '3px solid #1a1410',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Sun */}
          <div
            style={{
              position: 'absolute',
              top: 30,
              left: 110,
              width: 16,
              height: 16,
              borderRadius: 8,
              background: '#d4a04c',
            }}
          />
          {/* Three layered dunes — anchored to the bottom edge */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 96,
              background: '#e0a982',
              borderTopLeftRadius:  64,
              borderTopRightRadius: 64,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 72,
              background: '#d4a04c',
              borderTopLeftRadius:  56,
              borderTopRightRadius: 56,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 48,
              background: '#2d5f3f',
              borderTopLeftRadius: 48,
              borderTopRightRadius: 48,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
