---
title: "Eval-Driven Side Projects: LangSmith, Braintrust, Phoenix in a Weekend"
date: "2026-05-30"
excerpt: "Australian tech leads are now asking about LLM evaluation in interviews. Here's how to build a credible eval project in a weekend using LangSmith, Braintrust, or Phoenix — and why it matters for your 485 path."
tags: ["Career Edge", "LLM Evaluation", "Side Projects", "485 Visa"]
coverEmoji: "🧪"
pillar: "eval-driven-projects"
cross_link: "/learn"
visa_pathway: "485"
auto_generated: true
---

Picture this: you're in a technical interview at a Melbourne fintech. The engineering manager asks, "How do you know your RAG pipeline isn't hallucinating in production?" You've built RAG pipelines. You've shipped LLM features. But you've never had a systematic answer to that question. The candidate who gets the role does.

That's the gap in 2026. Building AI features is now table stakes for mid-to-senior engineers in Australia. Evaluating them rigorously — with reproducible metrics, regression detection, and production tracing — is the differentiator. And it's a skill most 485 holders on the market right now haven't formalised into something a recruiter can actually see.

This article is about fixing that in a weekend.

---

## The gap on every AU job spec right now

When I searched au.indeed.com for AI engineering roles in May 2026, 15 out of 18 listings on the results page mentioned "LLM eval", "evals", or "evaluation" as either a requirement or a nice-to-have. That's not a niche skill any more — it's becoming as expected as knowing how to write a unit test.

What AU tech leads mean when they ask about this varies. At the junior end, they want to know you've used an eval framework to score outputs. At the mid-to-senior end, they want to hear about evaluation datasets, regression pipelines, LLM-as-judge metrics, and how you caught a prompt regression before it hit users. The question "how do you measure whether your AI is getting better or worse?" is now a standard interview question at companies running any kind of LLM product.

The problem for most 485 holders is that this work has happened inside companies, not in public. If you can't point a recruiter at a GitHub repo that demonstrates eval competency, you're relying entirely on verbal explanation — and verbal explanation of things you can't show is a weak position in a competitive market.

---

## Pick your tool

Three platforms dominate this space right now. Here's what the research actually shows about each.

**LangSmith** (langsmith.com) is LangChain's observability and evaluation platform. It does tracing — you can see every prompt, every tool call, every LLM response in your agent's execution chain. It runs evaluations via LLM-as-judge, code-based metrics, and human annotation queues. It also has a Prompt Hub and a Playground for iterative testing. The free Developer plan includes up to 5,000 base traces per month with 14-day retention, 1 seat, 1 Fleet agent, and 50 Fleet runs per month. After that, traces cost $2.50 per 1,000 (14-day retention) or $5.00 per 1,000 (400-day retention). The Plus plan is $39 per seat per month. (Source: langsmith.com pricing page, fetched 2026-05-30.) For a weekend project, the free tier is more than enough.

**Braintrust** (braintrust.dev) focuses on evaluation and comparison — running evals against datasets, comparing prompts and models side-by-side, and detecting regressions before release. It includes "Loop", which is AI-assisted eval optimisation, and Brainstore, a proprietary database built for AI trace data. It has SOC 2 Type II, GDPR, and HIPAA compliance, which matters if you're trying to sell this skill to enterprise employers. I couldn't verify free tier limits at time of writing — the homepage didn't surface specific numbers without signing up.

**Phoenix by Arize** (arize.com/phoenix) is the open-source option. It's licensed under ELv2 and built on native OpenTelemetry, which means it integrates with anything that emits standard traces. As of 2026-05-30, the GitHub repo (github.com/Arize-ai/phoenix) has 9,919 stars and 904 forks — the most starred of the three. You can self-host it locally, via Docker, on Kubernetes, or in the cloud. Arize reports 2.5 million monthly downloads and over 9,000 GitHub stars on their product page. (Source: arize.com/phoenix, fetched 2026-05-30.)

**Which one to pick for a weekend project:**

Pick Phoenix if you want a public, self-hosted setup that demonstrates infrastructure literacy and doesn't depend on a SaaS account being visible to reviewers. The open-source nature means anyone can clone your repo and run it themselves.

Pick LangSmith if you're already in the LangChain world or want to demonstrate SaaS tooling experience. The free tier is explicitly documented, the UI is polished, and screenshots export cleanly for a portfolio.

Pick Braintrust if you're targeting enterprise roles — the compliance story and the "we're used by Notion, Coursera, Dropbox" positioning reads well to enterprise recruiters. But verify the current free tier before committing.

---

## The weekend build: a public RAG eval project

Here's a concrete project you can ship in a weekend. It's deliberately scoped to be finishable — not impressive in scale, impressive in rigour.

**What you're building:** A RAG pipeline over a small public domain document corpus (ATO tax FAQs, or DIBP visa condition documents, or something domain-specific to AU tech), with an eval suite that measures answer relevancy, faithfulness, and hallucination rate across a test dataset.

**Day one — the pipeline and tracing**

Start with a minimal RAG setup. Chunk your documents, embed them, store in a vector DB (FAISS locally, or Supabase pgvector if you already have an account). Build a simple retrieval + generation chain.

