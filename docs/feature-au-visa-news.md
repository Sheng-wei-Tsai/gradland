# Feature: AU Visa & Migration News

**Goal:** Automatically aggregate daily news about Australian immigration policy, visa rule changes, and international student regulations — enriched with a plain-English "what this means for you" summary — and surface it as a live section inside AU Insights.

---

## Why this belongs in AU Insights, not the Blog

AU Insights is already where people go to research visa pathways (Visa Guide, Visa Sponsors). Those sections are static reference material. This feature turns AU Insights into a **living resource** — when Department of Home Affairs changes a condition, or when international student cap policy shifts, users see it the same day rather than finding out months later via Reddit.

The blog is for ideas and developer tools. AU Insights is for AU-specific, actionable career intelligence. Visa news is firmly in the second category.

Target audience: international students, 482/TSS visa holders, PR applicants, graduates on 485 visas, and anyone navigating skilled migration to Australia.

---

## Data Sources

| Source | RSS / URL | What it covers |
|---|---|---|
| Department of Home Affairs | `https://immi.homeaffairs.gov.au/news-media/rss` | Policy changes, visa condition updates, processing time notices |
| Australian Border Force | `https://www.abf.gov.au/news-media/rss` | Border/compliance updates |
| ACS (Australian Computer Society) | `https://www.acs.org.au/news/rss` | Skills assessment rule changes (critical for 189/190 visas) |
| Study International | `https://studyinternational.com/feed/` | International student visa news, cap changes, English requirements |
| Migration Alliance | `https://www.migrationalliance.com.au/feed/` | RMA practitioner commentary — plain-English analysis of policy changes |
| Universities Australia | `https://www.universitiesaustralia.edu.au/news/rss/` | Student visa policy, ESOS Act updates |

Fallback: scrape `immi.homeaffairs.gov.au/news-media/` if RSS is unavailable (Home Affairs has historically been inconsistent with RSS).

---

## Architecture

### Content Storage

```
content/visa-news/
  2026-04-09-home-affairs-482-processing-times.md
  2026-04-08-acs-skills-assessment-it-changes.md
  2026-04-07-student-visa-cap-2026-update.md
  ...
```

### Frontmatter Schema

```yaml
---
title: "Home Affairs Updates 482 Occupation List — April 2026"
date: "2026-04-09"
source: "home-affairs"          # home-affairs | acs | study-international | migration-alliance | universities-au | abf
source_url: "https://immi.homeaffairs.gov.au/..."
excerpt: "One-line pulled from RSS item description"
visa_types: ["482", "189", "190"]   # which visa subclasses this affects
audience: ["skilled-workers", "students", "pr-applicants"]
tags: ["Visa", "482", "Skilled Migration", "AU"]
coverEmoji: "🛂"
auto_generated: true
---

*Source: [Department of Home Affairs](https://immi.homeaffairs.gov.au/...) — {date}*

## What changed

{RSS description or first paragraph}

## What this means for you

{Claude-generated 2–3 paragraph plain-English explanation targeted at the affected audience}

## Action items

- [ ] Action 1 (e.g. "Check if your occupation is still on the MLTSSL")
- [ ] Action 2 (e.g. "Contact your migration agent if you have a pending lodgement")
- [ ] Action 3

## Who is affected

**Visa types:** {visa_types joined}
**Affects:** {audience joined}
```

---

## Script: `scripts/fetch-visa-news.ts`

```
Flow:
1. Parse RSS feeds from all sources
2. Filter items published in last 24h
3. Deduplicate: skip any slug already in content/visa-news/
4. For each new item:
   a. Classify: extract affected visa types + audience from title/description
   b. Call Claude API to generate "What this means for you" + action items
   c. Write markdown file
5. Stage + commit if any new files
```

Prompt design — system message includes:
- Persona: "Plain-English immigration explainer for skilled migrants and international students in Australia"
- Audience context: people who are NOT lawyers, on tight timelines, anxious about their status
- Tone: direct, empathetic, never alarmist
- Required sections: What changed / What this means for you / Action items
- Never give legal advice — always include "consult a registered migration agent (MARA)" where appropriate

