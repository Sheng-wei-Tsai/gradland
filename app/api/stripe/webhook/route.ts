export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseService } from '@/lib/auth-server';
import { sendJobListingConfirmation } from '@/lib/email';

async function updateSubscription(
  userId: string,
  tier: 'free' | 'pro',
  expiresAt: string | null,
  eventId: string,
) {
  const sb = createSupabaseService();
  const { error } = await sb
    .from('profiles')
    .update({
      subscription_tier:       tier,
      subscription_expires_at: expiresAt,
    })
    .eq('id', userId);
  if (error) console.error(`[stripe/webhook] DB update failed event=${eventId} user=${userId}:`, error.message);
}

function periodEndToISO(sub: Stripe.Subscription): string {
  // In v22 / basil API, current_period_end lives on the subscription item
  const item = sub.items?.data?.[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const ts   = item?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  const body      = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const sb = createSupabaseService();

  // Idempotency guard — prevents duplicate processing of Stripe event replays.
  // Requires supabase/027_stripe_events.sql; degrades gracefully if table absent.
  const { data: dedupRows, error: dedupError } = await sb
    .from('stripe_events')
    .upsert({ event_id: event.id, event_type: event.type }, { onConflict: 'event_id', ignoreDuplicates: true })
    .select('event_id');
  if (!dedupError && Array.isArray(dedupRows) && dedupRows.length === 0) {
    return NextResponse.json({ received: true });
  }

  switch (event.type) {

    // ── Payment succeeded → activate Pro or create job listing ────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // ── Job listing one-time payment ───────────────────────────
      if (session.metadata?.type === 'job_listing') {
        const m = session.metadata;
        const { error } = await sb.from('job_listings').insert({
          company:           m.company,
          title:             m.title,
          location:          m.location,
          job_type:          m.jobType,
          description:       m.description,
          apply_url:         m.applyUrl,
          salary:            m.salary || null,
          contact_email:     m.contactEmail,
          status:            'pending',
          stripe_session_id: session.id,
          expires_at:        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
        if (error) {
          console.error(`[stripe/webhook] job_listings insert failed event=${event.id}:`, error.message);
        } else {
          await sendJobListingConfirmation({
            to:        m.contactEmail,
            company:   m.company,
            title:     m.title,
            listingId: session.id,
          });
        }
        break;
      }

      // ── Subscription payment ────────────────────────────────────
      const userId = session.metadata?.supabase_user_id;
      if (!userId) break;

      let expiresAt: string | null = null;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        expiresAt = periodEndToISO(sub);
      }
      await updateSubscription(userId, 'pro', expiresAt, event.id);
      break;
    }

    // ── Renewal → extend expiry ────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      // In v22 basil, subscription is nested under parent
      const subRef  = (invoice as unknown as { subscription?: string | null }).subscription
                   ?? (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } }).parent?.subscription_details?.subscription;
      if (!subRef) break;

      const sub    = await stripe.subscriptions.retrieve(subRef as string);
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      await updateSubscription(userId, 'pro', periodEndToISO(sub), event.id);
      break;
    }

    // ── Cancellation / non-payment → downgrade ─────────────────────
    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      await updateSubscription(userId, 'free', null, event.id);
      break;
    }

    // ── Payment failed → keep until period end ─────────────────────
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef  = (invoice as unknown as { subscription?: string | null }).subscription
                   ?? (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } }).parent?.subscription_details?.subscription;
      if (!subRef) break;

      const sub    = await stripe.subscriptions.retrieve(subRef as string);
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      await sb.from('profiles')
        .update({ subscription_expires_at: periodEndToISO(sub) })
        .eq('id', userId);
      break;
    }

    // ── Reactivation / update ──────────────────────────────────────
    case 'customer.subscription.updated': {
      const sub    = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      const isActive = sub.status === 'active' || sub.status === 'trialing';
      await updateSubscription(userId, isActive ? 'pro' : 'free', isActive ? periodEndToISO(sub) : null, event.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
