import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { commitAndPublish } from './lib/git-publish';
import { fetchAll } from './fetch-digest';
import { filterItems } from './filter';
import { summarizeAll } from './summarize';
import { writeDigestPost } from './generate-post';

async function main() {
  console.log('🚀 AI Research Digest pipeline\n');

  // 0. Skip if today's digest already exists (prevents duplicate on double-run)
  const todayStr = new Date().toISOString().split('T')[0];
  const digestPath = path.join(process.cwd(), 'content', 'digests', `${todayStr}.md`);
  if (fs.existsSync(digestPath)) {
    console.log(`✅ Digest for ${todayStr} already exists — skipping.`);
    process.exit(0);
  }

  // 1. Fetch from curated high-quality sources
  const items = await fetchAll();
  if (items.length === 0) {
    console.error('No items fetched. Check your network / source URLs.');
    process.exit(1);
  }

  // 2. Filter — rule-based scoring + Claude quality gate
  const quality = await filterItems(items);
  if (quality.length === 0) {
    console.error('No items passed the quality gate. Try again later.');
    process.exit(1);
  }

  // 3. Summarize — cap at 6 so it stays readable
  const topItems = quality.slice(0, 6);
  const entries  = await summarizeAll(topItems);

  // 4. Write digest post (.md so Obsidian can open it)
  const filePath = writeDigestPost(entries);

  // 5. Commit + publish (direct to main, or via auto-merge PR under branch protection)
  const dateStr = new Date().toISOString().split('T')[0];
  console.log('\n\u{1F4E4} Publishing to GitHub...');
  await commitAndPublish({ add: [filePath], message: `digest: AI Research Digest ${dateStr}` });

  console.log('\n✅ Digest pipeline complete!');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
  });
