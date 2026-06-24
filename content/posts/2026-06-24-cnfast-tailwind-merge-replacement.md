---
title: "cnfast: Drop tailwind-merge for a 3.8x Speed Boost"
date: "2026-06-24"
excerpt: "cnfast is a drop-in replacement for the ubiquitous cn utility — byte-identical output, 3.8x faster on average, up to 7x on component-heavy code. Migration is one command."
tags: ["TypeScript", "React", "Performance", "Tailwind"]
coverEmoji: "⚡"
auto_generated: true
source_url: "https://github.com/aidenybai/cnfast"
---

`tailwind-merge` is everywhere. If you've touched a shadcn/ui project in the last two years, you've copied this snippet into `lib/utils.ts` without thinking twice:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

It's fine. It works. And it's been doing more computation than it needs to for every single render. `cnfast` just fixed that.

## What it is

cnfast is a drop-in replacement for the `cn` helper. Byte-identical output to `tailwind-merge`, 3.8x faster on average, up to 7x on component-heavy rendering paths. The API is identical — you change the import and nothing else:

```ts
import { cn } from "cnfast";

cn("px-2 py-1", isActive && "px-4", { "text-red-500": hasError });
// "py-1 px-4 text-red-500"
```

It also re-exports `clsx`, `twMerge`, and `twJoin` for anything that imports those directly, so you're not hunting down secondary usages.

## Why it's faster

The main gain comes from call-site caching. When a component re-renders with the same className arguments — which is the common case — cnfast skips the merge and returns a cached result. `tailwind-merge` rehashes and recomputes on every call regardless.

There's also a tagged template form for your hottest render paths:

```ts
cn`px-2 px-4 ${isActive && "bg-blue-500"}`;
// "px-4 bg-blue-500"
```

The tagged template caches by call-site identity rather than argument content. If the same call site fires repeatedly with the same values, it short-circuits before touching the string at all. Benchmarks show 4.3x faster than `tailwind-merge` on V8, wider gaps on other engines.

## Migration takes 30 seconds

```bash
npm install cnfast
npx cnfast migrate
```

`migrate` rewrites your imports project-wide. On a shadcn/ui project, you can also go through the registry:

```bash
npx shadcn@latest add aidenybai/cnfast/cn
```

That replaces `lib/utils.ts` and installs the package in one step. The net result:

```ts
// before — lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// after — lib/utils.ts
export { cn } from "cnfast";
```

One fewer transitive dependency. Same API surface. Nothing in your components changes.

## Does the speed difference actually matter?

For most pages: probably not in a way users notice. The real benefit is in component-heavy, frequently-updating UI — data tables, kanban boards, real-time dashboards, anything with drag-and-drop.

Consider a table with 500 rows, each row rendering 3–4 class expressions. That's 1,500+ `cn` calls per render cycle. At 7x faster, the time saved there is measurable on lower-end hardware. More importantly, it stops being the bottleneck if you're trying to hit 60fps during scroll or live data updates.

The other argument for adopting it now: the caching mechanism means you get *better* gains as your codebase grows, not constant gains. More components, more call sites, more cache hits.

## What I'd build with this

**1. A virtualised data table for the jobs board.** Combining virtualisation (only render visible rows) with cnfast means class computation never becomes the limiting factor. You can push row counts into the thousands without profiling `cn` as a suspect.

**2. A drag-and-drop kanban column.** Dragging items means rapid re-renders across multiple components simultaneously, all computing className strings. The call-site cache is exactly what this use case needs — same base classes on every tick, only the conditional classes change.

**3. A shadcn/ui starter template.** Any Next.js project I spin up now gets cnfast in the base template before anything else is scaffolded. Zero ongoing cost, and you never have to think about it again.

## My take

The reason this is worth writing about is that the migration cost is genuinely zero. Not "low" — zero. Same API, same output, one command to migrate. That's almost never true when something claims to be faster.

The tagged template syntax is worth adopting specifically for components you know re-render frequently. It's a small change that compounds across every hot render path in your codebase.

Drop it in, run the migrate command, ship it. That's the whole decision.
