---
title: "cnfast: Drop-In Replacement for cn That's 3.8x Faster"
date: "2026-06-23"
excerpt: "A new package hit 700+ GitHub stars this week claiming to replace tailwind-merge with byte-identical output and 3.8x better performance. I tested it."
tags: ["TypeScript", "React", "Performance"]
coverEmoji: "⚡"
auto_generated: true
source_url: "https://github.com/aidenybai/cnfast"
---

If you've used shadcn/ui — and if you're building Next.js apps in 2026, you have — you know the `cn` utility. It's two lines that appear in basically every component:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

This week a package called [cnfast](https://github.com/aidenybai/cnfast) hit 700+ GitHub stars claiming to be a drop-in replacement that runs **3.8x faster on average**, up to **7x on component-heavy code**, with byte-identical output.

That's a bold claim. Here's what's actually going on.

## What It Is

`cnfast` from Aiden Bai (the same person who built Million.js) is a reimplementation of the `tailwind-merge` merge engine with a caching layer baked in at the right level. The key insight: `cn` runs once per element on every render, so its cost scales directly with how much you render. On a component-heavy page, `tailwind-merge` is doing redundant work because the same class argument combinations recur constantly.

The benchmarks across 65 workloads on V8:

| Workload | tailwind-merge | cnfast | Speedup |
|---|---|---|---|
| Cached re-render | 2,025 ops/s | 8,709 ops/s | **4.3x** |
| Merge engine, cold | 1,440 ops/s | 5,411 ops/s | **3.8x** |
| Component corpus | 1,585 ops/s | 6,506 ops/s | **4.1x** |
| Page render | 4,249 ops/s | 11,908 ops/s | **2.8x** |
| Live data grid | 500 ops/s | 2,185 ops/s | **4.4x** |

Zero output mismatches over 113,291 real-world call groups. The bundle is 9.43 KB gzipped vs 8.45 KB for baseline — you pay about 1 KB extra for the speed gain.

## How to Migrate

This is where it gets interesting: migration is either one command or zero code changes.

**Option 1 — shadcn/ui project (recommended):**

```bash
npx shadcn@latest add aidenybai/cnfast/cn
```

This rewrites your `lib/utils.ts` and installs the package. Done.

**Option 2 — general project:**

```bash
npx cnfast migrate
```

This rewrites all your `cn`, `clsx`, and `tailwind-merge` imports automatically.

**Option 3 — manual swap:**

```ts
// Before
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// After
export { cn } from "cnfast";
```

The package also re-exports `clsx`, `twMerge`, and `twJoin` so nothing else needs to change.

## The Tagged Template Trick

There's an additional API worth knowing about. When you use `cn` as a tagged template literal, it caches by call-site identity:

```ts
// Function form — caches arguments on V8
cn("px-2 py-1", isActive && "px-4");

// Tagged template form — caches by call-site identity
cn`px-2 py-1 ${isActive && "px-4"}`;
```

The tagged template form is 4.3x faster than `tailwind-merge` on stable call sites. In practice, this matters most for components that re-render frequently with the same base classes (navigation items, buttons in a list, table cells).

## Is the Speed Difference Noticeable?

For most apps, probably not in raw user experience. The gains show up in profiling, not in obvious jank.

Where it does matter: large component trees rendering server-side. If you're generating a dashboard with 200 table rows, each with several conditionally styled cells, you're calling `cn` thousands of times per request. A 3.8x speedup there translates to real response time reduction — the kind that shows up in your p99 latency.

The other case: React Native or any environment without V8's argument caching. The README notes that the speedup is larger on non-V8 engines because V8 already caches `cn(...)` call-form arguments natively.

## What I'd Build With This

**1. Drop it into the dashboard at Gradland.** The job search and resume analyser pages have dense component trees with lots of conditional styling based on user data. Worth profiling before and after — I'd expect measurable reduction in server render time.

**2. Component library builds.** If you're maintaining a design system used across multiple apps, `cnfast` is an easy win. One swap, the migration command handles everything, and every downstream app benefits.

**3. Any Next.js app using shadcn/ui.** If you built your app using the shadcn/ui template, you're already using `lib/utils.ts` with `twMerge`. The `npx shadcn@latest add aidenybai/cnfast/cn` command is legitimately zero-risk migration — it's the same output, same API, faster execution.

---

The "byte-identical output" claim is the key thing to trust here. If cnfast ever produced different class order than tailwind-merge, components would subtly break in ways that are hard to debug. The 113,291 call group test suite without mismatches gives me confidence that the caching doesn't change semantics.

I'll be dropping this into the next Gradland build. The migration takes five minutes and the worst case is you revert one file.