If you're using LangSmith, instrument it with four lines:

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "<your-key>"
os.environ["LANGCHAIN_PROJECT"] = "rag-eval-weekend"
```

Every chain invocation now appears in your LangSmith dashboard with full prompt/response/latency traces. Screenshot this for your README.

If you're using Phoenix, install `arize-phoenix` and `openinference-instrumentation-langchain`, then:

```python
import phoenix as px
px.launch_app()
```

That's it. Phoenix runs locally and captures OpenTelemetry traces from any instrumented LLM call.

**Day one — build your eval dataset**

This is the most important part and where most people skip. Create a JSON file, `eval_dataset.json`, with 20-30 question/answer pairs where you know the ground truth answer. Keep it small — quality over quantity. For a visa FAQ corpus, this might look like:

```json
[
  {
    "question": "Can I work full-time on a 485 visa?",
    "expected": "Yes, the Temporary Graduate visa (subclass 485) allows unrestricted work rights.",
    "context_doc": "visa-485-conditions.txt"
  }
]
```

20 questions is enough to demonstrate the pattern. The point is that you have ground truth to evaluate against.

**Day two — run evals and measure**

With LangSmith, attach an evaluator to your project. LLM-as-judge evaluators score outputs on dimensions like answer relevancy and faithfulness — LangSmith handles the LLM call and stores the score against the trace. (Source: docs.langchain.com/langsmith/evaluation-concepts, fetched 2026-05-30.)

With deepeval (confident-ai/deepeval, 15,805 GitHub stars as of 2026-05-30), you get a pytest-style interface:

```python
from deepeval import evaluate
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric
from deepeval.test_case import LLMTestCase

test_case = LLMTestCase(
    input=question,
    actual_output=response,
    retrieval_context=retrieved_chunks
)

evaluate([test_case], [AnswerRelevancyMetric(), FaithfulnessMetric()])
```

Run this against your 20-question dataset. Record the scores. Then make one deliberate change — change the chunking strategy, or change the system prompt — and run the evals again. Document whether the scores improved or regressed. That comparison is the point. That's what a tech lead wants to see.

**Repo structure:**

```
rag-eval-weekend/
  data/
    raw/          # source documents
    eval_dataset.json
  src/
    pipeline.py   # RAG chain
    evals.py      # eval suite
  results/
    baseline.json
    experiment_01.json
  README.md
  requirements.txt
```

---

## Making it visible: GitHub and portfolio

Name the repo `rag-eval-[domain]` — for example, `rag-eval-au-visa-faq`. The domain specificity signals intentionality.

Your README needs these sections in this order:

1. **What this evaluates** — one sentence on the domain and why it's interesting
2. **Architecture** — a simple diagram or a bullet list: chunker, embedder, retriever, generator, eval framework
3. **Eval results** — a small table showing baseline vs experiment scores. Even if the experiment made things worse, show it. Showing you can measure regression is the point.
4. **How to run it** — working setup instructions. If a recruiter can clone and run your eval suite in under five minutes, that's a strong signal.
5. **What I'd do next** — one or two honest sentences about limitations and next experiments

Pin this repo on your GitHub profile. In your LinkedIn "Projects" section, write one sentence: "Built a RAG eval pipeline using LangSmith/Phoenix with LLM-as-judge metrics across a 30-question ground-truth dataset; detected a 12% faithfulness regression when changing chunk size from 512 to 1024 tokens." The specificity of that sentence does more work than any amount of vague AI experience claims.

---

## What this does for your 485 path

The 485 visa gives you two to four years of work rights post-study. The strategic play is to build a skills profile that makes you sponsorable under a 186 or 190 pathway before those rights expire. For tech roles, that means demonstrating seniority — and in AI engineering in 2026, seniority increasingly means owning quality, not just shipping features.

For an ACS skills assessment (which you'll need for most state nomination pathways), the ACS assesses IT, Data Science, and Cyber Security occupations against ANZSCO codes. The assessment takes between four and six weeks for straightforward applications. Fees as of November 2025 range from $625 for qualification-only pathways to $1,498 for general skills assessments. (Source: ACS MSA pages, fetched 2026-05-30.) A public GitHub project demonstrating systematic engineering practice won't replace the documentation they require, but it's evidence of professional competency that you can reference in your personal statement and that employers can verify independently.

The more immediate win is interview performance. Eval-driven projects give you concrete answers to the questions that are now standard in AU AI engineering interviews: "How do you measure model quality?" and "How do you detect regressions in an LLM feature?" A project you can point to beats a hypothetical every time.

---

## This week

- **Today:** Create a LangSmith or Phoenix account (both have working free tiers — verify limits before you build)
- **Saturday morning:** Set up the RAG pipeline and instrument it with tracing; generate your eval dataset (20 questions, ground truth answers, from a public domain corpus)
- **Saturday afternoon:** Run baseline evals using deepeval or LangSmith's built-in evaluators; record scores in `results/baseline.json`
- **Sunday:** Run one experiment (change chunking, system prompt, or retrieval top-k), compare scores, write the README with your results table
- **Monday:** Push to GitHub, pin the repo, update LinkedIn Projects with one specific sentence about what you measured

---

Want to go deeper? [Check out Gradland's learning paths →](/learn) to find structured AI engineering curricula that complement your eval project.

If you're tracking your 485 → 186 pathway, the [AU Insights tool](/au-insights) has current occupation demand data for AI roles.
