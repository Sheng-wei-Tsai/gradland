---
title: "Claude Skills are the npm of agentic AI — and the ecosystem just exploded"
date: "2026-04-28"
excerpt: "Four of the ten top-trending GitHub repos this week are Claude Skills. We're watching the agentic packaging layer get born in real time. Here's what skills are, how to ship one, and why this matters for anyone building AI features."
tags: ["AI Agents", "Claude", "Developer Tools", "Open Source"]
coverEmoji: "🧩"
auto_generated: true
source_url: "https://github.com/op7418/guizang-ppt-skill"
---

I scraped GitHub's top trending repos this morning. Four of the top ten are Claude Skills. Another two are agent skill packs for Codex and Cursor. The most-starred repo of the week, [guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill), is a single Claude Skill that turns a prompt into a magazine-quality HTML deck — 3,679 stars in seven days. Six months ago "skills" weren't a thing. Now they're the only thing the trending page wants to talk about. This is the npm-for-agents moment and it's worth understanding before the next wave hits.

## What a Claude Skill actually is

Strip the marketing. A Claude Skill is a directory with three things: a `SKILL.md` describing what the skill does and when to invoke it, a set of resource files (prompts, code, schemas), and optionally a manifest declaring which tools (`Bash`, `Read`, `Write`, etc.) the skill needs. You drop the directory into `~/.claude/skills/` and from that moment on, Claude Code sees it. When your prompt matches what the skill is good at, Claude routes through it.

That's the entire mechanism. There's no daemon, no API key for the skill itself, no plugin SDK. The skill is a folder of markdown and code, and Claude reads it. This is what makes the format interesting: it's the simplest possible packaging layer that could work, and it's spreading because of that simplicity.

The closest historical analogy is npm circa 2010 — a flat directory with a manifest, distributed via `git clone`, with no runtime to install. Skills have the same property and that's why the velocity feels so sudden.

## Why this is different from "ChatGPT plugins" v1

ChatGPT plugins failed for three reasons: they required hosting, they required OpenAPI specs, and they only ran inside the ChatGPT product. Skills require none of those. A skill can be a single markdown file with no code. It runs anywhere the Claude CLI runs — your terminal, a CI pipeline, an MCP-connected editor. There's no hosting bill. There's no review queue. You publish by pushing to GitHub.

The result is the kind of long-tail explosion you see when distribution gets cheap enough. Browsing today's top repos, the categories are already specialising:

- **Production design tools**: PowerPoint, image generation, sprite sheets, CAD, magazine layouts
- **Engineering operations**: issue triage, dependency review, release notes, PR summaries
- **Domain experts**: legal contract review, medical literature search, financial filings parsing
- **Personal automation**: email triage, calendar negotiation, weekly reviews

None of these existed three months ago. Most are one-author hobby repos. The good ones are getting picked up by other developers and forked into team-specific variants — exactly the pattern that produced the early npm long tail.

## How to ship a skill in fifteen minutes

I'll write a real one to make this concrete. Let's build a skill that generates a "today I learned" blog post from your shell history. Useful and small.

```bash
mkdir -p ~/.claude/skills/til
cd ~/.claude/skills/til
```

Create `SKILL.md`:

```markdown
---
name: til
description: Generate a "Today I Learned" blog post from recent shell history and git activity. Use when the user asks for a TIL, a daily log, a learning summary, or "what did I do today".
allowed_tools: ["Bash", "Read", "Write"]
---

# Today I Learned generator

When invoked, follow these steps:

1. Read the user's shell history for the current day:
   ```bash
   HISTFILE=$HOME/.zsh_history fc -li 0 | grep "$(date +%Y-%m-%d)"
   ```
2. Get today's git commits:
   ```bash
   git log --since="00:00 today" --pretty=format:"%h %s" 2>/dev/null
   ```
3. Identify 1–3 non-obvious things the user learned, based on patterns in the commands and commits.
4. Write a 200–300 word blog post in markdown to `content/posts/$(date +%Y-%m-%d)-til-{slug}.md` with frontmatter (title, date, excerpt, tags: ["TIL"]).
5. Print the path of the file you wrote.

Voice: direct, practical, first person, no hype words. Australian English.
```

That's the skill. No code. Reload Claude Code (`claude --reload`) and:

```bash
claude "write me a TIL post"
```

Claude reads `SKILL.md`, runs the three commands, identifies what looks interesting, and writes the post. The whole thing took fifteen minutes — twelve of which were thinking about the prompt.

Now multiply this by every developer who has a small annoying task. That's why the trending page looks the way it does this week.

## The three properties that make a skill spread

Looking at the four skills in this week's top ten, there's a pattern. The viral skills share three properties:

**They package a workflow, not a feature.** Anyone can prompt Claude to make slides. The PPT skill packages the entire workflow — layouts, themes, WebGL hero generation, single-file output — as one invocation. The skill isn't selling a capability; it's selling a workflow that the model already had but nobody wanted to assemble each time.

**They produce real artifacts.** The trending skills all output files: HTML decks, PNG sprites, STL meshes, markdown posts. Skills that just answer questions get fewer stars. There's a strong correlation between "produces a file you can use" and "lots of stars". The artifact is the proof.

**They have a clear "when to use me" signal.** The `description` field in the SKILL frontmatter is what Claude uses to decide whether to route through the skill. Skills with vague descriptions get ignored. Skills with descriptions like "use when the user asks for slides, a deck, a presentation, or a pitch" get reliably triggered.

If you're shipping a skill, those three are the bar.

## What I'd build with this

Three concrete things, in priority order for someone running a developer-facing product:

**A resume-rewrite skill for personal use.** Take the resume analyser logic from TechPath AU and ship it as an open-source skill. The product still needs the web UI for non-technical users, but a CLI-native skill version becomes a long-tail acquisition channel — every developer who clones it for themselves becomes aware of the paid product.

**A weekly-review skill.** Reads the user's GitHub activity, calendar, and notes for the week and produces a Markdown weekly review with three "what shipped", three "what stalled", and one recommended focus for next week. Personal productivity is the killer demo for skills because the user feels the value immediately.

**A skill-distributor skill.** A skill that scans GitHub for new Claude skills, summarises what each one does, and lets the user install them with a single confirmation. This is the meta-play — owning the discovery layer for a fast-growing ecosystem is a defensible position before the official registry exists.

## The thing nobody is saying yet

Skills are going to fragment. There will be Claude Skills, Cursor Skills, Codex Skills, OpenAI Skills, and a dozen others. Each will have a slightly different manifest format. Within six months, the question won't be "is there a skill for this?" but "is there a skill for this **for my agent**?". Whoever builds the cross-runtime skill format — the equivalent of CommonJS for agents — captures a coordination position that compounds.

If you're a developer with even passing curiosity about agentic systems, ship a small skill this weekend. The cost is nothing, the format is genuinely simple, and you'll learn more in three hours of building one than in three weeks of reading about them. The trending page is telling you what the next year of AI tooling looks like — packaged, distributable, runtime-agnostic capabilities. The early entrants are getting noticed.

That `~/.claude/skills/` directory on your laptop is a publishing platform. Use it.
