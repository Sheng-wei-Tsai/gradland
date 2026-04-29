import dotenv from 'dotenv';
import { existsSync } from 'fs';
if (existsSync('.env.local')) dotenv.config({ path: '.env.local' });
else dotenv.config();

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { claudeMessage, ClaudeQuotaError } from './llm-claude';

const OUT_DIR = path.join(process.cwd(), 'content', 'diagrams');
const COUNT   = 4;

// ── ByteByteGo-inspired system design topic pool ─────────────────
// Source: ByteByteGoHq/system-design-101 (MIT) + Alex Xu's newsletter topics
const TOPIC_POOL: Array<{ title: string; topic: string; difficulty: string; prompt: string }> = [
  { title: 'How a CDN Serves a Request',               topic: 'Networking',           difficulty: 'beginner',     prompt: 'How a CDN (Content Delivery Network) serves a static asset request using edge caches' },
  { title: 'How OAuth 2.0 Works',                       topic: 'Security',             difficulty: 'intermediate', prompt: 'OAuth 2.0 authorization code flow between user, client app, auth server, and resource server' },
  { title: 'CAP Theorem',                               topic: 'Distributed Systems',  difficulty: 'intermediate', prompt: 'CAP theorem: Consistency, Availability, Partition Tolerance — trade-offs in distributed databases' },
  { title: 'How a Message Queue Works',                 topic: 'Distributed Systems',  difficulty: 'intermediate', prompt: 'Message queue (Kafka/RabbitMQ) producer-broker-consumer pattern for async decoupling' },
  { title: 'Database Replication',                      topic: 'Databases',            difficulty: 'intermediate', prompt: 'Primary-replica database replication: write to primary, async replicate to replicas, read from replicas' },
  { title: 'How an API Gateway Works',                  topic: 'APIs',                 difficulty: 'beginner',     prompt: 'API gateway pattern: single entry point, routing, auth, rate limiting, logging before backend services' },
  { title: 'Consistent Hashing',                        topic: 'Distributed Systems',  difficulty: 'advanced',     prompt: 'Consistent hashing ring for distributing keys across servers with minimal remapping on node change' },
  { title: 'How Redis Caching Works',                   topic: 'Databases',            difficulty: 'beginner',     prompt: 'Cache-aside pattern with Redis: check cache first, cache miss fetches from DB and writes to cache' },
  { title: 'JWT Authentication Flow',                   topic: 'Security',             difficulty: 'intermediate', prompt: 'JWT authentication: login issues token, client stores it, sends in header, server validates signature' },
  { title: 'How a Database Index Works',                topic: 'Databases',            difficulty: 'beginner',     prompt: 'B-tree database index: full table scan vs index lookup, how an index speeds up WHERE queries' },
  { title: 'Microservices vs Monolith',                 topic: 'System Design',        difficulty: 'intermediate', prompt: 'Monolith vs microservices architecture comparison: deployment, scaling, communication, failure isolation' },
  { title: 'How Kubernetes Schedules Pods',             topic: 'DevOps',               difficulty: 'intermediate', prompt: 'Kubernetes pod scheduling: API server, scheduler, kubelet, and how a pod goes from pending to running' },
  { title: 'Event-Driven Architecture',                 topic: 'System Design',        difficulty: 'intermediate', prompt: 'Event-driven architecture: producers emit events, event bus routes them, consumers react independently' },
  { title: 'How WebSockets Work',                       topic: 'Networking',           difficulty: 'intermediate', prompt: 'WebSocket connection lifecycle: HTTP upgrade handshake, full-duplex channel, heartbeat, close' },
  { title: 'Rate Limiting Algorithms',                  topic: 'APIs',                 difficulty: 'intermediate', prompt: 'Token bucket vs sliding window rate limiting algorithms for protecting API endpoints' },
  { title: 'How a Search Engine Indexes Pages',         topic: 'System Design',        difficulty: 'intermediate', prompt: 'Search engine pipeline: crawler, parser, inverted index, ranking, query serving' },
  { title: 'ACID Database Transactions',                topic: 'Databases',            difficulty: 'intermediate', prompt: 'ACID properties: Atomicity, Consistency, Isolation, Durability in database transactions with example' },
  { title: 'How Git Works Internally',                  topic: 'DevOps',               difficulty: 'intermediate', prompt: 'Git internals: blobs, trees, commits, branches as pointers, how a commit is stored' },
  { title: 'Circuit Breaker Pattern',                   topic: 'Distributed Systems',  difficulty: 'advanced',     prompt: 'Circuit breaker pattern: closed, open, half-open states for graceful service degradation' },
  { title: 'How a Compiler Works',                      topic: 'Backend',              difficulty: 'intermediate', prompt: 'Compiler pipeline: lexer, parser, AST, semantic analysis, code generation, optimization' },
  { title: 'HTTP/2 vs HTTP/1.1',                        topic: 'Networking',           difficulty: 'intermediate', prompt: 'HTTP/1.1 vs HTTP/2 differences: multiplexing, header compression, server push, binary framing' },
  { title: 'Saga Pattern for Distributed Transactions', topic: 'Distributed Systems',  difficulty: 'advanced',     prompt: 'Saga pattern: choreography vs orchestration for distributed transactions with compensating actions' },
  { title: 'How React Rendering Works',                 topic: 'Frontend',             difficulty: 'intermediate', prompt: 'React rendering: virtual DOM diffing, reconciliation, commit phase, how useState triggers re-render' },
  { title: 'Service Mesh with Istio',                   topic: 'DevOps',               difficulty: 'advanced',     prompt: 'Service mesh: sidecar proxy pattern, control plane, data plane, mTLS between services' },
  { title: 'How a URL Shortener Works',                 topic: 'System Design',        difficulty: 'beginner',     prompt: 'URL shortener system design: hash generation, database storage, redirect flow, analytics tracking' },
  { title: 'How a Web Crawler Works',                   topic: 'System Design',        difficulty: 'intermediate', prompt: 'Web crawler architecture: URL frontier, fetcher, parser, URL dedup, storage, politeness rules' },
  { title: 'Pub/Sub vs Message Queue',                  topic: 'Distributed Systems',  difficulty: 'intermediate', prompt: 'Pub/Sub vs message queue: topics vs queues, fan-out, delivery guarantees, consumer groups' },
  { title: 'How Docker Containers Work',                topic: 'DevOps',               difficulty: 'beginner',     prompt: 'Docker container internals: Linux namespaces, cgroups, union filesystem, image layers' },
  { title: 'gRPC vs REST',                              topic: 'APIs',                 difficulty: 'intermediate', prompt: 'gRPC vs REST comparison: protobuf vs JSON, HTTP/2 vs HTTP/1.1, streaming, code generation' },
  { title: 'How a Recommendation Engine Works',         topic: 'AI/ML',               difficulty: 'intermediate', prompt: 'Recommendation engine: collaborative filtering, item embeddings, retrieval, ranking, serving' },
];

