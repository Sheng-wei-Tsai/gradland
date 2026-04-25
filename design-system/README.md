# Design System — TechPath AU

Extracted from the live site via [designlang](https://github.com/Manavarya09/design-extract) on 2026-04-25.
Design score: **82/100 (B)** — 5 known issues documented below.

## Files

| File | Purpose |
|------|---------|
| `design-tokens.json` | W3C DTCG v1 design tokens — import into Figma, Style Dictionary, or Token Studio |
| `extracted-variables.css` | CSS custom properties extracted from the live DOM |
| `design-language.md` | AI-optimized full design language (colors, type, spacing, shadows, motion) |
| `tailwind.config.js` | Tailwind theme if you ever migrate to Tailwind |
| `brand-voice.json` | Tone, pronoun posture, CTA verbs, heading style |
| `visual-dna.json` | Material language, imagery style, background patterns |
| `motion-tokens.json` | Duration tokens, easing families, keyframes in use |

## Re-extracting

```bash
# Run local server first
npm run start

# Then in another terminal
npm run design:extract
```

## Known Issues (from designlang score report)

| Issue | Score Impact | Notes |
|-------|-------------|-------|
| 26 distinct font sizes | Typography 40/100 | Many are computed px values from rem — the actual CSS scale is tight. Fine for now. |
| 5 font families detected | Typography 40/100 | Times + Arial are system fallbacks, not intentional. Space Grotesk + Lora + Caveat are the 3 real families. |
| 34 `!important` rules | Shadow/radius −10 | All legitimate: 3 for `prefers-reduced-motion`, rest override inline-style tech debt (§15 AGENTS.md). |
| 93% CSS unused | Info only | Next.js build + Turbopack handles dead-code elimination at build time. This is computed from the raw CSS file. |
| 895 duplicate declarations | Info only | Same reason — build-time deduplication handles this. Not a runtime concern. |

## Design tokens in use (source of truth: `app/globals.css`)

The actual tokens are in `app/globals.css` → `:root` and `[data-theme="dark"]`.
The files in this directory are **reference exports** for tooling — do not edit them by hand.
When you change a token in `globals.css`, re-run `npm run design:extract` to sync.
