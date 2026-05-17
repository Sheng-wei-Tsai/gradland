import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Supabase query chain mock ─────────────────────────────────────────────────
const mockSingle = vi.fn().mockResolvedValue({
  data: { role_title: 'Dev', visa_type: '485', skills: [], city: 'Sydney',
          is_hired: false, hired_company: null, hired_skills: [], hired_message: null },
  error: null,
});
const mockSelect = vi.fn().mockReturnValue({ maybeSingle: mockSingle });
const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect });
const mockEq     = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
const mockFrom   = vi.fn().mockReturnValue({ upsert: mockUpsert, delete: mockDelete });

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });

vi.mock('@/lib/auth-server', () => ({
  createSupabaseServer: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

const { POST, DELETE } = await import('@/app/api/network/profile/route');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makePost(body: object) {
  return new NextRequest('http://localhost/api/network/profile', {
    method:  'POST',
    body:    JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const validBody = {
  role_title: 'Software Engineer',
  visa_type:  '485',
  city:       'Sydney',
  skills:     ['TypeScript', 'React'],
};

describe('POST /api/network/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockSingle.mockResolvedValue({
      data: { role_title: 'Dev', visa_type: '485', skills: [], city: 'Sydney',
              is_hired: false, hired_company: null, hired_skills: [], hired_message: null },
      error: null,
    });
    mockSelect.mockReturnValue({ maybeSingle: mockSingle });
    mockUpsert.mockReturnValue({ select: mockSelect });
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ upsert: mockUpsert, delete: mockDelete });
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is invalid JSON', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const req = new NextRequest('http://localhost/api/network/profile', {
      method:  'POST',
      body:    'not-json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when role_title is missing', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res  = await POST(makePost({ ...validBody, role_title: '' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/role_title/i);
  });

  it('returns 400 when visa_type is not in VALID_VISA_TYPES', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res  = await POST(makePost({ ...validBody, visa_type: 'tourist' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/visa_type/i);
  });

  it('returns 400 when city is not in VALID_CITIES', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res  = await POST(makePost({ ...validBody, city: 'Darwin' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/city/i);
  });

  it('accepts all valid visa_type values', async () => {
    const validVisaTypes = ['485', '482', 'student', 'pr', 'citizen', 'other'];
    for (const visa_type of validVisaTypes) {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
      mockSingle.mockResolvedValueOnce({ data: { ...validBody, visa_type }, error: null });
      const res = await POST(makePost({ ...validBody, visa_type }));
      expect(res.status).toBe(200);
    }
  });

  it('accepts all valid city values', async () => {
    const validCities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Other'];
    for (const city of validCities) {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
      mockSingle.mockResolvedValueOnce({ data: { ...validBody, city }, error: null });
      const res = await POST(makePost({ ...validBody, city }));
      expect(res.status).toBe(200);
    }
  });

  it('truncates skills array to 20 entries', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const lotsOfSkills = Array.from({ length: 30 }, (_, i) => `skill${i}`);
    await POST(makePost({ ...validBody, skills: lotsOfSkills }));

    expect(mockUpsert).toHaveBeenCalledOnce();
    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg.skills).toHaveLength(20);
  });

  it('caps each skill at 50 characters', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const longSkill = 'x'.repeat(80);
    await POST(makePost({ ...validBody, skills: [longSkill] }));

    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg.skills[0]).toHaveLength(50);
  });

  it('filters out non-string entries from skills', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    await POST(makePost({ ...validBody, skills: ['TypeScript', 42, null, 'React'] }));

    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg.skills).toEqual(['TypeScript', 'React']);
  });

  it('returns 200 with valid body and passes data to upsert', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledOnce();
    const upsertArg = mockUpsert.mock.calls[0][0];
    expect(upsertArg.role_title).toBe('Software Engineer');
    expect(upsertArg.visa_type).toBe('485');
    expect(upsertArg.city).toBe('Sydney');
  });

  it('returns 500 when Supabase upsert fails', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });
    const res = await POST(makePost(validBody));
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/network/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ upsert: mockUpsert, delete: mockDelete });
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it('returns 200 with { ok: true } when delete succeeds', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    const res  = await DELETE();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('returns 500 when Supabase delete fails', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
    mockEq.mockResolvedValueOnce({ error: { message: 'RLS blocked delete' } });
    const res  = await DELETE();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Failed to leave network/i);
  });
});