function kebabCase(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-').slice(0, 60).replace(/-+$/, '');
}

function formatDate(d: Date) { return d.toISOString().split('T')[0]; }

function existingSlugs(): Set<string> {
  if (!existsSync(OUT_DIR)) return new Set();
  return new Set(
    fs.readdirSync(OUT_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, '').slice(11)) // strip YYYY-MM-DD-
  );
}

function pickTopics(done: Set<string>) {
  const available = TOPIC_POOL.filter(t => !done.has(kebabCase(t.title)));
  const pool      = available.length >= COUNT ? available : TOPIC_POOL;
  const picks: typeof TOPIC_POOL = [];
  const usedTopics = new Set<string>();
  for (const t of pool) {
    if (picks.length >= COUNT) break;
    if (!usedTopics.has(t.topic)) { picks.push(t); usedTopics.add(t.topic); }
  }
  for (const t of pool) {
    if (picks.length >= COUNT) break;
    if (!picks.includes(t)) picks.push(t);
  }
  return picks.slice(0, COUNT);
}

async function generateMermaid(t: typeof TOPIC_POOL[0]): Promise<string> {
  const system = `You are a technical diagram expert. Generate clean Mermaid diagram code.

Rules:
- Output ONLY valid Mermaid syntax. No markdown fences, no explanation.
- Max 8 nodes. Labels ≤5 words each.
- Use one of: flowchart TD, flowchart LR, sequenceDiagram
- Accent key node: style nodeId fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
- Labels with special chars: A["label/with-slash"]`;

  return claudeMessage({
    model: 'claude-haiku-4-5-20251001',
    system,
    prompt: `Generate a Mermaid diagram for: ${t.prompt}\n\nKeep it simple and educational (ByteByteGo style).`,
    retries: 2,
  });
}

async function generateExcerpt(t: typeof TOPIC_POOL[0]): Promise<string> {
  return claudeMessage({
    model:  'claude-haiku-4-5-20251001',
    prompt: `Write 2 plain sentences explaining "${t.title}" for a software developer learning system design. First: what it is. Second: why it matters. No markdown. Under 60 words.`,
    retries: 1,
  });
}

function validateMermaid(code: string): boolean {
  const t = code.trim();
  return t.startsWith('flowchart') || t.startsWith('sequenceDiagram') || t.startsWith('graph ');
}

async function run() {
  if (!existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const done   = existingSlugs();
  const topics = pickTopics(done);
  const today  = formatDate(new Date());
  let written  = 0;

  console.log(`Generating ${topics.length} diagrams for ${today}…`);

  for (const t of topics) {
    const slug     = kebabCase(t.title);
    const filename = `${today}-${slug}.md`;
    const filepath = path.join(OUT_DIR, filename);

    if (existsSync(filepath)) { console.log(`  skip: ${filename}`); continue; }

    try {
      console.log(`  generating: ${t.title}`);
      const raw     = await generateMermaid(t);
      const mermaid = raw.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();

      if (!validateMermaid(mermaid)) {
        console.warn(`  invalid Mermaid for "${t.title}" — skip`);
        continue;
      }

      const excerpt = await generateExcerpt(t);
      const mermaidIndented = mermaid.split('\n').map(l => '  ' + l).join('\n');

      fs.writeFileSync(filepath, `---
title: "${t.title}"
date: "${today}"
topic: "${t.topic}"
difficulty: "${t.difficulty}"
mermaid: |
${mermaidIndented}
---

${excerpt.trim()}
`, 'utf8');

      console.log(`  wrote: ${filename}`);
      written++;
    } catch (err) {
      if (err instanceof ClaudeQuotaError) throw err;
      console.error(`  error for "${t.title}":`, err);
    }
  }

  if (written === 0) { console.log('No new diagrams written.'); return; }

  execFileSync('git', ['add', 'content/diagrams/'], { stdio: 'inherit' });
  execFileSync('git', ['commit', '-m', `diagrams: ${written} new diagrams ${today}`], { stdio: 'inherit' });
  execFileSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });
  console.log(`Pushed ${written} diagrams.`);
}

run().catch(err => {
  if (err instanceof ClaudeQuotaError) {
    console.error('Claude quota exhausted:', err.message);
    process.exit(2);
  }
  console.error(err);
  process.exit(1);
});
