# PRD — Gradland

> Product scope anchor for the AI workflow layer (see AGENTS.md §19).
> Feature status lives in `TODO.md` (single source of truth); this file holds the stable product definition.

## Product

The definitive career platform for **international IT graduates entering the Australian job market** — resume analyser, interview prep, visa tracker, salary checker, job search, learning paths. The personal blog (digest, githot, AI news, visa news) is a content/SEO moat, not the core product.

## Target users

International students and 482/485/PR applicants in tech roles in Australia.

## Non-goals

- General-purpose (non-AU, non-IT) job board
- Blog-first personal site — career tools always come before blog content for logged-out users

## Success criteria

- New visitor understands the product within 5 seconds of landing (AGENTS.md §13)
- Career tools are subscription-gated, rate-limited, and never a billing liability (§5.1)
- CI stays green: `npm run check` gates every merge to main

## How to evolve this file

For substantial new features, run `.agents/ai-workflow/commands/create-prd.md` to draft the phase plan here before implementation, then track execution in `TODO.md`.
