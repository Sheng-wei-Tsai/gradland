import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseService } from '@/lib/auth-server';

// Simple in-memory rate limit — max 10 error reports per IP per minute
const ipLog = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();

  const entry = ipLog.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 10) return NextResponse.json({}, { status: 429 });
    entry.count++;
  } else {
    if (!entry && ipLog.size >= 5000) ipLog.delete(ipLog.keys().next().value!);
    ipLog.set(ip, { count: 1, resetAt: now + 60_000 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({}, { status: 400 });

  const message = String(body.message ?? '').slice(0, 500);
  const digest  = String(body.digest  ?? '').slice(0, 100);
  const url     = String(body.url     ?? '').slice(0, 500);

  // Log to Supabase — best effort, don't surface failures to the client
  try {
    const sb = createSupabaseService();
    await sb.from('error_logs').insert({ message, digest, url, created_at: new Date().toISOString() });
  } catch {
    // Table may not exist yet — fail silently until migration runs
  }

  return NextResponse.json({ ok: true });
}
