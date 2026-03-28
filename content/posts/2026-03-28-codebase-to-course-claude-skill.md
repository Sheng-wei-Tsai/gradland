---
title: "Auto-Generate Interactive Courses From Any Codebase With Claude"
date: "2026-03-28"
excerpt: "A Claude Code skill that turns any repo into a self-contained HTML course — quizzes, animations, code translations, no dependencies. Here's how to wire it into your Next.js projects for zero-effort contributor onboarding."
tags: ["Claude", "AI Tooling", "Developer Experience", "Documentation"]
coverEmoji: "🎓"
auto_generated: true
source_url: "https://github.com/zarazhangrui/codebase-to-course"
---

2,282 GitHub stars in a week for a documentation tool. That's not an accident — it's developers collectively realising that the hardest part of open source isn't writing code, it's explaining it to the next person. `codebase-to-course` is a Claude Code skill that points at any repo and spits out a single, self-contained HTML file that teaches how the code works. No server, no deps, works offline. If you've ever spent a Friday afternoon writing onboarding docs that nobody read, this is worth 10 minutes of your time.

## What it actually produces

The output is one HTML file with scroll-based navigation, keyboard shortcuts, animated component diagrams, interactive quizzes, and — the bit I find most useful — a side-by-side code-to-plain-English translation panel. Real source code on the left, what it's actually doing on the right.

The quizzes are application-based, not trivia. Instead of "what does useState return?", you get "you want to add a favourites feature — which files change and why?". That's a meaningful distinction if you're trying to actually understand a codebase rather than pass a test.

The whole thing is a single HTML file. You can email it, commit it to the repo, drop it on S3, whatever. No build step, no framework, no maintenance.

## Setting it up as a Claude Code skill

Installation is dead simple:

```bash
# Clone the repo
git clone https://github.com/zarazhangrui/codebase-to-course.git

# Copy the skill folder to Claude's skills directory
cp -r codebase-to-course/codebase-to-course ~/.claude/skills/
```

Open any project in Claude Code and say: *"Turn this codebase into an interactive course."* That's it. Claude reads the repo structure, understands the architecture, and generates the HTML.

If you want to automate this in a project, you can wire it into a script that runs on demand:

```bash
#!/bin/bash
# generate-course.sh — run this when you want to regenerate docs
echo "Generating interactive course for $(basename $PWD)..."
claude -p "Turn this codebase into an interactive course. Output the HTML file to ./docs/course.html" 
echo "Done. Open docs/course.html in a browser."
```

Commit that script to your repo and new contributors can regenerate the course any time the codebase shifts significantly.

## Wiring it into a Next.js/Supabase project

Here's where this gets actually useful. Say you've got a Next.js app backed by Supabase. You want contributors to understand your auth flow, your RLS policies, and how your server actions interact with the DB — without you writing a single doc.

Add a GitHub Actions workflow that regenerates the course on every merge to main and deploys it to GitHub Pages:

```yaml
# .github/workflows/generate-course.yml
name: Generate Interactive Course

on:
  push:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Claude Code CLI
        run: npm install -g @anthropic-ai/claude-code
      
      - name: Generate course
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          mkdir -p docs
          claude -p "Turn this codebase into an interactive course focused on the authentication flow, database schema, and API routes. Output a single HTML file." > docs/index.html
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

Now every contributor gets a live, up-to-date interactive course at `https://yourorg.github.io/your-repo`. Your PR description can link straight to it. Your README gets one line: "New here? Start with the [interactive course](link)."

You can also scope the prompt to specific parts of your codebase. If you've got a gnarly Supabase edge function or a complex middleware chain, just point Claude at that directory and generate a targeted explainer.

## What I'd build with this

**Contributor onboarding portal** — A Next.js app where you paste a GitHub repo URL, it clones it server-side, runs the skill, and serves the generated HTML. Charge $5/month for private repos. The whole backend is maybe 50 lines of code.

**Auto-updating internal docs** — For teams shipping fast, wire this into a weekly cron job that regenerates the course and posts the link to Slack. Stop writing architecture docs that go stale in a fortnight.

**"Understand before you fork" browser extension** — Adds a "Generate Course" button to any GitHub repo page. Sends the repo to a worker, returns the HTML. Exactly the kind of tool that gets 10k installs on the Chrome Web Store without any marketing.

Documentation has always been the thing developers skip until it hurts someone. A tool that generates it automatically, makes it interactive, and keeps it current removes the only excuse for not having it. I'm dropping this into my own projects this week — the GitHub Actions workflow above is already committed.
