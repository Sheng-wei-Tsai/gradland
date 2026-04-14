---
title: "LLM Wiki: Build a Knowledge Graph That Grows Itself"
date: "2026-04-14"
excerpt: "Traditional RAG re-derives answers from scratch every query. LLM Wiki's incremental approach compiles knowledge once into a persistent, interlinked graph — here's how to implement the same architecture with Next.js, TypeScript, and Supabase."
tags: ["LLM", "TypeScript", "Knowledge Graph", "RAG", "Next.js"]
coverEmoji: "🧠"
auto_generated: true
source_url: "https://github.com/nashsu/llm_wiki"
---

RAG is the default answer to 'how do I make an LLM talk to my documents', but it has a fundamental design flaw: it's stateless. Every query cold-starts from raw chunks, re-derives context, and throws it away. [LLM Wiki](https://github.com/nashsu/llm_wiki) — 1,200+ stars in a week — implements Andrej Karpathy's wiki-building pattern as a real desktop app, and the architecture it demonstrates is worth stealing for your own projects right now.

## What's Actually Different Here

The core idea: instead of vectorising raw documents and retrieving chunks at query time, you run the LLM *once per document* to generate structured wiki pages, then maintain those pages as a persistent, interlinked knowledge graph. Subsequent queries hit the compiled knowledge, not the raw source.

This matters for a few reasons:

- **Compounding value** — every ingested document enriches the existing graph rather than sitting as an isolated chunk
- **Explicit relationships** — the graph stores typed links between concepts (direct references, source overlap, Adamic-Adar similarity, type affinity) rather than inferring proximity purely from embeddings
- **Gap detection** — you can actually query the structure to find what you *don't* know

The two-step ingest is what makes this work. First pass: LLM analyses the document and extracts entities, concepts, and relationships. Second pass: LLM generates or updates wiki pages with citations back to the source. You never re-process a document unless it changes.

## Implementing the Core Pattern with TypeScript and Supabase

Here's a minimal version of the ingest pipeline. The key is treating wiki pages as first-class database rows with a graph of edges between them.

```sql
-- Supabase schema
create table wiki_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  content text not null,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table wiki_edges (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references wiki_pages(id),
  target_id uuid references wiki_pages(id),
  edge_type text check (edge_type in ('direct', 'source_overlap', 'type_affinity')),
  weight float default 1.0
);

create table source_documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  content text not null,
  ingested_at timestamptz
);
```

```typescript
// lib/ingest.ts
import { openai } from './openai'
import { supabase } from './supabase'

interface ExtractedConcept {
  title: string
  summary: string
  relatedConcepts: string[]
}

async function analyseDocument(content: string): Promise<ExtractedConcept[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Extract key concepts from this document. Return JSON array of objects with:
- title: concept name
- summary: 2-3 sentence explanation in context of this document
- relatedConcepts: array of other concept titles this links to`
      },
      { role: 'user', content }
    ],
    response_format: { type: 'json_object' }
  })

  const parsed = JSON.parse(response.choices[0].message.content!)
  return parsed.concepts as ExtractedConcept[]
}

async function upsertWikiPage(concept: ExtractedConcept, sourceId: string) {
  // Check if page exists
  const { data: existing } = await supabase
    .from('wiki_pages')
    .select('id, content')
    .eq('title', concept.title)
    .single()

  if (existing) {
    // Merge rather than overwrite — append new context
    const mergedContent = await mergePageContent(existing.content, concept.summary)
    await supabase
      .from('wiki_pages')
      .update({ content: mergedContent, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    return existing.id
  }

  const { data } = await supabase
    .from('wiki_pages')
    .insert({ title: concept.title, content: concept.summary })
    .select('id')
    .single()

  return data!.id
}

export async function ingestDocument(filename: string, content: string) {
  // Step 1: analyse
  const concepts = await analyseDocument(content)

  // Step 2: upsert pages and build edges
  const pageIds: Record<string, string> = {}

  for (const concept of concepts) {
    pageIds[concept.title] = await upsertWikiPage(concept, filename)
  }

  // Create edges between related concepts
  for (const concept of concepts) {
    for (const related of concept.relatedConcepts) {
      if (pageIds[related]) {
        await supabase.from('wiki_edges').upsert({
          source_id: pageIds[concept.title],
          target_id: pageIds[related],
          edge_type: 'direct',
          weight: 1.0
        }, { onConflict: 'source_id,target_id' })
      }
    }
  }
}
```

The `mergePageContent` function is where you earn your money — it calls the LLM again to intelligently combine existing page content with new information from the fresh source, preserving citations.

## Querying the Graph Instead of Raw Chunks

Once you have the graph, queries become graph traversals rather than embedding searches. For a given query, you find the most relevant wiki pages (via vector similarity on `embedding`), then walk the edges to pull in related context:

```typescript
async function queryKnowledgeGraph(query: string, depth = 2) {
  const queryEmbedding = await embed(query)

  // Find seed pages via vector similarity
  const { data: seeds } = await supabase.rpc('match_wiki_pages', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 3
  })

  const visited = new Set<string>()
  const context: string[] = []

  // BFS over the graph from seed pages
  const queue = seeds.map((s: any) => ({ id: s.id, currentDepth: 0 }))

  while (queue.length) {
    const { id, currentDepth } = queue.shift()!
    if (visited.has(id) || currentDepth > depth) continue
    visited.add(id)

    const { data: page } = await supabase
      .from('wiki_pages')
      .select('title, content')
      .eq('id', id)
      .single()

    context.push(`## ${page.title}\n${page.content}`)

    if (currentDepth < depth) {
      const { data: edges } = await supabase
        .from('wiki_edges')
        .select('target_id')
        .eq('source_id', id)

      edges?.forEach((e: any) => queue.push({ id: e.target_id, currentDepth: currentDepth + 1 }))
    }
  }

  return context.join('\n\n')
}
```

The context you pass to the LLM is now a coherent subgraph of compiled knowledge rather than a bag of raw text chunks. Answers are more consistent across queries because they're grounded in the same compiled pages.

## What I'd Build With This

**Engineering decision log** — ingest all your ADRs, Notion docs, and Confluence pages. Query it when onboarding someone new or making a decision that might have historical precedent. The graph surfaces connections between decisions that flat search would miss.

**Personal research assistant** — feed it papers, blog posts, and bookmarks on a topic you're learning. After 50 documents the wiki starts showing you relationships between concepts you hadn't spotted. The gap detection (concepts referenced but not yet documented) gives you a reading list.

**Codebase knowledge base** — run it over your repo's markdown docs, changelogs, and inline comments. Instead of grepping or asking an LLM to re-read source files every time, you're querying a compiled understanding of how the system fits together.

The stateless RAG pattern made sense when LLMs were expensive and storage was the constraint. That trade-off has flipped. Compiling knowledge once and maintaining a graph is the right default for anything you'll query repeatedly — and now there's a solid reference implementation to learn from.
