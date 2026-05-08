export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const VALID_LOCATIONS = new Set(['Sydney', 'Melbourne', 'Brisbane', 'Remote', 'Hybrid']);
const VALID_JOB_TYPES = new Set(['Full-time', 'Contract', 'Graduate']);

// Max 5 checkout sessions per IP per hour — blocks automated session flooding
const ipLog = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
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

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  const entry = ipLog.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 5) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    entry.count++;
  } else {
    if (!entry && ipLog.size >= 5000) ipLog.delete(ipLog.keys().next().value!);
    ipLog.set(ip, { count: 1, resetAt: now + 3_600_000 });
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
