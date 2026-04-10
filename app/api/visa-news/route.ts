import { getAllVisaNews } from '@/lib/posts';
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = getAllVisaNews();
  return NextResponse.json(posts);
}
