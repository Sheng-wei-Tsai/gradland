# TODO: GitHub Skills Learning Guide

See `docs/feature-github-skills.md` for full spec.

---

- [x] **1** Create `lib/github-skills.ts` — all 37 courses as `GITHUB_LEVELS` data
- [x] **2** Create `app/learn/github/page.tsx` — server component with metadata
- [x] **3** Create `app/learn/github/GitHubSkillsGuide.tsx` — full client guide component
  - Level tabs with scroll-to-left on active
  - Course accordion cards (expand on click)
  - "Start on GitHub →" external link per course
  - "Mark complete" checkbox with localStorage + Supabase
  - Overall + per-level progress bars
- [x] **4** Add Supabase migration `supabase/016_github_skill_progress.sql`
- [x] **5** Update `components/Header.tsx` — add GitHub Skills to Learn dropdown
- [x] **6** Update Learn page (`app/learn/LearnPageClient.tsx`) — add GitHub Skills card below YouTube/Claude Code
- [x] **7** `npm run check` before pushing
