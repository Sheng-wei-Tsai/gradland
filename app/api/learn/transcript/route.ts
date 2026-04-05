import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('videoId');
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });

  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = segments
      .map(s => s.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000); // Claude context budget

    if (!transcript) return NextResponse.json({ error: 'No transcript available' }, { status: 404 });
    return NextResponse.json({ transcript });
  } catch {
    return NextResponse.json({ error: 'Transcript unavailable for this video' }, { status: 404 });
  }
}
