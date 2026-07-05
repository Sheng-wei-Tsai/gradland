---
title: "shadcn/ui Just Made Base UI the Default — What Changes for You"
date: "2026-07-05"
excerpt: "shadcn/ui quietly flipped its default component library from Radix to Base UI today. Here's what actually changes, what breaks if you have CI scripts, and whether you should migrate."
tags: ["Next.js", "UI", "shadcn"]
coverEmoji: "🎛️"
auto_generated: true
source_url: "https://ui.shadcn.com/docs/changelog"
---

Today, `shadcn/ui` shipped a change that's been telegraphed for months: Base UI is now the default when you run `npx shadcn init`. If you're using shadcn on a project — or your CI pipeline runs `shadcn init` — here's what you need to know.

## What Actually Changed

Three concrete things shifted:

1. **`npx shadcn init` defaults to Base UI.** You get a prompt, and Base UI is now the pre-selected option.
2. **The docs default to Base UI tabs.** When you open a component page, you see the Base UI implementation first. Radix is one click away.
3. **`shadcn/create` (their hosted scaffolding) shows Base UI first.** They tracked usage data and users were already picking Base UI 2-to-1 over Radix.

What *didn't* change: Radix is not deprecated. Every new component and update ships for both libraries. If your app is running on Radix and working, you don't need to touch anything.

## Why Base UI

Base UI is built by the same team that built Radix — MUI's primitives team. Same philosophy (unstyled, headless, accessible), rebuilt from scratch with everything they learned. It hit 1.0 stable last year and is sitting at 1.6.0 with 6 million weekly downloads. The shadcn team has been running it in their own new projects for a while.

The practical differences you'll notice when writing components:

- More composable render-prop style APIs on some components
- Slots and `className` utilities that make styling more predictable
- A few components (like `Field`) that don't exist in Radix yet

For day-to-day use, the abstraction layer shadcn puts over both libraries means the components look nearly identical in your JSX. The bigger win is at the primitive level if you're building custom things on top.

## The One Thing That Can Break: CI Scripts

If you have a CI pipeline or a project scaffolding script that runs `shadcn init` non-interactively, this is the thing that will bite you:

```bash
# Before today, this would default to Radix
npx shadcn init

# After today, this defaults to Base UI
# If your tests/types/imports assume Radix internals, things can drift
```

Fix it with one flag:

```bash
npx shadcn init -b radix
```

Add that flag to any script that needs to stay on Radix. Ditto if you're shipping a component registry — add a `registry:base` config to pin the library explicitly.

## Migrating (If You Want To)

The shadcn team released a skills-based migration tool rather than a codemod. Their reasoning: you've customised your components — added variants, changed classes, wired up your own logic — so a blunt text replacement would trash that work.

```bash
npx skills add shadcn/ui
```

Then you can ask your editor agent:

```
migrate accordion to base-ui
```

It migrates one component at a time, both libraries coexist while you work, and it picks up where it left off if you stop mid-migration. You can also ask it to migrate the whole project at once if you're feeling bold.

I'd treat this as a "next greenfield project" decision rather than a "migrate everything this sprint" decision. The migration path exists if you need it, but the ROI isn't obvious for a stable production app.

## What I'd Build With This

**A typed component audit CLI** — given a Next.js project, find every shadcn component, detect whether it's using Radix or Base UI internals, and output a migration priority list based on usage frequency. Useful if you have a large codebase and want to know what migration actually entails before you commit.

**An A/B scaffolding tool** — spin up two identical app shells (one Radix, one Base UI), build the same feature in both, and benchmark bundle size and runtime performance differences. Good data to have if your team is debating the migration.

**A registry with opinionated Base UI components** — build your own component library on top of Base UI (instead of shadcn's defaults), publish it as a shadcn-compatible registry, and reuse it across projects. The `registry:base` config makes this straightforward now.

## My Take

This was inevitable once Base UI hit stable. The shadcn team was honest about it — they watched usage data and the community had already voted with their `npx` commands.

The migration story is better than I expected. Progressive, non-destructive, tool-assisted rather than a find-and-replace nightmare. But I wouldn't rush it. If you're starting something new today, sure, go with the default and use Base UI. If you have a production app on Radix, the risk/reward on migrating isn't there yet unless you have a specific reason.

The flag to watch: whether Base UI components keep shipping faster than Radix equivalents. If Base UI gets `Combobox` and `DatePicker` before Radix does, that'll be a harder argument to ignore.
