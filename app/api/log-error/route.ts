import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseService } from '@/lib/auth-server';
import { checkRateLimit } from '@/lib/rate-limit-db';
import { assertSameOrigin } from '@/lib/safety';

export async function POST(req: NextRequest) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const limited = await checkRateLimit(`log-error:${ip}`, 60, 10);
  if (limited) return NextResponse.json({}, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({}, { status: 400 });

  const message = typeof body.message === 'string' ? body.message.slice(0, 500) : '';
  const digest  = typeof body.digest  === 'string' ? body.digest.slice(0, 100)  : '';
  const url     = typeof body.url     === 'string' ? body.url.slice(0, 500)     : '';

  Sentry.captureMessage(message, { level: 'error', extra: { digest, url } });

  const sb = createSupabaseService();
  const { error } = await sb.from('error_logs').insert({ message, digest, url, created_at: new Date().toISOString() });
  if (error) console.error('[log-error] error_logs insert failed:', error.message);

  return NextResponse.json({ ok: true });
}
