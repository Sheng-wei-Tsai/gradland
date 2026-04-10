# Feature: AI Company News Feed

**Goal:** Automatically aggregate and publish daily news from Anthropic, OpenAI, and Google DeepMind — parsed from their official RSS feeds, enriched with an AI-written "Why it matters" analysis, stored as markdown files, and surfaced in the blog hub as a new "AI News" tab.

> **Scope note:** This feed is for developers worldwide. "Why it matters" analysis is globally relevant — no AU-specific angle forced. For Australian immigration/visa news, see `feature-au-visa-news.md`.

---

## Why this, and why now

The digest covers academic papers. Githot covers open-source repos. Neither covers **product announcements from the three companies shaping AI tooling**: Anthropic (Claude), OpenAI (GPT/Codex), and Google DeepMind (Gemini/Vertex). These releases directly affect which APIs you call, which CLI tools you use, and what skills are worth learning. Surfacing them daily — with a concise "why it matters to you as a developer" paragraph — makes the blog genuinely useful rather than just another aggregator.

---

## Data Sources

| Company | RSS / Feed URL | Notes |
|---|---|---|
| Anthropic | `https://www.anthropic.com/rss.xml` | Model releases, safety research, policy |
| OpenAI | `https://openai.com/news/rss.xml` | Product releases, API changes |
| Google DeepMind | `https://deepmind.google/blog/rss/` | Research & product (Gemini, AlphaFold) |
| Google AI Blog | `https://blog.google/technology/ai/rss/` | Practical AI product announcements |

Fallback: if RSS unavailable, scrape the `/news` page with `cheerio` and extract `<article>` elements.

---

## Architecture

### Content Storage

```
content/ai-news/
  2026-04-09-anthropic-claude-3-7-sonnet.md
  2026-04-09-openai-gpt-4o-mini-fine-tuning.md
  2026-04-08-deepmind-gemini-2-flash.md
  ...
```

### Frontmatter Schema

```yaml
---
title: "Claude 3.7 Sonnet — What's New"
date: "2026-04-09"
company: "anthropic"          # anthropic | openai | google
source_url: "https://www.anthropic.com/news/..."
excerpt: "One-line description pulled from RSS item description"
tags: ["Anthropic", "Claude", "AI Models"]
coverEmoji: "🤖"
auto_generated: true
---

*Source: [anthropic.com](https://www.anthropic.com/news/...)*

## What was announced

{RSS description / first paragraph of article}

## Why it matters for AU IT workers

{Claude-generated 2–3 paragraph analysis: practical impact on tooling, hiring, skills}

## Key takeaways

- Bullet 1
- Bullet 2
- Bullet 3
```

### Script: `scripts/fetch-ai-news.ts`

```
Flow:
1. Parse RSS feeds for each company (rss-parser)
2. Filter items published in the last 24h (or last N days on first run)
3. Deduplicate: skip any slug already in content/ai-news/
4. For each new item:
   a. Call Claude API to generate "Why it matters" + key takeaways
   b. Write markdown file to content/ai-news/
5. Stage + commit if any new files written
```

Key decisions:
- **Slug**: `{date}-{company}-{kebab-case-title}` — deterministic, dedup-safe
- **No full content mirroring**: only store RSS excerpt + AI analysis. Link out for full read.
- **Rate limiting**: process max 5 items per run to keep API cost low
- **Idempotent**: re-running the script never duplicates files

### GitHub Action: new `ai-news` job in `daily-posts.yml`

Runs daily at the same time as `digest` and `githot` (9am AEST / 23:00 UTC).

Required secret: `ANTHROPIC_API_KEY` (already present).

---

## lib/posts.ts Changes

Add fourth source type:

```ts
source: 'blog' | 'digest' | 'githot' | 'ai-news'
```

Add functions:
- `getAllAINews(): Post[]`
- `getAINewsBySlug(slug: string): Post | null`

Add to `parseTopics()`:
- `ai-news` source: extract bullet points from "Key takeaways" section

---

## Routing

| Route | Content |
|---|---|
| `/blog?category=ai-news` | Filtered BlogHub tab |
| `/ai-news/[slug]` | Individual post page (same as /blog/[slug] layout) |

PostCard for `ai-news` opens at `/ai-news/[slug]` (local page). The local page shows the AI analysis + a prominent "Read original on anthropic.com →" CTA.

---

## UI / PostCard Design

### Company badge colours

| Company | Colour | Badge text |
|---|---|---|
| Anthropic | `#CC785C` (terracotta orange) | `Anthropic` |
| OpenAI | `#10a37f` (OpenAI green) | `OpenAI` |
| Google / DeepMind | `#4285f4` (Google blue) | `Google AI` |

### Accent stripe (left border on PostCard)

Each company gets its own gradient — visually distinct from blog (red/gold), digest (indigo), and githot (orange).

### Topic preview

`parseTopics()` for `ai-news` extracts the 3 key takeaway bullets — the card shows what the announcement means in concrete terms, not just the announcement title.

---

## BlogHub Changes

New tab: `{ id: 'ai-news', label: 'AI News', emoji: '📡', desc: 'Daily updates from Anthropic, OpenAI & Google' }`

Tab order: All · Blog · Research · Githot · **AI News**

---

## Header Dropdown

Add to `contentLinks`:

```ts
{ href: '/blog?category=ai-news', label: 'AI News', desc: 'Anthropic · OpenAI · Google daily', emoji: '📡' }
```

---

## Dependencies to Add

```bash
npm install rss-parser
```

`rss-parser` is small (no native deps), works with `tsx`, handles Atom + RSS 2.0.

---

## Edge Cases & Guardrails

| Scenario | Handling |
|---|---|
| RSS feed down | Catch + log; skip that company for the day; don't fail the whole run |
| Article already exists | Slug dedup check before writing |
| Article has no description | Use title as excerpt; still generate AI analysis from title |
| Claude API failure | Write file without AI section; add `ai_enriched: false` to frontmatter |
| Non-English article | Claude translates + analyses in English |
| Very long RSS description | Truncate to 800 chars before sending to Claude |

---

## Content Quality Bar

The AI analysis paragraph must answer two questions per article:
1. **"So what?"** — What does this change for a developer using these tools today?
2. **"What to do?"** — One concrete, actionable next step (test it, read the changelog, update a dependency, etc.)

The prompt template enforces this. Output is rejected (and retried once) if it doesn't address both. No geographic angle is forced — this is global developer news.
