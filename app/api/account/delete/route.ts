import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServer, createSupabaseService } from '@/lib/auth-server';

export async function POST() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const service = createSupabaseService();

  // Fetch profile for Stripe customer ID before we delete
  const { data: profile } = await service
    .from('profiles')
    .select('stripe_customer_id, subscription_tier')
    .eq('id', user.id)
    .maybeSingle();

  // Cancel active Stripe subscription if one exists
  if (profile?.stripe_customer_id && profile.subscription_tier !== 'free') {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-06-30.basil',
      });
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status:   'active',
        limit:    1,
      });
      if (subs.data.length > 0) {
        await stripe.subscriptions.cancel(subs.data[0].id);
      }
    } catch (err) {
      // Log but don't block deletion — billing reconciliation can happen manually
      console.error('[account/delete] Stripe cancel failed:', err);
    }
  }

  // Delete comments — user_id is NOT NULL so anonymization requires schema change;
  // deletion is the correct privacy-compliant action under AU Privacy Act APP 13.
  await service
    .from('post_comments')
    .delete()
    .eq('user_id', user.id);

  // Soft-delete the profile
  await service
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', user.id);

  // Sign out all sessions
  await sb.auth.signOut();

  return NextResponse.json({ ok: true });
}
