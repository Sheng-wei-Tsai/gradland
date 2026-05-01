import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createSupabaseService } from '@/lib/auth-server';
import { sendJobListingApproved } from '@/lib/email';

export interface AdminJobListing {
  id:                string;
  company:           string;
  title:             string;
  location:          string;
  job_type:          string;
  description:       string;
  apply_url:         string;
  salary:            string | null;
  contact_email:     string;
  status:            'pending' | 'active' | 'expired';
  stripe_session_id: string | null;
  posted_at:         string;
  expires_at:        string;
  created_at:        string;
}

// GET — list all job listings (admin only)
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sb = createSupabaseService();
  const { data, error } = await sb
    .from('job_listings')
    .select('id, company, title, location, job_type, description, apply_url, salary, contact_email, status, stripe_session_id, posted_at, expires_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data ?? [] });
}

// PATCH — approve / reject / extend a listing
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null) as {
    id:     string;
    action: 'approve' | 'reject' | 'extend';
  } | null;

  if (!body?.id || !body.action) {
    return NextResponse.json({ error: 'id and action are required' }, { status: 400 });
  }
  if (!['approve', 'reject', 'extend'].includes(body.action)) {
    return NextResponse.json({ error: 'action must be approve | reject | extend' }, { status: 400 });
  }

  const sb = createSupabaseService();

  if (body.action === 'reject') {
    const { error } = await sb.from('job_listings').delete().eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'approve') {
    const { data: listing, error: fetchError } = await sb
      .from('job_listings')
      .select('contact_email, company, title, expires_at')
      .eq('id', body.id)
      .maybeSingle();
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
    if (!listing)   return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    const { error } = await sb
      .from('job_listings')
      .update({ status: 'active' })
      .eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sendJobListingApproved({
      to:        listing.contact_email,
      company:   listing.company,
      title:     listing.title,
      expiresAt: listing.expires_at,
    });
    return NextResponse.json({ ok: true });
  }

  // extend — add 30 days to expires_at
  if (body.action === 'extend') {
    const { data: listing, error: fetchError } = await sb
      .from('job_listings')
      .select('expires_at')
      .eq('id', body.id)
      .maybeSingle();
    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
    if (!listing)   return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    const current    = new Date(listing.expires_at);
    const newExpiry  = new Date(current.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error }  = await sb
      .from('job_listings')
      .update({ expires_at: newExpiry, status: 'active' })
      .eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, expires_at: newExpiry });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// DELETE — hard-delete a listing
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const sb = createSupabaseService();
  const { error } = await sb.from('job_listings').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
