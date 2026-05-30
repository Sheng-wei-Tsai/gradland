---
title: "Your Database Is Already a Workflow Engine"
date: "2026-05-30"
excerpt: "Before you wire up Temporal or AWS Step Functions for your next background job, consider that your existing Postgres or SQLite instance can handle durable workflows just fine — and with a lot less ceremony."
tags: ["TypeScript", "PostgreSQL", "Architecture"]
coverEmoji: "🗄️"
auto_generated: true
source_url: "https://obeli.sk/blog/sqlite-is-all-you-need-for-durable-workflows/"
---

There's a pattern I keep seeing in production codebases: someone needs a reliable multi-step background process — send an email sequence, run an AI pipeline, process a batch of records — and they immediately start evaluating Temporal, AWS Step Functions, or Inngest. Which are all fine tools. But they also add significant infrastructure complexity and cost to a problem you might already have the tools to solve.

The argument doing the rounds on HN this week: SQLite is all you need for durable workflows. I'd extend that further. If you're already running Postgres (or Supabase), you almost certainly don't need a separate workflow engine for the majority of use cases.

## What "durable" actually means

A workflow is durable if it survives process restarts. If your server crashes mid-execution, a durable workflow picks up where it left off rather than starting over or silently dying.

The primitive you need is dead simple: **store the workflow's current state in a database before you do any work**. When the process resumes, it reads that state and continues.

```sql
create table workflows (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  status text not null default 'pending',  -- pending | running | completed | failed
  payload jsonb not null default '{}',
  result jsonb,
  step text,  -- which step we're up to
  attempts int not null default 0,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on workflows (status, next_run_at)
  where status in ('pending', 'failed');
```

That index is doing real work — it's what a polling worker queries to find the next job to run.

## The worker pattern

A worker is just a process that polls for pending workflows and processes them. In TypeScript with Supabase:

```ts
async function processNextWorkflow() {
  // Claim a workflow atomically — prevent double-processing
  const { data: workflow } = await supabase
    .from('workflows')
    .update({ status: 'running', attempts: supabase.raw('attempts + 1'), updated_at: new Date().toISOString() })
    .eq('status', 'pending')
    .lte('next_run_at', new Date().toISOString())
    .order('next_run_at')
    .limit(1)
    .select()
    .maybeSingle();

  if (!workflow) return;

  try {
    const result = await runWorkflow(workflow);
    await supabase
      .from('workflows')
      .update({ status: 'completed', result, step: null })
      .eq('id', workflow.id);
  } catch (err) {
    const backoff = Math.min(30, 2 ** workflow.attempts) * 60 * 1000; // exponential, capped at 30min
    await supabase
      .from('workflows')
      .update({
        status: workflow.attempts >= 5 ? 'failed' : 'pending',
        next_run_at: new Date(Date.now() + backoff).toISOString(),
      })
      .eq('id', workflow.id);
  }
}
```

The key is the `update ... where status = 'pending'` pattern. Postgres (and SQLite with WAL) gives you the atomic compare-and-swap you need to ensure only one worker claims each job. No distributed locks required.

## The hard part: idempotency

This is where people get tripped up. Storing and resuming state is easy. The challenge is that some steps have **side effects you can't replay**: charging a credit card, sending an email, calling an external API that isn't idempotent.

The solution is to record what you've done alongside the workflow state:

```ts
async function runWorkflow(workflow: Workflow) {
  const payload = workflow.payload as ResumeEmailPayload;
  const done = (workflow.result as Record<string, boolean>) ?? {};

  // Step 1: Send welcome email (idempotent check)
  if (!done.welcomeEmail) {
    await sendEmail(payload.userId, 'welcome');
    done.welcomeEmail = true;
    await supabase.from('workflows').update({ result: done }).eq('id', workflow.id);
  }

  // Step 2: Wait 3 days, send follow-up
  if (!done.followUp) {
    if (Date.now() < workflow.created_at.getTime() + 3 * 86400_000) {
      throw new RetryLaterError('3 days not elapsed');
    }
    await sendEmail(payload.userId, 'followup');
    done.followUp = true;
    await supabase.from('workflows').update({ result: done }).eq('id', workflow.id);
  }
}
```

Persist the result of each step before moving to the next. A crash after `sendEmail` but before the Supabase write means you re-send — so you still need your email provider to handle idempotency keys. But that's a much smaller problem than building an entire workflow engine.

## What I'd build with this

**AI pipeline orchestration.** Claude API calls are slow and can fail. Rather than blocking a request waiting for a 3-step analysis, enqueue it as a workflow, stream the intermediate results into the `result` JSON, and poll from the frontend. Pairs nicely with Supabase Realtime for the push updates.

**Retry-safe webhooks.** Stripe sends a webhook, you need to provision access, send a confirmation email, and update three tables. Do it all in a single workflow row — if any step fails, the whole thing retries from the last completed step, not the beginning.

**Daily data pipelines.** Scrape jobs, process them through an AI classifier, deduplicate, write to the DB. Each stage checkpointed. When the classifier rate-limits you at step 400 of 600, you resume at 400.

## My take

Temporal and friends are the right answer when you need fan-out across machines, sub-second scheduling precision, or a visual workflow designer for non-engineers. For everything else — which is most things — a Postgres table and a worker loop is 95% of what you actually need, already in your stack, with zero new infrastructure to operate.

The HN thread raised the valid point that distributed commit log semantics matter at scale. True. But most of us aren't at that scale, and the premature abstraction of a dedicated workflow engine costs real complexity. Start with the database you have. Extract to a proper engine when the seams show.
