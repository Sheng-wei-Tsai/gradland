# Coding Standards — Henry Blog

Standards derived from how this project is actually built. Follow these exactly.

---

## TypeScript

- Strict mode enabled — no `any`; use `unknown` and narrow properly
- Prefer `type` over `interface` for data shapes; use `interface` when extending
- Co-locate types with the file that uses them (no separate `types/` folder)
- Use explicit types on function parameters; let TypeScript infer return types where obvious

```typescript
// Correct
type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

// Wrong
interface QuestionDifficulty {  // ❌ don't use interface for unions
  ...
}
const val: any = ...;           // ❌ never use any
```

---

## React / Next.js

- **Server components by default** — no `'use client'` unless you need interactivity, hooks, or browser APIs
- **Client components** — always put `'use client'` as the very first line
- **Functional components only** — no class components
- **Custom hooks** — extract reusable stateful logic into `hooks/` or inline with the component
- **API routes** — use for all external API calls (OpenAI, Adzuna, Supabase server-side auth); do NOT use Server Actions
- **Metadata** — add `generateMetadata` to all route pages for SEO

```typescript
// Server component (default — no directive needed)
export default async function Page() {
  const data = await fetchSomething();
  return <div>...</div>;
}

// Client component
'use client';
import { useState } from 'react';
export default function Widget() { ... }
```

---

## File & Folder Structure

```
app/
  page.tsx              Route pages (server components by default)
  [route]/
    page.tsx            Route
    ComponentName.tsx   Co-located client components for this route

components/             Shared components used across multiple routes
lib/                    Data definitions, helpers, API clients
scripts/                Node.js pipeline scripts (not Next.js)
supabase/               SQL migration files
context/                AI engineering documentation (not code)
```

**Naming:**
- Components: `PascalCase.tsx` (e.g. `InterviewSession.tsx`)
- Lib files: `kebab-case.ts` (e.g. `interview-roles.ts`)
- API routes: always `route.ts` inside a folder (Next.js App Router convention)

---

## Styling — CSS Custom Properties (NOT Tailwind classes)

This project uses CSS custom properties defined in `app/globals.css`. Always use inline styles with CSS vars. Never use Tailwind utility classes.

```typescript
// ✅ Correct — inline styles with CSS vars
<div style={{
  background: 'var(--warm-white)',
  color: 'var(--brown-dark)',
  padding: '1.5rem',
  borderRadius: '12px',
}}>

// ❌ Wrong — Tailwind classes
<div className="bg-white text-gray-900 p-6 rounded-xl">
```

**Key CSS variables:**

| Variable | Use |
|----------|-----|
| `--brown-dark` | Primary text, headings |
| `--text-secondary` | Secondary text |
| `--text-muted` | Captions, labels |
| `--terracotta` | Primary accent, active states, buttons |
| `--amber` | Secondary accent |
| `--sage` | Positive/success states |
| `--warm-white` | Card backgrounds |
| `--parchment` | Section backgrounds |
| `--cream` | Page background |

**Note:** Tailwind is installed as a build tool only. The `@tailwind base/components/utilities` imports in `globals.css` provide CSS resets — we don't use Tailwind's utility classes in JSX.

---

## Database — Supabase

**No Prisma.** Use `@supabase/supabase-js` directly.

```typescript
// Client-side (browser) — import singleton from lib/supabase.ts
import { supabase } from '@/lib/supabase';
const { data } = await supabase.from('table').select('col').eq('user_id', user.id);
await supabase.from('table').upsert({ user_id: user.id, ...payload });
await supabase.from('table').delete().eq('id', id);

// Server-side API route — create a request-scoped client
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
const cookieStore = await cookies();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
);
```

**Auth in server API routes:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
```

**Auth in client components:**
```typescript
import { useAuth } from '@/components/AuthProvider';
const { user, loading } = useAuth();
```

---

## AI API Routes

**OpenAI only** for user-facing routes (cover letter, resume match, interview prep).
**Anthropic (Claude)** only in `scripts/` pipeline files — never in API routes.

### Non-streaming (JSON response)
```typescript
const completion = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userPrompt }],
  max_tokens: 800,
  response_format: { type: 'json_object' }, // only when you want strict JSON
});
const raw = completion.choices[0].message.content ?? '{}';
return new Response(raw, { headers: { 'Content-Type': 'application/json' } });
```

### Streaming (text/plain)
```typescript
const stream = await client.chat.completions.create({ stream: true, model: 'gpt-4o-mini', ... });
const encoder = new TextEncoder();
const readable = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) controller.enqueue(encoder.encode(text));
    }
    controller.close();
  },
});
return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
```

Reference implementations: `app/api/cover-letter/route.ts` (streaming), `app/api/resume-match/route.ts` (JSON).

---

## API Route Structure

```typescript
export async function POST(req: NextRequest) {
  // 1. Auth check (if required)
  // 2. Parse + validate body
  let body: { field?: string };
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 }); }

  const { field } = body;
  if (!field) return new Response(JSON.stringify({ error: 'Missing field' }), { status: 400 });

  // 3. Call external API / DB
  // 4. Return response
}
```

---

## Data Fetching

- **Server components** fetch directly using Supabase or file-system (MDX content) — no API round-trips needed
- **Client components** call internal API routes (`/api/...`) via `fetch()` — never call OpenAI or Supabase directly from the browser
- Validate all API route inputs manually with guard clauses (Zod is not installed)

```typescript
// Server component — fetch directly
const { data } = await supabase.from('profiles').select('*').eq('id', userId);

// Client component — go through API route
const res = await fetch('/api/interview/questions', { method: 'POST', body: JSON.stringify({ roleId }) });
```

---

## Error Handling

- Wrap `req.json()` in try/catch — return 400 on parse failure
- **API routes:** return `{ error: string }` with correct HTTP status code
- **Client components:** store error in state, display inline (no toast library — use a styled `<p>` with `color: 'var(--terracotta)'`)
- Log errors with `console.error()` before returning 500
- No silent failures — always propagate or log

```typescript
// API route error pattern
return new Response(JSON.stringify({ error: 'Missing roleId' }), { status: 400 });

// Client error pattern
const [error, setError] = useState<string | null>(null);
// ...
{error && <p style={{ color: 'var(--terracotta)', fontSize: '0.9rem' }}>{error}</p>}
```

---

## Code Quality

- No `any` types
- No commented-out code
- No unused imports or variables
- Keep functions under 50 lines where possible — extract helpers if needed
- Keep components focused — split if a component grows beyond ~300 lines
- Don't add features not asked for — minimal changes only
