/**
 * cleanup-junk-jobs.ts
 *
 * Deletes scraped_jobs rows that fail the IT title filter.
 * Old Jora scraper pulled non-IT roles (Receptionist, Driver, Accountant);
 * filterIT in /api/jobs hides them from UI but they still occupy the DB.
 *
 * Run: npx tsx --env-file=.env.local scripts/cleanup-junk-jobs.ts
 *      DRY_RUN=true npx tsx --env-file=.env.local scripts/cleanup-junk-jobs.ts
 */

import { createClient } from '@supabase/supabase-js';

const IT_TITLE_RE = /\b(developer|engineer|devops|architect|analyst|scientist|dba|database|software|frontend|backend|fullstack|full.?stack|qa|tester|testing|security|cloud|aws|azure|gcp|machine.?learning|data|python|java|javascript|react|node|php|ruby|golang|kotlin|mobile|android|ios|sre|platform|infrastructure|network|systems|it.?support|helpdesk|cyber|soc|scrum|agile|product.?manager|ux|ui.?ux|devSecOps|ict|technology)\b/i;
const NON_IT_RE   = /\b(finance|financial|investment|accounting|accountant|mortgage|insurance|trading|risk\s+analyst|equity|banking|treasury|actuar|chef|cook|nurse|driver|warehouse|forklift|electrician|plumber|carpenter|mechanic|retail|civil\s+engineer|structural\s+engineer|mechanical\s+engineer|chemical\s+engineer|electrical\s+engineer|mining\s+engineer|environmental\s+engineer|geotechnical|receptionist|leasing|barista|hairdresser|cleaner|labourer|drillers?\s+offsider|hr\s+business|sales\s+manager|office\s+manager|partnerships\s+manager)\b/i;

export function isJunk(title: string): boolean {
  if (NON_IT_RE.test(title)) return true;
  if (!IT_TITLE_RE.test(title)) return true;
  return false;
}

async function main() {
  const dry = process.env.DRY_RUN === 'true';
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await sb.from('scraped_jobs').select('id, title, source').limit(5000);
  if (error) { console.error(error); process.exit(1); }
  const total = data?.length ?? 0;
  const junkIds = (data ?? []).filter(r => isJunk(r.title)).map(r => r.id);

  console.log(`Total rows: ${total}`);
  console.log(`Junk rows:  ${junkIds.length}`);
  console.log(`Keeping:    ${total - junkIds.length}`);

  if (dry) {
    console.log('\n🔍 DRY RUN — no deletes. Sample junk titles:');
    (data ?? []).filter(r => isJunk(r.title)).slice(0, 10).forEach(r => console.log(`  [${r.source}] ${r.title}`));
    return;
  }

  if (!junkIds.length) {
    console.log('Nothing to delete.');
    return;
  }

  // Batch deletes (Supabase has implicit limits)
  const batchSize = 100;
  let deleted = 0;
  for (let i = 0; i < junkIds.length; i += batchSize) {
    const batch = junkIds.slice(i, i + batchSize);
    const { error: delErr } = await sb.from('scraped_jobs').delete().in('id', batch);
    if (delErr) { console.error(`Batch ${i}: ${delErr.message}`); continue; }
    deleted += batch.length;
    process.stdout.write(`\r  Deleted ${deleted}/${junkIds.length}`);
  }
  console.log(`\n✅ Deleted ${deleted} junk rows.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
