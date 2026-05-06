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
    .single();

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

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

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
        message: 'I have read and agree to the [Terms of Service](https://henrysdigitallife.com/terms) and [Privacy Policy](https://henrysdigitallife.com/privacy) of TechPath AU.',
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
