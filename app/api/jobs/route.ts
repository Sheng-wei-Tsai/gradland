import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const APP_ID  = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

const ALLOWED_SORT = new Set(['date', 'salary']);

export interface AdzunaJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string | null;
  url: string;
  created: string;
  category: string;
  contract_type: string | null;
}

export async function GET(req: NextRequest) {
  if (!APP_ID || !APP_KEY) {
    return NextResponse.json({ error: 'Job search not configured' }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const keywords = searchParams.get('keywords') || 'software developer';
  const location = searchParams.get('location') || 'Brisbane';
  const fullTime = searchParams.get('full_time');

  // Validate page: positive integer, max 10
  const rawPage = parseInt(searchParams.get('page') ?? '1', 10);
  const page    = Number.isFinite(rawPage) ? Math.max(1, Math.min(rawPage, 10)) : 1;

  // Validate sort_by against allowlist
  const rawSort = searchParams.get('sort_by') ?? 'date';
  const sortBy  = ALLOWED_SORT.has(rawSort) ? rawSort : 'date';

  const params = new URLSearchParams({
    app_id:           APP_ID,
    app_key:          APP_KEY,
    results_per_page: '20',
    what:             keywords,
    where:            location,
    sort_by:          sortBy,
  });

  if (fullTime === '1') params.set('full_time', '1');

  const url = `https://api.adzuna.com/v1/api/jobs/au/search/${page}?${params}`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();

    const jobs: AdzunaJob[] = (data.results ?? []).map((r: any) => ({
      id:            r.id,
      title:         r.title,
      company:       r.company?.display_name ?? 'Unknown',
      location:      r.location?.display_name ?? location,
      description:   r.description,
      salary:        r.salary_min
        ? `$${Math.round(r.salary_min / 1000)}k – $${Math.round(r.salary_max / 1000)}k`
        : null,
      url:           r.redirect_url,
      created:       r.created,
      category:      r.category?.label ?? '',
      contract_type: r.contract_type ?? null,
    }));

    return NextResponse.json({ jobs, total: data.count ?? 0 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
