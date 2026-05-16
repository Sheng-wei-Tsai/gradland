import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseService } from '@/lib/auth-server';
import { checkRateLimit } from '@/lib/rate-limit-db';

const HOST = 'youtube138.p.rapidapi.com';

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('videoId');
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });

  // ── Check Supabase cache first — avoids RapidAPI call on repeat visits ────
  const sb = createSupabaseService();
  const { data: cached } = await sb
    .from('video_content')
    .select('video_title, channel_title')
    .eq('video_id', videoId)
    .maybeSingle();

  if (cached?.video_title) {
    return NextResponse.json({
      id:           videoId,
      title:        cached.video_title,
      channelTitle: cached.channel_title ?? '',
      thumbnail:    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration:     '',
      description:  '',
    });
  }

  // ── Rate limit before hitting paid RapidAPI (cache hits remain unmetered) ──
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          ?? req.headers.get('x-real-ip')
          ?? 'unknown';
  if (await checkRateLimit('learn/video-meta:' + ip, 3600, 30)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // ── Fallback: fetch from RapidAPI ─────────────────────────────────────────
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RapidAPI key not configured' }, { status: 503 });

  let res: Response;
  try {
    res = await fetch(`https://${HOST}/video/details/`, {
      method:  'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-rapidapi-host': HOST,
        'x-rapidapi-key':  apiKey,
      },
      body:   JSON.stringify({ id: videoId, hl: 'en', gl: 'AU' }),
      cache:  'no-store', // POST body not part of Next.js cache key — never cache
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return NextResponse.json({ error: 'Upstream timeout' }, { status: 504 });
  }

  if (!res.ok) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  const data = await res.json();
  if (!data?.id) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

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
