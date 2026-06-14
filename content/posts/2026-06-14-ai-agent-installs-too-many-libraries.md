---
title: "Your AI Agent Installs Too Many Libraries"
date: "2026-06-14"
excerpt: "A new agent skill called ponytail cuts AI-generated code by 80–94% by teaching your agent to use native APIs instead of reaching for npm. Here's how it works and why it matters."
tags: ["AI", "Developer Tools", "Next.js"]
coverEmoji: "🐴"
auto_generated: true
source_url: "https://github.com/DietrichGebert/ponytail"
---

AI coding agents have a hoarding problem. You ask for a date picker and three packages appear in node_modules. You ask for email validation and a regex library gets installed. You ask for a countdown timer and suddenly you're shipping a 12kb dependency that wraps `Date`.

This isn't a hallucination problem. The models are doing exactly what they were trained to do — they've seen mountains of Stack Overflow answers and npm documentation recommending library solutions. The bias is baked in.

[ponytail](https://github.com/DietrichGebert/ponytail) (1,800+ GitHub stars in under a week) tries to fix this by injecting a character into your agent: the laziest senior developer in the office. He's been at the company fifteen years. He knows what the browser already does. He doesn't install things.

## What It Actually Does

Ponytail is an [Agent Skills](https://agentskills.io) format plugin. Drop it in your agent and it starts reaching for native APIs before reaching for npm:

```bash
npx skills add DietrichGebert/ponytail
```

The skill ships with a catalogue of "survivors" — examples of things AI agents commonly over-engineer, paired with the native alternative:

```html
<!-- what your agent writes without ponytail -->
<!-- installs flatpickr, adds stylesheet, wraps it in a component, debates timezones -->
<DatePicker onChange={handleDate} format="YYYY-MM-DD" />

<!-- with ponytail -->
<input type="date">
```

Same pattern for debouncing:

```ts
// without ponytail: installs lodash.debounce
import debounce from 'lodash.debounce';
const debouncedSearch = debounce(handleSearch, 300);

// with ponytail
let timer: ReturnType<typeof setTimeout>;
const debouncedSearch = (q: string) => {
  clearTimeout(timer);
  timer = setTimeout(() => handleSearch(q), 300);
};
```

Four lines. No dependency. Nothing to audit, update, or bundle.

## The Numbers

Tested across five everyday tasks (email validator, debounce, CSV sum, countdown timer, rate limiter), three models (Haiku, Sonnet, Opus), ten runs per cell:

- **80–94% less code** than the no-skill baseline
- **3–6× faster** completions
- **47–77% cheaper** on API costs

The gains hold across all three model tiers. Even Opus over-engineers without the skill. That tells you something: the tendency to reach for libraries isn't a capability gap the smarter models are growing out of. It's a training distribution problem, and a prompt-level fix can close most of it today.

## Why the "Lazy Senior Dev" Framing Works

Skills like ponytail are essentially prompt engineering with a persona anchor. "Use native APIs" as a raw instruction is abstract. "What would the guy who refuses to install anything do?" is concrete — the model has seen enough internet to simulate that character.

The skill description puts it well: *He says nothing. He writes one line. It works.*

That's a memorable heuristic the model can apply consistently. Generic instructions like "write minimal code" don't stick the same way.

## What I'd Build With This

**A native-first audit script for AI-generated code.** Before merging anything the agent wrote, run a pass that checks for common over-engineering patterns: lodash imported for one utility, moment.js used for date formatting, axios installed when `fetch` exists. Flag them and let the developer decide. Takes an hour to write, saves ongoing review effort.

**A custom ponytail fork for a specific stack.** The base skill is framework-agnostic. I'd fork it and add Supabase-specific rules: "use `supabase.rpc()` not a custom query wrapper", "use `supabase.storage` not an S3 library", "Supabase Realtime is already there — don't add a WebSocket library". Prune the agent's npm instinct at the tool level, not the code review stage.

**Cost tracking per feature across model tiers.** If ponytail is genuinely cutting token costs 47–77%, that's worth measuring. A simple log of tokens-per-feature with and without the skill, broken down by model tier, would let you make informed decisions about where to deploy it and whether the cheaper model is now viable for tasks you were routing to Sonnet.

## My Take

The interesting thing here isn't the library — it's the category. We're now writing skills that teach agents to forget bad habits. That's a different kind of tooling than a linter or a type checker. It's prompt-level culture change, packaged as an installable unit.

The skill format itself ([agentskills.io](https://agentskills.io)) is worth watching. It's an emerging standard for portable agent behaviour — skills that work across Claude Code, Copilot, and other agents without being tied to a specific tool's plugin format.

For anyone using AI coding assistants on a Next.js project: give ponytail a run. You'll either be surprised how much it changes the agent's output, or you'll discover your agent was already restrained. Either way, worth knowing.
