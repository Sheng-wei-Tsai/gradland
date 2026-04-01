# Interview Prep — UX Wireframes

Design system generated using [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).

## Design Intelligence Applied

| Decision | Recommendation | Applied to this project |
|----------|---------------|------------------------|
| Pattern | Scroll-Triggered Storytelling | Stage-by-stage mentor narrative (SCENE → WHY → GUIDE → PRACTICE → DEBRIEF) |
| Style | Claymorphism (soft, chunky, rounded) + Soft UI Evolution | Warm cards with thick border-radius, soft shadows — adapted to existing CSS vars |
| Key effect | Progressive reveal, each chapter distinct | Each stage has a distinct visual weight and colour treatment |
| Anti-pattern to avoid | "No motivation" + "Boring design" | Alex's streaming voice replaces every static text block |
| CTA placement | End of each chapter + climax | "Continue" button only appears after mentor finishes streaming |

## Why This Design

The current flow failed because it treated interview prep as a **quiz** (show question → show answer → next).
Real learning works differently: you need **context, stakes, and narrative** before a concept sticks.

The skill flagged "Scroll-Triggered Storytelling" — meaning each stage should feel like turning a page in a story,
not clicking through a form. That's exactly why Alex streams the narration instead of displaying it statically.

## Wireframe Files

| File | Screen |
|------|--------|
| `01-role-selector.md` | `/interview-prep` — role grid landing page |
| `02-session-layout.md` | `/interview-prep/[role]` — overall layout |
| `03-scene-stage.md` | Stage 1: Alex sets the scenario |
| `04-why-guide-stages.md` | Stages 2–3: Alex explains and guides |
| `05-practice-debrief.md` | Stages 4–5: user answers, Alex debriefs |
