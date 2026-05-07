import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Must be stubbed before route import so the module's fetch calls are intercepted.
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const { GET } = await import('@/app/api/learn/videos/route');

function makeGet(params?: Record<string, string>) {
  const url = new URL('http://localhost/api/learn/videos');
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

function mockChannel(playlistId: string) {
  const items = playlistId
    ? [{ contentDetails: { relatedPlaylists: { uploads: playlistId } } }]
    : [];
  return { json: () => Promise.resolve({ items }) };
}

function mockPlaylist(
  videos: Array<{ videoId: string; title: string; description?: string }>,
  nextPageToken?: string,
) {
  return {
    json: () =>
      Promise.resolve({
        items: videos.map(v => ({
          snippet: {
            resourceId: { videoId: v.videoId },
            title: v.title,
            thumbnails: { medium: { url: `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg` } },
            publishedAt: '2024-01-01T00:00:00Z',
            description: v.description ?? 'Test description',
          },
        })),
        ...(nextPageToken ? { nextPageToken } : {}),
      }),
  };
}

describe('GET /api/learn/videos', () => {
  afterEach(() => {
    mockFetch.mockReset();
    delete process.env.YOUTUBE_API_KEY;
  });

  it('returns 503 when YOUTUBE_API_KEY is not configured', async () => {
    const res = await GET(makeGet());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  it('returns 404 when YouTube returns no channel items', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch.mockResolvedValueOnce(mockChannel(''));
    const res = await GET(makeGet());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });

  it('returns 200 with videos array and null nextPageToken on last page', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch
      .mockResolvedValueOnce(mockChannel('PL_ibm_1'))
      .mockResolvedValueOnce(mockPlaylist([
        { videoId: 'ibm1', title: 'IBM Cloud Intro' },
        { videoId: 'ibm2', title: 'Kubernetes Basics' },
      ]));
    const res = await GET(makeGet());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.videos).toHaveLength(2);
    expect(body.videos[0].id).toBe('ibm1');
    expect(body.videos[0].title).toBe('IBM Cloud Intro');
    expect(body.nextPageToken).toBeNull();
  });

  it('propagates nextPageToken when more pages are available', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch
      .mockResolvedValueOnce(mockChannel('PL_ibm_2'))
      .mockResolvedValueOnce(mockPlaylist(
        [{ videoId: 'ibm3', title: 'AI Video' }],
        'PAGE_TOKEN_IBM_ABC',
      ));
    const res = await GET(makeGet());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.nextPageToken).toBe('PAGE_TOKEN_IBM_ABC');
  });

  it('forwards pageToken query param to the YouTube playlist API request', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch
      .mockResolvedValueOnce(mockChannel('PL_ibm_3'))
      .mockResolvedValueOnce(mockPlaylist([{ videoId: 'ibm4', title: 'Paged Video' }]));
    await GET(makeGet({ pageToken: 'MY_NEXT_TOKEN' }));
    const playlistCallUrl = mockFetch.mock.calls[1][0] as string;
    expect(playlistCallUrl).toContain('pageToken=MY_NEXT_TOKEN');
  });

  it('truncates video description to 200 chars', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    const longDesc = 'D'.repeat(300);
    mockFetch
      .mockResolvedValueOnce(mockChannel('PL_ibm_4'))
      .mockResolvedValueOnce(mockPlaylist([
        { videoId: 'ibm5', title: 'Long Description Video', description: longDesc },
      ]));
    const res = await GET(makeGet());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.videos[0].description).toHaveLength(200);
    expect(body.videos[0].description).toBe('D'.repeat(200));
  });

  it('returns 500 on fetch error', async () => {
    process.env.YOUTUBE_API_KEY = 'yt-test';
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));
    const res = await GET(makeGet());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Network failure/);
  });
});
