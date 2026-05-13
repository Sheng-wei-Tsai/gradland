/**
 * Cron job: expire job listings and send renewal/expiry emails.
 * Called daily by Vercel Cron (see vercel.json).
 * Authenticated via CRON_SECRET Bearer token.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseService } from '@/lib/auth-server';
import { sendJobListingExpired, sendJobListingRenewalReminder } from '@/lib/email';

export async function GET(req: NextRequest) {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb  = createSupabaseService();
  const now = new Date().toISOString();

  // ── 1. Mark active listings past their expires_at as 'expired' ──────────────
  const { data: justExpired, error: expireError } = await sb
    .from('job_listings')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', now)
    .select('id, company, title, contact_email');

  if (expireError) {
    console.error('[cron/expire-job-listings] expire update failed:', expireError.message);
    return NextResponse.json({ error: 'Failed to expire job listings' }, { status: 500 });
  }

  // Send expiry emails
  for (const listing of justExpired ?? []) {
    await sendJobListingExpired({
      to:      listing.contact_email,
      company: listing.company,
      title:   listing.title,
    });
  }

  // ── 2. Send renewal reminder for listings expiring in 4–6 days ─────────────
  // Window: 4d–6d so we don't spam if cron runs slightly off-time
  const in4days = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
  const in6days = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();

  const { data: expiringSoon, error: reminderError } = await sb
    .from('job_listings')
    .select('id, company, title, contact_email, expires_at')
    .eq('status', 'active')
    .gt('expires_at', in4days)
    .lt('expires_at', in6days)
    .limit(100);

  if (reminderError) {
    console.error('[cron/expire-job-listings] reminder query failed:', reminderError.message);
    // Non-fatal — expiry marking already succeeded
  }

  for (const listing of expiringSoon ?? []) {
    await sendJobListingRenewalReminder({
      to:        listing.contact_email,
      company:   listing.company,
      title:     listing.title,
      expiresAt: listing.expires_at,
    });
  }

  return NextResponse.json({
    expired:  (justExpired ?? []).length,
    reminded: (expiringSoon ?? []).length,
  });
}
