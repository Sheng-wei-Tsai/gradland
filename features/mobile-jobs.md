# Feature: Mobile-First Job Search Redesign

**Priority:** 🟡 P3 — UX / Reach
**Status:** 🔲 Not started
**Effort:** Medium (3–4 days)
**Started:** —
**Shipped:** —

---

## Problem

International grads search for jobs on their phones — during commutes, on campus between classes, waiting for a coffee. The current `/jobs` page was designed for desktop. On mobile:

- The filter strip (keywords, location, job type, working rights toggle) sits in a horizontal row that overflows off-screen
- Action buttons (Save, Apply) have tap targets smaller than 44px — Apple's minimum for touch
- Job cards are dense with text and require precision taps
- The "working rights" toggle is 28px wide — nearly untappable on a phone
- There is no way to quickly triage 20 jobs without scrolling through all of them
- Expanding a job detail forces a full page navigation — back button loses scroll position

This is a pure mobile UX problem. The data and features are correct. The touch layer is broken.

---

## Goal

Redesign the job search experience to be mobile-first without degrading the desktop experience. The key interactions on mobile should feel as natural as Instagram or Twitter — swipe, tap, and act.

---

## Mobile Job Card Redesign

### Current (desktop-only):
```
┌──────────────────────────────────────────────────────────────┐
│ [logo]  Title                  Company · City · $80k–$100k  │
│         Tech stack chips                                     │
│         [Save ♡]  [Apply →]  [Track it]                     │
└──────────────────────────────────────────────────────────────┘
```

### Mobile-first card:
```
┌────────────────────────────────────────┐
│ [logo]  Senior Data Engineer           │
│         Atlassian · Sydney             │
│         $90k–$110k · Full-time         │
│                                        │
│ Python  SQL  Spark  dbt    ← chips     │
│                                        │
│  [♡ Save]    [→ Apply]    [+ Track]   │
│   (48px)      (48px)       (48px)     │
└────────────────────────────────────────┘
```

All action buttons are minimum 48px tall (exceeds Apple 44px guideline). Touch target size is the #1 mobile usability issue on the current page.

---

## Swipe-to-Save

On mobile, each job card supports horizontal swipe gestures:
- **Swipe right →** — Save job (green overlay: "Saved ♡")
- **Swipe left ←** — Dismiss / hide job (grey overlay: "Hidden")

Implemented with Framer Motion `drag` on the x-axis:

```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.7}
  onDragEnd={(_, info) => {
    if (info.offset.x > 80)  handleSave(job);
    if (info.offset.x < -80) handleDismiss(job);
  }}
  style={{ x }}
>
  {/* Swipe indicators */}
  <motion.div style={{ opacity: rightIndicatorOpacity }}>♡ Save</motion.div>
  <motion.div style={{ opacity: leftIndicatorOpacity }}>✕ Hide</motion.div>
  {/* Card content */}
</motion.div>
```

No new dependencies — Framer Motion is already installed.

---

## Filter Sheet (Bottom Drawer)

On mobile, filters move from a horizontal strip into a bottom drawer:

```
[ 🔍 "Data Engineer in Sydney"        Filters (3) ]
```

Tap "Filters (3)" → bottom sheet slides up:

```
┌────────────────────────────────────────┐
│  ▬  Filters                  [Clear]  │
│──────────────────────────────────────│
│  Keywords                            │
│  [________________________]          │
│                                      │
│  Location                            │
│  [ Sydney ]  [ Melbourne ]  [ All ]  │
│                                      │
│  Job type                            │
│  [ Full-time ]  [ Contract ]  [ All ]│
│                                      │
│  ✅ Full working rights only         │  ← 44px toggle
│                                      │
│  [──────────────────────────────────] │
│  [   Show 47 results →              ] │ ← 56px button
└────────────────────────────────────────┘
```

Bottom sheet uses Framer Motion `AnimatePresence` + drag-to-dismiss.

---

## Job Detail Modal (Mobile)

Tapping a job card on mobile opens a full-screen bottom sheet instead of navigating to a new page. This preserves scroll position in the list.

```
┌────────────────────────────────────────┐
│  ▬                                    │
│                                        │
│  [logo]  Senior Data Engineer          │
│          Atlassian · Sydney            │
│          $90k–$110k · Full-time        │
│          Posted 2 days ago             │
│                                        │
│  Requirements:                         │
│  • 3+ years Python and SQL             │
│  • Experience with dbt or Spark        │
│  • AWS or GCP                          │
│  ...                                   │
│                                        │
│  [ 🔍 Analyse my fit ]  ← Gap Engine  │
│                                        │
│  [────────────────────────────────────]│
│  [ ♡ Save ]         [ → Apply now   ] │
│    (56px)                (56px)        │
└────────────────────────────────────────┘
```

On desktop, this is still the same expanded card / link-out behaviour.

---

## Sticky Search Bar

On mobile, the search bar sticks to the top as the user scrolls:

```
┌────────────────────────────────────────┐
│  🔍  Data Engineer in Sydney  [▼ 3]   │  ← sticky
├────────────────────────────────────────┤
│                                        │
│  [job card]                            │
│  [job card]                            │
│  [job card]                            │
│                         ↕ scroll       │
```

"[▼ 3]" shows the count of active filters. Tap → opens the filter sheet.

---

## "Apply Later" vs "Apply Now" Quick Strip

Below each expanded job, a two-button strip:

```
[ ♡ Apply later ]     [ → Apply now ]
  adds to saved          opens apply URL
```

"Apply later" saves the job and shows a toast: "Saved — check your dashboard when ready to apply."

This reduces friction for mobile users who find a job while commuting but can't apply in the moment.

---

## Scroll Position Preservation

Currently, navigating away from `/jobs` loses scroll position and re-fetches results (fixed by the 10-min localStorage cache). On mobile, the additional issue is that the browser sometimes resets scroll position on back navigation.

Fix: use `sessionStorage` to save the scroll position `Y` value on unmount, restore it on mount. One `useEffect`, ~10 lines.

---

## Files

| File | Change |
|------|--------|
| `app/jobs/page.tsx` | Major rewrite — mobile-first layout, sticky header, filter sheet |
| `components/JobCard.tsx` | Create — extracted card with swipe + 48px buttons |
| `components/JobDetailSheet.tsx` | Create — mobile full-screen bottom sheet |
| `components/FilterSheet.tsx` | Create — Framer Motion bottom drawer for filters |

---

## Acceptance Criteria

- [ ] All action buttons ≥ 48px tall on mobile (verified with Chrome DevTools)
- [ ] Swipe-right saves a job (green indicator, haptic feedback on supported devices)
- [ ] Filter sheet opens as bottom drawer on < 640px screen width
- [ ] Job detail opens as bottom sheet on mobile (scroll position preserved)
- [ ] Sticky search bar visible while scrolling on mobile
- [ ] Working rights toggle is ≥ 44px tall
- [ ] Desktop layout unchanged (filter strip, inline expanded cards)
- [ ] Scroll position restored on back navigation
- [ ] Tested at 375px (iPhone SE), 390px (iPhone 14), 428px (iPhone 14 Plus)
- [ ] `npm run build` passes
