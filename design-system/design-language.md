# Design Language: TechPath AU — Career tools for international IT grads

> Extracted from `http://localhost:3000` on April 25, 2026
> 796 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#c0281c` | rgb(192, 40, 28) | hsl(4, 75%, 43%) | 31 |
| Secondary | `#0000ee` | rgb(0, 0, 238) | hsl(240, 100%, 47%) | 51 |
| Accent | `#fdf5e4` | rgb(253, 245, 228) | hsl(41, 86%, 94%) | 2 |

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#140a05` | hsl(20, 60%, 5%) | 1023 |
| `#000000` | hsl(0, 0%, 0%) | 166 |
| `#ffffff` | hsl(0, 0%, 100%) | 30 |

### Background Colors

Used on large-area elements: `#fdf5e4`, `#fffef6`

### Text Colors

Text color palette: `#000000`, `#140a05`, `#ffffff`, `#3d1c0e`, `#0000ee`, `#7a5030`, `#c0281c`, `#1e7a52`

### Gradients

```css
background-image: linear-gradient(135deg, rgb(192, 40, 28) 0%, rgb(200, 138, 20) 100%);
```

```css
background-image: linear-gradient(rgb(192, 40, 28) 0%, rgb(200, 138, 20) 100%);
```

```css
background-image: linear-gradient(90deg, rgba(0, 0, 0, 0), rgb(192, 40, 28) 20%, rgb(200, 138, 20) 50%, rgb(192, 40, 28) 80%, rgba(0, 0, 0, 0));
```

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#140a05` | text, border | 1023 |
| `#3d1c0e` | text, border | 209 |
| `#000000` | text, border | 166 |
| `#7a5030` | text, border | 86 |
| `#0000ee` | text, border | 51 |
| `#c0281c` | background, text, border | 31 |
| `#e8d5a8` | border, background | 31 |
| `#ffffff` | text, border, background | 30 |
| `#1e7a52` | background, text, border | 10 |
| `#fdf5e4` | background | 2 |

## Typography

### Font Families

- **Space Grotesk** — used for body (700 elements)
- **Times** — used for body (58 elements)
- **Arial** — used for body (17 elements)
- **Lora** — used for all (16 elements)
- **Caveat** — used for body (5 elements)

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 60.8px | 3.8rem | 700 | 69.92px | -1.216px | h1, br, span |
| 25.6px | 1.6rem | 700 | 28.16px | normal | span |
| 22.4px | 1.4rem | 400 | 38.08px | normal | span, h2 |
| 18.4px | 1.15rem | 700 | 31.28px | normal | div |
| 17px | 1.0625rem | 400 | 28.9px | normal | body, div, header, nav |
| 16.8px | 1.05rem | 400 | 29.4px | normal | p, h2, svg, path |
| 16px | 1rem | 400 | normal | normal | html, head, meta, link |
| 15.2px | 0.95rem | 700 | 25.84px | normal | a |
| 14.4px | 0.9rem | 600 | 24.48px | normal | a, div, p |
| 14.08px | 0.88rem | 600 | 16.896px | normal | a, button, svg, path |
| 13.6px | 0.85rem | 600 | 23.12px | 0.68px | p, a, span |
| 13.44px | 0.84rem | 400 | 22.848px | normal | a, svg, path, rect |
| 13.3333px | 0.8333rem | 400 | normal | normal | button, div, svg, circle |
| 13.28px | 0.83rem | 600 | 22.576px | normal | a |
| 13.12px | 0.82rem | 400 | 22.304px | normal | span, p |

### Heading Scale

```css
h1 { font-size: 60.8px; font-weight: 700; line-height: 69.92px; }
h2 { font-size: 22.4px; font-weight: 400; line-height: 38.08px; }
h2 { font-size: 16.8px; font-weight: 400; line-height: 29.4px; }
```

### Body Text

```css
body { font-size: 11.68px; font-weight: 500; line-height: 19.856px; }
```

### Font Weights in Use

`400` (701x), `600` (33x), `500` (32x), `700` (30x)

## Spacing

**Base unit:** 2px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-1 | 1px | 0.0625rem |
| spacing-12 | 12px | 0.75rem |
| spacing-16 | 16px | 1rem |
| spacing-23 | 23px | 1.4375rem |
| spacing-28 | 28px | 1.75rem |
| spacing-32 | 32px | 2rem |
| spacing-40 | 40px | 2.5rem |
| spacing-48 | 48px | 3rem |
| spacing-64 | 64px | 4rem |
| spacing-96 | 96px | 6rem |
| spacing-252 | 252px | 15.75rem |
| spacing-272 | 272px | 17rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| xs | 2px | 7 |
| md | 8px | 9 |
| lg | 12px | 7 |
| full | 50px | 1 |
| full | 99px | 1 |

