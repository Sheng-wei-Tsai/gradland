# Learn Hub — Feature Spec
**Status:** In progress  
**Author:** Henry  
**Date:** 2026-04-09

---

## 1. Problem

The `/learn` page is a static list. Users have no guided discovery, no sense of progress ownership, and no reason to return. The three learning tools (IT Roadmap, Claude Code Guide, YouTube Learning) are buried in cards with no hierarchy or interactivity.

## 2. Goals

- Guide users through a **discovery flow**: understand how it works → see tools → pick a path
- Make path enrollment **persistent** (localStorage for guests, Supabase for signed-in users)
- Show **live progress** per path so returning users immediately see where they left off
- Add a **dashboard/learn** tab so progress is visible across devices after sign-in

## 3. Non-Goals

- Not a full LMS — no video hosting, no quizzes (those are in `/learn/youtube`)
- Not replacing the existing spaced-repetition skill-checking inside `/learn/[path]`
- No server-side recommendation engine in this iteration

---

## 4. User Flows

### 4a. Guest (unauthenticated)
1. Lands on `/learn`
2. Sees "How it works" collapsed section + IT Roadmap section
3. Clicks "How it works" → 4 animated steps reveal → 3 feature cards spring in
4. Clicks IT Roadmap → 5 path cards animate in
5. Clicks a path → **enrollment saved to localStorage** → navigates to `/learn/[path]`
6. Returns later → path shows "Continue" + progress from localStorage
7. Signs in → localStorage progress **migrated to Supabase** (handled in AuthProvider)

### 4b. Signed-in user
- Same flow, but enrollment saved to `user_active_paths` in Supabase
- Dashboard `/dashboard/learn` shows all active paths with % completion
- Progress syncs across devices

### 4c. Multiple paths
- User can enroll in multiple paths simultaneously
- Each path card shows independent progress
- No limit on concurrent enrollments

### 4d. Re-enrollment
- If already enrolled, `upsert` is a no-op (idempotent)
- Path card shows "Continue →" instead of "Start →" for enrolled paths

---

## 5. Data Model

### Existing (do not change)
```sql
-- skill_progress: per-skill topic checks with spaced repetition
-- Fields: user_id, path_id, skill_id, status, review_count, next_review_at
```

### New: `user_active_paths`
```sql
create table public.user_active_paths (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  path_id     text not null,
  enrolled_at timestamptz default now(),
  unique(user_id, path_id)
);
-- RLS: users can only read/write their own rows
```

### localStorage keys (guest fallback)
| Key | Value |
|-----|-------|
| `techpath_enrolled_paths` | `string[]` — path IDs |
| `skill_topics_checked` | `Record<string, boolean>` — existing key |

### Migration path (guest → auth)
On `supabase.auth.onAuthStateChange` SIGNED_IN:
1. Read `techpath_enrolled_paths` from localStorage
2. Upsert all into `user_active_paths`
3. Clear localStorage key after sync

---

## 6. Component Architecture

```
app/learn/
├── page.tsx                  # Server component — metadata + data pass-through
├── LearnPageClient.tsx       # Client component — all Framer Motion UI
│   ├── <HeroSection>         # Animated mount, static content
│   ├── <HowItWorksSection>   # Accordion: steps + 3 feature cards
│   └── <ITRoadmapSection>    # Path picker with enrollment
└── PathProgress.tsx          # Existing — reads skill_progress

app/dashboard/learn/
└── page.tsx                  # Shows enrolled paths + progress bars + resume buttons
```

---

## 7. Animation Design

### "How it works" accordion
| Element | Initial | Animate | Trigger |
|---------|---------|---------|---------|
| Container height | 0 | auto | click header |
| Steps 1–4 | opacity:0, x:-16 | opacity:1, x:0 | stagger 0, 140, 280, 420ms |
| Feature card 1 | opacity:0, y:32, scale:0.93 | spring | delay 720ms |
| Feature card 2 | opacity:0, y:32, scale:0.93 | spring | delay 830ms |
| Feature card 3 | opacity:0, y:32, scale:0.93 | spring | delay 940ms |

### IT Roadmap path picker
| Element | Initial | Animate | Trigger |
|---------|---------|---------|---------|
| Path cards 1–5 | opacity:0, y:24 | spring stagger | click "Browse paths" |
| Selected card | scale:1 | scale:0.97 → 1.0 | click (then navigate) |

---

## 8. State Management

```ts
// LearnPageClient
const [howOpen, setHowOpen] = useState(false);
const [pathsOpen, setPathsOpen] = useState(false);
const [enrolling, setEnrolling] = useState<string | null>(null); // pathId being enrolled
const [enrolled, setEnrolled] = useState<string[]>([]);          // from localStorage/DB

// On mount: load enrolled paths from localStorage
// On auth: sync localStorage → Supabase (see §5)
```

---

## 9. Error Handling

| Scenario | Handling |
|----------|----------|
| Supabase upsert fails | Silent — localStorage still saved, user still navigates |
| User not in `profiles` yet | `upsert` on `user_active_paths` catches FK violation, falls back gracefully |
| localStorage unavailable (SSR/private mode) | try/catch wrapping all localStorage access |

---

## 10. Dashboard `/dashboard/learn`

Shows:
- Active paths with: path title, % completion (checked topics / total topics), "Resume →" link
- Empty state: "You haven't started a learning path yet" + link to `/learn`
- Unauthenticated: redirect to `/login?next=/dashboard/learn`

Reads from: `skill_progress` table (existing) + `user_active_paths` (new)

---

## 11. Performance

- `LearnPageClient` is `'use client'` — metadata stays in server `page.tsx`
- Path cards only render when `pathsOpen = true` (AnimatePresence unmounts on close)
- `framer-motion` is already in bundle — no new dependency
- No API calls on mount — all path data is static (`SKILL_PATHS`)

---

## 12. Future Work

- **AI path recommender**: based on onboarding role + existing progress, suggest the best path
- **Streak tracking**: days in a row with skill reviews completed
- **Path completion certificate**: generate downloadable PDF on 100% mastery
- **Social proof**: "1,234 learners on the Frontend path"