Max 4 items per run. Immigration news is lower volume than tech news but higher stakes per item.

---

## AU Insights Integration

### New SECTION entry in `app/au-insights/page.tsx`

```ts
{
  id: 'visa-news',
  emoji: '📰',
  label: 'Visa News',
  tag: 'Live',
  desc: 'Daily immigration updates — 482, student visa, PR pathways',
  bg: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
  border: '#0ea5e9',
  accent: '#38bdf8',
}
```

This slots naturally next to the existing "Visa Sponsors" and "Visa Guide" sections in the pill row.

### New dynamic component: `app/au-insights/VisaNews.tsx`

Renders a list of visa news cards:
- Date + source badge (Home Affairs, ACS, etc.)
- Title
- Affected visa types as chips (🟡 482, 🟢 189, 🔵 Student)
- Excerpt / first paragraph
- "Read full analysis →" link to `/visa-news/[slug]`

No static content — purely driven by `content/visa-news/*.md` files.

---

## Routing

| Route | Content |
|---|---|
| `/au-insights?tab=visa-news` | VisaNews component inside AU Insights |
| `/visa-news/[slug]` | Individual post page — same layout as `/blog/[slug]` |

Individual pages include:
- Prominent "This is not legal advice — consult a MARA-registered agent" disclaimer banner
- Source link back to original Home Affairs / ACS page
- "Affected visa types" badge row at the top
- Share button (copy link)

---

## lib/posts.ts Changes

Add fifth source:
```ts
source: 'blog' | 'digest' | 'githot' | 'ai-news' | 'visa-news'
```

Add:
- `getAllVisaNews(): Post[]`
- `getVisaNewsBySlug(slug): Post | null`

`parseTopics()` for `visa-news`: extract action items checklist (lines starting with `- [ ]`).

---

## PostCard Design for Visa News

| Property | Value |
|---|---|
| Accent stripe | Sky blue gradient `#0ea5e9 → #38bdf8` |
| Source badge | "Visa News" in sky blue |
| Topic preview | Shows 2–3 action items from the checklist |
| Tags | Visa subclass chips replace regular tags |

---

## GitHub Action

New `visa-news` job in `.github/workflows/daily-posts.yml`:

```yaml
visa-news:
  runs-on: ubuntu-latest
  timeout-minutes: 20
  steps:
    - uses: actions/checkout@v4
      with: { token: '${{ secrets.GITHUB_TOKEN }}', fetch-depth: 0 }
    - uses: actions/setup-node@v4
      with: { node-version: '20', cache: 'npm' }
    - run: npm ci
    - run: git config user.name "henry-blog-bot" && git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
    - run: npx tsx scripts/fetch-visa-news.ts
      env:
        ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## Header / Nav Changes

Add to `AU_INSIGHTS_ITEMS` in `Header.tsx`:
```ts
{ href: '/au-insights?tab=visa-news', label: 'Visa News', desc: 'Daily immigration & student visa updates', emoji: '📰' }
```

Add to AU Insights mega-menu under **Visa & Career** group.

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Home Affairs RSS down | Fallback to HTML scrape of `/news-media/` page |
| Article is legal jargon only | Claude rewrites in plain English; adds MARA disclaimer |
| Article affects non-IT visas | Still publish — student visa and PR news is relevant to the audience |
| Duplicate from two sources | Slug dedup by URL hash, not just title |
| Very technical legislative reference | Claude includes a "TL;DR" line at the top |

---

## Content Quality Bar

Every "What this means for you" must:
1. Name the specific audience affected (e.g., "If you're on a 482 Primary visa...")
2. State the practical consequence in one sentence
3. Give at least one concrete action item
4. Include MARA disclaimer where there's any legal ambiguity

Tone model: "a knowledgeable friend who works in immigration, not a lawyer giving you a bill".
