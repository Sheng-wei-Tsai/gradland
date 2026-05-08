import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// ImageResponse is called with `new` so the mock must be a class.
// Use vi.hoisted so the spy reference is available inside vi.mock's factory.
const mockImageResponse = vi.hoisted(() => vi.fn());

vi.mock('next/og', () => ({
  ImageResponse: class MockImageResponse extends Response {
    constructor(element: unknown, options: unknown) {
      super('mock-image-data', {
        status: 200,
        headers: { 'content-type': 'image/png' },
      });
      mockImageResponse(element, options);
    }
  },
}));

const { GET } = await import('@/app/api/interview/share-card/route');

function makeGet(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/interview/share-card');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe('GET /api/interview/share-card', () => {
  afterEach(() => mockImageResponse.mockClear());

  it('returns 200 with no params (all defaults)', async () => {
    const res = await GET(makeGet());
    expect(res.status).toBe(200);
    expect(mockImageResponse).toHaveBeenCalledOnce();
  });

  it('returns 200 with all valid params supplied', async () => {
    const res = await GET(makeGet({
      role: 'Senior Software Engineer',
      score: '82',
      xp: '1500',
      level: '5',
      levelTitle: 'Expert',
    }));
    expect(res.status).toBe(200);
    expect(mockImageResponse).toHaveBeenCalledOnce();
  });

  it('ImageResponse is called with width:1200 height:630 OG dimensions', async () => {
    await GET(makeGet({ score: '75' }));
    expect(mockImageResponse).toHaveBeenCalledWith(
      expect.anything(),
      { width: 1200, height: 630 },
    );
  });

  it('clamps score > 100 to 100 — no crash', async () => {
    const res = await GET(makeGet({ score: '999' }));
    expect(res.status).toBe(200);
    expect(mockImageResponse).toHaveBeenCalledOnce();
  });

  it('clamps score < 0 to 0 — no crash', async () => {
    const res = await GET(makeGet({ score: '-50' }));
    expect(res.status).toBe(200);
    expect(mockImageResponse).toHaveBeenCalledOnce();
  });

  it('clamps level > 10 to 10 — no crash', async () => {
    const res = await GET(makeGet({ level: '99' }));
    expect(res.status).toBe(200);
    expect(mockImageResponse).toHaveBeenCalledOnce();
  });

  it('clamps level < 1 to 1 — no crash', async () => {
    const res = await GET(makeGet({ level: '0' }));
    expect(res.status).toBe(200);
    expect(mockImageResponse).toHaveBeenCalledOnce();
  });

  it('truncates role longer than 60 chars — no crash', async () => {
    const res = await GET(makeGet({ role: 'A'.repeat(100) }));
    expect(res.status).toBe(200);
    expect(mockImageResponse).toHaveBeenCalledOnce();
  });

  it('truncates levelTitle longer than 30 chars — no crash', async () => {
    const res = await GET(makeGet({ levelTitle: 'B'.repeat(50) }));
    expect(res.status).toBe(200);
    expect(mockImageResponse).toHaveBeenCalledOnce();
  });
});
