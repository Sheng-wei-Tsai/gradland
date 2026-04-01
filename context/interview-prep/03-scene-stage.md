# Wireframe 03 — Stage 1: SCENE

## Use Case
This is the moment the user gets placed INTO the story. Alex doesn't ask the question cold —
he paints a scene first. The user reads it and thinks "oh, I know this situation" before the
question is even asked. The question emerges naturally from the story on the last line.

## Design Rationale
The UI UX Pro Max skill flagged "Scroll-Triggered Storytelling" with the note:
*"Narrative increases time-on-page 3x. Use progress indicator."*
The SCENE stage IS that narrative hook. It's not information — it's immersion.
The card uses a slightly warmer background (`--parchment`) vs the default `--warm-white`
to signal "you're in a story now, not a form."

---

```
┌────────────────────────────────────────────────────────────────────────┐
│  ① SCENE  ② WHY  ③ GUIDE  ④ PRACTICE  ⑤ DEBRIEF                      │
│  [██░░░░░░░░░░░░░░░░░░░░]                                              │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  background: var(--parchment)  ← slightly warmer than normal           │
│  border-radius: 20px                                                   │
│  box-shadow: soft, 2-layer                                             │
│                                                                        │
│   👤  Alex Chen                                                        │
│       Senior Developer · ex-Atlassian                                  │
│                                                                        │
│   ── 🎬  The Scene ──────────────────────────────────────────────      │
│                                                                        │
│   It's your first week at Canva. You've just pushed your first         │
│   feature — a live preview panel for the design editor. Your          │
│   tech lead Emma drops a message on Slack:                             │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │  💬 Emma  · just now                                       │       │
│   │  "Hey! The panel sometimes flickers on load. I think        │       │
│   │   it's a rendering lifecycle issue. Can you look into it?"  │       │
│   └────────────────────────────────────────────────────────────┘       │
│                                                                        │
│   You open the code. You see two hooks: useEffect and                  │
│   useLayoutEffect. Both look like they could work... but which         │
│   one is actually right here, and why?                                 │
│                                                                        │
│   In the next standup Emma turns to you and asks:                      │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │  🎯  "Can you walk me through the difference between        │       │
│   │       useEffect and useLayoutEffect, and when you'd         │       │
│   │       use one over the other?"                              │       │
│   └────────────────────────────────────────────────────────────┘       │
│                                                                        │
│   [ Easy ]  ·  React Hooks                          +5 XP pending      │
│                                                                        │
│                                    [ Got it — let's go → ]            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Why Each Element

| Element | Decision | Why |
|---------|----------|-----|
| Slack-style message bubble | Inlined quote from "Emma" | Makes the scenario feel real — not a hypothetical, a conversation |
| Question in a highlighted box | `--parchment` border + terracotta left-bar | The question stands out from the story without breaking the flow |
| Difficulty + category badges | Bottom-left, small, subtle | User gets context but it doesn't interrupt the narrative |
| `+5 XP pending` label | Shows the reward before they click | Motivation signal up-front per the skill's "no motivation = anti-pattern" rule |
| "Got it — let's go →" | Single CTA, full-width on mobile | Only one action available — no confusion |
| Stage label "🎬 The Scene" | Replaces "Stage 1" | Reinforces storytelling frame — this is cinema, not a form |
