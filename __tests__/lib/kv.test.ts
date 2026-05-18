import { vi, describe, it, expect, afterEach } from 'vitest';

const MOCK_URL   = 'https://kv.example.com';
const MOCK_TOKEN = 'tok123';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

// Load a fresh module instance with KV env vars set.
async function loadKvWithEnv() {
  vi.stubEnv('KV_REST_API_URL', MOCK_URL);
  vi.stubEnv('KV_REST_API_TOKEN', MOCK_TOKEN);
  vi.resetModules();
  return import('@/lib/kv');
}

// ── kvGet ──────────────────────────────────────────────────────────────────────

describe('kvGet', () => {
  it('returns null without calling fetch when KV env vars are absent', async () => {
    const { kvGet } = await import('@/lib/kv');
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    expect(await kvGet('somekey')).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns the cached value on a successful fetch', async () => {
    const { kvGet } = await loadKvWithEnv();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok:   true,
      json: vi.fn().mockResolvedValue({ result: 'hello' }),
    }));

    expect(await kvGet('mykey')).toBe('hello');
  });

  it('returns null when the KV result field is null', async () => {
    const { kvGet } = await loadKvWithEnv();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok:   true,
      json: vi.fn().mockResolvedValue({ result: null }),
    }));

    expect(await kvGet('mykey')).toBeNull();
  });

  it('returns null when the response status is not OK', async () => {
    const { kvGet } = await loadKvWithEnv();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    expect(await kvGet('mykey')).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    const { kvGet } = await loadKvWithEnv();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    expect(await kvGet('mykey')).toBeNull();
  });
});

// ── kvSet ──────────────────────────────────────────────────────────────────────

describe('kvSet', () => {
  it('does not call fetch when KV env vars are absent', async () => {
    const { kvSet } = await import('@/lib/kv');
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    await kvSet('k', 'v');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls the Upstash pipeline endpoint with correct headers and SET command', async () => {
    const { kvSet } = await loadKvWithEnv();
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await kvSet('mykey', 'myvalue', 3600);

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_URL}/pipeline`,
      expect.objectContaining({
        method:  'POST',
        headers: expect.objectContaining({
          Authorization:  `Bearer ${MOCK_TOKEN}`,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify([['SET', 'mykey', 'myvalue', 'EX', '3600']]),
      }),
    );
  });

  it('uses the default TTL of 86 400 seconds when none is supplied', async () => {
    const { kvSet } = await loadKvWithEnv();
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await kvSet('k', 'v');

    const { body } = mockFetch.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(body as string)).toEqual([['SET', 'k', 'v', 'EX', '86400']]);
  });

  it('silently swallows fetch exceptions so callers are never interrupted', async () => {
    const { kvSet } = await loadKvWithEnv();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await expect(kvSet('k', 'v')).resolves.toBeUndefined();
  });
});
