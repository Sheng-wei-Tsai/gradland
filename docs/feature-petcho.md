# TamaAussie — 90s Handheld Virtual Pet (v2 Redesign)

A Henry Tsai original. Draws on the classic 90s handheld virtual pet aesthetic —
egg-shaped plastic shell, LCD screen, 3-button navigation — but built from scratch
with its own mechanics and deeply integrated into the blog.
**Goal:** Replace the CLI-terminal Petcho with a proper LCD handheld device
experience themed around Australian native wildlife, where **reading blog posts
is the primary progression currency**.

---

## What Changes (v1 → v2)

| Aspect | v1 (Petcho / CLI pet) | v2 (TamaAussie) |
|---|---|---|
| Shell visual | CSS terminal box | Egg-shaped plastic device |
| Screen | Green terminal text | LCD pixel art, 32×24 grid |
| Buttons | Rounded web buttons | 3 physical A / B / C buttons |
| Mechanics | Hunger + happiness only | Full Tamagotchi loop (see below) |
| Menu | None | 8-icon icon bar, button-navigated |
| Minigame | None | Left/Right guessing game |
| Sound | Web Audio synthesis | Retro chip-tone beeps |
| Evolution | 5 levels, XP bar | Life stages: Egg→Baby→Child→Teen→Adult→Old |
| Death | Never dies | Angel form after neglect |

---

## Core Game Loop

```
Hatch egg → name pet → feed / play / clean → respond to attention calls
  → discipline when misbehaving → watch pet evolve through life stages
  → share your adult form → read blog posts to refill food meter
```

---

## Stats & Decay

| Stat | Range | Decay Rate | Replenish |
|---|---|---|---|
| Hunger | 0–4 hearts | −1 per 30 min | Feed meal |
| Happiness | 0–4 hearts | −1 per 60 min | Play game / snack |
| Weight | 5–99 oz | −1 per 120 min | +1 meal / +2 snack |
| Age | 0–999 days | +1 per 24 hrs real time | — |
| Discipline | 0–100% | −5 per ignored call | Discipline action |
| Poop | 0–3 pieces | +1 per 3 hrs | Clean toilet |

---

## Life Stages & Evolution

Care quality (avg hunger + happiness maintained, discipline %, attention answered)
determines which Australian animal you get at each stage.

```
Egg        → hatches after 5 minutes
Baby       → blob/pixel egg sack (5 min)
Child      → Joey (neutral, ~1 hr)
Teen       → depends on discipline + care (24 hrs real)
  ↳ Good   : Quokka Teen
  ↳ Average: Wallaby Teen
  ↳ Bad    : Cassowary Teen (aggressive)
Adult      → depends on overall care score (3–7 days real)
  ↳ Perfect: Quokka / Platypus / Sugar Glider
  ↳ Good   : Kookaburra / Wombat / Echidna
  ↳ Average: Possum / Wallaby
  ↳ Bad    : Thylacine (rare ghost form — bad care Easter egg)
Old        → elder form (day 10+)
Angel      → death by neglect (hunger=0 for 4+ hrs OR sick untreated 2+ hrs)
```

Evolution is revealed with a flash animation + pixel confetti + retro jingle.

---

## Menu Icons (A = prev, B = select, C = next)

| # | Icon | Action |
|---|---|---|
| 1 | 🍔 Food | Choose Meal (hunger+2, weight+1) or Snack (happy+1, weight+2) |
| 2 | 💡 Light | Toggle sleep light on/off |
| 3 | 🎮 Game | Left/Right guessing minigame |
| 4 | 💊 Medicine | Cure sickness |
| 5 | 🚿 Toilet | Clean poop tiles |
| 6 | 📊 Status | Show age, weight, hunger hearts, happy hearts, discipline |
| 7 | 🎓 Discipline | Scold during attention call for discipline points |
| 8 | 📢 Call | Attention indicator — lit when pet needs you |

---

## Left/Right Minigame

```
Pet randomly faces LEFT or RIGHT (hidden from player, shown after guess)
Player guesses: A=LEFT, C=RIGHT
Round won → happy chirp; round lost → sad tone
Best of 5 rounds: wins ≥ 3 → happiness +1
```

---

## Attention Call System

- Pet randomly calls for attention every 1–4 hrs (icon 8 flashes)
- Sometimes it's a fake call (pet is misbehaving — must use Discipline, not respond)
- Answering a real call → discipline −0 (neutral)
- Disciplining a real call → discipline −5 (mistake)
- Ignoring any call for 30 min → discipline −10
- Answering a fake call → discipline −5

---

## Sickness

