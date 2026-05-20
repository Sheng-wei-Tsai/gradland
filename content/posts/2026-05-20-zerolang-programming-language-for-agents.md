---
title: "zerolang: What a Programming Language Looks Like When Agents Write the Code"
date: "2026-05-20"
excerpt: "Vercel Labs released zerolang — a language designed from the ground up for agents as primary users, not humans. The design decisions reveal something real about what we're currently asking AI to fake."
tags: ["AI", "Programming Languages", "Agents", "Vercel"]
coverEmoji: "🔧"
auto_generated: true
source_url: "https://github.com/vercel-labs/zerolang"
---

The zerolang README says something that's been sitting with me since I read it: "agents are primary users from day one." Not humans. Not even AI-assisted humans. The agent is the user.

Vercel Labs dropped this into GitHub five days ago and it's already at 3.5k stars. It's explicitly pre-1, explicitly unstable, explicitly not ready for production. The README is refreshingly honest about that. But the design thinking behind it is worth examining regardless of whether the language itself takes off.

## What zerolang is actually doing

zerolang uses `.0` files and is compiled — currently written in C. You can install and run it today:

```bash
curl -fsSL https://zerolang.ai/install.sh | bash
export PATH="$HOME/.zero/bin:$PATH"
zero run examples/add.0
```

The diagnostic tooling is the most polished part:

```bash
zero check examples/hello.0         # structured JSON diagnostics
zero graph --json examples/systems-package   # dependency graph as machine-readable data
zero size --json examples/point.0   # code size breakdown
zero doctor --json                  # environment check, parseable output
```

Notice the pattern: everything emits structured JSON by default, not pretty prose for a human to read. The tooling is designed to be consumed programmatically — by an agent in a feedback loop.

## Three design decisions that make sense for agents

**Regularity over expressiveness.** The README says: "prefer one obvious way to express most things, even when that makes code more explicit than a human might choose." This sounds like a constraint for humans. For agents, it's a feature. Fewer ways to express the same thing means a smaller search space when generating code, and more predictable output across runs.

When Claude writes TypeScript, it's working in a language with a dozen ways to handle async, optional chaining, three different module systems, and ecosystem conventions that shift every two years. It produces correct output largely because it's seen enough TypeScript to pattern-match fluently. zerolang is asking: what if we designed away the surface area agents need to fake expertise in?

**Standard library depth.** "Common capabilities should live in documented, coherent library APIs instead of scattered dependency stacks." This matters enormously when an agent is writing code. If stdlib handles HTTP, JSON, crypto, and filesystem, the agent doesn't need to decide which package to reach for — a decision that currently requires understanding community convention, semver, security track records, and licence compatibility. Agents make these decisions by statistical pattern-matching, which is why AI-written code sometimes reaches for deprecated packages with worrying confidence.

**Structured, machine-readable diagnostics.** When an agent gets a TypeScript compiler error today, it receives a prose message designed for a human to read. The agent has to parse that text, infer what went wrong, and decide what to do — often by recognising patterns from training data. zerolang's `zero check --json` returns structured facts: what's wrong, where, what the known fix options are. That's an API, not a message. An agent can act on an API directly.

This is the same pattern that distinguishes well-designed software APIs from poorly-designed ones. Machine-readable output when machines are the consumer.

## What this reveals about current AI coding tools

The interesting thing here isn't zerolang specifically. It's what the constraints reveal about the gap between how current programming languages are designed and what agents actually need.

TypeScript's ergonomics are tuned for human cognition: expressiveness, terseness, flexibility. These same qualities create friction for agents. A language with one obvious way to do string interpolation is worse for a human who wants to choose the most readable form in context; it's better for an agent that needs to produce consistent, verifiable output.

We're currently asking agents to write TypeScript, Go, Python — languages designed for human readers — and expecting them to behave like fluent humans. They mostly do, because training data is large and good. But the seams show in the edge cases: the hallucinated package names, the outdated idioms, the error recovery that goes in circles.

zerolang is stress-testing the opposite set of priorities. Whether or not it becomes a real language, it's a useful lens.

## What I'd build with this

**An agent-driven compile loop** — write a harness that feeds a failing spec to an agent, lets the agent write zerolang code, runs `zero check --json`, feeds structured errors back to the agent, and loops until clean. No human in the middle. The structured diagnostics make the feedback loop tractable in a way it isn't with prose errors.

**A dependency explainer** — use `zero graph --json` to extract the dependency structure of any zerolang program an agent writes, then pass that structure to a second LLM call to generate a plain-language explanation of every import decision. Good for auditing what an AI actually built and why.

**An agent benchmarking harness** — compare how different models perform at writing correct zerolang code from a spec, measured by first-attempt compile passes. Because the tooling is structured, you get clean signal: pass/fail + specific error types, not ambiguous "it looks right" vibes. This is the kind of evaluation that's currently hard to run on TypeScript because there are too many ways to be "correct."

## My take

I don't think zerolang replaces TypeScript. The README isn't claiming that either. What it's doing is running an experiment: if you optimise a programming language for agents rather than humans, what do you actually change?

The answer so far is: you make it more boring, more regular, and more machine-readable at every layer. That's the trade. Whether that trade is worth it depends on how much you care about agent-generated code being verifiable versus ergonomic.

Go poke at `zero doctor --json` and `zero graph --json` regardless of where the language lands. The pattern of structured, programmatically-consumable tooling output is applicable right now, in whatever stack you're working in.
