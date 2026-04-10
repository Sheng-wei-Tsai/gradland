# Feature: GitHub Skills Learning Guide

**Goal:** A curated, interactive learning guide for all 37 GitHub Skills courses — organized into 6 progressive levels, with progress tracking per user, embedded course details, and direct "Start on GitHub" CTAs. Same UX pattern as the Claude Code Guide at `/learn/claude-code`.

---

## Why GitHub Skills, why here

GitHub Skills courses are the official, free, hands-on way to learn Git, GitHub Actions, Copilot, and security workflows. Every course is a GitHub template repo with automated step-checking. The content exists — what's missing is a curated learning path that:
1. Tells you *what order* to take them in
2. Shows your *overall progress* across all courses
3. Surfaces the *why* behind each course (not just what GitHub says)

This guide solves all three. It doesn't host the content — it **structures the journey**.

---

## Architecture

### Route
`/learn/github` — new page alongside `/learn/claude-code` and `/learn/youtube`

### Components
- `app/learn/github/page.tsx` — server component (metadata)
- `app/learn/github/GitHubSkillsGuide.tsx` — client component (same pattern as ClaudeCodeGuide.tsx)
- `lib/github-skills.ts` — all 37 courses as structured data

### Data model
```ts
interface GitHubCourse {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  description: string;        // opinionated description, not just GitHub's tagline
  whatYoullLearn: string[];
  whatYoullBuild: string;
  prerequisites: string[];    // course ids
  githubUrl: string;          // template copy URL
  topics: string[];           // tags
}

interface GitHubLevel {
  id: string;
  title: string;
  badge: string;    // emoji
  color: string;    // hex
  bg: string;       // light bg for header card
  summary: string;
  courses: GitHubCourse[];
}
```

---

## 6 Levels + 37 Courses

### 🌱 Foundation (4 courses)
Core Git + GitHub concepts. Zero prerequisites.
- introduction-to-git
- introduction-to-github
- communicate-using-markdown
- github-pages

### ⚡ Collaboration (5 courses)
Working with others: PRs, conflicts, history.
- review-pull-requests
- resolve-merge-conflicts
- connect-the-dots
- change-commit-history
- introduction-to-repository-management

### 🔧 GitHub Actions (6 courses)
Automation, CI/CD, Docker, releases.
- hello-github-actions
- test-with-actions
- reusable-workflows
- workflow-artifacts
- release-based-workflow
- publish-docker-images

### 🤖 Copilot & AI (12 courses)
All Copilot features + AI in Actions + GitHub Spark.
- getting-started-with-github-copilot
- build-applications-w-copilot-agent-mode
- customize-your-github-copilot-experience
- integrate-mcp-with-copilot
- expand-your-team-with-copilot
- copilot-code-review
- create-applications-with-the-copilot-cli
- your-first-extension-for-github-copilot
- ai-in-actions
- create-ai-powered-actions
- scale-institutional-knowledge-using-copilot-spaces
- idea-to-app-with-spark

### 🛡️ Security (5 courses)
DevSecOps: supply chain, scanning, secrets.
- secure-repository-supply-chain
- secure-code-game
- introduction-to-codeql
- introduction-to-secret-scanning
- configure-codeql-language-matrix

### 🏆 Advanced DevOps (5 courses)
Codespaces, Azure, custom Actions, migration.
- code-with-codespaces
- deploy-to-azure
- write-javascript-actions
- modernize-your-legacy-code-with-github-copilot
- migrate-ado-repository

---

## UX Pattern (same as ClaudeCodeGuide)

- Level tabs at top — scroll horizontally, active tab scrolls to left
- Level header card with badge, colour, summary
- Course cards in an accordion: click to expand details
- Expanded card shows: description, what you'll learn bullets, what you'll build, prerequisites, duration
- "Start on GitHub →" button (opens GitHub template copy URL in new tab)
- "✓ Mark complete" checkbox — saves to localStorage + Supabase
- Overall progress bar (% of 37 courses complete)
- Per-level progress: X/N complete shown in tab badge

---

## Progress Tracking

Same dual-layer as ClaudeCodeGuide:
- `localStorage` key: `github_skills_done` (Set of course IDs)
- Supabase table: `github_skill_progress` (user_id, course_id, completed_at)
- Migration on sign-in: localStorage → Supabase upsert

---

## Header / Nav

Add to Learn dropdown in Header.tsx:
```ts
{ href: '/learn/github', label: 'GitHub Skills', desc: '37 official courses — Git to Copilot', emoji: '🐙' }
```

---

## Key Design Decisions

1. **No content hosting** — GitHub owns the courses. We link out to `github.com/new?template_owner=skills&template_name=...`. Copyright-clean.
2. **Opinionated order** — Foundation → Collaboration → Actions → Copilot → Security → Advanced. Not alphabetical.
3. **Prerequisites shown** — Each card lists which courses to complete first, reducing wasted time.
4. **"Why take this?" framing** — Each course gets a 1-sentence opinionated description beyond GitHub's tagline.
5. **37 courses, not 47** — Excluded internal tooling repos (action-update-step, exercise-creator, etc.) that aren't learner-facing.
