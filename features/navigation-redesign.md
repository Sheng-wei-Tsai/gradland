# Feature: Navigation Architecture Redesign

**Priority:** 🟡 P3 — UX Clarity
**Status:** 🔲 Not started
**Effort:** Medium (3–4 days)
**Started:** —
**Shipped:** —

---

## Problem

The platform has grown from a blog into a 20+ feature career platform. The navigation has not kept up. Current issues:

1. **Top nav is feature-flat:** Blog · Jobs · Interview Prep · Cover Letter · Learn · AU Insights · Me
   — There is no hierarchy. Everything looks equally important. New users have no mental model.

2. **AU Insights has 10 tabs:** Company Tiers, IT Ecosystem, Career Guide, Visa Sponsors, Job Market, Salary Checker, Grad Programs, Skill Map, Visa Guide, Compare
   — Useful once discovered, but impossible to navigate to a specific tab from anywhere in the site.

3. **Mobile bottom nav (currently 4 items) does not reflect the product's actual depth.**

4. **Related tools are scattered:** Resume Analyser is in Dashboard. Cover Letter is in the main nav. Interview Prep is in the main nav. Salary Checker is buried in AU Insights tab 6. These are all "career tools" but live in completely different locations.

---

## Proposed Information Architecture

Three user verbs replace the feature list:

```
PREPARE            SEARCH              TRACK
───────────        ──────────          ──────────
Resume Analyser    Job Search          Dashboard
Cover Letter       AU Companies        Applications
Interview Prep     AU Insights         Visa Tracker
Learning Paths       ↳ Company Tiers   Job Alerts
YouTube Learning     ↳ Skill Map       Saved Jobs
Gap Engine           ↳ Grad Programs
                     ↳ Salary Checker
                     ↳ Visa Guide
                   GitHub Hot
                   Daily Digest
```

---

## Desktop Navigation

```
┌──────────────────────────────────────────────────────────────────┐
│  Henry · Digital Life           Prepare ▾  Search ▾  Track ▾  [Me ▾]  │
└──────────────────────────────────────────────────────────────────┘
```

**Mega-dropdown on hover/click — "Prepare":**

```
┌──────────────────────────────────────────────────────────────┐
│  Prepare for your job search                                 │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ 📄 Resume    │  │ ✉️ Cover     │  │ 🎯 Interview Prep │   │
│  │ Analyser     │  │ Letter       │  │                   │   │
│  │ AI feedback  │  │ Generator    │  │ Alex mentor, AU   │   │
│  │ for AU IT    │  │ GPT-4.1,     │  │ company-specific  │   │
│  │              │  │ AU English   │  │                   │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ 📚 Learn     │  │ 🎥 YouTube   │  │ 🔍 Gap Engine    │   │
│  │ 5 career     │  │ Learning     │  │ JD → skill gap   │   │
│  │ paths        │  │ Gemini guide │  │ + action plan    │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Mega-dropdown — "Search":**

```
┌──────────────────────────────────────────────────────────────┐
│  Find your role in Australia                                 │
│                                                              │
│  ┌──────────────────────┐   ┌──────────────────────────┐    │
│  │ 💼 Job Search        │   │ 🏆 AU Insights           │    │
│  │ JSearch, live        │   │                          │    │
│  │ working rights filter│   │ Company Tiers            │    │
│  └──────────────────────┘   │ Salary Checker           │    │
│                             │ Skill Map                │    │
│  ┌──────────────────────┐   │ Grad Programs            │    │
│  │ 🔥 GitHub Hot        │   │ Visa Guide               │    │
│  │ Trending repos daily │   │ Compare Companies        │    │
│  └──────────────────────┘   └──────────────────────────┘    │
│                                                              │
│  ┌──────────────────────┐                                    │
│  │ 🤖 Daily AI Digest   │                                    │
│  └──────────────────────┘                                    │
└──────────────────────────────────────────────────────────────┘
```

**Mega-dropdown — "Track":**

```
┌──────────────────────────────────────────────────────────────┐
│  Track your job search progress                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ 📋 Dashboard │  │ 🛂 Visa      │  │ 🔔 Job Alerts    │   │
│  │ Applications │  │ Journey      │  │ Saved searches   │   │
│  │ + pipeline   │  │ Tracker      │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  Readiness Score: 82/100  [View full dashboard →]           │
└──────────────────────────────────────────────────────────────┘
```

---

## Mobile Navigation

**Bottom nav bar (4 icons, always visible):**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│            [current page content]                  │
│                                                     │
├───────────┬───────────┬───────────┬─────────────────┤
│   🏠      │   🔍      │   📚      │    👤           │
│   Home    │  Search   │  Prepare  │    Me           │
└───────────┴───────────┴───────────┴─────────────────┘
```

"Prepare" tab → slides up a drawer with all Prepare tools.
"Search" tab → navigates to `/jobs` directly.
"Me" tab → avatar dropdown (Dashboard, Visa Tracker, Settings, Sign out).

---

## Breadcrumbs

Every nested page gets breadcrumbs. Examples:

```
Search → AU Insights → Company Tiers → Atlassian
Prepare → Learning Paths → Data Engineer → Phase 2: Pipeline Engineering
Track → Visa Journey Tracker
```

Implemented as a `<Breadcrumb>` server component that reads the current path and maps it to the IA labels. Zero JS overhead.

---

## URL Structure (unchanged — no breaking changes)

No URL changes. The navigation is a presentation layer on top of the existing routes. All existing links, bookmarks, and SEO continue to work.

---

## Files

| File | Change |
|------|--------|
| `components/Header.tsx` | Rewrite — three-zone mega-dropdown nav |
| `components/MobileNav.tsx` | Create — bottom tab bar + drawer |
| `components/Breadcrumb.tsx` | Create — server component, path → label mapping |
| `app/layout.tsx` | Modify — add `<Breadcrumb>` and `<MobileNav>` |

---

## Acceptance Criteria

- [ ] Desktop: three zones with mega-dropdowns — all tools discoverable in 2 clicks
- [ ] Mobile: bottom nav bar always visible, "Prepare" drawer works
- [ ] Breadcrumbs on all nested pages (AU Insights tabs, learn paths, company detail, visa tracker)
- [ ] No URL changes — all existing routes continue to work
- [ ] Keyboard navigable (tab through dropdowns, Escape closes)
- [ ] Active state shown for current zone
- [ ] `npm run build` passes
