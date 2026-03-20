# My Little Corner 🌿

A warm personal blog built with Next.js, MDX, and Tailwind CSS. Deployed to GitHub Pages.

## Tech Stack
- **Framework**: Next.js 14 (App Router, Static Export)
- **Styling**: Tailwind CSS + custom CSS variables
- **Content**: MDX (Markdown + JSX)
- **Deployment**: GitHub Pages via GitHub Actions

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Adding a New Post

Create a new `.mdx` file in `content/posts/`:

```markdown
---
title: "My Post Title"
date: "2025-03-19"
excerpt: "A short description of your post."
tags: ["Tech & Coding"]
coverEmoji: "🚀"
---

Your content here...
```

## Deployment

Push to `main` and GitHub Actions will automatically build and deploy to GitHub Pages.

**One-time setup:**
1. Go to your repo → Settings → Pages
2. Set Source to **GitHub Actions**
3. Push to `main` — your site is live!
