# Feature: Vercel KV Caching Layer

**Priority:** 🔴 P2 — Infrastructure
**Status:** 🔲 Not started
**Effort:** Small (1–2 days)
**Started:** —
**Shipped:** —

---

## Problem

Every expensive AI call (study guides, interview questions, cover letter templates) checks a Supabase Postgres table for a cached result before calling the AI. Postgres round-trips take 30–80ms. For a cache check that fires on every study session load — before even touching the AI — this is avoidable latency.

More critically: interview questions are currently cached **per user**. Two users studying for the same role generate identical questions from the AI, then each pays $0.035 and waits 4 seconds. There is no shared cache across users for role-based content.

---

## Goal

Add Vercel KV (Redis) as a fast-path cache in front of Supabase for all expensive AI responses. Cache checks go from 50ms → 1ms. Shared caches for role-based content (interview questions, study guides) are shared across all users — one AI call benefits everyone.

---

## Cache Architecture

```
Request arrives at API route
  ↓
Check Vercel KV  →  hit?  → return immediately (1ms)
  ↓ miss
Check Supabase   →  hit?  → write to KV, return (50ms)
  ↓ miss
Call AI model               → 3–15 seconds
  ↓
Write to Supabase (durable, long TTL)
Write to KV (fast, short TTL)
Return response
```

**KV is an acceleration layer, not a source of truth.** Supabase is always the durable store. KV can evict entries; Supabase can rebuild them.

---

## What Gets Cached

### 1. Interview Questions (per role) — shared across users

```
Key:   interview:questions:{roleId}
TTL:   24 hours
Value: JSON array of Question objects (5 questions)
```

Currently: each user generates their own questions, per-user, per session.
After: all users of `junior-data-engineer` share one question set. One AI call serves hundreds.

```typescript
// Check shared KV cache first
const cached = await kv.get(`interview:questions:${roleId}`);
if (cached) return cached;

// Generate once, cache for all
const questions = await generateQuestions(roleId);
await kv.setex(`interview:questions:${roleId}`, 86400, JSON.stringify(questions));
```

### 2. Video Study Guides (per videoId) — shared across users

```
Key:   study:guide:{videoId}
TTL:   7 days (video content doesn't change)
Value: StudyGuide JSON object
```

Currently: cached in Supabase `video_content` table (50ms check).
After: KV check (1ms) → Supabase fallback → AI fallback.

### 3. Quiz Questions (per videoId) — shared across users

```
Key:   study:quiz:{videoId}
TTL:   7 days
Value: QuizQuestion[] JSON
```

### 4. Readiness Score (per userId)

```
Key:   readiness:{userId}
TTL:   1 hour
Value: ReadinessScore object
```

Heavy computation (4 Supabase queries + aggregation). Cached per user, invalidated when user completes a topic or takes a quiz.

### 5. Analytics Summary (admin only)

```
Key:   analytics:summary:30d
TTL:   1 hour
Value: Summary object (daily trends, top pages, etc.)
```

Currently recalculated on every admin dashboard load. Now cached for 1 hour.

---

## Vercel KV Setup

Vercel KV is free up to 256MB storage and 30,000 requests/day. Setup:

```bash
# In Vercel dashboard: Storage → Create KV Store
# In .env.local:
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=xxx
```

```bash
npm install @vercel/kv
```

---

## Implementation Pattern

All cache logic lives in a single `lib/kv-cache.ts` utility:

```typescript
import { kv } from '@vercel/kv';

export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    return await kv.get<T>(key);
  } catch {
    // KV unavailable — degrade gracefully to DB fallback
    return null;
  }
}

export async function kvSet(key: string, ttlSeconds: number, value: unknown): Promise<void> {
  try {
    await kv.setex(key, ttlSeconds, value);
  } catch {
    // Non-critical — just skip the cache write
  }
}

export function invalidate(...keys: string[]): Promise<void[]> {
  return Promise.all(keys.map(k => kv.del(k).catch(() => {})));
}
```

All errors are swallowed — KV failure should never cause an API route to fail. The Supabase fallback always exists.

---

## Cache Invalidation Rules

| Event | Invalidate |
|-------|-----------|
| User completes a skill topic | `readiness:{userId}` |
| User takes a quiz | `readiness:{userId}` |
| User uploads a resume | `readiness:{userId}` |
| User completes an interview session | `readiness:{userId}` |
| Admin generates new interview questions | `interview:questions:{roleId}` |
| New Gemini video analysis stored | `study:guide:{videoId}`, `study:quiz:{videoId}` |
| Analytics dashboard refreshed | `analytics:summary:30d` |

---

## Files

| File | Change |
|------|--------|
| `lib/kv-cache.ts` | Create — shared KV get/set/invalidate utilities |
| `package.json` | Add `@vercel/kv` |
| `app/api/interview/questions/route.ts` | Modify — KV cache check first |
| `app/api/learn/analyse/route.ts` | Modify — KV cache check first |
| `app/api/learn/quiz/route.ts` | Modify — KV cache check first |
| `app/api/readiness-score/route.ts` | Modify — KV cache check first |
| `app/api/analytics/summary/route.ts` | Modify — KV cache check first |

---

## Acceptance Criteria

- [ ] `npm install @vercel/kv` and env variables documented
- [ ] Interview questions served from KV on second request (same role) — verified in logs
- [ ] Video study guide served from KV on second request — verified in logs
- [ ] KV failure degrades gracefully to Supabase (no 500 errors)
- [ ] Cache invalidation fires correctly on user actions (skill complete, quiz taken)
- [ ] `npm run build` passes
- [ ] Cost: KV free tier (256MB / 30k req/day) sufficient at current traffic
