# Feature: AU Company Tier Guide

**Priority:** 🔴 High
**Status:** 🔲 Not started
**Branch:** `feature/au-insights`
**Started:** —
**Shipped:** —

---

## Goal

Give Australian IT job seekers a practical, opinionated tier breakdown of tech companies — from elite product companies down to body-shop consultancies — so they can prioritise their applications intelligently. A fresh grad burning time on B- tier companies because they don't know the landscape is a common and fixable problem.

The guide covers both global companies with AU offices (Amazon, Google, Atlassian) and AU-native employers. Each tier shows: typical comp, work culture, career growth trajectory, and what kind of person thrives there.

---

## Tier Structure

### God Tier / SSS
Elite quant trading and product companies. Extremely selective. High comp, high autonomy.
- **Examples:** Palantir, TGS (quantitative trading), Radix
- **Comp:** $150k–$250k+ AUD base for grads
- **Culture:** Small teams, research-heavy, performance-driven
- **Who thrives:** Top 1% CS grads, competitive programming backgrounds

### S+ / S — Premium Product & High-Frequency Trading
Well-known global product companies and AU-native tech unicorns.
- **Examples:** IMC Trading, Optiver, Afterpay/Block, Canva, Atlassian
- **Comp:** $100k–$160k AUD for grads
- **Culture:** Strong eng culture, internal mobility, good L&D budgets
- **Who thrives:** Strong fundamentals grads who want to build real product

### A+ — FAANG-adjacent / Scale-ups
Globally recognised brands with strong AU engineering presence.
- **Examples:** Meta, Apple, Google, Netflix, Airbnb, Stripe, Uber, AWS
- **Comp:** $120k–$180k with RSUs
- **Culture:** Structured, process-heavy at scale; great brand on resume
- **Who thrives:** Grads who want brand recognition + solid systems at scale

### A — Strong Mid-tier Products
Good companies that don't get enough credit.
- **Examples:** Notion, Discord, Figma, LinkedIn (AU), Spotify, Dropbox, Pinterest
- **Comp:** $90k–$130k AUD
- **Culture:** More relaxed than FAANG; still strong product focus
- **Who thrives:** Grads who prefer product depth over raw prestige

### B+ — Large Tech / Well-run Enterprises
Solid engineering org, slower culture than product companies, good for stability.
- **Examples:** Amazon (AWS ops roles), Adobe, Cloudflare, Salesforce, GitHub, Lyft, Twilio
- **Comp:** $85k–$120k AUD
- **Culture:** Bureaucratic at times but structured career ladders
- **Who thrives:** Grads who want structure and a clear promotion path

### B — Traditional Enterprise & Consulting Majors
Large companies where IT is a cost centre, not a core product.
- **Examples:** IBM, Booking.com, Morgan Stanley (AU), Intel, Deloitte (tech roles), Accenture
- **Comp:** $70k–$100k AUD
- **Culture:** Slower pace, lots of legacy code, political promotion paths
- **Who thrives:** Grads who prioritise stability over growth speed; good for visa sponsorship

### B- — Body Shops & Bank IT
Banks, government IT outsourcers, second-tier consultancies. Not bad — just go in eyes open.
- **Examples:** Citi, Wells Fargo (AU ops), TCS, HCL, Booz Allen (AU), Infosys
- **Comp:** $60k–$85k AUD
- **Culture:** High utilisation (billed hourly), limited ownership, frequent contractor churn
- **Who thrives:** Grads who need a visa pathway or first-job foothold; plan to leave in 2 years

### Avoid
Companies with documented poor culture, exploitative hours, or no engineering growth.
- **Signs to watch for:** No public engineering blog, no L&D budget, "work hard play hard" on Glassdoor, no code review culture, majority contractor workforce

---

## Acceptance Criteria

- [ ] `/au-insights` page exists with "Company Tiers" as the first tab
- [ ] Each tier rendered as a visually distinct card section with colour coding
- [ ] God/SSS = gold accent; A+ = terracotta; B = muted; Avoid = grey
- [ ] Logos or representative company name chips shown per tier
- [ ] "What to expect" quick facts (comp, culture, growth) shown per tier
- [ ] Mobile-first: single-column stack on < 768px
- [ ] No auth required — this is free educational content

---

## Affected Files

| File | Action | Notes |
|------|--------|-------|
| `app/au-insights/page.tsx` | Create | Tab container with three tabs |
| `app/au-insights/CompanyTiers.tsx` | Create | Client component rendering tier cards |

---

## Implementation Notes

- Content is static — no API, no Supabase
- Company logos can be replaced with styled name chips (no external image hosting needed)
- Tier colours should pull from existing CSS vars where possible
- This page is public (no auth gate) — it is a lead-gen / resource page

---

## Senior Dev Test Checklist

### Functional
- [ ] All tiers render without horizontal scroll on mobile
- [ ] Comp ranges clearly formatted, not misleading
- [ ] "Avoid" section is clearly distinguished without naming specific companies unfairly

### Build & Types
- [ ] `npm run build` passes
- [ ] No TypeScript `any`

### Performance
- [ ] Static page — no API calls, instant load

---

## Notes / History

- **2026-04-06** — Feature spec created from tier-of-job.PNG reference screenshot
- Content based on real AU IT market knowledge + widely shared tier lists in the AU dev community
