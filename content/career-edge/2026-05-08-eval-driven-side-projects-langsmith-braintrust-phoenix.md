---
title: "Eval-Driven Side Projects — The Portfolio Move That Beats Another Chatbot Demo"
date: "2026-05-08"
excerpt: "Generic ML projects (Titanic, MNIST, yet-another-chatbot) are now a negative signal in AU 2026 hiring. Publishing eval data for an AI feature you built is rare and gets interviews. Here's how to do it in a weekend."
tags: ["Career Edge", "AI Engineering", "Side Projects", "LangSmith", "Braintrust"]
coverEmoji: "📊"
pillar: "eval-driven-projects"
cross_link: "/learn"
visa_pathway: "485"
auto_generated: false
---

If your GitHub has a "movie sentiment classifier" or a "personal ChatGPT clone", the AU hiring market has bad news: in 2026 those projects are negative signal. Recruiters and tech leads see them as "candidate followed a YouTube tutorial". The market is over-supplied.

What's *under-supplied* — based on Hays Salary Guide AU 2026, ACS skill demand reports, and threads on r/cscareerquestionsAUS over the last 3 months — is engineers who can build an AI feature *and* publish evidence that it works. The evidence is called "evals", and almost no junior portfolio has them. This article shows you how to add evals to one project this weekend and use it to land your next interview.

## What "eval-driven" actually means

A traditional side project ships code. An eval-driven side project ships code *plus a dataset of inputs and expected outputs*, *plus a script that measures how often the AI gets it right*, *plus a public dashboard showing the trend over time*.

The three tools that own this category in 2026:

- **[LangSmith](https://www.langchain.com/langsmith)** — LangChain's eval and tracing platform. Free tier: 5,000 traces per month, plenty for a portfolio.
- **[Braintrust](https://www.braintrust.dev)** — Cleaner UI, especially good for evals on structured outputs. Free tier covers solo projects.
- **[Arize Phoenix](https://docs.arize.com/phoenix)** — Open source, self-hostable. Best if you want to demonstrate infrastructure skills alongside the eval work.

Pick one. Don't try all three on day one.

## The weekend project — pick something you already built

You don't need a new idea. Take an existing AI side project and bolt evals onto it. Examples that work well:

- A resume parser → eval: does it extract the right fields from 50 sample CVs?
- A code-explainer chatbot → eval: do its explanations match a reference set on 30 functions?
- A meeting-notes summariser → eval: does it capture the same action items a human would on 25 transcripts?

The smaller and more boring the project, the better — because the eval work is the headline, not the project.

## Saturday morning — define the eval set

Three deliverables, two hours total:

1. **30–50 inputs.** Real or synthetic, doesn't matter. They need to be diverse enough that "always answer yes" isn't a winning strategy.
2. **Reference outputs.** What the *correct* answer looks like for each input. This is hand-written — you are the labeller.
3. **A scoring rubric.** For each input, what counts as "correct"? Pick from: exact-match, BLEU, ROUGE, JSON schema validity, LLM-as-judge with a clear rubric.

Save these as `evals/inputs.jsonl` and `evals/expected.jsonl`. Commit to git.

## Saturday afternoon — instrument the project

Pick LangSmith for this walk-through (Braintrust and Phoenix are similar; pick whichever you like).

```bash
npm install langsmith
```

In your existing AI feature, wrap the call:

```ts
import { Client } from 'langsmith';

const ls = new Client({ apiKey: process.env.LANGSMITH_API_KEY });

await ls.createRun({
  name: 'extract-resume-fields',
  inputs: { resumeText },
  outputs: extractedFields,
  run_type: 'chain',
});
```

Run your feature on every input in `evals/inputs.jsonl`. LangSmith captures every call automatically. Open the dashboard — you can already see traces, latency, and error rates. This is more observability than 90% of junior portfolios show.

## Sunday morning — score the runs

Write a tiny script that compares each run's output to the reference and writes a score:

```ts
import fs from 'fs';

const inputs   = fs.readFileSync('evals/inputs.jsonl', 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
const expected = fs.readFileSync('evals/expected.jsonl', 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));

let correct = 0;
for (let i = 0; i < inputs.length; i++) {
  const actual = await yourFeature(inputs[i]);
  if (matches(actual, expected[i])) correct++;
}
console.log(`Pass rate: ${(correct / inputs.length * 100).toFixed(1)}%`);
```

Whatever number comes out (60%, 80%, 92%) is what you publish. Real numbers, even mediocre ones, beat zero numbers every time.

## Sunday afternoon — publish

Three things go on GitHub:

1. **The original project README** — now with a "## Evals" section showing the pass rate, the number of test cases, and the latest run date
2. **A `EVALS.md`** — explaining what you measured, why, and what you'd improve next iteration
3. **A LangSmith public link** to one trace, so recruiters can see what the actual data looks like

Then write a 200-word LinkedIn post: "I added evals to my X project. It scored Y% on Z test cases. Here's what surprised me…" You'll get more recruiter inbound from this single post than from a month of cold applications.

## Why this works for international graduates

The eval-driven move solves the two problems 485-holders report most often:

- **CV ignored at the keyword filter.** "LangSmith", "Braintrust", "AI evals" are 2026 keywords with low candidate supply. Your CV stops getting filtered.
- **Interviewer sees you as a junior, not as a real engineer.** Showing up with a public eval dashboard reframes the conversation. You're now talking about test methodology, not whether you've heard of React hooks.

For the 485 → 186/190 PR pathway, demonstrating the ability to ship and measure AI features positions you for the AI Engineer occupation codes that landed on the [2026 Core Skills Occupation List](https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list). That's a near-vertical sponsorship trajectory through 2027.

## What to do this weekend

- Pick one existing AI side project (don't start a new one)
- Saturday: 50 inputs + 50 references + scoring rubric
- Saturday afternoon: instrument with LangSmith
- Sunday morning: score the runs
- Sunday afternoon: publish — README + EVALS.md + LinkedIn post

If you can't show eval data on Monday morning, you're not finished. The portfolio item is the data, not the project.