- If poop sits for 4+ hrs → pet gets sick (X marks on body)
- If hunger hits 0 → pet gets sick after 30 min
- Must administer medicine (icon 4); two doses cure sickness
- Untreated 2+ hrs → angel / death

---

## LCD Screen Rendering

- Canvas: 128×128 px actual, 32×32 logical pixel grid (4×4 scaling)
- Palette: `bg=#9aba6c`, `dark=#2d4b1e`, `mid=#5a8a3c`
- `imageSmoothingEnabled = false` for crisp pixels
- CRT scanline overlay (CSS `repeating-linear-gradient`)
- All sprites hand-drawn pixel art in a 15×15 sprite area
- Icon bar: 8 icons at top (2×2px each, selected = inverted)
- Animation states: idle, happy, eating, sleeping, sick, pooping, attention, game, dead
- 30fps animation loop via `requestAnimationFrame`

---

## Blog Post Integration — Reading = XP + Food

Reading posts is the **main progression loop**. Without it, evolution stalls.

| Action | Reward |
|---|---|
| Feed a post (first time) | hunger +2, XP +readingMinutes, confetti burst |
| Feed same post again | hunger +1 only (no XP — pet already knows it) |
| Read a coding post | +bonus 5 XP (pet loves tech content) |
| Read 3 posts in one session | happiness +1 (reading streak bonus) |
| Read all posts in a category | unlock secret species hint |

XP gates evolution — you cannot evolve past Child without feeding at least 3 posts.
Teen→Adult requires 10 total posts fed. Food type shown by tag (🔮 AI, 🐛 code, 🥭 travel, 🌿 life, 🦗 default).
`FeedButton` on each blog post: feeds pet, plays eat animation remotely via localStorage event.
Posts tracked in `tama_fed` key so each post gives full XP only once per pet lifetime.

---

## Sound (Web Audio API — zero external files)

| Event | Sound |
|---|---|
| Button press | Short 400hz click (5ms) |
| Happy | Ascending 3-note arpeggio |
| Eating | Nom nom (two quick pops) |
| Level up / evolve | 8-note jingle |
| Attention call | Repeating high beep |
| Sick | Low descending tone |
| Death | Slow 4-note descending dirge |
| Game win | Quick up trill |
| Game lose | Descending buzz |

---

## Component Architecture

```
components/tama/
  types.ts          — TamaState, LifeStage, MenuIcon, AnimState, EvolutionPath
  engine.ts         — tick(), evolve(), shouldCall(), isRealCall(), applyAction()
  sprites.ts        — draw* functions for each sprite (Canvas 2D, 15×15 grid)
  sounds.ts         — AudioEngine singleton, all synthesized sounds
  TamaDevice.tsx    — Egg shell CSS, A/B/C buttons, mounts screen
  TamaScreen.tsx    — Canvas renderer, animation loop, menu rendering
  useTama.ts        — React hook: load/save localStorage, tick interval, actions
  TamaSection.tsx   — Page wrapper for /about (replaces PetchoSection)
```

### TamaState (localStorage: `tama_pet`)
```ts
interface TamaState {
  name:         string;          // player-given
  stage:        LifeStage;       // egg | baby | child | teen | adult | old | angel
  species:      string;          // species id, resolved at each evolution
  age:          number;          // real days since hatch
  weight:       number;          // oz
  hunger:       number;          // 0–4
  happiness:    number;          // 0–4
  discipline:   number;          // 0–100
  poopCount:    number;          // 0–3
  sick:         boolean;
  sleeping:     boolean;
  careScore:    number;          // running tally for evolution quality
  totalPets:    number;
  lastTick:     number;          // Date.now() — offline decay reference
  lastEvolve:   number;          // timestamp of last evolution
  callPending:  boolean;
  callIsReal:   boolean;
  medicineCount: number;         // 0–2 doses given this sickness
}
```

---

## Preserved from v1

- `FeedButton.tsx` — blog post feeding (updates tama_pet hunger)
- `PetShareCard.tsx` — shareable canvas card (update to show tama species sprite)
- `PetCreator.tsx` → renamed/replaced by `TamaHatch.tsx` (name + hatch sequence)

---

## Implementation Order

1. `types.ts` — interfaces + constants
2. `engine.ts` — pure tick/action logic (no React, fully testable)
3. `sprites.ts` — pixel art draw functions for all species
4. `sounds.ts` — Web Audio synthesis
5. `useTama.ts` — React hook wiring engine + localStorage
6. `TamaScreen.tsx` — canvas renderer + animation loop
7. `TamaDevice.tsx` — physical shell + buttons
8. `TamaHatch.tsx` — name + first hatch flow
9. `TamaSection.tsx` — page wrapper
10. Update `/about` page + `FeedButton`
