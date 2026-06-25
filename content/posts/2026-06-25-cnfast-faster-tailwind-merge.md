---
title: "cnfast: Your cn() Is Slower Than It Needs to Be"
date: "2026-06-25"
excerpt: "cnfast is a drop-in replacement for tailwind-merge that runs 3.8x faster on average with byte-identical output — and migrates your whole project in one command."
tags: ["Performance", "Tailwind", "TypeScript", "shadcn"]
coverEmoji: "⚡"
auto_generated: true
source_url: "https://github.com/aidenybai/cnfast"
---

Every component in a shadcn/ui project calls `cn()`. Not occasionally — on every render, for every dynamic class merge. In a real app that's thousands of calls per interaction. Most developers never look twice at it because the standard setup "just works," but [cnfast](https://github.com/aidenybai/cnfast) landed 900+ GitHub stars this week with a simple claim: same output, significantly faster.

## What it actually is

The standard shadcn/ui `cn` helper looks like this:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

`tailwind-merge` is doing real work here — it parses Tailwind class strings, understands property conflicts (`px-2` vs `px-4`), and produces a correct merged output. That parsing has a cost.

cnfast produces **byte-identical output** to `tailwind-merge` but caches aggressively. On V8, argument objects that repeat across calls hit the cache and skip the re-hash. The result: 3.8x faster on average, up to 7x faster on component-heavy render paths where the same class combinations appear repeatedly.

```ts
import { cn } from "cnfast";

// Works exactly the same
cn("px-2 py-1", isActive && "px-4", { "text-red-500": hasError });
// "py-1 px-4 text-red-500"
```

## The tagged template form is worth understanding

cnfast also ships a tagged template API that caches by **call-site identity**, not argument identity:

```ts
// Stable call site — 4.3x faster than tailwind-merge on repeat renders
cn`px-2 py-1 ${isActive && "px-4"} ${{ "text-red-500": hasError }}`;
```

The difference matters for components that re-render with changed state but the same class structure. A button that toggles active state still uses the same `px-2 py-1 [active-class]` template — the tagged form recognises this and skips re-evaluation of the static parts entirely.

On non-V8 engines (not many in practice), this gap widens further. On V8 the `cn(...)` call form already benefits from V8's own argument caching, so the template form only adds about 1.2x on top of that.

## Migration is genuinely one command

For a shadcn/ui project:

```bash
npx shadcn@latest add aidenybai/cnfast/cn
```

This rewrites `lib/utils.ts` to re-export cnfast and installs the package. Nothing else changes.

For a non-shadcn project:

```bash
npm install cnfast
npx cnfast migrate
```

The migrate command finds every import of `clsx`, `classnames`, and `tailwind-merge` in your project and rewrites them to use cnfast. cnfast re-exports `clsx`, `twMerge`, and `twJoin` from the same package so any code that uses those directly keeps working.

## What I'd build with this

**High-frequency list rendering.** A virtual scrolling component like a jobs board or activity feed re-renders many items at once. Each item calls `cn()` multiple times for conditional styling. Switching to cnfast's tagged template form on these hot-path components would measurably reduce render time with zero logic changes.

**A Tailwind performance profiler.** The interesting thing about cnfast's architecture is that it *knows* which call sites are hot (frequently hit the cache) vs cold (always new arguments). It would be straightforward to wrap it in a dev-only profiler that logs the top 20 `cn()` call sites by frequency — giving you a prioritised list of exactly where to optimise your class logic.

**Component library benchmarking.** If you're building an internal component library and want to prove performance numbers to stakeholders, cnfast's `bench` tooling (see their repo) gives you ops/sec comparisons per component. Useful for quantifying the cost of complex conditional class logic before it ships.

## My take

I don't reach for performance micro-optimisations by default — profiling first, then optimise. But cnfast is the exception because the trade-off is unusually clean: zero API changes, zero behaviour changes, one command to migrate, a clear upside on re-rendering paths.

If you're already on tailwind-merge, there's no reason not to switch. The shadcn migration command takes about 10 seconds. Worth it.
