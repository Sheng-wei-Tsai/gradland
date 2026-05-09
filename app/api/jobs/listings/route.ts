import { NextResponse } from 'next/server';
import { createSupabaseService } from '@/lib/auth-server';

export interface FeaturedListing {
  id:          string;
  company:     string;
  logo_url:    string | null;
  title:       string;
  location:    string;
  job_type:    string;
  description: string;
  apply_url:   string;
  salary:      string | null;
  posted_at:   string;
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ listings: [] });
  }

  // Query the public_job_listings view — excludes contact_email and enforces
  // status='active' AND expires_at > now() at the DB layer via RLS + view definition.
  const sb = createSupabaseService();
  const { data, error } = await sb
    .from('public_job_listings')
    .select('id, company, logo_url, title, location, job_type, description, apply_url, salary, posted_at')
    .order('posted_at', { ascending: false })
    .limit(10);

  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[jobs/listings] query error:', error.message);
    }
    return NextResponse.json({ listings: [] });
  }

  return NextResponse.json({ listings: data ?? [] });
}
