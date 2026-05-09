import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseService } from '@/lib/auth-server';
import { checkRateLimit } from '@/lib/rate-limit-db';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limited = await checkRateLimit(`log-error:${ip}`, 60, 10);
  if (limited) return NextResponse.json({}, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({}, { status: 400 });

  const message = String(body.message ?? '').slice(0, 500);
  const digest  = String(body.digest  ?? '').slice(0, 100);
  const url     = String(body.url     ?? '').slice(0, 500);

  Sentry.captureMessage(message, { level: 'error', extra: { digest, url } });

  // Log to Supabase — best effort, don't surface failures to the client
  try {
    const sb = createSupabaseService();
    await sb.from('error_logs').insert({ message, digest, url, created_at: new Date().toISOString() });
  } catch {
    // Table may not exist yet — fail silently until migration runs
  }

  return NextResponse.json({ ok: true });
}
