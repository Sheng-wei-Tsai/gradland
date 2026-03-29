---
title: "Build Reusable AI Agent Skills With slavingia/skills"
date: "2026-03-29"
excerpt: "Sahil Lavingia just open-sourced 10 Claude Code skills that turn the Minimalist Entrepreneur playbook into callable AI workflows. Here's what the skill format actually looks like and what you can build with it today."
tags: ["Claude Code", "AI Agents", "Open Source", "Next.js", "Developer Tools"]
coverEmoji: "🧠"
auto_generated: true
source_url: "https://github.com/slavingia/skills"
---

Claude Code's plugin system just got a lot more interesting. Sahil Lavingia (Gumroad founder) dropped [slavingia/skills](https://github.com/slavingia/skills) this week — 4,990 stars in seven days — and it's not the content that matters, it's the *format*. This repo is the clearest public example I've seen of how to package reusable, composable AI agent workflows as first-class Claude Code skills you can install, fork, and ship into your own projects.

## What a Claude Code Skill Actually Is

A skill is a structured prompt file — think of it as a typed interface for an AI workflow. Each skill in this repo maps to a slash command, declares its inputs, and ships a focused system prompt that keeps Claude on-task. The install is dead simple:

```bash
# Inside Claude Code
/plugin marketplace add slavingia/skills
/plugin install minimalist-entrepreneur
```

Or clone locally if you want to hack on the source before installing:

```bash
git clone https://github.com/slavingia/skills.git ~/.claude/plugins/skills
```

Then register it:

```
/plugin marketplace add ~/.claude/plugins/skills
/plugin install minimalist-entrepreneur
```

Once installed, you get ten slash commands — `/validate-idea`, `/mvp`, `/pricing`, `/first-customers`, and so on — each representing a discrete step in building a bootstrapped business. But again: the content is secondary. What I care about is the pattern.

## The Skill File Pattern Worth Stealing

Each skill is a self-contained file with a clear contract: a command name, a trigger description ("when to use this"), and a focused prompt. The minimalist-review skill, for example, exists purely to gut-check decisions against a single coherent philosophy. That's it. No sprawling mega-prompt trying to do everything.

This maps directly to how you'd want to structure AI workflows in a real product. Instead of one giant system prompt trying to handle every user intent, you decompose into skills — each with a single responsibility. In a Next.js app with Supabase, you'd expose these as API routes:

```typescript
// app/api/skills/validate-idea/route.ts
import { anthropic } from '@/lib/anthropic'

export async function POST(req: Request) {
  const { idea, context } = await req.json()

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: `You are running the validate-idea skill.
      Evaluate the business idea against these criteria:
      - Is there an existing community with this problem?
      - Can the founder reach them directly?
      - Is the problem painful enough to pay for?
      Return structured JSON with a viability score and specific next actions.`,
    messages: [{
      role: 'user',
      content: `Idea: ${idea}\nContext: ${context}`
    }]
  })

  // persist result to Supabase
  await supabase.from('skill_runs').insert({
    skill: 'validate-idea',
    input: { idea, context },
    output: response.content
  })

  return Response.json(response.content)
}
```

Each route is testable, cacheable, and auditable. Your Supabase `skill_runs` table becomes a full log of every agent action — which is exactly what you need for debugging and iterating on prompts in production.

## Composing Skills Into Workflows

The part that jumps out in slavingia/skills is the journey structure — skills are ordered deliberately. Community → Validate → Build → Processize → Sell. That's not just content organisation, that's a state machine.

You can model this directly:

```typescript
// lib/workflow.ts
const JOURNEY_STEPS = [
  'find-community',
  'validate-idea',
  'mvp',
  'processize',
  'first-customers',
  'pricing',
  'marketing-plan',
  'grow-sustainably',
  'company-values',
  'minimalist-review',
] as const

type SkillName = typeof JOURNEY_STEPS[number]

async function runNextSkill(projectId: string): Promise<SkillName> {
  const { data } = await supabase
    .from('skill_runs')
    .select('skill')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const lastSkill = data?.skill as SkillName | undefined
  const nextIndex = lastSkill
    ? JOURNEY_STEPS.indexOf(lastSkill) + 1
    : 0

  return JOURNEY_STEPS[nextIndex] ?? 'minimalist-review'
}
```

Now your app can guide users through the journey step by step, with AI driving each stage and Supabase tracking progress.

## What I'd Build With This

**Idea validation SaaS for solo founders.** A Next.js app where founders paste an idea, and it runs through `/find-community` → `/validate-idea` → `/mvp` automatically, storing each result in Supabase. Charge $9/month for unlimited validations. The skills format means you can iterate on the prompts server-side without touching the frontend.

**An internal decision-review tool for small teams.** Wire `/minimalist-review` and `/company-values` to a Slack bot. Any time someone proposes a new hire, a pricing change, or a feature, the bot runs both skills and posts a structured gut-check back into the thread. Takes a weekend to build.

**A prompt skill marketplace for your own Claude Code setup.** Fork the repo structure, build a `/plugin marketplace` equivalent for your domain — say, a set of skills for Rails devs covering database migrations, PR reviews, and deploy checklists. Publish it. The install pattern is already proven.

---

The real value of slavingia/skills isn't the Minimalist Entrepreneur content — you can read the book. It's that Sahil published a clean, real-world example of the Claude Code skill format at exactly the moment the ecosystem needs reference implementations. Fork it, gut the content, and drop in your own domain logic. The scaffolding is solid.
