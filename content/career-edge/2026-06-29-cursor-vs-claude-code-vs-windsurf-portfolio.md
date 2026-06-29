---
title: "Cursor vs Claude Code vs Windsurf — Pick One for Your Portfolio"
date: "2026-06-29"
excerpt: "The AI coding tool market shifted in June 2026. Windsurf is now Devin Desktop. Here's how to choose between Cursor and Claude Code based on the AU companies you're actually targeting."
tags: ["Career Edge", "AI Tools", "485 Visa"]
coverEmoji: "⚒️"
pillar: "tools-deep-dive"
cross_link: "/learn"
visa_pathway: "485"
auto_generated: true
---

The AI coding tool market just had its most disruptive month since Copilot launched. On 2 June 2026, Cognition — the company behind the Devin AI software engineer — [announced it had completed the acquisition of Windsurf](https://cognition.com/blog/windsurf) and rebranded the product as Devin Desktop. Windsurf's hundreds of thousands of daily active users woke up to a product on a new roadmap, owned by a new company, with an uncertain place in the market.

For 485 holders, this matters for a specific reason: AU technical interviewers now routinely ask which AI coding tools you use and what you've shipped with them. Three different answers carry different signals depending on who's in the room. Picking the wrong tool doesn't fail interviews — but choosing strategically can genuinely help them.

Cursor, Claude Code, and Windsurf (now Devin Desktop) are not interchangeable. They solve different problems. Here's how to pick one, use it well, and make it visible in your portfolio before your next application round.

## What just happened to Windsurf

On 2 June 2026, Cognition finalised its acquisition of Windsurf. The Windsurf IDE is now [Devin Desktop](https://devin.ai/desktop). According to Cognition's acquisition announcement at [cognition.com/blog/windsurf](https://cognition.com/blog/windsurf), existing Windsurf plans, pricing, extensions, and settings carry over automatically. Day-to-day, the product hasn't changed much.

What has changed is the trajectory. Windsurf had $82M in annual recurring revenue and 350+ enterprise customers at acquisition — a solid business. Devin Desktop is now positioning itself as an IDE for managing fleets of AI agents rather than the focused, polished copilot experience that made Windsurf popular. That's a meaningful product pivot.

For an individual developer building a portfolio right now, betting on a tool that is mid-transition carries risk the other two don't. The rest of this article focuses on Cursor and Claude Code, because those are the two stable choices in the market today.

## Cursor: the default for enterprise-facing roles

Cursor started as a VS Code fork and has grown into the dominant AI IDE for enterprise development. As of May 2026, [over 70% of Fortune 500 companies use Cursor](https://cursor.com/blog/cursor-leads-gartner-mq-2026), and Gartner placed it as a Leader in its 2026 Magic Quadrant for Enterprise AI Coding Agents — with the furthest placement on "Completeness of Vision" among all vendors in that quadrant.

That matters for your portfolio. If your target employers include Commonwealth Bank, Macquarie, Atlassian, Canva, or any mid-to-large AU tech company, Cursor is almost certainly the tool their engineers use. Walking into an interview and saying "I built this feature using Cursor's Agent mode" lands with these teams — they recognise the workflow.

**What Cursor does well**

Cursor is a full IDE replacement. Your VS Code extensions carry over; the interface is identical. The Tab autocomplete is fast and context-aware, predicting edits across files rather than just within a single function. Agent mode (accessed via the chat sidebar) handles multi-file changes from a single instruction. Bugbot, the automated PR review system, [as of June 2026 runs over 3x faster, costs 22% less, and finds 10% more bugs](https://cursor.com/blog/bugbot-updates-june-2026) per review than prior versions, with 90% of reviews completing in under three minutes.

It supports models from Anthropic (Opus 4.8, Sonnet 4.6), OpenAI (GPT-5.5), Google Gemini, and xAI's Grok. You're not locked into one provider.

**Pricing:** Free tier (limited completions), $20/month Pro (what most individual developers pay), $40/user/month Teams.

**The portfolio signal:** Cursor says "I work in professional, team-based development environments." That's the signal a 485 holder needs when targeting enterprise sponsorship.

## Claude Code: the terminal power tool for AI-native teams

Claude Code is different in kind, not just degree. It's not an IDE — it's a terminal-based agentic tool that reads your entire codebase, edits files across multiple directories, and runs shell commands from the terminal. You keep whatever editor you prefer. Claude Code runs alongside it.

According to the [Claude Code product page](https://claude.com/product/claude-code), it deliberately avoids remote code indexing. Your code never leaves your machine for indexing purposes, which matters for companies with strict data-handling requirements. It runs on macOS, Linux, and Windows, and integrates natively with VS Code and JetBrains via extensions.

The practical difference shows up in complex tasks. Cursor's Agent works within the IDE and handles well-scoped, discrete changes efficiently. Claude Code is better suited for tasks that span many files and require running tests, checking git history, and iterating on build output in a single loop. A task like "refactor the authentication module to use the new JWT library, update all tests, and fix any breaking changes" is the kind of work Claude Code handles particularly well — it can run the test suite, read the failures, and iterate without you manually directing each step.

**Pricing:** $20/month Pro (Claude Sonnet 4.6), $100/month Max 5x (higher usage, Opus 4.8 access), $200/month Max 20x.

**The portfolio signal:** Claude Code is associated with AI-native engineering teams — companies building LLM-powered products or roles that require deep agentic workflow comprehension. If you're targeting a startup that builds on the Anthropic API, a role on Canva's AI team, or research engineering positions at companies like Atlassian's AI group, Claude Code on your portfolio signals that you operate at the agent layer, not just the autocomplete layer.

## How to pick: a decision framework

The question isn't which tool is objectively better. It's which one matches the companies you're targeting.

**Pick Cursor if:**
- You're targeting enterprise roles — banking, consulting, large AU tech companies
- Your portfolio needs to demonstrate team-based, production-grade development
- You want one tool covering IDE and agentic workflows in the same interface
- You're on a tight budget and need $20/month to cover everything

**Pick Claude Code if:**
- You're targeting AI-native startups or companies building on Anthropic's API
- Your portfolio centres on complex refactors, agentic pipelines, or LLM-powered features
- You work across large codebases where file-by-file IDE interaction gets tedious
- You want to demonstrate you understand the difference between an AI completion tool and an AI agent

**On Windsurf / Devin Desktop:** It's not a bad product and the transition is smooth for existing users. But unless you're genuinely interested in multi-agent orchestration as a career direction, it's an extra variable you don't need in an interview conversation right now. Interviewers who know the space will ask follow-up questions about Cognition, the Devin acquisition, and product direction. Wait until the dust settles — probably Q1 2027.

## Building a visible portfolio project with your chosen tool

Saying "I use Cursor" in an interview isn't a portfolio. A GitHub repo with a clear commit history, a README that describes how you used AI tooling, and working code — that's a portfolio.

Here's a three-week structure that works for either tool:

**Week 1 — Pick a real problem, scope it to a weekend sprint**

Skip the todo app. Build something you'd actually use: a script that monitors ACS occupation list announcements and sends you a Slack ping, a CLI that compares your resume keywords against active AU job listings via a public jobs API, or a RAG chatbot over the DIBP Migration Program outcomes data. Realistic scope: one working feature, one test file, deployed somewhere public (Vercel, Railway, or a scheduled GitHub Action). The specifics matter less than the fact that it solves a genuine problem.

**Week 2 — Document the AI workflow, not just the feature**

Add a `DEVELOPMENT.md` or a `## How I built this` section in your README. Be specific: "I used Cursor's Agent mode to write the initial database schema. Here's the prompt I used. Here's what it got wrong and what I fixed." That section is often what gets you the technical screen call — it shows you have judgment over AI output, not just the output itself.

**Week 3 — Make it findable**

Commit consistently, not in one giant push. Write a short LinkedIn post linking to the repo with one concrete thing you learned or one decision you made. Add the project to your Gradland profile so it surfaces on your [/learn](/learn) history.

Salary data from [Levels.fyi as of June 2026](https://www.levels.fyi/t/software-engineer/locations/australia) shows the median total compensation for AU software engineers sitting at A$153,203, with the top quartile at A$191,000. The companies paying above that threshold — Atlassian at A$280,278 and Canva at A$264,910 — are the same ones adopting AI tooling fastest. A visible, AI-driven portfolio project doesn't guarantee those numbers, but it's what moves you from screened-out to shortlisted at the companies paying them.

## What this means for the 485 to 186 pathway

The path from 485 to permanence runs through a sponsoring employer who will nominate you under the 186 Temporary Residence Transition (TRT) stream — which requires two years with the nominating employer — or the Direct Entry stream. Either way, you need the role first.

The employers most likely to sponsor 482 visas for junior-to-mid AI roles in 2026 appear consistently in the top of salary leaderboards: Atlassian, Canva, and the AU consulting arms of the large US firms. They're also Cursor shops. That correlation is not coincidental — enterprise AI tooling adoption and willingness to sponsor international technical talent tend to move together.

A portfolio project built with the tool your target employer uses, documented clearly enough that an interviewer can see your reasoning, is a concrete demonstration of the contemporary technical skills that skills assessors and hiring managers alike look for. It's also something you can talk about for 20 minutes in a technical screen — which is exactly what they need from you.

For current occupation list status, 190 nomination thresholds by state, and which ANZSCO codes are currently open for ACS assessment, check [/au-insights](/au-insights) and [/visa-news](/visa-news).

## What to do this week

- If you're targeting enterprise roles: install Cursor, import your VS Code extensions, and run your next feature through Agent mode. The [Cursor docs](https://cursor.com/docs) take under 20 minutes to work through.
- If you're targeting AI-native roles: install Claude Code from [claude.com](https://claude.com/product/claude-code) and run it against an existing project. Give it a multi-file refactor task and watch the iteration loop.
- Pick one portfolio project and commit to finishing it in the next three weeks with whichever tool you chose. Real and explainable beats impressive and vague.
- Add a README section describing your AI workflow — that section is what hiring managers read when they're deciding whether to book the screen call.
- Use [Gradland's /learn path](/learn) to track the skills adjacent to your chosen tool — evaluation, tracing, and prompt design are underrepresented in junior AI portfolios right now.

The tool you pick matters less than picking one and actually shipping something with it.

---

*Relevant visa subclasses: 485 (Graduate Temporary), 482 (Temporary Skills Shortage — TSS), 186 (Employer Nomination Scheme, TRT and Direct Entry streams). For current ACS skills assessment guidance and occupation list updates, see [/visa-news](/visa-news).*