## Box Shadows

**xs** — blur: 0px
```css
box-shadow: rgb(20, 10, 5) 1px 1px 0px 0px;
```

**xs** — blur: 0px
```css
box-shadow: rgba(20, 10, 5, 0.3) 2px 2px 0px 0px;
```

**xs** — blur: 0px
```css
box-shadow: rgba(20, 10, 5, 0.2) 2px 2px 0px 0px;
```

**xs** — blur: 0px
```css
box-shadow: rgb(20, 10, 5) 2px 2px 0px 0px;
```

**sm** — blur: 0px
```css
box-shadow: rgba(20, 10, 5, 0.14) 3px 3px 0px 0px;
```

**sm** — blur: 0px
```css
box-shadow: rgb(20, 10, 5) 3px 3px 0px 0px;
```

**sm** — blur: 0px
```css
box-shadow: rgb(20, 10, 5) 4px 4px 0px 0px;
```

**md** — blur: 10px
```css
box-shadow: rgba(180, 60, 40, 0.2) 0px 2px 10px 0px;
```

## CSS Custom Properties

### Colors

```css
--panel-border: 3px solid #140a05;
--text-secondary: #3d1c0e;
--text-primary: #140a05;
--text-muted: #7a5030;
--shadow-color: #140a051a;
```

### Spacing

```css
--font-space: "Space Grotesk", "Space Grotesk Fallback";
```

### Typography

```css
--font-lora: "Lora", "Lora Fallback";
--font-caveat: "Caveat", "Caveat Fallback";
```

### Shadows

```css
--panel-shadow: 4px 4px 0 #140a05;
--panel-shadow-lg: 6px 6px 0 #140a05;
```

### Other

```css
--gold: #c88a14;
--vermilion-light: #e03828;
--sage: #1e7a52;
--lightningcss-dark: ;
--gold-light: #e0a020;
--terracotta: #c0281c;
--forest: #140a05;
--lightningcss-light: ;
--parchment: #e8d5a8;
--glow: none;
--amber: #c88a14;
--terracotta-light: #e03828;
--brown-dark: #140a05;
--vermilion: #c0281c;
--cream: #fdf5e4;
--jade: #1e7a52;
--brown-mid: #3d1c0e;
--ink: #140a05;
--warm-white: #fffef6;
--brown-light: #7a5030;
```

### Semantic

