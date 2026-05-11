import { getAllVisaNews } from '@/lib/posts';
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = getAllVisaNews();
  return NextResponse.json(posts, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
