import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerUser } from '@/lib/auth-server';
import { createSupabaseService } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  const sb = createSupabaseService();

  // Fetch or create Stripe customer
  const { data: profile } = await sb
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id as string | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      name:  profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await sb
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  // Validate origin against allowlist so user-controlled input can't redirect
  // Stripe success/cancel URLs to an arbitrary host (open-redirect prevention).
  const allowedOrigins = new Set<string>(
    process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
      : [process.env.NEXT_PUBLIC_APP_URL ?? 'https://gradland.au', 'http://localhost:3000'],
  );
  const rawOrigin = req.headers.get('origin');
  const origin    = rawOrigin && allowedOrigins.has(rawOrigin)
    ? rawOrigin
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'https://gradland.au');

  const session = await stripe.checkout.sessions.create({
    customer:   customerId,
    mode:       'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/dashboard?subscribed=1`,
    cancel_url:  `${origin}/pricing?cancelled=1`,
    metadata:    { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    allow_promotion_codes: true,
    consent_collection: {
      terms_of_service: 'required',
    },
    custom_text: {
      terms_of_service_acceptance: {
        message: 'I have read and agree to the [Terms of Service](https://gradland.au/terms) and [Privacy Policy](https://gradland.au/privacy) of Gradland.',
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