```css
success: [object Object];
warning: [object Object];
error: [object Object];
info: [object Object];
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| sm | 600px | max-width |
| sm | 640px | max-width |
| md | 768px | max-width |

## Transitions & Animations

**Easing functions:** `[object Object]`, `[object Object]`

**Durations:** `0.4s`, `0.15s`, `0.2s`, `0.3s`, `0.56s`, `0.25s`, `0.18s`

### Common Transitions

```css
transition: all;
transition: background-color 0.4s, color 0.4s;
transition: top 0.15s;
transition: 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
transition: transform 0.2s;
transition: border-color 0.3s, box-shadow 0.3s;
transition: transform 0.56s cubic-bezier(0.4, 0, 0.2, 1);
transition: fill 0.25s;
transition: stroke 0.25s;
transition: 0.15s;
```

### Keyframe Animations

**fadeUp**
```css
@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0px); }
}
```

**brushReveal**
```css
@keyframes brushReveal {
  0% { opacity: 0; transform: translate(-24px) scaleX(0.92); }
  100% { opacity: 1; transform: translate(0px) scaleX(1); }
}
```

**inkDrop**
```css
@keyframes inkDrop {
  0% { opacity: 0; transform: scale(0.7) rotate(-4deg); }
  60% { opacity: 1; transform: scale(1.04) rotate(0.5deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
```

**lanternFloat**
```css
@keyframes lanternFloat {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-12px) rotate(1deg); }
}
```

**bambooSway**
```css
@keyframes bambooSway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
```

**petalDrift**
```css
@keyframes petalDrift {
  0% { opacity: 0; transform: translateY(-20px) translate(0px) rotate(0deg); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translateY(100px) translate(40px) rotate(360deg); }
}
```

**yinYangRoll**
```css
@keyframes yinYangRoll {
  0% { transform: rotate(0deg) scale(1); }
  20% { transform: rotate(80deg) scale(0.88); }
  50% { transform: rotate(200deg) scale(0.82); }
  75% { transform: rotate(340deg) scale(0.94); }
  88% { transform: rotate(380deg) scale(1.06); }
  100% { transform: rotate(360deg) scale(1); }
}
```

**chiRipple**
```css
@keyframes chiRipple {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(2.2); }
}
```

**glowPulse**
```css
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 12px var(--vermilion), 0 0 24px #e840404d; }
  50% { box-shadow: 0 0 20px var(--vermilion), 0 0 40px #e8404080; }
}
```

**scrollUnfurl**
```css
@keyframes scrollUnfurl {
  0% { opacity: 0; clip-path: inset(0px 0px 100%); transform: translateY(30px); }
  100% { opacity: 1; clip-path: inset(0px 0px 0%); transform: translateY(0px); }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (10 instances)

```css
.button {
  background-color: rgb(192, 40, 28);
  color: rgb(61, 28, 14);
  font-size: 13.3333px;
  font-weight: 400;
  padding-top: 4.224px;
  padding-right: 12.672px;
  border-radius: 4px;
}
```

### Cards (5 instances)

```css
.card {
  background-color: rgb(255, 254, 246);
  border-radius: 8px;
  box-shadow: rgb(20, 10, 5) 4px 4px 0px 0px;
  padding-top: 20.8px;
  padding-right: 24px;
}
```

### Links (35 instances)

```css
.link {
  color: rgb(61, 28, 14);
  font-size: 13.44px;
  font-weight: 400;
}
```

### Navigation (14 instances)

```css
.navigatio {
  background-color: rgba(253, 245, 228, 0.88);
  color: rgb(61, 28, 14);
  padding-top: 2.4px;
  padding-bottom: 2.4px;
  padding-left: 0px;
  padding-right: 0px;
  position: static;
  box-shadow: rgba(20, 10, 5, 0.14) 3px 3px 0px 0px;
}
```

### Footer (16 instances)

```css
.foote {
  background-color: rgb(255, 254, 246);
  color: rgb(61, 28, 14);
  padding-top: 2.4px;
  padding-bottom: 2.4px;
  font-size: 13.44px;
}
```

### Badges (15 instances)

```css
.badge {
  background-color: rgb(232, 213, 168);
  color: rgb(61, 28, 14);
  font-size: 10.88px;
  font-weight: 600;
  padding-top: 1.9584px;
  padding-right: 8.16px;
  border-radius: 4px;
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(61, 28, 14);
  padding: 4.224px 12.672px 4.224px 12.672px;
  border-radius: 4px;
  border: 0px none rgb(61, 28, 14);
  font-size: 14.08px;
  font-weight: 600;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 50%;
  border: 2px solid rgba(20, 10, 5, 0.2);
  font-size: 13.3333px;
  font-weight: 400;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgb(255, 254, 246);
  color: rgb(0, 0, 238);
  padding: 20.8px 24px 20.8px 24px;
  border-radius: 8px;
  border: 3px solid rgb(20, 10, 5);
  font-size: 17px;
  font-weight: 400;
```

## Layout System

**2 grid containers** and **71 flex containers** detected.

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 720px | 24px |
| 760px | 24px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 3-column | 1x |
| 2-column | 1x |

### Grid Templates

```css
grid-template-columns: 340px 340px;
gap: 32px;
grid-template-columns: 217.594px 217.609px 217.609px;
gap: 9.6px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/nowrap | 45x |
| column/nowrap | 18x |
| row/wrap | 8x |

**Gap values:** `12px`, `13.6px`, `16px`, `3.2px`, `32px`, `4.224px`, `4px`, `5.6px`, `5.88px`, `6.4px`, `7.2px`, `8px`, `9.6px`

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 24 passing, 0 failing color pairs

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#3d1c0e` | `#e8d5a8` | 10.59:1 | AAA |
| `#140a05` | `#fffef6` | 19.3:1 | AAA |
| `#ffffff` | `#c0281c` | 5.9:1 | AA |
| `#3d1c0e` | `#fffef6` | 15.14:1 | AAA |

## Design System Score

**Overall: 82/100 (Grade: B)**

| Category | Score |
|----------|-------|
| Color Discipline | 100/100 |
| Typography Consistency | 40/100 |
| Spacing System | 100/100 |
| Shadow Consistency | 90/100 |
| Border Radius Consistency | 90/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- 5 font families — consider limiting to 2 (heading + body)
- 26 distinct font sizes — consider a tighter type scale
- 34 !important rules — prefer specificity over overrides
- 93% of CSS is unused — consider purging
- 895 duplicate CSS declarations

## Gradients

**3 unique gradients** detected.

| Type | Direction | Stops | Classification |
|------|-----------|-------|----------------|
| linear | 135deg | 2 | brand |
| linear | — | 2 | brand |
| linear | 90deg | 5 | complex |

```css
background: linear-gradient(135deg, rgb(192, 40, 28) 0%, rgb(200, 138, 20) 100%);
background: linear-gradient(rgb(192, 40, 28) 0%, rgb(200, 138, 20) 100%);
background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgb(192, 40, 28) 20%, rgb(200, 138, 20) 50%, rgb(192, 40, 28) 80%, rgba(0, 0, 0, 0));
```

## Z-Index Map

**4 unique z-index values** across 4 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 9999,9999 | a.s.k.i.p.-.t.o.-.c.o.n.t.e.n.t |
| dropdown | 100,100 | nav.m.o.b.i.l.e.-.b.o.t.t.o.m.-.n.a.v |
| sticky | 50,50 | header |
| base | 1,1 | div, main, footer |

## SVG Icons

**17 unique SVG icons** detected. Dominant style: **outlined**.

| Size Class | Count |
|------------|-------|
| xs | 14 |
| sm | 2 |
| lg | 1 |

**Icon colors:** `currentColor`, `#140a05`, `#fdfef6`, `rgba(20,10,5,0.7)`, `rgb(0, 0, 0)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Space Grotesk | self-hosted | 300, 400, 500, 600, 700 | normal |
| Lora | self-hosted | 400, 500, 600, 700 | italic, normal |
| Caveat | self-hosted | 500, 600 | normal |

## Motion Language

**Feel:** springy · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `150ms` | 150 |
| `sm` | `180ms` | 180 |
| `md` | `300ms` | 300 |
| `lg` | `560ms` | 560 |

### Easing Families

- **spring** (28 uses) — `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **custom** (1 uses) — `cubic-bezier(0.4, 0, 0.2, 1)`

### Spring / Overshoot Easings

- `cubic-bezier(0.34, 1.56, 0.64, 1)`

### Keyframes In Use

| name | kind | properties | uses |
|---|---|---|---|
| `fadeUp` | slide-y | opacity, transform | 3 |

## Component Anatomy

### button — 4 instances

**Slots:** label, icon

### card — 3 instances


## Brand Voice

**Tone:** neutral · **Pronoun:** you-only · **Headings:** Title Case (verbose)

### Top CTA Verbs

- **posts** (1)
- **learn** (1)
- **au** (1)

### Button Copy Patterns

- "posts" (1×)
- "learn" (1×)
- "au insights" (1×)

### Sample Headings

> Getting your first IT job
in Australia is harder
than it should be.
> Writing activity
> Recent writing
> Browser Harness: Give Your LLM a Real Browser and Get Out of the Way
> Self-Healing Browser Automation with browser-harness and Next.js
> Getting your first IT job
in Australia is harder
than it should be.
> Recent writing
> Browser Harness: Give Your LLM a Real Browser and Get Out of the Way
> Self-Healing Browser Automation with browser-harness and Next.js
> CodeBurn: Track Your AI Coding Spend Before It Tracks You

## Page Intent

**Type:** `landing` (confidence 0.61)
**Description:** Resume analyser, AI interview prep, visa tracker, salary checker, and learning paths — built for international IT graduates in Australia.

Alternates: blog-post (0.35)

## Section Roles

Reading order (top→bottom): nav → nav → nav → steps → testimonial → content → testimonial → content → footer → content

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | nav | — | 0.4 |
| 1 | nav | — | 0.9 |
| 2 | nav | — | 0.9 |
| 3 | steps | Getting your first IT job
in Australia is harder
than it should be. | 0.75 |
| 4 | testimonial | Getting your first IT job
in Australia is harder
than it should be. | 0.8 |
| 5 | content | — | 0.3 |
| 6 | testimonial | — | 0.8 |
| 7 | content | Recent writing | 0.3 |
| 8 | footer | — | 0.95 |
| 9 | content | — | 0.3 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.511 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 99px |
| backdrop-filter in use | no |
| Gradients | 3 |

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Space Grotesk` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
