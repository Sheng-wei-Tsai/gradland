# TODO: AI News Feature

Tracks every task needed to ship the AI news feed end-to-end.
See `docs/feature-ai-news.md` for full spec.

---

## Phase 1 — Data Pipeline

- [x] **1.1** Install `rss-parser`:
  ```bash
  npm install rss-parser
  npm install --save-dev @types/rss-parser
  ```

- [x] **1.2** Create `scripts/fetch-ai-news.ts`
  - Define `RSS_FEEDS` array: Anthropic, OpenAI, Google DeepMind, Google AI Blog
  - Fetch + parse each feed with `rss-parser`
  - Filter items published in last 24h (use `item.isoDate`)
  - Slugify: `${date}-${company}-${kebabCase(title)}`
  - Dedup: check if `content/ai-news/${slug}.md` already exists
  - Limit to max 5 new items per run (cost guard)

- [x] **1.3** Add Claude enrichment in `fetch-ai-news.ts`
  - Build prompt: title + RSS excerpt → "Why it matters" + 3 key takeaways
  - Include AU-angle requirement in system prompt
  - Retry once on failure; if still failing, write file without AI section + `ai_enriched: false`

- [x] **1.4** Write markdown files to `content/ai-news/`
  - Create `content/ai-news/` directory (add `.gitkeep`)
  - Use frontmatter schema from spec: title, date, company, source_url, excerpt, tags, coverEmoji, auto_generated

- [x] **1.5** Auto-commit new files
  - Same pattern as `run-githot.ts`: `git add content/ai-news/ && git commit && git push`
  - Exit 0 with "no new articles" if nothing to commit

- [x] **1.6** Test script locally:
  ```bash
  ANTHROPIC_API_KEY=... npx tsx scripts/fetch-ai-news.ts
  ```

---

## Phase 2 — Data Layer

- [x] **2.1** Update `lib/posts.ts`
  - Add `'ai-news'` to `Post['source']` union type
  - Add `aiNewsDir` path constant: `content/ai-news`
  - Add `getAllAINews(): Post[]` using `readDir(aiNewsDir, 'ai-news', '📡')`
  - Add `getAINewsBySlug(slug): Post | null` using `getBySlug`

- [x] **2.2** Update `parseTopics()` in `lib/posts.ts`
  - `ai-news` source: extract lines starting with `- ` from the "Key takeaways" section
  - Return up to 3 bullet strings

- [x] **2.3** Add company-aware fields to Post (optional enhancement)
  - Read `company` from frontmatter in `readDir` / `getBySlug`
  - Store as `Post['company']?: 'anthropic' | 'openai' | 'google'`

---

## Phase 3 — Routing

- [x] **3.1** Create `/app/ai-news/[slug]/page.tsx`
  - Mirror structure of `/app/blog/[slug]/page.tsx`
  - Uses `getAllAINews()` + `getAINewsBySlug()`
  - Add prominent "Read original on {company}.com →" CTA button above article body
  - Company-branded header accent colour

- [x] **3.2** Create `/app/ai-news/layout.tsx` (if needed for breadcrumb / metadata)

---

## Phase 4 — UI

- [x] **4.1** Update `components/PostCard.tsx`
  - Add `'ai-news'` to `SOURCE_STRIPE` — use company-specific gradient if `post.company` available; fallback to `#4285f4 → #34a853`
  - Add `ai-news` source badge: "AI News" (blue), or company-specific if `post.company` set
  - Topics list: render key takeaway bullets (same `<ul>` pattern as digest/githot)

- [x] **4.2** Update `components/BlogHub.tsx`
  - Accept `ainews: Post[]` prop
  - Add "AI News" tab: `{ id: 'ai-news', label: 'AI News', emoji: '📡', desc: 'Daily from Anthropic, OpenAI & Google' }`
  - Wire `activePosts` for `tab === 'ai-news'`

- [x] **4.3** Update `app/blog/page.tsx`
  - Import `getAllAINews`
  - Pass `ainews={ainews}` to `<BlogHub>`

- [x] **4.4** Update `components/BlogList.tsx`
  - Add `ai-news` → `basePath: '/ai-news'` in the `PostCard` basePath switch

- [x] **4.5** Update `components/Header.tsx`
  - Add to `contentLinks`:
    ```ts
    { href: '/blog?category=ai-news', label: 'AI News', desc: 'Anthropic · OpenAI · Google daily', emoji: '📡' }
    ```

---

## Phase 5 — Automation

- [x] **5.1** Add `ai-news` job to `.github/workflows/daily-posts.yml`
  ```yaml
  ai-news:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with: { token: '${{ secrets.GITHUB_TOKEN }}', fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: git config user.name "henry-blog-bot" && git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
      - run: npx tsx scripts/fetch-ai-news.ts
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  ```

- [x] **5.2** Verify `ANTHROPIC_API_KEY` secret exists in repo settings (already used by other jobs — should be present)

- [x] **5.3** Manual trigger test: run the workflow via "workflow_dispatch" before relying on cron

---

## Phase 6 — Quality & Polish

- [x] **6.1** Seed `content/ai-news/` with ~10 backfilled articles (last 7 days) by running script with `--days=7` flag

- [x] **6.2** Add `Breadcrumb.tsx` entry for `ai-news` → label "AI News"

- [x] **6.3** Add `/ai-news` link to RSS feed (`app/feed.xml/route.ts`) so browsers auto-discover it

- [x] **6.4** Add `ai-news` tag to `getAllTags()` exclusion list (avoid cluttering the blog tag cloud with every company name)

- [x] **6.5** `npm run check` — build passes, no TS errors before pushing

---

## Rough Execution Order

```
1.2 → 1.3 → 1.4 → 1.5 → 1.6   (script works locally)
2.1 → 2.2 → 2.3                 (types compile)
3.1 → 3.2                       (pages render)
4.1 → 4.2 → 4.3 → 4.4 → 4.5   (UI visible)
5.1 → 5.2 → 5.3                 (automation running)
6.1 → 6.2 → 6.3 → 6.4 → 6.5   (production ready)
```
