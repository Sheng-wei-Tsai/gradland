import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchIAFeed, formatRelativeDate } from '@/lib/ia-feed';

// ── fetchIAFeed ────────────────────────────────────────────────────────────────

function makeRssXml(items: Array<{
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  categories?: string[];
  author?: string;
  cdataTitle?: string;
}>) {
  const itemsXml = items.map(item => {
    const title = item.cdataTitle
      ? `<title><![CDATA[${item.cdataTitle}]]></title>`
      : item.title != null ? `<title>${item.title}</title>` : '';
    const link = item.link != null ? `<link>${item.link}</link>` : '';
    const pubDate = item.pubDate != null ? `<pubDate>${item.pubDate}</pubDate>` : '';
    const desc = item.description != null ? `<description>${item.description}</description>` : '';
    const cats = (item.categories ?? []).map(c => `<category>${c}</category>`).join('');
    const author = item.author != null ? `<dc:creator>${item.author}</dc:creator>` : '';
    return `<item>${title}${link}${pubDate}${desc}${cats}${author}</item>`;
  }).join('\n');
  return `<?xml version="1.0"?><rss version="2.0"><channel>${itemsXml}</channel></rss>`;
}

const TECH_ITEM = {
  title: 'AI jobs surge in Australia',
  link: 'https://ia.acs.org.au/ai-jobs',
  pubDate: 'Mon, 10 Jun 2026 09:00:00 +0000',
  description: 'Demand for AI engineers continues to grow.',
  categories: ['AI'],
};

const NON_TECH_ITEM = {
  title: 'Property prices rise in Sydney',
  link: 'https://ia.acs.org.au/property',
  pubDate: 'Mon, 10 Jun 2026 09:00:00 +0000',
  description: 'Housing market update.',
  categories: ['Real Estate'],
};

describe('fetchIAFeed', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns [] when fetch throws a network error', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchIAFeed();
    expect(result).toEqual([]);
  });

  it('returns [] when the response is not OK (status 500)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 500, text: async () => '' });
    const result = await fetchIAFeed();
    expect(result).toEqual([]);
  });

  it('returns parsed item for valid RSS with a tech-category article', async () => {
    const xml = makeRssXml([TECH_ITEM]);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, text: async () => xml });
    const result = await fetchIAFeed();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('AI jobs surge in Australia');
    expect(result[0].link).toBe('https://ia.acs.org.au/ai-jobs');
    expect(result[0].category).toContain('AI');
  });

  it('returns [] when the only item has a non-tech category', async () => {
    const xml = makeRssXml([NON_TECH_ITEM]);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, text: async () => xml });
    const result = await fetchIAFeed();
    expect(result).toEqual([]);
  });

  it('returns item when category array is empty (allow-all rule)', async () => {
    const xml = makeRssXml([{ ...TECH_ITEM, categories: [] }]);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, text: async () => xml });
    const result = await fetchIAFeed();
    expect(result).toHaveLength(1);
  });

  it('respects the limit parameter', async () => {
    const xml = makeRssXml([TECH_ITEM, { ...TECH_ITEM, title: 'Second item', link: 'https://ia.acs.org.au/second' }]);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, text: async () => xml });
    const result = await fetchIAFeed(1);
    expect(result).toHaveLength(1);
  });

  it('filters out items missing a title', async () => {
    const xml = makeRssXml([{ ...TECH_ITEM, title: '' }]);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, text: async () => xml });
    const result = await fetchIAFeed();
    expect(result).toEqual([]);
  });

  it('unwraps CDATA-wrapped titles', async () => {
    const xml = makeRssXml([{ ...TECH_ITEM, title: undefined, cdataTitle: 'CDATA Title & More' }]);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, text: async () => xml });
    const result = await fetchIAFeed();
    expect(result[0].title).toBe('CDATA Title & More');
  });

  it('decodes HTML entities in descriptions', async () => {
    const xml = makeRssXml([{ ...TECH_ITEM, description: 'Foo &amp; Bar &lt;baz&gt;' }]);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, text: async () => xml });
    const result = await fetchIAFeed();
    expect(result[0].description).toBe('Foo & Bar <baz>');
  });
});

// Fix "now" so all branch assertions are deterministic.
const NOW = new Date('2026-05-16T12:00:00Z');

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" when the date is earlier the same day', () => {
    const earlier = new Date('2026-05-16T06:00:00Z').toISOString();
    expect(formatRelativeDate(earlier)).toBe('Today');
  });

  it('returns "Yesterday" for a date ~26 hours ago', () => {
    const d = new Date('2026-05-15T10:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('Yesterday');
  });

  it('returns "Xd ago" for 3 days ago (< 7 branch)', () => {
    const d = new Date('2026-05-13T12:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('3d ago');
  });

  it('returns "Xd ago" for 6 days ago (upper edge of < 7 branch)', () => {
    const d = new Date('2026-05-10T12:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('6d ago');
  });

  it('returns "1w ago" for 7 days ago (first entry of < 30 branch)', () => {
    const d = new Date('2026-05-09T12:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('1w ago');
  });

  it('returns "2w ago" for 14 days ago (< 30 branch)', () => {
    const d = new Date('2026-05-02T12:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('2w ago');
  });

  it('returns a locale date string for 45 days ago (≥ 30 branch)', () => {
    const d = new Date('2026-04-01T12:00:00Z').toISOString();
    const result = formatRelativeDate(d);
    // en-AU locale formats as "1 Apr" — match digit + short-month rather than hardcode
    expect(result).toMatch(/^\d+ [A-Za-z]{3}$/);
  });

  it('returns "" for an invalid date string', () => {
    expect(formatRelativeDate('not-a-date')).toBe('');
  });
});
