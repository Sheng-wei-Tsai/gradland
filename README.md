# henry-blog

Personal blog and portfolio built with Next.js. Covers software development, AI tooling, and engineering notes. Live at [henrytsai.dev](https://henrytsai.dev).

## Stack

- **Framework**: Next.js (App Router, static export)
- **Content**: Markdown with gray-matter and next-mdx-remote
- **Syntax highlighting**: rehype-pretty-code + Shiki
- **Deployment**: GitHub Pages via GitHub Actions

## Features

- Blog, digest, and Githot (trending GitHub repos) content types
- Writing activity heatmap on homepage
- AI-powered weekly digest pipeline (Claude API)
- Automated trending repo analysis (GitHub Search API + Claude)
- Live search and tag filtering on blog listing
- Responsive mobile nav with bottom sheet overflow

## Local development

```bash
npm install
npm run dev
```

## Content

Posts live in `content/posts/`, digests in `content/digest/`, githot entries in `content/githot/`. All use `.md` with this frontmatter:

```yaml
---
title: "Post title"
date: "2026-03-21"
excerpt: "One-sentence summary."
tags: ["AI"]
coverEmoji: "🤖"
---
```

## Automated pipelines

```bash
npx ts-node scripts/run-digest.ts   # fetch and summarise AI essays
npx ts-node scripts/run-githot.ts   # fetch and analyse trending repos
```

Requires `ANTHROPIC_API_KEY` and `GITHUB_TOKEN` in `.env.local`.

## Deployment

Push to `main`. GitHub Actions builds and deploys to GitHub Pages automatically.

First-time setup: Settings → Pages → Source → GitHub Actions.
