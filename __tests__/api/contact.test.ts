import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSend = vi.fn().mockResolvedValue({ id: 'mock-id' });

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function MockResend() {
    return { emails: { send: mockSend } };
  }),
}));

const { POST } = await import('@/app/api/contact/route');

const VALID_BODY = {
  name:    'Test User',
  email:   'test@example.com',
  topic:   'general',
  message: 'This is a valid test message that is long enough.',
};

let ipSeq = 200;
function makePost(body: object, ip?: string) {
  return new NextRequest('http://localhost/api/contact', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: {
      'content-type':    'application/json',
      'x-forwarded-for': ip ?? `172.20.${Math.floor(ipSeq / 256)}.${ipSeq++ % 256}`,
    },
  });
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ id: 'mock-id' });
    process.env.RESEND_API_KEY = 'test-resend-key';
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/contact', {
      method:  'POST',
      body:    '{not json}',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.168.10.1' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const { email: _e, ...noEmail } = VALID_BODY;
    const res  = await POST(makePost(noEmail));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email/i);
  });

  it('returns 400 on malformed email format', async () => {
    const res = await POST(makePost({ ...VALID_BODY, email: 'not-an-email' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when message is too short (< 10 chars)', async () => {
    const res  = await POST(makePost({ ...VALID_BODY, message: 'Short' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/short/i);
  });

  it('falls back to topic "general" for an unknown topic value', async () => {
    const res = await POST(makePost({ ...VALID_BODY, topic: 'unknown-topic' }));
    expect(res.status).toBe(200);
  });

  it('returns 200 with transport:none when RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY;
    const res  = await POST(makePost(VALID_BODY));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.transport).toBe('none');
  });

  it('returns 200 with ok:true on successful Resend send', async () => {
    const res  = await POST(makePost(VALID_BODY));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('returns 502 when Resend.emails.send throws', async () => {
    mockSend.mockRejectedValueOnce(new Error('Network error'));
    const res = await POST(makePost(VALID_BODY));
    expect(res.status).toBe(502);
  });

  it('returns 429 on the 6th request from the same IP within 1 hour', async () => {
    delete process.env.RESEND_API_KEY;
    const ip = '10.99.55.1';
    for (let i = 0; i < 5; i++) {
      const res = await POST(makePost(VALID_BODY, ip));
      expect(res.status).toBe(200);
    }
    const res = await POST(makePost(VALID_BODY, ip));
    expect(res.status).toBe(429);
  });
});
