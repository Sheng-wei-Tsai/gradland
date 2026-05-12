import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────────────
const mockRpc = vi.fn();

vi.mock('@/lib/auth-server', () => ({
  createSupabaseService: vi.fn().mockReturnValue({ rpc: mockRpc }),
}));

const { checkRateLimit } = await import('@/lib/rate-limit-db');

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('checkRateLimit', () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it('returns false when count is at the limit (not over)', async () => {
    mockRpc.mockResolvedValue({ data: 5, error: null });
    const result = await checkRateLimit('test:1.2.3.4', 60, 5);
    expect(result).toBe(false);
  });

  it('returns false when count is below the limit', async () => {
    mockRpc.mockResolvedValue({ data: 3, error: null });
    const result = await checkRateLimit('test:1.2.3.4', 60, 5);
    expect(result).toBe(false);
  });

  it('returns true when count exceeds the limit', async () => {
    mockRpc.mockResolvedValue({ data: 6, error: null });
    const result = await checkRateLimit('test:1.2.3.4', 60, 5);
    expect(result).toBe(true);
  });

  it('fails-open (returns false) on a DB error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'connection refused' } });
    const result = await checkRateLimit('test:1.2.3.4', 60, 5);
    expect(result).toBe(false);
  });

  it('fails-open (returns false) when rpc throws', async () => {
    mockRpc.mockRejectedValue(new Error('network timeout'));
    const result = await checkRateLimit('test:1.2.3.4', 60, 5);
    expect(result).toBe(false);
  });

  it('calls rpc with increment_rate_limit and the correct key arg', async () => {
    mockRpc.mockResolvedValue({ data: 1, error: null });
    await checkRateLimit('contact:192.168.1.1', 3600, 5);
    expect(mockRpc).toHaveBeenCalledOnce();
    const [rpcName, args] = mockRpc.mock.calls[0];
    expect(rpcName).toBe('increment_rate_limit');
    expect(args.p_key).toBe('contact:192.168.1.1');
  });

  it('derives the bucket from the window — two calls in the same window share a bucket', async () => {
    mockRpc.mockResolvedValue({ data: 1, error: null });
    const windowSec = 3600;

    await checkRateLimit('test:key', windowSec, 10);
    await checkRateLimit('test:key', windowSec, 10);

    const bucket1 = mockRpc.mock.calls[0][1].p_bucket;
    const bucket2 = mockRpc.mock.calls[1][1].p_bucket;
    expect(bucket1).toBe(bucket2);
    expect(new Date(bucket1).getTime() % (windowSec * 1000)).toBe(0);
  });
});
