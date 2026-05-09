export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerUser } from '@/lib/auth-server';
import { checkRateLimit } from '@/lib/rate-limit-db';

const VALID_LOCATIONS = new Set(['Sydney', 'Melbourne', 'Brisbane', 'Remote', 'Hybrid']);
const VALID_JOB_TYPES = new Set(['Full-time', 'Contract', 'Graduate']);

export async function POST(req: NextRequest) {
  // IP-based rate limit — 5 Checkout sessions per IP per hour.
  // Authenticated users get a more permissive per-user limit (10/hr).
  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const user = await getServerUser();
  const rateLimitKey = user
    ? `job-listing:user:${user.id}`
    : `job-listing:ip:${ip}`;
  const limited = await checkRateLimit(rateLimitKey, 3600, user ? 10 : 5);
  if (limited) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const { company, title, location, jobType, description, applyUrl, salary, contactEmail } = body;

  if (!company || !title || !location || !jobType || !description || !applyUrl || !contactEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!VALID_LOCATIONS.has(String(location))) {
    return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
  }
  if (!VALID_JOB_TYPES.has(String(jobType))) {
    return NextResponse.json({ error: 'Invalid job type' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contactEmail))) {
    return NextResponse.json({ error: 'Invalid contact email' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gradland.au';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_JOB_LISTING_PRICE_ID!, quantity: 1 }],
    metadata: {
      type:         'job_listing',
      company:      String(company).slice(0, 100),
      title:        String(title).slice(0, 200),
      location:     String(location),
      jobType:      String(jobType),
      // Stripe metadata values are capped at 500 chars
      description:  String(description).slice(0, 500),
      applyUrl:     String(applyUrl).slice(0, 500),
      salary:       salary ? String(salary).slice(0, 100) : '',
      contactEmail: String(contactEmail).slice(0, 200),
    },
    success_url: `${BASE_URL}/post-a-role/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${BASE_URL}/post-a-role`,
  });

  return NextResponse.json({ url: session.url });
}
