# Wireframe 02 — Session Layout  `/interview-prep/[role]`

## Use Case
Henry has picked "Junior Frontend Developer." He sees all 10 questions in the sidebar, ordered
Easy → Medium → Hard. He's on question 1. The main area is where Alex speaks to him — it's not
a card, it's more like a conversation window. The XP counter in the header shows his live progress.

## Design Rationale (UI UX Pro Max: Scroll-Triggered Storytelling)
The skill recommended treating each stage like a "chapter" with a distinct visual beat.
The layout mirrors this: the sidebar tracks your story position (which chapter you're in),
and the main panel is the scene itself. Same spatial grammar as a book — sidebar = table of contents,
main = the page you're reading.

---

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER (sticky)                                                                        │
│  ← Back to roles     Junior Frontend Developer        🌱 Beginner  ·  45 XP  [💬]      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────┬─────────────────────────────────────────────────────────────────┐
│  QUESTION SIDEBAR     │  MAIN STAGE AREA                                                │
│  (desktop: 240px)     │                                                                 │
│  (mobile: hidden)     │                                                                 │
│                       │                                                                 │
│  Q1  ● Easy           │  ┌────────────────────────────────────────────────────────┐    │
│  Q2  ○ Easy           │  │  STAGE PROGRESS BAR                                    │    │
│  Q3  ○ Easy           │  │  ① SCENE  ② WHY  ③ GUIDE  ④ PRACTICE  ⑤ DEBRIEF      │    │
│  ─────────────────    │  │  [████░░░░░░░░░░░░░░░░░░░]  Stage 1 of 5              │    │
│  Q4  ○ Medium         │  └────────────────────────────────────────────────────────┘    │
│  Q5  ○ Medium         │                                                                 │
│  Q6  ○ Medium         │  ┌────────────────────────────────────────────────────────┐    │
│  Q7  ○ Medium         │  │  MENTOR CARD                                           │    │
│  Q8  ○ Medium         │  │                                                        │    │
│  ─────────────────    │  │  👤  Alex Chen                                         │    │
│  Q9  ○ Hard           │  │     Senior Developer · ex-Atlassian · Sydney           │    │
│  Q10 ○ Hard           │  │  ─────────────────────────────────────────────────     │    │
│                       │  │                                                        │    │
│                       │  │  [streaming text appears here, word by word...]        │    │
│                       │  │                                                        │    │
│  ─────────────────    │  │  "Imagine it's your first week at Canva. Your          │    │
│  Session XP: 0        │  │   tech lead Emma asks you to look into a UI bug...▌"  │    │
│  Questions: 0/10      │  │                                                        │    │
│                       │  │  [Continue →]  ← appears after stream finishes        │    │
│                       │  └────────────────────────────────────────────────────────┘    │
│                       │                                                                 │
│                       │  +5 XP 🎉  ← XP toast (top-right, 1.5s then fades)            │
└───────────────────────┴─────────────────────────────────────────────────────────────────┘

                              [💬]  ← floating mentor chat button (bottom-right)
```

## Key Design Decisions

| Element | Decision | Why |
|---------|----------|-----|
| Sidebar groups Easy / Medium / Hard | Visual divider between difficulty tiers | User sees the progression path upfront — builds confidence |
| Main area is one card, not a deck | Single focused card, not swipeable | Removes "how many more clicks" anxiety |
| Stage progress bar (not stage tabs) | Linear bar with stage labels above | Tabs feel like navigation (can skip); a bar feels like a journey |
| Streaming text with `▌` cursor | Text appears word-by-word like a real person typing | The skill flagged "no motivation" as anti-pattern — live streaming text is inherently engaging |
| Continue button hidden during stream | Button only appears after stream finishes | Forces user to read/listen before moving on — like a real mentor speaking |
| XP toast (top-right, auto-dismiss) | Small "+5 XP" fade in/out | Reward without interrupting the flow |
| Alex's identity line | Name, role, past company, city | Grounds the AI as a real persona — not just a chatbot |
