---
title: "Turn Any Codebase Into a Knowledge Graph You Can Query"
date: "2026-05-25"
excerpt: "Understand Anything hit #1 on GitHub trending today — a multi-agent pipeline that parses your code with tree-sitter, runs LLM analysis in parallel, and gives you an interactive graph you can search and chat with."
tags: ["AI Tools", "Developer Tools", "Claude Code"]
coverEmoji: "🕸️"
auto_generated: true
source_url: "https://github.com/Lum1104/Understand-Anything"
---

Every developer has had this moment: you inherit a codebase or clone a repo you haven't touched before, and you spend the first day just trying to work out what calls what. Where does auth live? Which service owns the billing logic? How does a user action ripple through to the database?

The standard answer is "read the code." Which is fine if the codebase is 5,000 lines. Not so fine when it's 150,000.

[Understand-Anything](https://github.com/Lum1104/Understand-Anything) went from zero to #1 on GitHub trending today — nearly 4,000 stars in a single day. The pitch: turn any codebase into an interactive knowledge graph you can explore, search, and ask questions about. I've spent the morning looking at how it actually works, and the architecture is worth understanding beyond the headline.

## How It Works

The tool combines two things that individually are table-stakes but together are genuinely useful:

**Static analysis with tree-sitter.** Tree-sitter is a parser-generator library that produces concrete syntax trees for most popular languages — fast, deterministic, no LLM involved. Understand-Anything uses it to extract structural facts: imports, exports, function definitions, call sites. This is the foundation. Because it's pure parsing, the output is reproducible and it can detect exactly what changed between runs for incremental updates.

**Multi-agent LLM analysis.** On top of the tree-sitter facts, five specialised agents run to produce semantic understanding:

- Project scanner — identifies files, frameworks, entry points
- File analyser — generates plain-English summaries per function and class
- Architecture analyser — classifies code into architectural layers (API, domain, infra)
- Tour builder — generates learning paths ordered by dependency
- Graph reviewer — validates consistency across the full output

File analysers run in parallel, batching 20–30 files at a time. On a medium-sized codebase you're looking at a few minutes for the initial analysis, with incremental updates after that.

The result is a visual graph where nodes are files, functions, and classes. Edges are dependency relationships. Colour coding maps to architectural layers.

## Using It

If you're on Claude Code, installation is one command:

```
/plugin marketplace add Lum1104/Understand-Anything
/plugin install understand-anything
```

For other setups (Cursor, VS Code + Copilot, Gemini CLI):

```bash
curl -fsSL https://raw.githubusercontent.com/Lum1104/Understand-Anything/main/install.sh | bash
```

The core commands you'll reach for:

```bash
/understand          # Analyse codebase, build the graph
/understand-dashboard  # Open the interactive explorer
/understand-chat     # Ask questions about the code
/understand-diff     # Analyse impact of a change before making it
/understand-domain   # Extract business processes as plain English
```

The `/understand-diff` command is the one I find most interesting. Before you refactor a shared utility or change a database schema, you can ask what depends on it and how a change would propagate. That's the kind of thing you'd previously work out manually or miss entirely until the PR review.

You can also commit the generated graph to the repo so teammates don't have to re-run the analysis. It becomes a shared artefact — like committing your ERD alongside your migrations.

## What I'd Build With This

A few concrete applications for anyone building AI-powered products:

**Codebase onboarding for new hires.** Drop Understand-Anything into your CI pipeline, commit the graph, and point new teammates at the dashboard before their first PR. Instead of "go read the codebase," you give them a navigable map with tours ordered by dependency. The architecture analyser is good enough that it auto-labels layers — new engineers can see the shape of the system in 20 minutes.

**Pre-refactor impact analysis integrated into PRs.** Wire `/understand-diff` into a GitHub Actions step that comments on PRs touching certain high-risk files. Something like: "This change to `lib/auth.ts` affects 14 downstream modules — here's the dependency graph." Catches blast radius issues before review.

**LLM context generation for coding agents.** The codegraph output is machine-readable. If you're building an AI coding assistant or internal tool with the Anthropic API, you could feed relevant graph sections as context instead of raw file dumps. The tree-sitter facts are structured, token-efficient, and don't include irrelevant noise. Much cheaper than stuffing entire files into a prompt.

## My Take

The multi-agent pipeline approach is the right architecture for this problem. Static analysis alone gives you structure without meaning; LLMs alone give you plausible-sounding analysis that can hallucinate relationships that don't exist. Combining them — tree-sitter for ground truth, LLMs for interpretation — is the pattern I'd design from scratch.

The thing that puts me off using this in production today is the cost question. Five agents running in parallel against a large codebase is not cheap if you're hitting a paid API. The incremental update support helps, but until you've run it once on your actual codebase and seen the bill, budget for surprise.

That said — 28,000 stars suggests a lot of developers have already cleared that bar. Worth spending an afternoon with it on a side project to see if it fits your workflow before committing to production use.
