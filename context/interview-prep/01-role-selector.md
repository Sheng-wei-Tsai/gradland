# Wireframe 01 — Role Selector  `/interview-prep`

## Use Case
Henry visits the page to choose which job he's preparing for. He's applying for junior frontend roles at
Canva and needs to know what questions to expect. The grid shows him salary, demand, and which companies
hire for each role — it's not just a menu, it's a market snapshot.

## Design Rationale (UI UX Pro Max: Feature-Rich + Social Proof pattern)
- Cards carry **social proof signals** (salary range, demand badge, company logos)
- **CTA above the fold**: 8 roles visible without scrolling on desktop
- Each card has a distinct accent colour so roles feel distinct at a glance
- Demand badge (🔴 Very High / 🟡 High) creates mild urgency

---

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  HEADER NAV  (sticky)                                                           │
│  🌿 My Little Corner    Home  Blog  Digest  Githot  Learn  [Interview]  ···   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                         HERO — max-width 900px centred                          │
│                                                                                 │
│   🎯  Interview Prep                                     [XP badge if logged in]│
│                                                                                 │
│   The 10 questions Australian tech companies actually ask.                      │
│   Pick your target role. Alex, your AI mentor, will coach you through each one. │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  ROLE GRID  (2 cols on desktop, 1 col on mobile)                                │
│                                                                                 │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐          │
│  │  ⚛️  Junior Frontend Dev      │  │  🔄  Junior Full Stack Dev     │          │
│  │  ─────────────────────────── │  │  ─────────────────────────── │          │
│  │  React, TypeScript, CSS...   │  │  React, Node.js, PostgreSQL...│          │
│  │                               │  │                               │          │
│  │  🔴 Very High Demand          │  │  🔴 Very High Demand          │          │
│  │  $70k – $90k AUD              │  │  $80k – $100k AUD             │          │
│  │                               │  │                               │          │
│  │  Canva · Atlassian · REA      │  │  Xero · MYOB · Atlassian      │          │
│  │                               │  │                               │          │
│  │              [ Start → ]      │  │              [ Start → ]      │          │
│  └───────────────────────────────┘  └───────────────────────────────┘          │
│                                                                                 │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐          │
│  │  🖥️  Junior Backend Dev       │  │  ☁️  Junior DevOps / Cloud     │          │
│  │  ...                          │  │  ...                          │          │
│  └───────────────────────────────┘  └───────────────────────────────┘          │
│                                                                                 │
│  ... (8 roles total, 4 rows × 2 columns)                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

| Element | Decision | Why |
|---------|----------|-----|
| 2-column grid | Fits all 8 roles without scroll on most desktops | Reduce friction to start |
| Role colour accent | Left border uses `role.color` | Visual differentiation at a glance |
| Companies listed | Show 3 real AU company names | Social proof — "I've seen Canva hire for this" |
| Demand badge | `🔴 Very High` in colour | Urgency without being pushy |
| `[ Start → ]` button | Bottom of each card, terracotta fill | Clear single CTA per card |
| XP badge in header | Only shown when logged in | Rewards returning users, invisible to new users |
