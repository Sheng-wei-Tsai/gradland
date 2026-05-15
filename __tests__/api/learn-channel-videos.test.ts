import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Rate-limit mock — always pass-through (not limited) ──────────────────────
vi.mock('@/lib/rate-limit-db', () => ({ checkRateLimit: vi.fn().mockResolvedValue(false) }));

// ── Global fetch mock ─────────────────────────────────────────────────────────
// Must be stubbed before the route module is imported so the route's fetch calls
// are intercepted. Each test uses a unique channelId to avoid the module-level
// playlistIdCache returning stale values across tests.
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const { GET } = await import('@/app/api/learn/channel-videos/route');

function makeGet(params: Record<string, string>) {
  const url = new URL('http://localhost/api/learn/channel-videos');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

// Helper: mock a successful YouTube Channels API response that returns a playlistId.
function mockChannel(playlistId: string) {
  return {
    json: () =>
      Promise.resolve({
        items: [{ contentDetails: { relatedPlaylists: { uploads: playlistId } } }],
      }),
  };
}

// Helper: mock a successful YouTube PlaylistItems API response.
function mockPlaylist(
  videos: Array<{ videoId: string; title: string; description?: string }>,
  nextPageToken?: string,
) {
  return {
    ok:   true,
    json: () =>
      Promise.resolve({
        items: videos.map(v => ({
          snippet: {
            resourceId:            { videoId: v.videoId },
            title:                 v.title,
            thumbnails:            { medium: { url: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg` } },
            publishedAt:           '2024-01-01T00:00:00Z',
            description:           v.description ?? 'Test description',
            videoOwnerChannelTitle: 'Test Channel',
          },
        })),
        ...(nextPageToken ? { nextPageToken } : {}),
      }),
  };
}

describe('GET /api/learn/channel-videos', () => {
  afterEach(() => {
    mockFetch.mockReset();
    delete process.env.YOUTUBE_API_KEY;
  });

  // ── Input validation ──────────────────────────────────────────────────────

  it('returns 400 when channelId query param is missing', async () => {
    const res = await GET(makeGet({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/channelId/i);
  });

  it('returns 400 when channelId fails format validation', async () => {
    const res = await GET(makeGet({ channelId: 'short' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/channelId/i);
  });

  // ── API key guard ─────────────────────────────────────────────────────────

  it('returns 503 when YOUTUBE_API_KEY is not configured', async () => {
    // env var intentionally absent
    const res = await GET(makeGet({ channelId: 'UC_nokey_100000000000000' }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  // ── Channel lookup ────────────────────────────────────────────────────────

  it('returns 404 when YouTube returns no channel items', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ items: [] }),
    });
    const res = await GET(makeGet({ channelId: 'UC_notfound_100000000000' }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });

  // ── Success path ──────────────────────────────────────────────────────────

  it('returns 200 with videos array and null nextPageToken when last page', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch
      .mockResolvedValueOnce(mockChannel('PL_success_1'))
      .mockResolvedValueOnce(mockPlaylist([
        { videoId: 'vid1', title: 'TypeScript Basics' },
        { videoId: 'vid2', title: 'React Hooks Deep Dive' },
      ]));
    const res = await GET(makeGet({ channelId: 'UC_success_1000000000000' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.videos).toHaveLength(2);
    expect(body.videos[0].id).toBe('vid1');
    expect(body.videos[0].title).toBe('TypeScript Basics');
    expect(body.nextPageToken).toBeNull();
  });

  it('propagates nextPageToken when more pages are available', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch
      .mockResolvedValueOnce(mockChannel('PL_pages_1'))
      .mockResolvedValueOnce(mockPlaylist(
        [{ videoId: 'p1', title: 'Page 1 Video' }],
        'NEXT_TOKEN_XYZ',
      ));
    const res = await GET(makeGet({ channelId: 'UC_pages_100000000000000' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.nextPageToken).toBe('NEXT_TOKEN_XYZ');
  });

  // ── Private/deleted video filter ──────────────────────────────────────────

  it('filters out private and deleted videos from the response', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch
      .mockResolvedValueOnce(mockChannel('PL_filter_1'))
      .mockResolvedValueOnce({
        ok:   true,
        json: () =>
          Promise.resolve({
            items: [
              {
                snippet: {
                  resourceId:            { videoId: 'public1' },
                  title:                 'Public Video',
                  thumbnails:            { medium: { url: 'https://example.com/t.jpg' } },
                  publishedAt:           '2024-01-01T00:00:00Z',
                  description:           'Visible',
                  videoOwnerChannelTitle: 'Chan',
                },
              },
              // Private video — no resourceId.videoId
              {
                snippet: {
                  resourceId: null,
                  title:      'Private video',
                  thumbnails: {},
                  publishedAt: '2024-01-01T00:00:00Z',
                  description: '',
                },
              },
              // Deleted video — sentinel title
              {
                snippet: {
                  resourceId:  { videoId: 'del1' },
                  title:       'Deleted video',
                  thumbnails:  {},
                  publishedAt: '2024-01-01T00:00:00Z',
                  description: '',
                },
              },
            ],
          }),
      });
    const res = await GET(makeGet({ channelId: 'UC_filter_1000000000000' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.videos).toHaveLength(1);
    expect(body.videos[0].id).toBe('public1');
  });

  // ── Unexpected error handling ─────────────────────────────────────────────

  it('returns 500 with generic message when an unexpected error is thrown', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch.mockRejectedValueOnce(new Error('internal details that must not leak'));
    const res = await GET(makeGet({ channelId: 'UC_throw_100000000000000' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to load channel videos');
    expect(body.error).not.toContain('internal details');
  });

  // ── YouTube API error forwarding ──────────────────────────────────────────

  it('returns generic error on YouTube API non-OK response, preserving status code', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch
      .mockResolvedValueOnce(mockChannel('PL_err_1'))
      .mockResolvedValueOnce({
        ok:     false,
        status: 403,
        json:   () => Promise.resolve({ error: { message: 'Quota exceeded' } }),
      });
    const res = await GET(makeGet({ channelId: 'UC_err_10000000000000000' }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('YouTube API error');
  });

  // ── Description truncation ────────────────────────────────────────────────

  it('truncates video description to 200 chars', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    const longDesc = 'D'.repeat(300);
    mockFetch
      .mockResolvedValueOnce(mockChannel('PL_desc_1'))
      .mockResolvedValueOnce(mockPlaylist([
        { videoId: 'vdesc1', title: 'Long Description Video', description: longDesc },
      ]));
    const res = await GET(makeGet({ channelId: 'UC_desc_100000000000000' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.videos[0].description).toHaveLength(200);
    expect(body.videos[0].description).toBe('D'.repeat(200));
  });
});
