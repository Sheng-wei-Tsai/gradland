import { NextResponse } from 'next/server';
import data from '@/data/ai-usage.json';

export async function GET() {
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
