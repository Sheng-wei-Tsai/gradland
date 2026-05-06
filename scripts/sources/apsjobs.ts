/**
 * APS Jobs RSS — Australian Public Service ICT roles.
 *
 *   https://www.apsjobs.gov.au/Search/SearchResultsRSS.aspx?keyword=ICT
 *
 * Federal-only roles, PR-friendly. Filter ICT classifications APS5–EL2.
 */

import Parser from 'rss-parser';
import { isITJob, type RawSourceJob } from './types';

const APS_RSS_URL = 'https://www.apsjobs.gov.au/Search/SearchResultsRSS.aspx?keyword=ICT';

const parser = new Parser({
  timeout: 20000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Accept':     'application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
  },
});

interface ApsItem {
  title?:   string;
  link?:    string;
  pubDate?: string;
  content?: string;
  guid?:    string;
}

function extractCompany(title: string): { title: string; company: string } {
  // APS RSS title typically: "{Job Title} – {Agency}" or "{Job Title} - {Agency}"
  const dashIdx = title.lastIndexOf('–');
  const idx     = dashIdx > 0 ? dashIdx : title.lastIndexOf(' - ');
  if (idx > 0) {
    return {
      title:   title.slice(0, idx).trim(),
      company: title.slice(idx + 1).trim(),
    };
  }
  return { title, company: 'Australian Public Service' };
}

export async function scrapeAPSJobs(): Promise<RawSourceJob[]> {
  try {
    const feed = await parser.parseURL(APS_RSS_URL);
    const items: ApsItem[] = feed.items as ApsItem[];
    const out: RawSourceJob[] = [];
    for (const item of items) {
      const rawTitle = item.title?.trim() ?? '';
      if (!rawTitle) continue;
      const { title, company } = extractCompany(rawTitle);
      if (!isITJob(title)) continue;
      out.push({
        source:      'apsjobs',
        externalId:  item.guid ?? item.link ?? rawTitle,
        title,
        company,
        location:    'Australia (APS)',
        url:         item.link ?? APS_RSS_URL,
        created:     item.pubDate ?? new Date().toISOString(),
        description: item.content ?? '',
      });
    }
    return out;
  } catch (e) {
    console.warn(`  APS Jobs: ${(e as Error).message}`);
    return [];
  }
}
