import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerUser, createSupabaseService } from '@/lib/auth-server';
import { assertSameOrigin } from '@/lib/safety';

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  const sb = createSupabaseService();
  const { data: profile } = await sb
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }

  const allowedOrigins = new Set<string>(
    process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
      : [process.env.NEXT_PUBLIC_APP_URL ?? 'https://gradland.au', 'http://localhost:3000'],
  );
  const rawOrigin = req.headers.get('origin');
  const origin    = rawOrigin && allowedOrigins.has(rawOrigin)
    ? rawOrigin
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://gradland.au');

  const session = await stripe.billingPortal.sessions.create({
    customer:   profile.stripe_customer_id,
    return_url: `${origin}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
