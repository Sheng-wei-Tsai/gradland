# Wireframe 05 — Stages 4 & 5: PRACTICE + DEBRIEF

## Use Case
Henry has understood the concept. Now Alex steps back and says "your turn."
Henry types his answer as if he's in the real interview — in the context of the Canva scenario.
After submitting, Alex streams a scored debrief — what worked, what was missing,
and a polished version of the answer Henry can internalise.

---

## Stage 4: PRACTICE

```
┌────────────────────────────────────────────────────────────────────────┐
│  ✓ SCENE  ✓ WHY  ✓ GUIDE  ④ PRACTICE  ⑤ DEBRIEF                      │
│  [████████████░░░░░░░░░░░░]                                            │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│   👤  Alex Chen                                                        │
│                                                                        │
│   ── 🎤  Your Turn ─────────────────────────────────────────────────   │
│                                                                        │
│   Emma is looking at you. Answer as if you're in that standup.        │
│   Take your time — there's no timer.                                   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │  💬  "Can you walk me through the difference between        │       │
│   │       useEffect and useLayoutEffect?"                       │       │
│   └────────────────────────────────────────────────────────────┘       │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │                                                            │       │
│   │  Sure! The main difference is timing. useEffect runs       │       │
│   │  after React updates the DOM and the browser has           │       │
│   │  painted...                                                │       │
│   │                                                            │       │
│   │  [textarea — auto-grows, min 5 rows]                       │       │
│   │                                                            │       │
│   └────────────────────────────────────────────────────────────┘       │
│                                                                        │
│   Characters: 143                    [ Skip ]  [ Submit → +50 XP ]    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Stage 5: DEBRIEF (streaming)

```
┌────────────────────────────────────────────────────────────────────────┐
│  ✓ SCENE  ✓ WHY  ✓ GUIDE  ✓ PRACTICE  ⑤ DEBRIEF                      │
│  [████████████████████░░░░]  ← filling...                              │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│   👤  Alex Chen                                                        │
│                                                                        │
│   ── 📊  Debrief ──────────────────────────────────────────────────    │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │  Score: 78/100  ⭐⭐⭐⭐                                    │       │
│   └────────────────────────────────────────────────────────────┘       │
│                                                                        │
│   Good start — you nailed the timing difference, and that's the        │
│   most important part.                                                  │
│                                                                        │
│   ✅  What landed:                                                      │
│   · Correctly identified useEffect fires after paint                   │
│   · Mentioned the DOM is updated before the effect runs                │
│                                                                        │
│   ⚠️  What was missing:                                                 │
│   · You didn't mention the "layout flicker" use case — that's          │
│     exactly the bug Emma described. Connecting your answer to          │
│     the scenario is what makes you stand out.                          │
│   · No code example — even a one-liner strengthens it                  │
│                                                                        │
│   💡  How a 90+ answer sounds:                                         │
│   ┌────────────────────────────────────────────────────────────┐       │
│   │  "useEffect runs after the browser paints, so the user      │       │
│   │   briefly sees the old state. useLayoutEffect fires before  │       │
│   │   paint — ideal for measuring DOM size or avoiding flicker  │       │
│   │   like in Emma's preview panel bug."                        │       │
│   └────────────────────────────────────────────────────────────┘       │
│                                                                        │
│   You've earned +50 XP. Strong effort.  ▌                              │
│                                                                        │
│             [ Retry ]          [ Next Question → ]                    │
└────────────────────────────────────────────────────────────────────────┘
```

## Why Each Element

| Element | Decision | Why |
|---------|----------|-----|
| Scenario box stays visible in practice | The question is shown in context again | User answered without looking at notes in WHY/GUIDE — this mirrors a real interview |
| Auto-growing textarea | Grows with content | Doesn't feel like a form field; feels like a writing space |
| Character count | Bottom of textarea | Subtle signal to write a complete answer — not one sentence |
| `[ Skip ]` option | Lowercase, lower visual weight | Skip is valid (maybe they already know this one) but it shouldn't be tempting |
| Score + stars | Prominent, top of debrief | Immediate reward signal — gives the user a number to beat next time |
| ✅ / ⚠️ sections | Separated positive and critical | Mirroring how real mentors give feedback — celebrate first, then improve |
| "How a 90+ answer sounds" | Concrete improved version in a box | The most actionable thing Alex can give — a model to memorise |
| Alex ties feedback back to Emma's scenario | "exactly the bug Emma described" | Closes the narrative loop — the story that started in SCENE resolves here |
| `[ Retry ]` + `[ Next Question → ]` | Two equal-weight actions | Some users will want to try again; others will move on — respect both |
