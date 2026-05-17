---
title: "CSS Without Tailwind: What Actually Works"
date: "2026-05-17"
excerpt: "Julia Evans published her Tailwind migration notes this week. Here's what the post gets right — and the techniques that hold up in a real production codebase."
tags: ["CSS", "Frontend", "Web Dev"]
coverEmoji: "🎨"
auto_generated: true
source_url: "https://jvns.ca/blog/2026/05/15/moving-away-from-tailwind--and-learning-to-structure-my-css-/"
---

Julia Evans published [her notes on moving away from Tailwind](https://jvns.ca/blog/2026/05/15/moving-away-from-tailwind--and-learning-to-structure-my-css-/) on Thursday and it hit 635 points on HN. I read it twice. Not because I'm considering the move — I already made it. I ripped Tailwind out of my own production app last year. What struck me is how closely her conclusions match what I stumbled onto, and where I'd push further.

This is the practical version: what actually holds up in a real codebase, not a weekend side project.

## The core insight Julia nails

The thesis of her post is: **Tailwind isn't magic. It's a system. You can build the same system yourself.**

That's correct. Tailwind gives you four concrete things: a CSS reset, a colour palette, a font scale, and utility classes. None of that is proprietary. When you leave Tailwind, you're not escaping structure — you're writing your structure explicitly instead of inheriting it implicitly.

The move from implicit to explicit is the whole game.

```css
/* What you had in Tailwind (implicit) */
/* text-lg → 1.125rem, line-height 1.75rem */

/* What you write directly */
:root {
  --size-lg: 1.125rem;
  --line-height-lg: 1.75rem;
}

h3 {
  font-size: var(--size-lg);
  line-height: var(--line-height-lg);
}
```

More verbose? Yes. But now your design system lives in your codebase, not inside a framework you're depending on.

## CSS custom properties as your design system

The single highest-leverage move is defining all your design decisions as CSS custom properties on `:root`. Colours, spacing, shadows, border radii — everything that needs to stay consistent.

```css
:root {
  /* Palette */
  --ink: #140a05;
  --cream: #fdf5e4;
  --vermilion: #c0281c;

  /* Component patterns */
  --panel-shadow: 4px 4px 0 var(--ink);
  --panel-border: 3px solid var(--ink);
}

[data-theme="dark"] {
  --ink: #f0e6d0;
  --cream: #07050f;
  --vermilion: #e84040;
  --panel-shadow: 4px 4px 0 rgba(232, 64, 64, 0.6);
}
```

Dark mode becomes a single data attribute swap. No Tailwind `dark:` prefixes scattered across 400 JSX files. When a designer says "make the shadow red in dark mode," you change one line.

This is what Julia is calling "colours.css" in her post. I'd extend it further: the token file is your entire design contract. If a value isn't in there, it shouldn't be hardcoded somewhere in a component.

## Component-scoped CSS with native nesting

Julia's approach of giving each component a root class and scoping everything inside it is solid. What I'd add: CSS native nesting is production-ready now. No preprocessor needed.

```css
.job-card {
  border: var(--panel-border);
  box-shadow: var(--panel-shadow);

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--ink);
  }

  & .job-card__title {
    font-size: var(--size-xl);
    font-family: 'Lora', serif;
  }

  & .job-card__tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
}
```

The component owns its own hover states, its own child layouts. You can delete this block and nothing else breaks. That's the property Tailwind utilities can't give you — true isolation.

## Grid with `auto-fit` is the responsive breakpoint killer

This is the technique I wish I'd found earlier. Julia mentions it briefly but it deserves more attention.

```css
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 1.5rem;
}
```

That single line replaces:

```html
<!-- Old Tailwind approach -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

The CSS version works at any container width, not just predefined breakpoints. It responds to the actual available space. Put it in a sidebar? It reflows. Put it full-width? It reflows. No media queries, no JavaScript.

`grid-template-areas` is the other one worth learning. Letting you name regions and rearrange them at different breakpoints is something Tailwind simply cannot express.

## Why I think the timing is right

Julia's stated reason for moving was partly build system fatigue — Tailwind v4 requires a bundler and her projects didn't want one. That's a legitimate reason.

But the deeper reason is that CSS landed features that didn't exist when Tailwind got popular: native nesting, `@layer`, `@import`, container queries, `:has()`. The platform caught up. The gap Tailwind was filling — "CSS is too painful to write directly" — is narrower now.

If you're starting a new project today, I'd seriously consider skipping Tailwind. The setup cost for vanilla CSS with custom properties is maybe two hours. The ongoing cost is lower than you'd expect.

## What I'd build with this

**A design token audit CLI** — scan a codebase and flag any hardcoded hex values that should be tokens. Something like `grep -rE '#[0-9a-fA-F]{3,6}'` but smarter: understands which values appear in multiple files and suggests what to token-ify first.

**A theme generator** — given a base colour, generate a full set of CSS custom properties (background, surface, text, accent, shadow) tuned for light and dark mode. Would save the "I need to build a dark mode" hour every new project costs.

**A component isolation checker** — parse a CSS file and warn when a selector inside a `.component-name` block targets something outside its scope. The architectural rule made explicit as a lint step.

---

I've been living with this approach for about a year now in a production app with multiple pages and components. The maintenance story is cleaner than I expected. When something looks wrong, I know exactly where to look: either a token is wrong, or the component CSS is wrong. No utility class archaeology.

Julia's post is worth reading in full if you haven't. The specific moves she makes translating from Tailwind concepts to vanilla CSS are concrete and worth stealing.
