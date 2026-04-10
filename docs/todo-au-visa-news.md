# TODO: AU Visa & Migration News Feature

See `docs/feature-au-visa-news.md` for full spec.

---

## Phase 1 — Data Pipeline

- [x] **1.1** Create `scripts/fetch-visa-news.ts`
  - Define `RSS_SOURCES` array: Home Affairs, ABF, ACS, Study International, Migration Alliance, Universities Australia
  - Fetch + parse each feed with `rss-parser` (already installed for ai-news)
  - Filter items published in last 24h
  - Slug: `{date}-{source-id}-{kebabCase(title)}`
  - Dedup: check if `content/visa-news/${slug}.md` already exists
  - Limit to max 4 items per run

- [x] **1.2** Add Claude enrichment in `fetch-visa-news.ts`
  - System prompt: plain-English immigration explainer, not a lawyer
  - Required output: What changed / What this means for you / Action items checklist
  - Auto-classify `visa_types` (482, 189, 190, 485, Student, etc.) from title + description
  - Auto-classify `audience` (skilled-workers, students, pr-applicants, family) from content
  - Always include MARA disclaimer where legal ambiguity exists

- [x] **1.3** Create `content/visa-news/` directory with `.gitkeep`

- [x] **1.4** Write markdown files using frontmatter schema from spec

- [x] **1.5** Auto-commit new files (same pattern as other scripts)

- [x] **1.6** Test locally:
  ```bash
  ANTHROPIC_API_KEY=... npx tsx scripts/fetch-visa-news.ts
  ```

---

## Phase 2 — Data Layer

- [x] **2.1** Update `lib/posts.ts`
  - Add `'visa-news'` to `Post['source']` union type
  - Add `visaNewsDir` constant: `content/visa-news`
  - Add `getAllVisaNews(): Post[]`
  - Add `getVisaNewsBySlug(slug): Post | null`

- [x] **2.2** Update `parseTopics()` for `visa-news` source
  - Extract action item lines (`- [ ] ...`) from "Action items" section
  - Return up to 3 items

- [x] **2.3** Add `visa_types` and `audience` to Post frontmatter parsing (optional enhancement)
  - Read `data.visa_types` and `data.audience` arrays from frontmatter
  - Store as `Post['visaTypes']?: string[]` and `Post['audience']?: string[]`

---

## Phase 3 — Routing

- [x] **3.1** Create `app/visa-news/[slug]/page.tsx`
  - Uses `getAllVisaNews()` + `getVisaNewsBySlug()`
  - MARA disclaimer banner at top: "This is general information only — not legal advice. Consult a MARA-registered migration agent."
  - "Read original" link to `source_url`
  - Visa type chips (🟡 482, 🟢 189, 🔵 Student, etc.) below title
  - MDX content render (same as blog posts)

- [x] **3.2** Create `app/visa-news/layout.tsx` if needed

---

## Phase 4 — AU Insights UI

- [x] **4.1** Add `visa-news` to `SECTIONS` in `app/au-insights/page.tsx`

- [x] **4.2** Add dynamic import in `app/au-insights/page.tsx`

- [x] **4.3** Create `app/au-insights/VisaNews.tsx`
  - Fetches visa news via API route
  - Renders a list of news cards with: date, source badge, title, visa type chips, excerpt, link
  - Source badge colours: Home Affairs (dark blue), ACS (purple), Study International (teal), etc.
  - Empty state: "No visa updates today — check back tomorrow"

- [x] **4.4** Add `{activeTab === 'visa-news' && <VisaNews />}` render in AU Insights page

---

## Phase 5 — Header / Nav

- [x] **5.1** Add to `AU_INSIGHTS_ITEMS` in `Header.tsx`:
  ```ts
  { href: '/au-insights?tab=visa-news', label: 'Visa News', desc: 'Daily immigration & student visa updates', emoji: '📰' }
  ```

- [x] **5.2** Add to AU Insights mega-menu under **Visa & Career** group

- [x] **5.3** Update `AU_COL_RIGHT` (used for mobile drawer) to include Visa News

---

## Phase 6 — Automation

- [x] **6.1** Add `visa-news` job to `.github/workflows/daily-posts.yml`

- [x] **6.2** Verify `ANTHROPIC_API_KEY` secret is present (should already be set)

- [x] **6.3** Manual trigger test via `workflow_dispatch`

---

## Phase 7 — Quality & Polish

- [x] **7.1** Seed `content/visa-news/` with ~8 backfilled articles (last 7 days) by running script with `--days=7` flag

- [x] **7.2** Add `Breadcrumb.tsx` mapping: `'visa-news'` → `'Visa News'`

- [x] **7.3** `npm run check` — build clean before pushing

---

## Execution Order

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6   (script works locally)
2.1 → 2.2 → 2.3                        (types compile)
3.1 → 3.2                              (routes render)
4.1 → 4.2 → 4.3 → 4.4                 (shows in AU Insights)
5.1 → 5.2 → 5.3                        (nav wired up)
6.1 → 6.2 → 6.3                        (runs daily)
7.1 → 7.2 → 7.3                        (production ready)
```
