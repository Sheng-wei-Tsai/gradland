import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit-db';

const IBM_CHANNEL_ID = 'UCKWaEZ-_VweaEx1j62do_vQ';

interface YTItem {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
}

async function getUploadsPlaylistId(apiKey: string): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${IBM_CHANNEL_ID}&key=${apiKey}`,
    { next: { revalidate: 86400 } }, // 24h — playlist ID never changes
  );
  const data = await res.json();
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? '';
}

async function fetchVideos(apiKey: string, playlistId: string, pageToken?: string): Promise<{ videos: YTItem[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    part:       'snippet',
    playlistId,
    maxResults: '12',
    key:        apiKey,
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res  = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`, { next: { revalidate: 3600 } });
  const data = await res.json();

  const videos: YTItem[] = (data.items ?? []).map((item: {
    snippet: {
      resourceId: { videoId: string };
      title: string;
      thumbnails: { medium?: { url: string }; default?: { url: string } };
      publishedAt: string;
      description: string;
    };
  }) => ({
    id:          item.snippet.resourceId.videoId,
    title:       item.snippet.title,
    thumbnail:   item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? '',
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description?.slice(0, 200) ?? '',
  }));

  return { videos, nextPageToken: data.nextPageToken };
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? req.headers.get('x-real-ip')
          ?? 'unknown';
  if (await checkRateLimit('learn/videos:' + ip, 3600, 60)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'YouTube API not configured' }, { status: 503 });

  const pageToken = req.nextUrl.searchParams.get('pageToken') ?? undefined;

  try {
    const playlistId = await getUploadsPlaylistId(apiKey);
    if (!playlistId) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });

    const { videos, nextPageToken } = await fetchVideos(apiKey, playlistId, pageToken);
    return NextResponse.json({ videos, nextPageToken: nextPageToken ?? null });
  } catch {
    return NextResponse.json({ error: 'Failed to load IBM channel videos' }, { status: 500 });
  }
}
