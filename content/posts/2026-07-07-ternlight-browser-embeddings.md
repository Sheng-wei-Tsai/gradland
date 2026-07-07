---
title: "7 MB Embedding Model That Runs Entirely in Your Browser"
date: "2026-07-07"
excerpt: "Ternlight ships a full embedding model as a single npm package — no API key, no server round-trip, no vector DB subscription. Semantic search in five lines of JavaScript."
tags: ["AI", "Embeddings", "JavaScript", "Next.js", "Search"]
coverEmoji: "🔍"
auto_generated: true
source_url: "https://ternlight-demo.vercel.app/"
---

Every time I add semantic search to a project, it involves the same stack: an embedding model API call, a vector database, a server-side route to orchestrate it, and a bill that grows linearly with usage. That stack makes sense at scale. For a personal site, a docs search, or a small SaaS feature, it's overkill.

[Ternlight](https://ternlight-demo.vercel.app/) landed on HN this week with 220 points and a different answer: ship the model itself as a 7 MB npm package. WASM, runs on CPU, ~5 ms per embed. No API, no server, nothing to authenticate.

## How It Works

Ternlight uses BitLinear (ternary weights) — weights stored as -1, 0, or 1 rather than float32. That's how a useful transformer gets compressed to 7 MB without a significant quality regression for short text. The WASM runtime means the same package works in Node.js and the browser without any changes.

```bash
npm install @ternlight/base
# or the 5 MB mini variant
npm install @ternlight/mini
```

The API is tiny:

```ts
import { embed, similar } from '@ternlight/base';

// Single embedding — returns a Float32Array
const vec = await embed('australian visa subclass 485');

// Semantic search over an array — returns ranked results
const matches = await similar(
  'tech job sponsoring 482 visa',
  jobListings,
  { topK: 5 }
);
```

The `similar` function handles embedding both the query and the corpus, then returns results ranked by cosine similarity. First call initialises the WASM runtime (about 300 ms); subsequent calls hit ~5 ms.

## Adding Semantic Search to a Next.js App

For a content site with markdown posts, you can pre-embed everything at build time and ship the vectors as a JSON file. At runtime, only the query needs to be embedded — the corpus is already done.

```ts
// scripts/build-search-index.ts  (runs during next build)
import { embed } from '@ternlight/base';
import { getAllPosts } from '@/lib/posts';
import fs from 'fs/promises';

const posts = getAllPosts();

const index = await Promise.all(
  posts.map(async (post) => ({
    slug: post.slug,
    title: post.title,
    vector: Array.from(await embed(`${post.title} ${post.excerpt}`)),
  }))
);

await fs.writeFile('public/search-index.json', JSON.stringify(index));
```

Then in a client component:

```tsx
'use client';
import { embed } from '@ternlight/mini';
import { useState } from 'react';

export function SearchBox() {
  const [results, setResults] = useState([]);

  async function handleSearch(query: string) {
    const [indexRes, queryVec] = await Promise.all([
      fetch('/search-index.json').then(r => r.json()),
      embed(query),
    ]);

    // cosine similarity against pre-built index
    const scored = indexRes.map((entry) => {
      const dot = entry.vector.reduce(
        (sum: number, v: number, i: number) => sum + v * queryVec[i], 0
      );
      return { ...entry, score: dot };
    });

    setResults(scored.sort((a, b) => b.score - a.score).slice(0, 5));
  }

  return (
    <div>
      <input onChange={e => handleSearch(e.target.value)} placeholder="Search posts..." />
      {results.map(r => <div key={r.slug}>{r.title}</div>)}
    </div>
  );
}
```

No API route. No Supabase vector extension. No Algolia subscription. The search-index.json is a static asset — CDN-cached, no compute.

## The Supabase pgvector Trade-off

If you're already on Supabase, `pgvector` is worth knowing: `CREATE EXTENSION vector` gives you proper vector search with indexing, filtering by user, and queries that compose with your existing row-level security. For multi-tenant apps where you need "find similar items *this user can see*", that's the right tool.

Ternlight is the better call when:
- Your corpus is static or slow-changing (blog posts, docs, product catalogue)
- You want zero latency on the embed step — no round-trip to your server
- You're building a privacy-first feature and don't want user queries leaving the browser
- You're prototyping and don't want to spin up infra yet

For a hybrid approach: pre-embed at build time using Ternlight in a Node.js script, store the vectors in Supabase, and use pgvector for the similarity query. You get cheap offline embedding plus proper database-level filtering.

## What I'd Build With This

**1. Client-side job matching.** On a job board, embed the user's resume text in the browser, then score it against a pre-embedded list of job descriptions fetched from an API. Rank matches before the user even submits a search query. Zero server compute per interaction.

**2. Docs search without Algolia.** For any site where the content is built from markdown files, generate the search index at build time and ship it as a static asset. Full semantic search for free, works offline, no crawler needed.

**3. Related content widget.** On each blog post or product page, embed the current page's text on load, then score it against a pre-built index of all other content. "You might also like" without a recommendation microservice or third-party script.

## My Take

The 5 ms latency is the thing that makes this useful. At 50–100 ms, you'd need to be careful about when you trigger embedding. At 5 ms, you can embed on every keystroke and it feels instant.

The model quality won't beat a proper embedding API — BitLinear compression has to make tradeoffs somewhere. For exact duplicate detection or production retrieval over millions of documents, you'd want OpenAI's `text-embedding-3-small` or a dedicated model. But for "is this blog post roughly about the same topic" or "does this job match this resume", the quality is genuinely fine and the cost is zero.

Worth pulling into your next project to see where the quality ceiling actually is. My bet: it'll hold up for more use cases than you'd expect.
