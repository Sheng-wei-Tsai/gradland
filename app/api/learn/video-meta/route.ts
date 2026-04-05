import { NextRequest, NextResponse } from 'next/server';

const HOST = 'youtube138.p.rapidapi.com';

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('videoId');
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RapidAPI key not configured' }, { status: 503 });

  const res = await fetch(`https://${HOST}/video/details/`, {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-rapidapi-host': HOST,
      'x-rapidapi-key':  apiKey,
    },
    body: JSON.stringify({ id: videoId, hl: 'en', gl: 'AU' }),
    next: { revalidate: 86400 },
  });

  if (!res.ok) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  const data = await res.json();
  if (!data?.id) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  // youtube138 returns thumbnails as an array sorted by quality
  const thumbs: Array<{ url: string }> = data.thumbnails ?? [];
  const thumbnail = thumbs[Math.floor(thumbs.length / 2)]?.url ?? thumbs[0]?.url ?? '';

  return NextResponse.json({
    id:           data.id,
    title:        data.title ?? '',
    channelTitle: data.author?.title ?? '',
    thumbnail,
    duration:     data.lengthSeconds ? `PT${Math.floor(data.lengthSeconds / 60)}M${data.lengthSeconds % 60}S` : '',
    description:  (data.description ?? '').slice(0, 300),
  });
}
