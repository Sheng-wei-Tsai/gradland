import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ listings: [] });
  }

  const sb = createClient(supabaseUrl, anonKey);
  const { data, error } = await sb
    .from('job_listings')
    .select('id, company, logo_url, title, location, job_type, description, apply_url, salary, posted_at')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
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
