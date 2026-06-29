---
title: "Evaluating Your AI Agents Without Vibes"
date: "2026-06-29"
excerpt: "You've added Claude to your app. How do you actually know it works? A practical guide to LLM evals that go beyond manual spot-checking."
tags: ["AI", "Testing", "TypeScript", "LLMs"]
coverEmoji: "🔬"
auto_generated: true
source_url: "https://github.com/benchflow-ai/awesome-evals"
---

The pattern I see constantly: developer adds an LLM to their app, manually tests a few prompts, says "looks good," and ships. Three weeks later users are filing bug reports about bizarre outputs and the developer has no idea what changed or why.

This week `benchflow-ai/awesome-evals` hit 576 stars in seven days on GitHub. It's a curated resource for building proper eval harnesses for AI agents — not just a link dump, but annotated and verified, with a companion `PATTERNS.md` full of runnable code. Worth understanding what it advocates for and why it matters right now.

## Why "it looked good" isn't an eval

When you write a regular function, you write unit tests. When that function calls an LLM, most developers suddenly abandon that discipline and switch to vibes-based QA.

The problem: LLM outputs are non-deterministic and context-sensitive. A prompt that works today can silently degrade after you tweak system instructions elsewhere. A new Claude version drops and your carefully tuned few-shots behave differently. Your production inputs have a distribution you didn't anticipate in dev.

You need systematic evals. The good news: you don't need a research team to do this.

## The three-tier eval stack

Think of evals in tiers, from cheapest to most expensive:

**Tier 1 — Code assertions.** Fast, deterministic, zero LLM cost. Check things like: does the output contain valid JSON? Does it include a field named `summary`? Is the word count under 200? Is no competitor brand name mentioned? These run in milliseconds and catch obvious regressions.

```typescript
function assertJobSummary(output: string): void {
  const parsed = JSON.parse(output); // throws on malformed JSON
  if (!parsed.summary || typeof parsed.summary !== 'string') {
    throw new Error('Missing or invalid summary field');
  }
  if (parsed.summary.length > 500) {
    throw new Error(`Summary too long: ${parsed.summary.length} chars`);
  }
}
```

**Tier 2 — LLM-as-judge.** Use a cheaper, faster model (Haiku) to evaluate whether a more expensive model's (Sonnet/Opus) output meets a criterion. Scales to thousands of traces without manual review. The key insight from `awesome-evals`: make every judge **binary pass/fail**, not a 1–5 scale. A 3 vs 4 rating is noise. Pass/fail forces a crisp decision.

```typescript
async function judgeJobSummary(
  input: string,
  output: string,
  client: Anthropic
): Promise<{ pass: boolean; critique: string }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `You are evaluating an AI-generated job summary.
      
[Job description]: ${input}
[Generated summary]: ${output}

Criterion: The summary must accurately represent the role's key requirements 
in plain language, without adding claims not present in the original.

First explain your reasoning briefly, then output exactly one of: PASS or FAIL`
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const pass = text.trim().endsWith('PASS');
  return { pass, critique: text };
}
```

**Tier 3 — Human review.** You can't skip this entirely, but you can minimise it. Use human labels to validate that your LLM judge actually agrees with humans — the `PATTERNS.md` recommends checking TPR and TNR separately, not just raw agreement rate. A judge can hit 80% overall agreement while missing most of your actual failures.

## CI gating — the missing piece

Evals are useless if you only run them manually. The step most teams skip: add a regression dataset and gate deploys on it.

The pattern: maintain a JSON file of `(input, expected_pass)` pairs. Add new cases whenever a bug is reported. Run this in CI and block deploy if pass rate drops below your threshold.

```typescript
// scripts/eval-ci.ts
import { evalDataset } from './eval-dataset.json'; // array of {input, expectedPass}

let passed = 0;
const results = [];

for (const { input, expectedPass } of evalDataset) {
  const output = await generateJobSummary(input);
  const { pass, critique } = await judgeJobSummary(input, output, anthropic);

  if (pass === expectedPass) passed++;
  else results.push({ input, output, critique, expectedPass });
}

const passRate = passed / evalDataset.length;
console.log(`Pass rate: ${(passRate * 100).toFixed(1)}%`);

if (passRate < 0.90) {
  console.error('Failures:');
  results.forEach(r => console.error(r));
  process.exit(1); // block deploy
}
```

Add `npx tsx scripts/eval-ci.ts` to your CI pipeline. Now prompt changes get the same regression protection as code changes.

## What I'd build with this

**Resume analyser regression suite.** Every time a user reports a bad analysis, add that resume + the expected output quality label to the eval set. After 50 cases, you have a regression dataset that actually reflects your real user inputs — not synthetic test cases you invented.

**Prompt version comparator.** Before shipping a new system prompt, run both the old and new versions across your eval dataset and diff the pass rates. If the new version passes 94% vs the old version's 88%, you can ship with confidence.

**Automated eval-set grower.** Use Haiku to generate synthetic edge cases from your existing inputs — unusual job titles, edge-case visa situations, non-standard resume formats. Validate 10% of them with humans to confirm quality, then add the rest to the dataset. Your coverage grows without manual labelling.

---

The `awesome-evals` repo is worth bookmarking — the `PATTERNS.md` in particular has solid worked examples for LLM-as-judge alignment, `pass@k` estimators, and trajectory evaluation for multi-step agents. The resource is at [github.com/benchflow-ai/awesome-evals](https://github.com/benchflow-ai/awesome-evals).

My take: evals are the unsexy part of AI engineering that separates apps that stay reliable from apps that slowly rot. Every AI feature I've shipped that I'm still happy with six months later had a proper eval harness from the start. The ones I regret didn't.
