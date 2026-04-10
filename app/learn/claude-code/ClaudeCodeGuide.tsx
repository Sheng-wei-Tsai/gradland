'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────
interface Lesson {
  id:       string;
  emoji:    string;
  title:    string;
  tagline:  string;
  concept:  string;
  code?:    { lang: string; label: string; content: string }[];
  exercise: string;
  tip:      string;
  docs?:    string;
}
interface Level {
  id:      string;
  title:   string;
  badge:   string;
  color:   string;
  bg:      string;
  summary: string;
  lessons: Lesson[];
}

// ─── Curriculum ───────────────────────────────────────────────
const LEVELS: Level[] = [

  // ══════════════════════════════════════════════════════════════
  //  LEVEL 1 — Foundation
  // ══════════════════════════════════════════════════════════════
  {
    id: 'foundation', title: 'Foundation', badge: '🌱', color: '#10b981', bg: '#d1fae5',
    summary: 'Understand how AI actually works, learn the 4D fluency framework, install Claude Code, and run your first real session.',
    lessons: [
      {
        id: 'how-ai-works',
        emoji: '🧠', title: 'How AI & Claude Work', tagline: 'Large language models explained without the hype',
        concept: `Claude is a **large language model (LLM)** — a neural network trained on vast amounts of text. It predicts the most useful continuation of any input. That makes it brilliant at language, reasoning, and code — and it is also why it can sometimes be confidently wrong.\n\n**What Claude does well:**\n- Reading, understanding, and summarising long documents\n- Writing and editing code in dozens of languages\n- Explaining complex technical concepts in plain English\n- Reasoning through multi-step problems step by step\n- Adapting its tone — technical for engineers, plain English for a CEO\n\n**What Claude does not do:**\n- Browse the internet in real time (unless given a tool for it)\n- Remember previous conversations (each session starts fresh by default)\n- Guarantee factual accuracy — always verify important claims\n- Know about events after its training cutoff date\n\n**Context window** — Claude reads everything you put in a session as one big document. The context window is the maximum size of that document. Claude Code uses Claude's full 200 000-token window (≈150 000 words). When it fills up, old content is automatically compressed.\n\n**Claude Code is different from Claude.ai:** Claude.ai is a chatbot. Claude Code is an *agent* — it reads your actual files, runs commands, makes edits, and loops until the task is done.`,
        code: [
          {
            lang: 'text', label: 'Context window — what counts toward it',
            content: `Everything in one session counts toward the 200K-token limit:

  Your messages          (cheapest)
  Claude's responses     (moderate)
  File contents read     (can be large)
  Tool call results      (bash output, search results)
  CLAUDE.md content      (read at startup every session)

Rule of thumb:
  1 token ≈ 4 characters ≈ 0.75 words
  200K tokens ≈ 150,000 words ≈ 500 pages of text
  A typical mid-sized codebase ≈ 50K–200K tokens`,
          },
        ],
        exercise: 'Go to claude.ai and ask: "Explain how you work — what is a transformer, what is a token, and what are your limitations?" Compare its self-description to what you just read.',
        tip: 'Claude is not a search engine. It generates plausible text, not ground truth. Treat its output like advice from a brilliant but occasionally overconfident colleague — useful, but always verify critical facts.',
        docs: 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
      },
      {
        id: 'capabilities-limitations',
        emoji: '⚖️', title: 'Capabilities & Limitations', tagline: 'Know when to trust AI output — and when not to',
        concept: `The most important skill in working with AI is knowing what kind of output you are looking at. Every AI output sits somewhere on a **capability-to-limitation continuum**.\n\n**Hallucination** is when Claude confidently states something that is false. It is not lying — it genuinely has no concept of truth. It generates the most statistically likely continuation, which is usually correct but not always. Hallucinations are more common with: specific facts (dates, statistics, URLs), niche topics with limited training data, code that calls libraries with unusual APIs.\n\n**Three types of unexpected output:**\n- **Wrong but fixable** — the logic is sound but a detail is off. Review and correct.\n- **Wrong and misleading** — the reasoning looks right but the conclusion is wrong. Dangerous if you trust without checking.\n- **Refused or hedged** — Claude declines or adds excessive caveats. You can often rephrase to get a better answer.\n\n**Where Claude excels:**\n- Boilerplate code, common patterns, standard library usage\n- Explaining existing code it can read\n- Refactoring and style improvements\n- Writing tests for code that already exists\n- Summarising and transforming text\n\n**Where to double-check:**\n- Security-critical code (authentication, encryption)\n- Calculations and numeric reasoning\n- Third-party API calls (verify the method names exist)\n- Anything affecting production data`,
        code: [
          {
            lang: 'text', label: 'Prompts that reduce hallucination',
            content: `# Bad — invites fabrication
"What are the 10 best practices for Redis caching?"

# Better — grounds Claude in what it can see
"Read our current Redis configuration in config/redis.js
and suggest improvements based on our actual usage patterns."

# Ask for citations
"List best practices for JWT token storage.
For each one, note whether you are confident or uncertain."

# Constrain the search space
"Only use methods from the Node.js crypto standard library —
do not use any third-party packages."`,
          },
        ],
        exercise: 'Ask Claude a question where you already know the answer (about your own codebase, a framework you know well). Grade its response: correct, partially correct, or wrong. This calibrates your trust level.',
        tip: 'The riskiest moment is when Claude sounds most confident. Hedged answers ("I think...", "you may want to verify...") are often more accurate than authoritative ones. Calibrate for your domain.',
      },
      {
        id: '4d-framework',
        emoji: '🧭', title: 'The 4D AI Fluency Framework', tagline: 'The mental model that separates great AI users from average ones',
        concept: `Anthropic, in partnership with academic researchers, developed the **4D AI Fluency Framework** — four skills that predict whether someone works effectively with AI or just gets frustrated by it.\n\n**1. Delegate** — Decide what to hand to AI vs do yourself.\nAI is great at the work that takes *volume and iteration* but not much judgment: writing boilerplate, transforming data, reading many files, generating options. Keep to yourself: final decisions, ethical judgments, domain expertise that requires knowing your specific context.\n\n**2. Describe** — Write prompts that get the output you actually want.\nGood descriptions include: what you want (not how to get it), constraints (what to avoid), examples (show don't tell), format (JSON, a list, prose), and context (why you need it). Vague prompts get vague results.\n\n**3. Discern** — Critically evaluate what AI gives you.\nDon't just accept. Spot-check facts. Test code before deploying. Ask yourself: "Is this actually what I asked for? Is it correct? Is there a simpler solution?" Discernment is the skill that stops you from shipping hallucinated bugs.\n\n**4. Diligent** — Maintain oversight throughout long tasks.\nFor multi-step work, check intermediate results, not just the final output. Give feedback mid-task. For high-stakes actions (deleting data, pushing to production), require confirmation. You are the pilot — AI is autopilot.`,
        code: [
          {
            lang: 'text', label: 'Applying the 4D framework in practice',
            content: `DELEGATE — right tasks for AI:
  ✓ "Read all 47 files in src/ and list every API endpoint"
  ✓ "Generate 20 variations of this email subject line"
  ✗ "Decide which features to cut for our MVP" (your call)

DESCRIBE — good vs bad prompts:
  ✗ "Fix the bug"
  ✓ "The checkout flow throws a 422 when the postal code
     contains a space. Read checkout/validate.ts and fix
     the validation regex. Do not change the error message format."

DISCERN — always verify:
  • Run the tests Claude wrote — don't just read them
  • Check that library methods Claude calls actually exist
  • Re-read security-critical changes line by line

DILIGENT — oversight for long tasks:
  • After each major step: "Pause — show me what you've
    done so far before continuing."
  • For destructive operations: require explicit confirmation
  • Set --max-turns 10 for automated sessions`,
          },
        ],
        exercise: 'Pick a real task from your current work. Write out: (1) Is this worth delegating to AI? (2) A precise description including constraints and format. (3) How you will discern if the output is correct. (4) What oversight checkpoints you need.',
        tip: 'Most people over-apply the first D (delegate everything) and under-apply the third (discern). The engineers who get the most from AI spend time reviewing output, not just generating it.',
        docs: 'https://anthropic.skilljar.com/ai-fluency-framework-foundations',
      },
      {
        id: 'install',
        emoji: '⬇️', title: 'Install Claude Code', tagline: 'Terminal, VS Code, JetBrains — your choice',
        concept: `Claude Code runs on macOS, Linux, Windows (WSL), and natively in VS Code and JetBrains. The terminal CLI is the most powerful surface — install there first.\n\n**Authentication options:**\n- **Claude subscription** (Pro, Max, Team, Enterprise) — recommended for most developers. Usage is billed from your subscription.\n- **Anthropic Console API key** — for scripts, CI/CD, or if you do not have a subscription. Pay per token.\n\n**After install:** Run \`claude\` in any project directory to start a session. Claude reads your current directory and any \`CLAUDE.md\` files automatically.\n\n**IDE integration:** In VS Code, install the Claude extension from the marketplace. In JetBrains (IntelliJ, WebStorm, PyCharm), install from the plugin store. Both give you an in-editor sidebar — no terminal needed.`,
        code: [
          {
            lang: 'bash', label: 'Install — macOS / Linux / WSL',
            content: `# Recommended: native installer (auto-updates)
curl -fsSL https://claude.ai/install.sh | bash

# Verify install
claude --version

# Start in your project
cd my-project && claude`,
          },
          {
            lang: 'powershell', label: 'Install — Windows PowerShell',
            content: `# Windows native (PowerShell)
irm https://claude.ai/install.ps1 | iex

# Or use WSL (recommended for full Unix tool support)
wsl --install
# then follow macOS/Linux instructions inside WSL`,
          },
          {
            lang: 'bash', label: 'Configure API key (alternative to subscription)',
            content: `# Set your Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Add to your shell profile to persist
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc

# Or use the interactive login (opens browser)
claude login`,
          },
          {
            lang: 'bash', label: 'Useful startup flags',
            content: `# Start with a specific prompt (no interactive session)
claude -p "What does this project do?"

# Resume the most recent session
claude --resume

# Verbose mode — see all tool calls
claude --verbose

# Print mode — great for scripting
claude -p "List all API endpoints" --output-format json`,
          },
        ],
        exercise: 'Install Claude Code. Run `claude --version`, then `cd` into your most-used project and run `claude`. Type "what does this project do?" — your first session.',
        tip: 'The native curl installer auto-updates Claude Code in the background. If you installed via Homebrew (`brew install --cask claude-code`), run `brew upgrade claude-code` manually to update.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/getting-started',
      },
      {
        id: 'agentic-loop',
        emoji: '🔄', title: 'The Agentic Loop', tagline: 'How Claude Code actually executes tasks',
        concept: `Claude Code is not just a chatbot — it is an **agent**. The difference: a chatbot responds and waits. An agent **acts, observes the result, then acts again** until the task is complete.\n\n**The loop:**\n1. You give Claude a task\n2. Claude plans what to do (reads relevant files, searches for context)\n3. Claude takes an action (edits a file, runs a command, searches for a pattern)\n4. Claude observes the result (read the file back, see the command output)\n5. Claude decides the next action — or stops if done\n\n**Claude's built-in tools (you never call these directly):**\n- **Read** — reads a file's contents\n- **Edit / Write** — modifies or creates files\n- **Bash** — runs any shell command\n- **Grep** — searches file contents by pattern\n- **Glob** — finds files by name pattern\n- **WebFetch** — fetches a URL (when enabled)\n\n**Permissions model:** Claude asks before taking actions that could have side effects. You can approve each action (careful mode) or enable auto-accept for a session. For CI/CD, use \`--dangerously-skip-permissions\` only in sandboxed environments.`,
        code: [
          {
            lang: 'text', label: 'What a session loop looks like',
            content: `You: "Add rate limiting to the login endpoint. Max 5 attempts per IP."

Claude thinks:
  → I need to find the login endpoint first
  → [Grep] searching for "login" in src/routes/
  → Found: src/routes/auth.ts line 23
  → [Read] reading src/routes/auth.ts
  → I see it uses Express. I'll use express-rate-limit.
  → [Bash] checking if express-rate-limit is installed: npm ls express-rate-limit
  → Not installed. I'll install it.
  → [Bash] npm install express-rate-limit
  → [Edit] adding rate limiter middleware to auth.ts
  → [Read] re-reading auth.ts to verify the edit is correct
  → Done. Let me explain what I changed.

Claude: "I added rate limiting to /api/auth/login. Here's what changed..."`,
          },
          {
            lang: 'bash', label: 'Control how Claude acts',
            content: `# Default: Claude asks permission before each tool use
claude

# Auto-accept all tool uses (careful — it will edit files without asking)
claude --accept-all

# Plan mode: Claude plans but does not execute until you say go
claude --plan

# Limit how many steps Claude can take
claude --max-turns 20

# Run completely non-interactively (for CI)
claude -p "run the tests and fix any failures" \
  --dangerously-skip-permissions \
  --max-turns 30`,
          },
        ],
        exercise: 'Run `claude --verbose` in a project and ask Claude to "find all TODO comments in the codebase." Watch how it uses Grep and Glob tools internally. Notice the loop: plan → search → read → respond.',
        tip: 'The agentic loop means Claude *compounds* errors. If it misunderstands step 1, it builds on that mistake in steps 2–10. For complex tasks, use Plan Mode first: Claude shows you the plan before doing anything.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/overview',
      },
      {
        id: 'first-session',
        emoji: '🚀', title: 'Your First Real Session', tagline: 'Explore → Plan → Code → Commit',
        concept: `The official Claude Code workflow is **Explore → Plan → Code → Commit**. It sounds simple, but following it rigorously is the difference between Claude producing something useful and Claude confidently building the wrong thing.\n\n**Explore:** Ask Claude to read the relevant parts of the codebase before touching anything. "Before you write any code, read the auth module and explain how sessions work." This builds Claude's understanding and catches mismatches between what you think the code does and what it actually does.\n\n**Plan:** For anything non-trivial, ask Claude to write a plan first. "Plan the implementation — which files will you change, what will you add, and what could go wrong?" Review this plan before saying go. Use \`--plan\` mode to force this.\n\n**Code:** Now implement. Claude edits files, runs tests, and loops until the task passes. You can steer mid-task: "good, but use the existing AuthService instead of creating a new one."\n\n**Commit:** Ask Claude to write the commit message. It has seen every change and will write a message that explains the *why*, not just the *what*.\n\n**Approval mode vs Auto-accept:**\n- **Approval mode (default):** Claude shows each action before executing. Best for unfamiliar codebases or sensitive changes.\n- **Auto-accept:** Claude executes without waiting. Faster, but requires trust. Enable with \`--accept-all\` or toggle with \`/accept-all\` in session.`,
        code: [
          {
            lang: 'text', label: 'Running the full workflow',
            content: `# 1. EXPLORE — always start here
"Before writing any code: read the authentication module
and explain how user sessions are created and validated."

# 2. PLAN — review before acting
"Plan how you would add refresh token support.
List every file you'll change, what you'll add,
and what tests need updating. Don't write code yet."

# 3. CODE — implement after agreeing on the plan
"The plan looks good. Implement it."
# (mid-task steering is fine)
"Good, but use Redis for token storage — we already have it."

# 4. COMMIT — let Claude write the message
"Commit this with a message explaining what we added and why."`,
          },
          {
            lang: 'bash', label: 'Plan Mode — force Claude to plan first',
            content: `# Start in plan mode — Claude writes a plan, waits for your approval
claude --plan

# Or enable it mid-session with the slash command
/plan

# Plan mode output looks like:
# "Here is my plan:
#  1. Read src/auth/session.ts to understand current token handling
#  2. Add refreshToken field to the User model in src/models/user.ts
#  3. Create src/auth/refresh.ts with the refresh endpoint
#  4. Add refresh route to src/routes/auth.ts
#  5. Write tests in src/auth/__tests__/refresh.test.ts
# Shall I proceed?"`,
          },
        ],
        exercise: 'Pick a small feature in a real project. Run `claude --plan` and ask it to add the feature. Review its plan — is it missing anything? Correct it, then say "proceed." Follow all four steps: Explore, Plan, Code, Commit.',
        tip: 'The single biggest mistake beginners make: skipping Explore and going straight to "add X." Claude will build something that works in isolation but conflicts with existing patterns. Always explore first.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/common-workflows',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  //  LEVEL 2 — Core Skills
  // ══════════════════════════════════════════════════════════════
  {
    id: 'core', title: 'Core Skills', badge: '⚡', color: '#f59e0b', bg: '#fef3c7',
    summary: 'CLAUDE.md for persistent memory, context management, debugging, building features, tests, and git — the daily driver skills.',
    lessons: [
      {
        id: 'claude-md',
        emoji: '📝', title: 'CLAUDE.md — Persistent Memory', tagline: 'The instructions Claude reads every single session',
        concept: `CLAUDE.md is a Markdown file that Claude reads at the start of every session. It is your project's memory — what a new engineer would need to know on day one.\n\nWithout CLAUDE.md, Claude infers your stack from file extensions and patterns. This works, but it guesses. With a good CLAUDE.md, Claude knows your exact conventions, forbidden patterns, and architectural decisions from the first message.\n\n**What to put in CLAUDE.md:**\n- How to start the dev server (exact command, not "run the dev command")\n- How to run tests (framework name, command, any flags)\n- Architecture decisions that aren't obvious from the code\n- What NOT to do (patterns you've explicitly rejected)\n- Key file locations for important modules\n\n**Three levels of CLAUDE.md:**\n- \`~/.claude/CLAUDE.md\` — personal preferences for all projects\n- \`CLAUDE.md\` (root) — project-wide context for all contributors\n- \`src/payments/CLAUDE.md\` — module-specific context, read when Claude works in that directory\n\n**Auto-memory:** As Claude discovers things mid-session ("tests use Vitest not Jest"), it saves these to its memory automatically. You never have to tell it the same fact twice.`,
        code: [
          {
            lang: 'markdown', label: 'Strong CLAUDE.md template',
            content: `# Project Name — CLAUDE.md

## Commands
- Dev server: \`npm run dev\` (NOT npm start — we aliased it)
- Tests: \`npm test\` — Vitest, not Jest
- Build check: \`npm run check\` — run this before EVERY push
- Database migrations: \`npx drizzle-kit push\` (NOT migrate)

## Architecture
- Next.js 16 App Router — all pages use App Router conventions
- Auth: Supabase SSR with Row Level Security
- Styles: inline React styles only — no Tailwind, no CSS modules
- API routes: Bearer token pattern, validate with \`verifyAuth()\`

## Conventions
- No speculative abstractions — solve the actual problem
- Prefer Edit over Write for existing files
- Use \`React.CSSProperties\` for typed inline styles
- All DB queries go through lib/db.ts — never query Supabase directly in components

## Do NOT
- Never use git push --force on main
- Never add --no-verify to bypass the pre-push hook
- Never import Tailwind classes — we removed it intentionally
- Never hardcode API keys — use environment variables

## Key Files
- Auth logic: lib/auth.ts
- DB schema: lib/schema.ts
- API middleware: middleware.ts`,
          },
          {
            lang: 'markdown', label: 'Personal ~/.claude/CLAUDE.md',
            content: `# Henry's Claude Preferences

## Style
- I prefer concise responses — no summaries of what you just did
- Skip the preamble. Lead with the answer.
- Use TypeScript types wherever possible
- When showing diffs, show context lines around the change

## Workflow
- Always read the file before editing it
- When in doubt, ask before making destructive changes
- Prefer smaller, focused commits over one large commit

## Tools I use
- Editor: VS Code with Prettier (single quotes, 2-space indent)
- Shell: zsh with oh-my-zsh
- Git: conventional commits format (feat:, fix:, docs:)`,
          },
        ],
        exercise: 'Create a CLAUDE.md in your main project right now. Include: (1) exact command to start dev server, (2) exact command to run tests, (3) one architecture decision that surprised you when you joined, (4) one thing contributors should never do.',
        tip: 'Keep CLAUDE.md under 150 lines. Claude reads it every session — it costs tokens each time. Link to longer docs rather than including them inline: "See ADR.md for architecture decisions."',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/memory',
      },
      {
        id: 'context-management',
        emoji: '🗃️', title: 'Context Management', tagline: 'Keep your sessions focused as they grow',
        concept: `Every message, file read, and command output in a session consumes context window tokens. Long sessions become expensive and Claude may start losing track of earlier instructions. Learning to manage context is the skill that separates power users from beginners.\n\n**Signs your context is getting full:**\n- Claude starts forgetting instructions you gave earlier\n- Responses get shorter or more generic\n- Claude re-reads files it already processed\n- You see a "context compressed" notice\n\n**Built-in context commands:**\n- \`/compact\` — Claude summarises the conversation so far, keeping the key decisions and discarding verbatim tool outputs. Saves 60–80% of tokens. Use this proactively before context fills.\n- \`/clear\` — wipes the session entirely. Fresh start. Use when you are switching to a completely different task.\n- \`/context\` — shows how many tokens you have used and what is in context.\n\n**Strategy: task-scoped sessions**\nDo not run your entire workday in one session. One session per task. When the task is done, commit, and start a fresh session. CLAUDE.md restores all the project context automatically.`,
        code: [
          {
            lang: 'text', label: 'Context management commands',
            content: `# See current context usage
/context

# Example output:
# Context: 45,231 / 200,000 tokens (22%)
# Files in context: auth.ts, user.ts, schema.ts
# Messages: 28 turns

# Compress context — keeps decisions, drops verbatim output
/compact

# Clear entirely — fresh session, CLAUDE.md reloads
/clear

# Resume a previous session (picks up where you left off)
claude --resume`,
          },
          {
            lang: 'text', label: 'What to put in CLAUDE.md vs session context',
            content: `In CLAUDE.md (permanent, loaded every session):
  ✓ Build commands, test commands
  ✓ Architecture decisions and conventions
  ✓ What to avoid and why
  ✓ Key file locations

In session context (ephemeral, this task only):
  ✓ "For this task, focus only on the payments module"
  ✓ "The bug we're fixing is: session expires after 2 min"
  ✓ "I want tests using mock data, not hitting the DB"
  ✗ Don't repeat things already in CLAUDE.md`,
          },
        ],
        exercise: 'Run a session until it has 20+ turns. Type `/context` to see token usage. Then type `/compact` — observe how it summarises. Compare the token count before and after.',
        tip: 'Run `/compact` proactively when you finish a major subtask within a session, not just when context is almost full. You will get better results in the second half of the session.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/context-management',
      },
      {
        id: 'reading-editing',
        emoji: '📖', title: 'Reading & Editing Files', tagline: 'Let Claude do the grep work — you steer',
        concept: `Claude Code can read, search, and edit any file in your project. You never copy-paste code into the chat — Claude finds what it needs using its tools.\n\n**How to direct Claude effectively:**\nDescribe the *change* in terms of its *effect*, not the mechanism. "Change the timeout to 8 hours" not "find line 47 in auth.ts and change the number 24 to 8."\n\n**Multi-file edits:** Claude handles changes that span many files. Give it the requirement and let it find all the places that need changing. "The API returns snake_case keys but the frontend expects camelCase — find and fix all the places where this mismatch causes bugs."\n\n**Diff preview:** By default, Claude shows you a diff before writing. You can say "looks good" or redirect: "actually, keep the error message the same — just change the status code."\n\n**File creation:** Claude can create new files from scratch. Describe the file's purpose and what interface it should expose. Claude will look at similar files in the project for style conventions.`,
        code: [
          {
            lang: 'text', label: 'Effective file editing prompts',
            content: `# Change a specific value
"In the auth config, change the session timeout from 24h to 8h."

# Add something to an existing file
"Add input validation to createUser: email must be valid format,
name must be 2–50 characters, non-empty."

# Cross-file refactor
"The function getUser() has been renamed to fetchUser() everywhere.
Find all callers and update them."

# Create a new file matching existing patterns
"Create a new service file for payments, following the same
pattern as the existing UserService in src/services/user.ts."

# Find before editing (good habit for unfamiliar code)
"Before making any changes: find where user permissions are
checked and explain the current permission model."`,
          },
          {
            lang: 'bash', label: 'Working with large codebases',
            content: `# Tell Claude where to focus
"Only look in src/api/ — ignore frontend code."

# Give Claude a starting point
"Start from the LoginController in src/controllers/auth.ts
and trace the code path for a failed login."

# Limit scope explicitly
"Read only the three files I mention:
src/auth/session.ts, src/auth/token.ts, src/middleware/auth.ts.
Do not read any other files."`,
          },
        ],
        exercise: 'Pick a constant or configuration value in a real project that appears in multiple files (like a timeout value, an API version string, or a feature flag name). Ask Claude to find all occurrences and update them consistently.',
        tip: 'If you know which file to change, say so: "In src/auth/session.ts, change X." Claude will still verify the file exists and read it first, but you save the search step. Specificity makes Claude faster.',
      },
      {
        id: 'debugging',
        emoji: '🐛', title: 'Debug & Fix Errors', tagline: 'Paste the error — Claude traces to the root cause',
        concept: `Claude Code is particularly strong at debugging because it can read the full call stack, trace through multiple files, and understand the runtime context — all at once.\n\n**What to give Claude when debugging:**\n- The full error message and stack trace (not just the last line)\n- The expected behaviour vs actual behaviour\n- When it started happening (if relevant — did a recent change cause it?)\n- Any relevant environment details (OS, Node version, browser)\n\n**Power move: pipe output directly**\nInstead of copying error output, pipe it from the terminal straight into Claude. This works for log files, failing tests, crash dumps, and \`curl\` output.\n\n**Root cause vs symptoms:** Claude identifies the *root cause*, not just where the error is thrown. A TypeError on line 47 might be caused by a missing null check 3 functions up the call stack. Claude traces the full path.`,
        code: [
          {
            lang: 'bash', label: 'Pipe errors directly to Claude',
            content: `# Analyse a failing test
npm test 2>&1 | claude -p "Why are these tests failing? Fix them."

# Check recent logs for errors
tail -500 logs/app.log | claude -p "Find errors and anomalies.
Explain root causes, not just symptoms."

# Debug a crashing process
npm start 2>&1 | head -100 | claude -p "What is causing this crash?"

# Analyse a curl response
curl -s -w "\n%{http_code}" api.example.com/endpoint | \
  claude -p "What does this response tell us about the API state?"

# Grep errors then explain
grep "ERROR" logs/app.log | sort | uniq -c | sort -rn | \
  claude -p "Which errors are most frequent? What likely causes each one?"`,
          },
          {
            lang: 'text', label: 'In-session debugging prompts',
            content: `# Give full context
"I'm getting this error in production:
TypeError: Cannot read properties of undefined (reading 'userId')
  at middleware/auth.ts:23
  at Layer.handle [as handle_request] ...

This started happening after the deployment yesterday.
Find the root cause and fix it."

# Describe the symptom
"Users can log in but their session expires after exactly
2 minutes instead of 24 hours. Users report it only happens
when they use the mobile app, not the web app. Find why."

# Ask for a hypothesis before fixing
"Before writing any code: what are the three most likely
causes of this bug? Explain your reasoning."`,
          },
        ],
        exercise: 'Find a failing test or error in any project (create one intentionally if needed). Give Claude the full stack trace and ask it to explain the root cause before fixing it. Check if its explanation is correct.',
        tip: 'Give Claude the full stack trace, not just the error message. The root cause is almost always several frames up from where the error is thrown. The error message tells you what failed; the trace tells you why.',
      },
      {
        id: 'build-features',
        emoji: '🔨', title: 'Build Features End-to-End', tagline: 'Requirements in, working code out',
        concept: `Building features with Claude Code follows the same Explore → Plan → Code → Commit pattern, but for features the *quality of your requirement* is the biggest variable in result quality.\n\n**What makes a good feature requirement:**\n- **Outcome, not implementation** — "Max 5 login attempts per IP per 15 minutes" not "add rate limiting middleware"\n- **Constraints** — "Use Redis if it exists in the project, otherwise in-memory"\n- **Edge cases** — "Return 429 with a Retry-After header, not a redirect"\n- **What to preserve** — "Don't change the error message format — it's tested by integration tests"\n\n**Claude's implementation process:**\n1. Reads relevant existing code to understand patterns\n2. Checks what dependencies are already installed\n3. Implements in the same style as the rest of the codebase\n4. Writes tests if you ask (or if CLAUDE.md says to)\n5. Runs tests to verify nothing is broken\n\n**Mid-task steering:** You can redirect Claude at any point. "Good start, but use the existing AuthService — don't create a new one." Claude incorporates corrections without restarting from scratch.`,
        code: [
          {
            lang: 'text', label: 'Feature requirements template',
            content: `Good feature prompt structure:

"Add [feature] to [where].

Requirements:
- [Specific outcome 1]
- [Specific outcome 2]

Constraints:
- [What to use / not use]
- [What not to change]

Edge cases to handle:
- [Edge case 1]
- [Edge case 2]"

---

Example:
"Add rate limiting to the POST /api/auth/login endpoint.

Requirements:
- Max 5 attempts per IP address per 15-minute window
- Return HTTP 429 with Retry-After header showing seconds until reset
- Log blocked attempts to the security log

Constraints:
- Use the rate-limiter-flexible package if it's installed,
  otherwise use express-rate-limit
- Do not modify the existing error response format

Edge cases:
- IPv6 addresses should be treated the same as IPv4
- Rate limit should NOT apply to the /api/auth/logout endpoint"`,
          },
          {
            lang: 'text', label: 'Mid-task steering examples',
            content: `# Redirect without restarting
You: "Good start, but use the existing CacheService
     instead of creating a new Redis client directly."

# Add a constraint mid-task
You: "Also make sure the new endpoint requires authentication —
     check how the /api/users endpoint does it."

# Catch a mistake
You: "Wait — don't run npm install for that package.
     Check if we already have something equivalent installed."

# Approve and continue
You: "The plan looks right. Proceed."
You: "This diff looks good — commit it."`,
          },
        ],
        exercise: 'Write a precise feature requirement for something you\'ve been putting off. Include outcome, constraints, and 2 edge cases. Give it to Claude. After it\'s done, check: did it handle all edge cases? Did it preserve what you said not to change?',
        tip: 'Vague requirements produce working code that does the wrong thing. "Add pagination" gives you one thing; "Add cursor-based pagination using the `cursor` query parameter, returning a `nextCursor` in the response" gives you the right thing.',
      },
      {
        id: 'tests-and-git',
        emoji: '✅', title: 'Tests, Reviews & Git', tagline: 'The full developer loop — automated',
        concept: `The combination of tests, code review, and git is where Claude Code delivers the most time savings. Each of these tasks is well-defined, repetitive, and requires reading code Claude can already see.\n\n**Tests:** Claude writes tests for existing code, runs them, fixes failures, and adds edge cases. Tell Claude which test framework you use in CLAUDE.md or it will guess.\n\n**Code review:** Ask Claude to review any diff for bugs, security issues, and missing tests before you commit. This catches issues in seconds that would take hours in a PR review cycle.\n\n**Git:** Claude writes commit messages that explain the *why* (not just "update auth.ts"). It creates branches, pushes, and opens PRs with proper descriptions. It knows git deeply — rebasing, cherry-picking, stash — ask for what you need.`,
        code: [
          {
            lang: 'bash', label: 'Test workflow',
            content: `# Write tests for existing code
claude "Write unit tests for src/auth/session.ts.
Cover: happy path, expired token, invalid signature,
missing token, and concurrent session edge case."

# Write tests, run them, fix failures — all in one
claude "Write tests for UserService, run them, fix any failures."

# Review a diff before committing
git diff | claude -p "Review for bugs, security issues,
and missing edge cases. Cite specific lines."

# Find missing tests for a PR
git diff main | claude -p "What test cases are missing for
these changes? Write them."

# Run tests and get a summary
npm test 2>&1 | claude -p "Which tests are failing and why?
Group them by root cause."`,
          },
          {
            lang: 'bash', label: 'Git workflow',
            content: `# Write a meaningful commit message
claude "Commit the staged changes with a message explaining
what changed and why (not just what files changed)."

# Create a PR with description and checklist
claude "Create a pull request. Write a summary of what changed,
why it was needed, and a testing checklist."

# Create a branch and implement in one step
claude "Create a branch feature/add-rate-limiting,
implement the rate limiting we designed,
then commit and push."

# Review commits before merging
git log main..HEAD --oneline | claude -p "Are these commits
complete for the rate limiting feature? Anything missing?"

# Generate a changelog from recent commits
git log --oneline v1.2.0..HEAD | claude -p "Write a
user-facing changelog entry for these commits."`,
          },
        ],
        exercise: 'Find a file with no tests. Ask Claude: "Write comprehensive tests for [file]. Cover happy path, edge cases, and failure modes." Run the tests. If any fail, ask Claude to fix them. Add the test file to a commit.',
        tip: 'Always tell Claude your test framework in CLAUDE.md. "Tests: Vitest (not Jest)" prevents Claude from writing Jest-style tests that fail to run in your project.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/common-workflows',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  //  LEVEL 3 — Power User
  // ══════════════════════════════════════════════════════════════
  {
    id: 'power', title: 'Power User', badge: '🔥', color: '#ef4444', bg: '#fee2e2',
    summary: 'Custom skills, hooks, CLI scripting, visual communication, and reasoning mode — the 10× multipliers.',
    lessons: [
      {
        id: 'slash-commands',
        emoji: '/', title: 'Slash Commands & Built-in Skills', tagline: 'Claude\'s built-in power tools — type / to discover them',
        concept: `Slash commands are pre-built skills that ship with Claude Code. They can run in parallel, spawn subagents, and automate tasks that would otherwise require careful multi-step prompting.\n\n**Most valuable built-in skills:**\n- \`/simplify\` — spawns 3 parallel review agents: code quality, test coverage, and style. Each files separate findings. Great for pre-PR cleanup.\n- \`/batch <instruction>\` — decomposes a large change into independent units, spawns one agent per unit (each in its own git worktree), each opens its own PR. Powerful for large refactors.\n- \`/debug\` — enables detailed debug logging for the current session. Claude explains every decision in its loop.\n- \`/compact\` — summarises and compresses the session context (saves 60–80% of tokens while preserving key decisions).\n- \`/agents\` — opens the subagent management interface. Create, list, and manage custom subagents.\n- \`/schedule\` — create a scheduled task that runs this prompt on a timer.\n- \`/accept-all\` — toggle auto-accept mode for the current session.\n\nType \`/\` in any session to see all available commands — both built-in and your own custom skills.`,
        code: [
          {
            lang: 'text', label: 'Built-in skill examples',
            content: `# Review and clean up recent changes before a PR
/simplify

# Large migration — spawns one agent per file/module
/batch migrate all class components in src/components/ to function components

# Migrate an entire API version
/batch update all usages of the v1 API to v2, maintaining backward compatibility

# Debug something weird mid-session
/debug

# Compact context after a long work session
/compact

# Create a scheduled task for this prompt
/schedule

# See all available skills (built-in + your custom ones)
/`,
          },
          {
            lang: 'text', label: 'What /simplify actually does',
            content: `/simplify launches 3 parallel review agents:

Agent 1 — Code Quality Review:
  • Finds duplicate logic and suggests abstractions
  • Identifies dead code and unused variables
  • Spots performance issues (N+1 queries, unnecessary re-renders)

Agent 2 — Test Coverage Review:
  • Lists untested code paths in your recent changes
  • Writes missing test cases
  • Runs existing tests to catch regressions

Agent 3 — Style & Consistency Review:
  • Checks naming consistency with the rest of the codebase
  • Identifies type safety gaps (any types, missing null checks)
  • Ensures error handling is consistent

All three run simultaneously. Results are merged into one report.`,
          },
        ],
        exercise: 'Make 5–10 lines of changes to a real project. Then run `/simplify`. Read the three reports. How many issues did it catch that you would have missed?',
        tip: 'Run `/simplify` on every PR before creating it. It takes 30 seconds and consistently finds things human reviewers miss — especially in the areas they are comfortable with and stop scrutinising.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/slash-commands',
      },
      {
        id: 'custom-skills',
        emoji: '🛠️', title: 'Write Custom Skills', tagline: 'Turn any workflow into a /slash-command',
        concept: `A **skill** is a SKILL.md file that turns any multi-step workflow into a reusable slash command. Skills are the most powerful customisation in Claude Code — they make your entire team faster by encoding expertise that would otherwise live only in senior engineers' heads.\n\n**What makes skills different from CLAUDE.md:**\n- CLAUDE.md gives Claude *permanent background context* ("always use TypeScript")\n- Skills give Claude *task-specific instructions* that activate on demand ("/review-pr")\n- Skills can restrict which tools Claude uses (security!)\n- Skills can run in isolated subagents (no context pollution)\n- Skills can accept arguments via \`$ARGUMENTS\`\n\n**Skill locations:**\n- \`~/.claude/skills/\` — personal skills, work in all projects\n- \`.claude/skills/\` — project skills, commit to git and share with the team\n- Enterprise managed skills — pushed from a central server, cannot be overridden\n\n**SKILL.md frontmatter fields:**\n- \`name\` — the slash command name (e.g., \`review-pr\` → \`/review-pr\`)\n- \`description\` — **critical**: Claude uses this to auto-trigger the skill. Write it carefully.\n- \`allowed-tools\` — whitelist which tools Claude can use (e.g., \`Bash(gh *) Read\`)\n- \`disable-model-invocation\` — prevents Claude from calling the API for this skill (cost control)\n- \`context\` — \`fork\` runs the skill in an isolated subagent`,
        code: [
          {
            lang: 'bash', label: 'Create your first skill',
            content: `# Create a personal skill directory
mkdir -p ~/.claude/skills/review-pr

# Create the SKILL.md
cat > ~/.claude/skills/review-pr/SKILL.md << 'HEREDOC'
---
name: review-pr
description: Review the current pull request for bugs, security issues, and missing tests
allowed-tools: Bash(gh *) Read Grep
context: fork
---

Review the current pull request thoroughly.

Steps:
1. Get the diff: run \`gh pr diff\`
2. Get open review comments: run \`gh pr view --comments\`
3. Read any files that changed significantly

Check for:
- Security vulnerabilities (injection, auth bypass, data exposure)
- Logic bugs and edge cases
- Missing error handling
- Tests for new code paths
- Breaking API changes

Report issues grouped by severity: Critical / High / Medium / Low.
For each issue: file name, line number, description, suggested fix.
HEREDOC

# Test it in a repo with an open PR
cd my-project && claude
/review-pr`,
          },
          {
            lang: 'yaml', label: 'Skill with arguments — fix a GitHub issue',
            content: `---
name: fix-issue
description: Fix a GitHub issue by number — reads the issue, finds relevant code, implements the fix
allowed-tools: Bash(gh *) Read Edit Grep Glob
---

Fix GitHub issue number $ARGUMENTS.

Process:
1. Read the issue: gh issue view $ARGUMENTS
2. Understand what is being asked
3. Find the relevant code using Grep and Glob
4. Read the files that need changing
5. Implement the fix
6. Write or update tests
7. Commit with a message referencing #$ARGUMENTS

Start by reading the issue before writing any code.`,
          },
          {
            lang: 'yaml', label: 'Project skill committed to the repo',
            content: `# .claude/skills/deploy/SKILL.md
---
name: deploy
description: Deploy the application to a specified environment with safety checks
allowed-tools: Bash(npm * git * gh *)
disable-model-invocation: true
---

Deploy to $ARGUMENTS environment.

Safety checklist before deploying:
1. Run npm run check — abort if it fails
2. Confirm all tests pass: npm test
3. Check for uncommitted changes: git status
4. Verify the target environment: $ARGUMENTS must be staging or production

If all checks pass:
- For staging: npm run deploy:staging
- For production: prompt for confirmation, then npm run deploy:production

Log the deployment in DEPLOYMENTS.md with timestamp and commit hash.`,
          },
        ],
        exercise: 'Create a personal skill for something you do every week: a changelog generator, a dependency audit, a code review checklist. Test it in 3 different projects to verify the description triggers correctly.',
        tip: 'The `description` field is how Claude decides to auto-suggest your skill. Write it like a user story: "When the user wants to [X], run this skill." A vague description means Claude will never suggest it proactively.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/skills',
      },
      {
        id: 'skill-design',
        emoji: '🎨', title: 'Skill Design Patterns', tagline: 'Make skills that are reliable, safe, and team-ready',
        concept: `Writing a skill that *works* is easy. Writing a skill that *always works correctly, without surprising side effects, at scale across a team* requires deliberate design.\n\n**Pattern 1: Progressive disclosure in skill directories**\nOrganise large skills as directories with multiple files. Put the main instructions in SKILL.md, reference detail files for specific scenarios. This keeps the active context small.\n\n**Pattern 2: Restrict tools for safety**\nAlways use \`allowed-tools\` to whitelist the minimum tools a skill needs. A documentation skill should never have access to \`Bash\`. A deploy skill should only have access to specific deploy commands: \`Bash(npm run deploy*)\`.\n\n**Pattern 3: Structured output for subagent skills**\nSkills running in subagents (with \`context: fork\`) need to return structured output — the parent agent can only see the return value, not intermediate steps. Use JSON or a defined report format.\n\n**Pattern 4: Obstacle reporting**\nTell the skill what to do when it hits a problem: "If you cannot find the relevant file, report the search terms you tried and stop — do not guess." Prevents silent failures.\n\n**Pattern 5: Share via git**\nCommit project skills to \`.claude/skills/\` in your repo. Every engineer gets your team's custom commands on \`git clone\`.`,
        code: [
          {
            lang: 'text', label: 'Skill directory structure',
            content: `.claude/
  skills/
    review-pr/
      SKILL.md           # Main instructions (references the others)
      security.md        # Security checklist (included by main)
      performance.md     # Performance checklist
    deploy/
      SKILL.md           # Orchestrates deployment
      staging.md         # Staging-specific steps
      production.md      # Production-specific steps
    onboard/
      SKILL.md           # New engineer onboarding
      architecture.md    # Architecture overview
      first-tasks.md     # Good first issues

# In SKILL.md, reference sub-files:
# "Read the security checklist in security.md and apply each item."`,
          },
          {
            lang: 'yaml', label: 'Skill with structured output (for subagent use)',
            content: `---
name: analyse-module
description: Analyse a code module and return a structured report
allowed-tools: Read Grep Glob
context: fork
---

Analyse the module at path $ARGUMENTS.

Return your analysis as JSON with this exact structure:
{
  "module": "path/to/module",
  "purpose": "one sentence description",
  "dependencies": ["list", "of", "imports"],
  "exports": ["list", "of", "public", "functions"],
  "complexity": "low|medium|high",
  "issues": [
    { "severity": "high|medium|low", "description": "..." }
  ],
  "test_coverage": "none|partial|good"
}

If you cannot find the module at $ARGUMENTS, return:
{ "error": "Module not found", "searched": "$ARGUMENTS" }`,
          },
        ],
        exercise: 'Take your skill from the previous lesson and add `allowed-tools` to whitelist only what it actually needs. Then add obstacle reporting: what should it do if the key step fails? Commit it to a project repo.',
        tip: 'Test your skills across 3 different projects before committing. A skill that works in one project but fails in another usually has a hardcoded path or command that doesn\'t generalise. Make it adaptive.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/skills',
      },
      {
        id: 'hooks',
        emoji: '🪝', title: 'Hooks — Automate Around Actions', tagline: 'Shell commands that run before or after Claude acts',
        concept: `Hooks are shell commands that Claude Code runs automatically in response to tool events. They give you **deterministic** control over things that Claude's probabilistic nature cannot guarantee: formatting, linting, logging, notifications.\n\n**Hook events:**\n- \`PreToolUse\` — runs before Claude calls a tool (can block the tool call)\n- \`PostToolUse\` — runs after Claude calls a tool (format, lint, log)\n- \`Notification\` — runs when Claude sends a notification to you\n- \`Stop\` — runs when Claude finishes a task (notify, clean up)\n\n**Hook matchers:** Hooks trigger based on tool name patterns. \`"matcher": "Edit|Write"\` triggers on any file edit. \`"matcher": "Bash"\` triggers on any shell command.\n\n**Environment variables in hooks:**\n- \`$CLAUDE_TOOL_INPUT_FILE_PATH\` — path of the file being written\n- \`$CLAUDE_TOOL_INPUT_COMMAND\` — bash command being run\n- \`$CLAUDE_TOOL_NAME\` — name of the tool being called\n\n**Blocking hooks:** If a PreToolUse hook exits with code 1, Claude will not call the tool. Use this to block dangerous commands.`,
        code: [
          {
            lang: 'json', label: '~/.claude/settings.json — real-world hooks',
            content: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true"
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "eslint --fix \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true",
            "background": true
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "comment": "Block force pushes",
            "command": "echo \"$CLAUDE_TOOL_INPUT_COMMAND\" | grep -q 'push.*--force\\|push.*-f' && echo 'BLOCKED: force push not allowed' && exit 1 || exit 0"
          },
          {
            "type": "command",
            "comment": "Audit log all bash commands",
            "command": "echo \"$(date -Iseconds) $CLAUDE_TOOL_INPUT_COMMAND\" >> ~/.claude/audit.log"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "comment": "Desktop notification when Claude finishes",
            "command": "osascript -e 'display notification \"Claude Code finished\" with title \"Done\"' 2>/dev/null || notify-send 'Claude Code' 'Task finished' 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}`,
          },
          {
            lang: 'bash', label: 'Hook for Go / Python / Ruby projects',
            content: `# Go — run gofmt after every file edit
# In settings.json PostToolUse:
"command": "gofmt -w \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true"

# Python — run black + isort
"command": "black \"$CLAUDE_TOOL_INPUT_FILE_PATH\" && isort \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true"

# Ruby — run rubocop --autocorrect
"command": "rubocop --autocorrect \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true"

# Language-agnostic: only format if the file is a source file
"command": "case \"$CLAUDE_TOOL_INPUT_FILE_PATH\" in *.ts|*.tsx|*.js|*.jsx) prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\";; esac"`,
          },
        ],
        exercise: 'Add a PostToolUse hook that runs your project\'s formatter (prettier, gofmt, black) after every file edit. Ask Claude to edit a deliberately messy file — verify it comes out formatted.',
        tip: 'Use `"background": true` for hooks that take more than 100ms (linters, type checkers). This prevents hooks from blocking Claude\'s loop. The hook runs in parallel while Claude continues.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/hooks',
      },
      {
        id: 'cli-scripting',
        emoji: '📟', title: 'CLI Scripting & Automation', tagline: 'Pipe, compose, and run Claude in scripts',
        concept: `Claude Code follows Unix philosophy: it composes with other tools via pipes. The \`-p\` flag enables headless, non-interactive mode — input goes in, output comes out, no prompts.\n\nThis makes Claude a reasoning engine you can embed in any pipeline: cron jobs, CI steps, git hooks, shell aliases, and deploy scripts.\n\n**Output formats:**\n- Default: plain text (good for humans)\n- \`--output-format json\` — structured JSON for scripting\n- \`--output-format stream-json\` — newline-delimited JSON stream\n\n**Permission handling in scripts:**\n- \`--allowedTools\` — explicitly whitelist which tools Claude can use\n- \`--dangerously-skip-permissions\` — skip all permission prompts (only in sandboxed CI environments)\n\n**Composing Claude with other tools:**\nClause is most powerful when chained: grep filters → Claude explains → jq parses → next tool consumes. The output of any tool becomes Claude's input.`,
        code: [
          {
            lang: 'bash', label: 'Scripting patterns',
            content: `# Non-interactive single question
claude -p "What does this project do? One paragraph."

# Pipe any output to Claude
cat error.log | claude -p "What is the root cause of the errors?"
git diff | claude -p "Summarise what changed in plain English."
npm audit --json | claude -p "What are the critical vulnerabilities and how do I fix them?"

# JSON output for scripting
RESULT=$(claude -p "List the 5 most complex functions" --output-format json)
echo $RESULT | jq '.text'

# Pre-commit hook — block commits with security issues
git diff --cached | claude -p \
  "Does this diff contain SQL injection, XSS, or hardcoded secrets?
   Reply exactly PASS or FAIL with a one-line reason." | grep -q "^PASS"

# Weekly changelog (run from cron)
git log --oneline --since="1 week ago" | \
  claude -p "Write a user-facing changelog entry for these commits.
             Group by feature, fix, and chore." > CHANGELOG_DRAFT.md

# Translate i18n strings in CI
claude -p "Translate new strings in en.json to French and German.
Update fr.json and de.json." \
  --allowedTools "Read,Edit" \
  --dangerously-skip-permissions`,
          },
          {
            lang: 'bash', label: 'Shell alias library',
            content: `# Add to ~/.zshrc or ~/.bashrc

# Explain any error
alias explain='claude -p "Explain this error and how to fix it:"'
# Usage: npm test 2>&1 | explain

# Quick code review
alias review='git diff | claude -p "Review for bugs and security issues."'

# Standup prep
alias standup='git log --oneline --author="$(git config user.email)" --since=yesterday | claude -p "Write a 3-bullet standup update from these commits."'

# Dependency check
alias depscan='npm audit --json | claude -p "Which vulnerabilities affect our runtime code (not just devDependencies)? How do I fix them?"'

# Explain a file
alias whatis='claude -p "Explain what this file does and its key functions:"'
# Usage: cat src/auth/token.ts | whatis`,
          },
        ],
        exercise: 'Write a shell script that: (1) runs `git log --oneline -20`, (2) pipes the output to Claude, (3) asks it to generate a changelog entry, (4) saves the output to CHANGELOG_DRAFT.md. Run it.',
        tip: '`--dangerously-skip-permissions` sounds scary but is designed exactly for CI/CD use. It skips the "may I?" prompts that are appropriate for interactive sessions but wrong for automated pipelines. Only use it in sandboxed environments.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/cli-reference',
      },
      {
        id: 'visual-reasoning',
        emoji: '👁️', title: 'Visual Input & Reasoning Mode', tagline: 'Show screenshots, think harder with extended reasoning',
        concept: `Claude Code is multimodal — you can give it images, screenshots, and PDFs, not just text. And for hard problems, Extended Thinking mode makes Claude reason through the problem step-by-step before answering.\n\n**Visual input use cases:**\n- Share a design mockup: "Implement this UI in our React components"\n- Share a screenshot of a bug: "This error appears on the checkout page — find and fix it"\n- Share an architecture diagram: "This is the system design we discussed — implement the data layer"\n- Share a screenshot of a competitor: "Build a similar feature to what is circled in red"\n\n**Extended Thinking (Reasoning Mode):**\nFor difficult problems — complex debugging, architecture decisions, algorithm design — ask Claude to think step by step before answering. It will reason through the problem explicitly before giving its answer. This is slower but dramatically more accurate for hard problems.\n\nIn Claude Code, enable reasoning mode with: \`/think\` or by asking "think through this carefully before answering."`,
        code: [
          {
            lang: 'text', label: 'Using visual input',
            content: `# Drag and drop an image into the Claude Code terminal,
# or reference a local file path

"Here is the Figma design for the new dashboard [screenshot.png].
Implement it in src/components/Dashboard.tsx.
Match the layout exactly. Use our existing CSS variables."

"This screenshot shows the bug [bug-screenshot.png].
The red highlighted area is where the layout breaks on mobile.
Find the CSS causing this and fix it."

"I have attached the architecture diagram [arch.png].
Based on this, design the database schema for the data layer."`,
          },
          {
            lang: 'text', label: 'Extended Thinking — when and how',
            content: `# Trigger extended thinking
"Think through this carefully before answering: [complex question]"

# Or use the slash command
/think

# Good use cases for extended thinking:
  - "Think carefully: should we use event sourcing or CQRS for this?"
  - "Reason through why the race condition might be happening in this code"
  - "Think step by step about the security implications of this auth design"
  - "Work through the algorithm: how would you find cycles in this graph efficiently?"

# Extended thinking output:
Claude will show a <thinking>...</thinking> block where it
works through the problem, then give its final answer.
The thinking block is often where the most valuable insights are.`,
          },
        ],
        exercise: 'Take a screenshot of a UI bug or a design you want to implement. Paste it into Claude Code and ask it to implement or fix it. Compare the result to doing the same task from a text description alone.',
        tip: 'Extended thinking costs more tokens and takes longer — but for architecture decisions and hard bugs, the quality difference is significant. Save it for genuinely difficult problems, not routine tasks.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  //  LEVEL 4 — Agents & Integration
  // ══════════════════════════════════════════════════════════════
  {
    id: 'agents', title: 'Agents & MCP', badge: '🔌', color: '#8b5cf6', bg: '#ede9fe',
    summary: 'Model Context Protocol, building MCP servers, subagents for parallel work, and advanced orchestration patterns.',
    lessons: [
      {
        id: 'mcp-intro',
        emoji: '🔌', title: 'MCP — The Three Primitives', tagline: 'Connect Claude to any external tool or data source',
        concept: `**Model Context Protocol (MCP)** is an open standard that lets Claude connect to external tools and data sources. Instead of copying data from Jira into Claude, you connect Jira to Claude — and it reads tickets directly.\n\nMCP defines three primitive types that cover every integration use case:\n\n**1. Tools** (model-controlled)\nFunctions Claude can call to perform actions: search a database, post to Slack, run a query. Claude decides when to call them based on the task.\n\n**2. Resources** (application-controlled)\nRead-only data sources exposed with URIs. Your app decides what to expose; Claude reads it when relevant. Example: a resource at \`project://config\` that returns the project configuration.\n\n**3. Prompts** (user-controlled)\nPre-crafted instruction templates for common workflows. Users explicitly invoke them: "Use the /code-review prompt for this PR." Great for ensuring consistent, high-quality outputs for defined tasks.\n\n**When to use each:**\n- Tools: when Claude needs to *do* something (write, send, update)\n- Resources: when you want to expose *read-only* data in a structured way\n- Prompts: when you want *consistent instructions* for a defined workflow`,
        code: [
          {
            lang: 'json', label: 'Connect MCP servers — ~/.claude/settings.json',
            content: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost/db"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/documents"]
    }
  }
}`,
          },
          {
            lang: 'text', label: 'What you can do with connected MCP servers',
            content: `# With GitHub MCP:
"Find all open PRs touching the auth module. Summarise what each changes."
"Which issues are tagged as bugs and have no assignee?"
"Create a GitHub issue for the missing validation we just found."

# With Postgres MCP:
"Query the users table: how many accounts were created in the last 30 days?
What percentage verified their email?"
"Find all orders where total > 1000 that shipped to Australia."

# With Slack MCP:
"Post to #deployments: v2.3.0 is live in production."
"Summarise the discussion in #architecture from the last 7 days."

# Mix and match:
"Read the GitHub issue #234, query our DB for related records,
then post a Slack summary to #product."`,
          },
        ],
        exercise: 'Install the GitHub MCP server (`npx -y @modelcontextprotocol/server-github`) and configure it in settings.json. Ask Claude: "What are the 3 oldest open issues in this repo? Summarise each one."',
        tip: 'Restart Claude Code after adding MCP servers — it reads the config at startup. Use `claude --mcp-debug` if a server isn\'t showing up.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/mcp',
      },
      {
        id: 'build-mcp-server',
        emoji: '🔧', title: 'Build an MCP Server', tagline: 'Expose your own tools and data to Claude with Python',
        concept: `Building your own MCP server lets you give Claude access to any internal system: your company's internal APIs, proprietary databases, custom tools, or any data source that doesn't have a public MCP server.\n\nThe **Python MCP SDK** uses decorators to define tools, resources, and prompts — you don't manually write JSON schemas. The SDK generates them from your type annotations.\n\n**Key concept: the shift in architecture**\nWithout MCP, every AI application has to implement its own tool definitions. With MCP, you define a tool once in an MCP server and any MCP-compatible client (Claude Code, Claude Desktop, other tools) can use it. The tool definition burden moves to specialised servers.\n\n**MCP Server Inspector** — a built-in browser-based interface for testing your server without connecting to Claude. Essential for development: you can call tools, test resources, and verify prompts before integrating.`,
        code: [
          {
            lang: 'bash', label: 'Set up the Python MCP SDK',
            content: `# Install the SDK
pip install mcp

# Create a new MCP server
mkdir my-mcp-server && cd my-mcp-server
touch server.py`,
          },
          {
            lang: 'python', label: 'MCP server with tools, resources, and prompts',
            content: `from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types
import json

app = Server("my-tools")

# ── TOOL — model-controlled, Claude calls when needed ──────────
@app.tool()
async def search_docs(query: str, limit: int = 5) -> list[dict]:
    """Search internal documentation by keyword."""
    # Your actual search logic here
    results = internal_search(query, limit)
    return [{"title": r.title, "url": r.url, "snippet": r.snippet} for r in results]

@app.tool()
async def create_ticket(
    title: str,
    description: str,
    priority: str = "medium"
) -> dict:
    """Create a Jira ticket. Priority: low, medium, high, critical."""
    ticket = jira_client.create_issue(
        summary=title,
        description=description,
        priority={"name": priority.capitalize()}
    )
    return {"id": ticket.key, "url": f"https://jira.company.com/browse/{ticket.key}"}

# ── RESOURCE — app-controlled, exposed read-only data ──────────
@app.resource("config://project")
async def get_project_config() -> str:
    """Returns the current project configuration as JSON."""
    config = load_config()
    return json.dumps(config, indent=2)

@app.resource("docs://{doc_id}")
async def get_doc(doc_id: str) -> str:
    """Fetch a specific internal doc by ID."""
    return fetch_document(doc_id)

# ── PROMPT — user-controlled, consistent instruction templates ──
@app.prompt()
async def code_review() -> list[types.PromptMessage]:
    """Structured code review for this project's standards."""
    return [types.PromptMessage(
        role="user",
        content=types.TextContent(type="text", text="""
Review the provided code for:
1. Security: injection, auth bypass, data exposure
2. Logic: edge cases, off-by-one errors, null handling
3. Performance: N+1 queries, missing indexes, unnecessary computation
4. Tests: coverage gaps for the changed code

Format: severity (Critical/High/Medium/Low), file:line, description, fix.
        """)
    )]

if __name__ == "__main__":
    import asyncio
    asyncio.run(stdio_server(app))`,
          },
          {
            lang: 'json', label: 'Connect your server to Claude Code',
            content: `// ~/.claude/settings.json
{
  "mcpServers": {
    "my-tools": {
      "command": "python",
      "args": ["/path/to/my-mcp-server/server.py"],
      "env": {
        "JIRA_TOKEN": "your_token",
        "INTERNAL_API_KEY": "your_key"
      }
    }
  }
}

// Test with the MCP inspector before connecting:
// mcp dev server.py
// Opens http://localhost:5173 — call tools in the browser`,
          },
        ],
        exercise: 'Build a minimal MCP server with one tool: `read_env_file()` that reads your project\'s .env.example and returns the variable names (not values). Connect it to Claude Code and verify it works.',
        tip: 'Use the MCP Server Inspector (`mcp dev server.py`) to test your server before connecting it to Claude. It saves enormous time — you can see exactly what your tools return without a full Claude session.',
        docs: 'https://modelcontextprotocol.io/docs/concepts/tools',
      },
      {
        id: 'advanced-mcp',
        emoji: '⚡', title: 'Advanced MCP — Transports & Production', tagline: 'Stdio vs HTTP, sampling, notifications, and scaling',
        concept: `For production MCP deployments — especially when multiple clients need to connect, or when your server needs to initiate requests — you need to understand MCP's transport mechanisms and advanced features.\n\n**Transport mechanisms:**\n\n**Stdio (Standard Input/Output)** — the default. Claude Code launches the MCP server as a subprocess and communicates via stdin/stdout. Simple, secure, no network. Best for local tools and personal servers. Requires an initialization handshake.\n\n**Streamable HTTP** — for servers that need to serve multiple clients simultaneously (team-shared servers, cloud deployments). Uses Server-Sent Events (SSE) for server-to-client streaming. Supports session management and bidirectional communication.\n\n**Sampling** — MCP servers can request LLM completions through the connected Claude client. The server sends a sampling request; the client makes the API call and returns the result. This shifts AI computation costs from your server to the client.\n\n**Notifications & Progress** — for long-running operations, emit progress notifications so the client can show real-time feedback. Use context objects to send logs and progress updates back through the connection.\n\n**Stateless vs stateful:** Stateless HTTP servers can be horizontally scaled behind a load balancer. Stateful servers (with session management) are simpler to build but don't scale horizontally.`,
        code: [
          {
            lang: 'python', label: 'HTTP transport MCP server (multi-client)',
            content: `from mcp.server.fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount, Route
import uvicorn

mcp = FastMCP("team-tools")

@mcp.tool()
async def query_database(sql: str) -> list[dict]:
    """Execute a read-only SQL query against the team database."""
    if not sql.strip().upper().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed")
    return await db.fetch_all(sql)

@mcp.tool()
async def long_running_task(task_id: str, ctx) -> str:
    """Run a long task with progress updates."""
    await ctx.report_progress(0, 100, "Starting...")

    result = await do_step_1()
    await ctx.report_progress(33, 100, "Step 1 complete")

    result = await do_step_2(result)
    await ctx.report_progress(66, 100, "Step 2 complete")

    final = await do_step_3(result)
    await ctx.report_progress(100, 100, "Done")
    return final

# Mount as HTTP server
sse = SseServerTransport("/messages/")
app = Starlette(routes=[
    Route("/sse", endpoint=sse.handle_sse),
    Mount("/messages/", app=sse.handle_post_message),
])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`,
          },
          {
            lang: 'json', label: 'Connect via HTTP in Claude Code',
            content: `// ~/.claude/settings.json — HTTP transport
{
  "mcpServers": {
    "team-tools": {
      "type": "http",
      "url": "http://mcp.internal.company.com:8000/sse",
      "headers": {
        "Authorization": "Bearer team_token_here"
      }
    }
  }
}

// Stateless HTTP (for horizontal scaling):
// Set stateless=True in your server — no session tracking,
// any request can go to any instance.
// Load balancer → multiple MCP server instances → works.`,
          },
        ],
        exercise: 'Modify your MCP server from the previous lesson to use HTTP transport (`FastMCP` with Starlette). Deploy it locally on port 8000. Connect it with `"type": "http"` in settings.json.',
        tip: 'Start with stdio transport — it\'s simpler and has zero network overhead. Only switch to HTTP when you need multiple clients or cloud deployment. The API is identical; just the transport changes.',
        docs: 'https://modelcontextprotocol.io/docs/concepts/transports',
      },
      {
        id: 'subagents',
        emoji: '🤝', title: 'Subagents — How Delegation Works', tagline: 'Spawn isolated Claude instances for parallel, focused work',
        concept: `Subagents are separate Claude Code instances that work on a specific task in an isolated context window. The main agent delegates a task, the subagent executes it, and returns a summary — the main agent never sees the subagent's internal steps.\n\n**Why subagents?**\n- **Parallel execution** — multiple subagents work simultaneously on independent tasks\n- **Context isolation** — a research subagent's 50K tokens of file reads don't pollute your implementation session\n- **Specialisation** — a subagent can be a code reviewer, a doc writer, a security analyst — each optimised for its task\n- **Context preservation** — the main session stays lean while subagents do heavy lifting\n\n**How subagents work:**\n1. Main agent gets a task too large or complex for one context\n2. Main agent spawns a subagent with a precise task description\n3. Subagent opens its own isolated context window\n4. Subagent reads files, runs commands, completes the task\n5. Subagent returns a structured summary to the main agent\n6. Main agent continues with the summary (not the full context)\n\n**The /agents command:** Opens the subagent management interface. Create custom subagents with specific tools, CLAUDE.md content, and personalities.`,
        code: [
          {
            lang: 'text', label: 'When to use subagents',
            content: `USE subagents when:
  ✓ The task is independent — doesn't need main session context
  ✓ You want parallel execution (research + implementation simultaneously)
  ✓ The task would consume too much of your main context window
  ✓ You want specialised expertise (security reviewer, doc writer)
  ✓ You don't want intermediate steps polluting your main context

DON'T use subagents when:
  ✗ The task needs context from the current session
  ✗ Tasks must happen in sequence (A must complete before B)
  ✗ The task is trivial (overhead isn't worth it)
  ✗ You need to see all intermediate steps, not just the summary`,
          },
          {
            lang: 'bash', label: 'Spawning subagents with /agents',
            content: `# Open the subagent management interface
/agents

# Create a custom "Security Reviewer" subagent
# Name: security-reviewer
# Instructions:
#   You are a security expert. When given code or a diff,
#   check for: injection vulnerabilities, auth bypass, data exposure,
#   insecure cryptography, and missing input validation.
#   Return a structured report: severity, location, description, fix.
# Tools: Read, Grep, Glob (no Bash — read only)

# Use your custom subagent
/security-reviewer  # reviews the current diff

# Or run the built-in /batch for parallel subagents:
/batch add input validation to every API endpoint in src/routes/`,
          },
          {
            lang: 'yaml', label: 'Skill that runs as a subagent',
            content: `# .claude/skills/doc-writer/SKILL.md
---
name: doc-writer
description: Generate JSDoc documentation for a module or file
allowed-tools: Read Grep
context: fork
---

Document the code at $ARGUMENTS.

Read the file(s) at $ARGUMENTS. For every exported function, class,
and type, write JSDoc comments covering:
- What it does (one sentence)
- @param — each parameter with type and description
- @returns — return type and what it represents
- @throws — any errors that can be thrown
- @example — one realistic usage example

Return the complete file content with comments added.
Do not change any logic — only add documentation.

If you cannot find the file, report: "File not found: $ARGUMENTS"`,
          },
        ],
        exercise: 'Create a "doc-writer" subagent skill (as shown above). Run `/doc-writer src/your-file.ts` on a file with no JSDoc. Verify the subagent adds proper documentation without changing any logic.',
        tip: 'Subagents need self-contained instructions — they have no memory of your main session. Write subagent skills with full context in the SKILL.md: what they should check for, what format to return, and what to do when they hit obstacles.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/sub-agents',
      },
      {
        id: 'subagent-patterns',
        emoji: '🧩', title: 'Subagent Design Patterns', tagline: 'Structured outputs, obstacle reporting, and orchestration',
        concept: `Reliable subagents require deliberate design. The main failure modes are: returning unstructured text the orchestrator can't parse, silently failing without reporting why, and trying to solve problems outside their scope.\n\n**Pattern 1: Structured outputs**\nAlways specify the exact format a subagent should return. Use JSON. The orchestrator (main agent or your code) parses it. Ambiguous prose output from subagents breaks orchestration.\n\n**Pattern 2: Obstacle reporting**\nExplicitly tell the subagent what to do when it can't complete a task. "If you cannot find the file, return \`{\"error\": \"not found\", \"searched\": \"<path>\"}\`. Do not guess." Silent failures are worse than explicit errors.\n\n**Pattern 3: Tool restriction**\nLimit tools to what the subagent actually needs. A review subagent should have Read and Grep — not Bash, not Edit. This prevents accidents and makes it faster (fewer permission prompts).\n\n**Pattern 4: Orchestration with /batch**\nFor large parallelizable tasks — migrating 50 files, adding tests to 30 endpoints, translating 20 strings — use \`/batch\`. It: decomposes the task, spawns one subagent per unit in a git worktree, each opens its own PR. You review and merge.\n\n**Anti-patterns to avoid:**\n- Spawning subagents for tasks that take less than 30 seconds (overhead isn't worth it)\n- Chaining subagents when they aren't truly independent (use sequential steps instead)\n- Not reading the subagent's structured output before acting on it`,
        code: [
          {
            lang: 'yaml', label: 'Orchestrator skill that uses subagents',
            content: `# .claude/skills/full-review/SKILL.md
---
name: full-review
description: Run a comprehensive review using specialised subagents for security, tests, and performance
allowed-tools: Bash(claude *)
---

Run a full review of the current changes using three specialist subagents.

Step 1: Launch all three in parallel:
  - Security review: claude -p "$(cat .claude/skills/security-review/SKILL.md)" < <(git diff)
  - Test review: claude -p "$(cat .claude/skills/test-review/SKILL.md)" < <(git diff)
  - Performance review: claude -p "$(cat .claude/skills/perf-review/SKILL.md)" < <(git diff)

Step 2: Collect all three JSON reports.

Step 3: Merge into a single report:
  {
    "security": [...issues...],
    "tests": [...issues...],
    "performance": [...issues...],
    "summary": "X critical, Y high, Z medium issues found."
  }

Step 4: Present the merged report, grouped by severity.`,
          },
          {
            lang: 'bash', label: '/batch — parallel work across many files',
            content: `# /batch syntax
/batch <instruction for each unit>

# Add OpenTelemetry traces to every API endpoint
/batch add OpenTelemetry tracing spans to every route handler in src/routes/

# Write tests for every untested service
/batch write comprehensive unit tests for every file in src/services/ that has no .test.ts file

# Migrate old patterns to new ones
/batch update every usage of the deprecated UserManager class to use the new UserService

# Each /batch unit:
# 1. Gets its own git worktree (isolated)
# 2. Works independently
# 3. Opens its own PR
# You review and merge each PR separately`,
          },
        ],
        exercise: 'Run `/batch write JSDoc for every exported function in src/` on a project with 5+ files. Watch it decompose into parallel agents. Review one of the resulting PRs — is the documentation accurate?',
        tip: 'Before running /batch, estimate the units: "this will spawn ~20 agents." If that sounds like too many PRs to review, break the scope first: "/batch ... in src/auth/ only" is more manageable than the whole src.',
      },
      {
        id: 'parallel-work',
        emoji: '⚡', title: 'Parallel Work & Git Worktrees', tagline: 'Run multiple Claude sessions simultaneously on the same repo',
        concept: `Git worktrees let you check out multiple branches of the same repo simultaneously in different directories. Combined with Claude Code, this means you can run multiple Claude sessions on the same codebase at the same time — each working on a different feature, each with its own context.\n\nThis is how \`/batch\` works internally: each unit gets a fresh worktree, a Claude session, and works without affecting other units.\n\n**When to use worktrees manually:**\n- Feature A depends on Feature B being reviewed (work on both in parallel)\n- You want Claude to work on a refactor while you continue unrelated work\n- You need to maintain a hotfix branch while developing the next version\n\n**Worktree + Claude workflow:**\n1. Create a worktree for each parallel task\n2. Open a terminal for each worktree\n3. Run \`claude\` in each — each session is independent\n4. Merge PRs as they're ready\n\n**Context management for parallel sessions:** Each session has its own context. They don't interfere. Changes to files in one worktree are not visible in another until you merge.`,
        code: [
          {
            lang: 'bash', label: 'Git worktrees + Claude sessions',
            content: `# Create worktrees for parallel features
git worktree add ../project-auth -b feature/add-oauth
git worktree add ../project-payments -b feature/stripe-integration
git worktree add ../project-perf -b fix/performance-issues

# Open 3 terminals and run Claude in each:
# Terminal 1:
cd ../project-auth && claude
# "Implement OAuth with Google. Read the existing auth module first."

# Terminal 2:
cd ../project-payments && claude
# "Add Stripe subscription billing. Use the existing payment models."

# Terminal 3:
cd ../project-perf && claude
# "Profile and fix the slow queries in the analytics dashboard."

# All three run simultaneously with zero interference.
# Each opens its own PR when done.

# List all worktrees
git worktree list

# Remove a worktree after merging
git worktree remove ../project-auth`,
          },
          {
            lang: 'bash', label: 'Automated parallel work with headless Claude',
            content: `#!/bin/bash
# parallel-tasks.sh — run multiple Claude tasks simultaneously

TASKS=(
  "src/auth/|Audit src/auth/ for security vulnerabilities. Return JSON report."
  "src/payments/|Add input validation to every endpoint in src/payments/."
  "src/analytics/|Optimise all SQL queries in src/analytics/ — add missing indexes."
)

# Launch each task in background
for task in "\${TASKS[@]}"; do
  dir=$(echo "$task" | cut -d'|' -f1)
  prompt=$(echo "$task" | cut -d'|' -f2)

  (
    worktree="../parallel-$(basename $dir)"
    git worktree add "$worktree" -b "auto/$(basename $dir)-$(date +%s)"
    cd "$worktree"
    claude -p "$prompt" --dangerously-skip-permissions
    gh pr create --title "Auto: $prompt" --body "Generated by parallel-tasks.sh"
  ) &
done

wait
echo "All tasks complete. Review PRs on GitHub."`,
          },
        ],
        exercise: 'Create two worktrees from a project. Open Claude in each. Give them different tasks (e.g., one adds a feature, one writes tests for existing code). Run both simultaneously. Merge the PRs when done.',
        tip: 'Worktrees share the same git objects but have independent working directories and index. Changes in one worktree are completely invisible to other worktrees until they\'re committed and merged.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  //  LEVEL 5 — Master
  // ══════════════════════════════════════════════════════════════
  {
    id: 'master', title: 'Master', badge: '🏆', color: '#d97706', bg: '#fef3c7',
    summary: 'GitHub Actions CI, the Anthropic API, Claude on Bedrock and Vertex, Agent SDK, and team-scale AI infrastructure.',
    lessons: [
      {
        id: 'github-actions',
        emoji: '⚙️', title: 'GitHub Actions & CI/CD', tagline: 'Automate PR reviews, issue triage, and releases in CI',
        concept: `Claude Code integrates with GitHub Actions via the official \`claude-code-action\`. Trigger Claude on every PR, on a schedule, or when issues are opened — with full access to the repo, PR diffs, and GitHub API.\n\n**Common CI automations:**\n- **PR review** — Claude reviews every PR, posting inline comments at the relevant line\n- **@claude mentions** — any comment starting with "@claude" triggers Claude to respond in the PR\n- **Issue triage** — new issues are automatically labelled and prioritised\n- **Security scan** — every push is scanned for new vulnerabilities\n- **Release notes** — merged PRs are automatically summarised into release notes\n- **Scheduled audit** — every Monday, Claude audits dependencies and creates issues for findings\n\n**Permissions:** The action needs \`contents: read\` and \`pull-requests: write\` to post reviews. For issue management, add \`issues: write\`.`,
        code: [
          {
            lang: 'yaml', label: '.github/workflows/claude-review.yml',
            content: `name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Claude Review
        uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          # Respond to @claude mentions in PR comments
          trigger_phrase: "@claude"
          # Also auto-review every new PR
          direct_prompt: |
            Review this pull request:
            1. Check for bugs and logic errors (cite file:line)
            2. Check for security vulnerabilities
            3. Check for missing tests on new code paths
            4. Check for breaking API changes
            5. Give an overall recommendation: Approve / Request Changes / Comment
            Post your review using the GitHub PR review API, not as a comment.`,
          },
          {
            lang: 'yaml', label: 'Scheduled dependency audit + issue creation',
            content: `name: Weekly Dependency Audit
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9am UTC

jobs:
  audit:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Claude Audit
        uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          direct_prompt: |
            Run: npm audit --json

            For each vulnerability with severity moderate or higher:
            1. Explain what the vulnerability is
            2. Determine if our codebase actually uses the vulnerable code path
            3. Provide the exact fix command

            Create a GitHub issue titled "Weekly Dependency Audit — {date}"
            with your findings grouped by severity.

            If there are zero moderate+ vulnerabilities, close any open
            audit issues and comment "All clear for this week."`,
          },
          {
            lang: 'yaml', label: 'Auto-triage new issues',
            content: `name: Issue Triage
on:
  issues:
    types: [opened]

jobs:
  triage:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - uses: actions/checkout@v4

      - name: Claude Triage
        uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          direct_prompt: |
            Triage this new GitHub issue.

            Apply the correct label: bug, feature-request, question,
            documentation, or needs-clarification.

            Estimate priority: P0 (blocking), P1 (high), P2 (medium), P3 (low).

            If it's a bug:
            - Try to identify which module it affects
            - Ask for any missing info (reproduction steps, OS, version)

            If it's a feature request:
            - Note if a similar feature was previously discussed
            - Tag related issues if any

            Post your triage as a comment. Keep it concise.`,
          },
        ],
        exercise: 'Add the claude-code-action to a GitHub repo. Open a test PR and add a comment starting with "@claude review this for security issues." Watch it respond inline.',
        tip: 'Store your API key in GitHub Secrets (`ANTHROPIC_API_KEY`), never in the workflow YAML. The action needs pull-requests: write permission. Check the action README for the latest version number.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/github-actions',
      },
      {
        id: 'scheduled-tasks',
        emoji: '⏰', title: 'Scheduled Tasks', tagline: 'Claude working overnight while you sleep',
        concept: `Scheduled tasks run Claude Code on a timer — automatically, without you present. There are two types:\n\n**Cloud tasks** run on Anthropic's infrastructure. Your computer does not need to be on. Claude has access to a clean environment with your project code, but not your local files or running services. Best for: nightly test runs, weekly audits, cron-driven summaries.\n\n**Desktop tasks** run on your machine. Claude has full access to your local files, running services, and all your tools. Best for: morning standup prep, pre-commit checks, local file monitoring.\n\n**Setting up scheduled tasks:**\nUse \`/schedule\` in an interactive session to create a task. Describe the schedule in natural language ("every weekday at 8am") and write the prompt. Claude converts it to a cron expression and saves the task.\n\n**What makes a good scheduled task:**\n- The task is clearly defined and reproducible (not "help me with today's work")\n- The output is actionable — a file, a Slack message, a GitHub issue\n- The task doesn't need interactive clarification mid-run`,
        code: [
          {
            lang: 'bash', label: 'Creating scheduled tasks',
            content: `# Create a scheduled task interactively
/schedule

# Describe in natural language:
"Every weekday at 8:00 AM:
Run git log --oneline --since=yesterday.
Summarise what changed in 3 bullet points.
Write the summary to STANDUP.md and overwrite any previous content."

# Claude converts this to cron (0 8 * * 1-5) and saves it.

# View your scheduled tasks
/schedule list

# Delete a task
/schedule delete <task-id>`,
          },
          {
            lang: 'json', label: 'Desktop tasks via settings.json',
            content: `// ~/.claude/settings.json
{
  "scheduledTasks": [
    {
      "name": "morning-standup",
      "schedule": "0 8 * * 1-5",
      "prompt": "Run git log --oneline --since=yesterday --author='$(git config user.email)'. Write a 3-bullet standup note to STANDUP.md.",
      "workingDirectory": "/Users/you/projects/main-project"
    },
    {
      "name": "nightly-test-report",
      "schedule": "0 22 * * *",
      "prompt": "Run npm test. If any tests fail, create a GitHub issue titled 'Nightly test failure — {date}' with the failure output. If all pass, do nothing.",
      "workingDirectory": "/Users/you/projects/main-project"
    },
    {
      "name": "weekly-dep-check",
      "schedule": "0 9 * * 1",
      "prompt": "Run npm audit. For each moderate+ vulnerability: explain the risk and give the fix command. Write the report to SECURITY_AUDIT.md.",
      "workingDirectory": "/Users/you/projects/main-project"
    }
  ]
}`,
          },
        ],
        exercise: 'Create a desktop scheduled task that runs every morning at 8am: reads `git log --oneline --since=yesterday` and writes a one-paragraph summary to STANDUP.md. Verify it works by running the prompt manually first.',
        tip: 'Cloud tasks are more reliable (no dependency on your machine being on), but desktop tasks have more power (local tools, running services, your full environment). Start with desktop tasks while learning.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/web-scheduled-tasks',
      },
      {
        id: 'anthropic-api',
        emoji: '🧬', title: 'Build with the Anthropic API', tagline: 'Messages API, tool use, extended thinking, and RAG',
        concept: `The Anthropic API gives you direct access to Claude's capabilities — build your own applications, agents, and tools without the Claude Code wrapper.\n\n**Messages API basics:**\n- Every call is stateless — you send the full conversation history each time\n- System prompt sets Claude's persona, constraints, and context\n- Temperature controls randomness (0 = deterministic, 1 = creative)\n- Streaming returns tokens as they're generated (better UX for long responses)\n\n**Tool use (function calling):**\nDefine functions in JSON Schema. Claude decides when to call them. Your code executes the function and returns the result. Claude uses the result to continue.\n\n**Extended Thinking:**\nClaudeuses an internal reasoning process before answering. Enable with \`thinking: { type: "enabled", budget_tokens: 10000 }\`. Returns the thinking block separately. Use for hard reasoning problems.\n\n**Prompt caching:**\nCache static parts of your prompt (system prompt, reference docs) to save 90%+ on repeated API calls. Essential for production applications.\n\n**RAG (Retrieval-Augmented Generation):**\nFor knowledge-intensive applications: chunk documents, embed them, store in a vector DB, retrieve relevant chunks per query, include in context. Prevents hallucination about your specific knowledge base.`,
        code: [
          {
            lang: 'typescript', label: 'Messages API — basics',
            content: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Single turn
const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  system: 'You are a senior TypeScript engineer. Be concise and precise.',
  messages: [
    { role: 'user', content: 'Review this function for type safety issues:\n\n' + code }
  ],
});
console.log(response.content[0].text);

// Streaming
const stream = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 2048,
  stream: true,
  messages: [{ role: 'user', content: prompt }],
});

for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    process.stdout.write(event.delta.text);
  }
}`,
          },
          {
            lang: 'typescript', label: 'Tool use (function calling)',
            content: `const tools: Anthropic.Tool[] = [
  {
    name: 'search_codebase',
    description: 'Search the codebase for files matching a pattern or containing a string',
    input_schema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Grep pattern to search for' },
        file_glob: { type: 'string', description: 'File glob to search in, e.g. "src/**/*.ts"' },
      },
      required: ['pattern'],
    },
  },
];

// Agentic loop
const messages: Anthropic.MessageParam[] = [
  { role: 'user', content: 'Find all places where we use the deprecated getUserById function.' }
];

while (true) {
  const response = await client.messages.create({
    model: 'claude-opus-4-6', max_tokens: 4096, tools, messages,
  });

  if (response.stop_reason === 'end_turn') {
    console.log(response.content.find(b => b.type === 'text')?.text);
    break;
  }

  // Process tool calls
  const toolResults: Anthropic.ToolResultBlockParam[] = [];
  for (const block of response.content) {
    if (block.type === 'tool_use') {
      const result = await executeToolCall(block.name, block.input);
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
    }
  }

  messages.push({ role: 'assistant', content: response.content });
  messages.push({ role: 'user', content: toolResults });
}`,
          },
          {
            lang: 'typescript', label: 'Extended Thinking + Prompt Caching',
            content: `// Extended Thinking — for hard reasoning problems
const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 16000,
  thinking: { type: 'enabled', budget_tokens: 10000 },
  messages: [{ role: 'user', content: 'Reason through the best database schema for a multi-tenant SaaS app with audit logging.' }],
});

// Response contains both thinking and answer
for (const block of response.content) {
  if (block.type === 'thinking') {
    console.log('Reasoning:', block.thinking); // Internal reasoning
  } else if (block.type === 'text') {
    console.log('Answer:', block.text);
  }
}

// Prompt Caching — cache static content to save 90% on tokens
const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: largeSystemPrompt,
      cache_control: { type: 'ephemeral' }, // Cache this for up to 5 minutes
    }
  ],
  messages: [{ role: 'user', content: 'Answer the user question based on the above context.' }],
});`,
          },
        ],
        exercise: 'Build a script that uses the Anthropic API to review a diff: read `git diff` output, send it to Claude with a security-focused system prompt, and print the findings. Add tool use to let Claude read specific files.',
        tip: 'Prompt caching is a massive cost saver for production apps. If your system prompt or reference documents are the same across calls, cache them. The first call fills the cache; subsequent calls within 5 minutes use it at 10% of the base cost.',
        docs: 'https://docs.anthropic.com/en/docs/initial-setup',
      },
      {
        id: 'bedrock-vertex',
        emoji: '☁️', title: 'Claude on AWS Bedrock & Google Vertex', tagline: 'Deploy Claude in your existing cloud infrastructure',
        concept: `For enterprise deployments — especially those with data residency, compliance, or existing cloud contracts — Claude is available through AWS Amazon Bedrock and Google Cloud Vertex AI.\n\n**Why Bedrock or Vertex instead of direct API?**\n- **Data stays in your cloud** — requests never leave AWS/GCP infrastructure\n- **Unified billing** — charge to existing AWS/GCP contracts\n- **Enterprise compliance** — SOC 2, HIPAA, GDPR controls from your cloud provider\n- **IAM integration** — use AWS IAM / GCP IAM roles, not Anthropic API keys\n- **Same API** — the Messages API is nearly identical across all three surfaces\n\n**AWS Bedrock:**\nAccess Claude via the Bedrock \`InvokeModel\` API. Use the \`anthropic.claude-*\` model IDs. Authenticate via AWS SDK (IAM roles, not API keys).\n\n**Google Vertex AI:**\nAccess Claude via the Vertex AI Endpoints API. Models are available in your GCP region. Authenticate via Application Default Credentials or service accounts.\n\n**Capability parity:** Bedrock and Vertex support the same Claude features as the direct API — tool use, extended thinking, vision, streaming, prompt caching — with minor version lag as new features roll out.`,
        code: [
          {
            lang: 'python', label: 'Claude on AWS Bedrock',
            content: `import boto3
import json

# Bedrock uses IAM authentication — no API key needed
bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1",
    # Credentials from IAM role, ~/.aws/credentials, or env vars
)

# Basic call — same structure as Anthropic API
response = bedrock.invoke_model(
    modelId="anthropic.claude-opus-4-5-20251101-v1:0",
    body=json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
        "system": "You are a helpful assistant.",
        "messages": [
            {"role": "user", "content": "Explain quantum entanglement in 2 sentences."}
        ]
    })
)

result = json.loads(response["body"].read())
print(result["content"][0]["text"])

# Streaming on Bedrock
response = bedrock.invoke_model_with_response_stream(
    modelId="anthropic.claude-opus-4-5-20251101-v1:0",
    body=json.dumps({ "anthropic_version": "bedrock-2023-05-31",
                      "max_tokens": 1024, "messages": [...] })
)

for event in response["body"]:
    chunk = json.loads(event["chunk"]["bytes"])
    if chunk["type"] == "content_block_delta":
        print(chunk["delta"]["text"], end="", flush=True)`,
          },
          {
            lang: 'python', label: 'Claude on Google Vertex AI',
            content: `import anthropic

# Vertex AI uses Application Default Credentials
# Run: gcloud auth application-default login
client = anthropic.AnthropicVertex(
    project_id="your-gcp-project-id",
    region="us-east5",  # Must be a region where Claude is available
)

# API is identical to direct Anthropic — same SDK, same format
response = client.messages.create(
    model="claude-opus-4-5@20251101",  # Note @ instead of - for version
    max_tokens=1024,
    system="You are a senior Python engineer.",
    messages=[
        {"role": "user", "content": "Review this code for performance issues:\n" + code}
    ]
)
print(response.content[0].text)

# Tool use on Vertex — identical to direct API
response = client.messages.create(
    model="claude-opus-4-5@20251101",
    max_tokens=4096,
    tools=tools,  # Same JSON Schema tool definitions
    messages=messages,
)`,
          },
        ],
        exercise: 'If you have an AWS account: set up Bedrock access for Claude (enable the model in the Bedrock console), then use `boto3` to call Claude with a simple question. Compare the response to a direct Anthropic API call.',
        tip: 'The Anthropic SDK handles both direct API and Bedrock/Vertex with the same interface. `AnthropicBedrock()` or `AnthropicVertex()` instead of `Anthropic()` — then the same `.messages.create()` call works on all three.',
        docs: 'https://docs.anthropic.com/en/api/claude-on-amazon-bedrock',
      },
      {
        id: 'agent-sdk',
        emoji: '🧬', title: 'Agent SDK — Build Custom Agents', tagline: 'Build autonomous Claude-powered tools with full control',
        concept: `The Agent SDK gives you programmatic access to Claude Code's capabilities — tools, loop control, streaming, permissions — so you can build your own products and automation on top of Claude Code's infrastructure.\n\n**What you can build:**\n- A code review bot with your team's specific checklist (posts to Slack, creates Jira tickets)\n- An automated onboarding assistant for new engineers\n- A custom deployment pipeline with human-in-the-loop approval gates\n- A specialised agent for your domain (ML experiment tracking, infrastructure management)\n- A Slack bot that answers "where does X work?" questions about your codebase\n\n**SDK key concepts:**\n- \`query()\` — run a one-shot task, returns when complete\n- \`query.stream()\` — run a task with streaming output\n- \`allowedTools\` — whitelist which tools the agent can use\n- \`maxTurns\` — limit how many steps the agent can take (cost control)\n- \`cwd\` — set the working directory (which project the agent sees)\n\n**Building responsibly:** Start with \`allowedTools\` being restrictive (Read, Grep, Glob only). Add write tools (Edit, Bash) only when you are confident the agent's behaviour is correct. Always add \`maxTurns\` to prevent runaway agents.`,
        code: [
          {
            lang: 'typescript', label: 'Agent SDK — core patterns',
            content: `import { query } from '@anthropic-ai/claude-code';

// One-shot task — wait for completion
async function reviewSecurity(diff: string) {
  const result = await query({
    prompt: \`Review this diff for security vulnerabilities.

Diff:
\${diff}

Check for: SQL injection, XSS, auth bypass, insecure crypto, data exposure.
Return JSON: { "issues": [{ "severity": "critical|high|medium|low", "file": "...", "line": N, "description": "...", "fix": "..." }] }\`,
    options: {
      allowedTools: ['Read', 'Grep'],  // Read-only — safe to run without approval
      maxTurns: 10,
      cwd: process.cwd(),
    },
  });

  return JSON.parse(result.text);
}

// Streaming task — show progress in real time
async function buildFeature(spec: string) {
  console.log('Building feature...');

  for await (const event of query.stream({
    prompt: \`Implement this feature: \${spec}

    Follow the Explore → Plan → Code → Commit workflow.
    Use the existing code patterns and conventions.\`,
    options: {
      allowedTools: ['Read', 'Edit', 'Bash', 'Grep', 'Glob'],
      maxTurns: 30,
    },
  })) {
    if (event.type === 'assistant_turn') {
      for (const block of event.turn.content) {
        if (block.type === 'text') process.stdout.write(block.text);
      }
    }
  }
}

// Human-in-the-loop — require approval for risky actions
async function deployWithApproval(env: string) {
  // Phase 1: read-only planning
  const plan = await query({
    prompt: 'Review the current state and create a deployment plan. List every action you will take.',
    options: { allowedTools: ['Read', 'Bash(git *)', 'Bash(npm run check)'] },
  });

  console.log('Deployment plan:\\n', plan.text);
  const approved = await askUserConfirmation('Proceed with deployment?');

  if (!approved) { console.log('Deployment cancelled.'); return; }

  // Phase 2: execute with approval
  await query({
    prompt: \`Execute the deployment plan to \${env}.\`,
    options: { allowedTools: ['Bash(npm run deploy:' + env + ')'] },
  });
}`,
          },
          {
            lang: 'typescript', label: 'PR review bot (production example)',
            content: `import { query } from '@anthropic-ai/claude-code';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function reviewPR(owner: string, repo: string, prNumber: number) {
  // 1. Get PR diff from GitHub
  const { data: diff } = await octokit.pulls.get({
    owner, repo, pull_number: prNumber,
    mediaType: { format: 'diff' },
  });

  // 2. Let Claude review it — with repo access for full context
  const review = await query({
    prompt: \`Review pull request #\${prNumber} in \${owner}/\${repo}.

The diff:
\${diff}

Check for:
1. Security vulnerabilities with specific line references
2. Logic bugs and edge cases
3. Missing tests for new code paths
4. Breaking API changes

Return JSON:
{
  "summary": "one paragraph overall assessment",
  "recommendation": "APPROVE|REQUEST_CHANGES|COMMENT",
  "issues": [
    { "severity": "critical|high|medium|low", "file": "...", "line": N, "body": "..." }
  ]
}\`,
    options: {
      allowedTools: ['Read', 'Grep', 'Glob'],
      maxTurns: 15,
      cwd: '/path/to/local/repo/clone',
    },
  });

  const { summary, recommendation, issues } = JSON.parse(review.text);

  // 3. Post inline review comments
  const comments = issues
    .filter((i: any) => i.severity !== 'low')
    .map((i: any) => ({ path: i.file, line: i.line, body: \`**\${i.severity.toUpperCase()}**: \${i.body}\` }));

  // 4. Submit the review
  await octokit.pulls.createReview({
    owner, repo, pull_number: prNumber,
    body: summary,
    event: recommendation,
    comments,
  });

  console.log(\`Review posted: \${recommendation}, \${issues.length} issues found.\`);
}`,
          },
        ],
        exercise: 'Build a CLI tool using the Agent SDK: `node review.js <file>`. It reads the specified file, asks Claude to review it for issues, and prints a structured JSON report. Add `maxTurns: 5` and `allowedTools: ["Read"]`.',
        tip: 'The Agent SDK\'s `allowedTools` list is your safety net. An agent with only `["Read", "Grep"]` cannot modify files, run commands, or make API calls. Start there and add tools only after validating behaviour.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/sdk',
      },
      {
        id: 'team-and-scale',
        emoji: '🌍', title: 'Team Setup & AI Infrastructure', tagline: 'Scale Claude Code across your entire engineering org',
        concept: `When dozens of engineers use Claude Code on the same projects, you need shared standards, governance, and infrastructure — not just individual configurations.\n\n**Layer 1: Shared project config (commit to git)**\n- \`CLAUDE.md\` in the repo root — every engineer gets the same project context on clone\n- \`.claude/skills/\` in the repo — custom slash commands for your team's workflows\n- No individual setup required — it just works for everyone\n\n**Layer 2: Enterprise managed settings**\nFor organisations on Claude Code Enterprise, push a settings file from a central server. Engineers cannot override managed settings. Use this for: requiring approval mode, blocking specific commands, enforcing audit logging.\n\n**Layer 3: Audit and observability**\nUse hooks to write every Claude action to a central log. Know what Claude is doing across your engineering org. This is especially important during the first few months of adoption.\n\n**Layer 4: Cost management**\n- Track token usage per engineer and per project\n- Set max_turns limits for automated tasks\n- Use prompt caching for shared reference documents\n- Run cost-intensive tasks as cloud scheduled tasks (batched pricing)\n\n**Rollout strategy:**\n1. Start with 5 early adopters — learn what works for your codebase\n2. Write a team CLAUDE.md from their learnings\n3. Create 2–3 shared skills for your most common workflows\n4. Roll out to the full team with a "getting started" doc\n5. Iterate based on feedback`,
        code: [
          {
            lang: 'text', label: 'What to commit to the repo',
            content: `# Commit these (shared across all team members):
CLAUDE.md                          # Project context + conventions
.claude/skills/review-pr/          # PR review with team checklist
.claude/skills/deploy/             # Deploy with safety gates
.claude/skills/onboard/            # New engineer onboarding
.claude/skills/security-scan/      # Pre-commit security check
.claude/skills/changelog/          # Generate release notes

# Don't commit these (personal preferences):
~/.claude/settings.json            # Personal hooks and preferences
~/.claude/CLAUDE.md                # Personal style preferences
~/.claude/skills/                  # Personal skills
.env files, API keys               # Obviously`,
          },
          {
            lang: 'json', label: 'Enterprise managed settings (pushed centrally)',
            content: `// Pushed from your central config server to ~/.claude/settings.json
// Engineers cannot override settings in the "managed" namespace
{
  "managed": {
    "requireApprovalForBash": true,
    "auditLogPath": "/var/log/claude-code/audit.log",
    "blockedCommands": [
      "rm -rf",
      "git push --force",
      "DROP TABLE",
      "kubectl delete"
    ],
    "maxTurnsPerSession": 50
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "echo \\"$(date -Iseconds) [$(whoami)] $CLAUDE_TOOL_INPUT_COMMAND\\" >> /var/log/claude-code/audit.log"
        }]
      }
    ]
  }
}`,
          },
          {
            lang: 'markdown', label: '.claude/skills/onboard/SKILL.md',
            content: `---
name: onboard
description: Interactive onboarding for new engineers joining this project
allowed-tools: Read Bash(git *) Bash(npm run check)
---

Welcome a new engineer to this project. Run interactively.

Step 1 — Architecture tour:
Read CLAUDE.md and explain the architecture in plain English.
Highlight the most important conventions and the most common mistakes.

Step 2 — Dev setup:
Run the dev server setup commands from CLAUDE.md.
Verify each step succeeded. Fix any failures before continuing.

Step 3 — Codebase tour:
Read the 5 most important files in the project.
For each: explain what it does, what it depends on, and what depends on it.

Step 4 — First task:
Run \`gh issue list --label "good first issue"\` and suggest the 3 most
suitable ones for a new engineer, with a brief explanation of each.

Step 5 — Team norms:
Explain the PR process, code review expectations, and deployment process.
Ask if they have any questions about the codebase or workflow.`,
          },
        ],
        exercise: 'Create a `.claude/skills/` directory in your main project. Write a `/review-pr` skill based on your team\'s actual PR checklist. Write a `/onboard` skill. Commit both. Ask a colleague to clone and try them.',
        tip: 'A strong team CLAUDE.md is worth more than dozens of individual skills. The best time to write it: after 2 weeks of your team using Claude Code, when you\'ve discovered all the conventions Claude keeps getting wrong.',
        docs: 'https://docs.anthropic.com/en/docs/claude-code/settings',
      },
    ],
  },
];

// ─── Storage ──────────────────────────────────────────────────
const STORAGE_KEY = 'claude-code-guide-progress-v2';
function loadProgress(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')); }
  catch { return new Set(); }
}
function saveProgress(done: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
}

// ─── Copy button ──────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={copy} style={{
      position: 'absolute', top: '0.6rem', right: '0.6rem',
      padding: '0.25rem 0.65rem', borderRadius: '5px', fontSize: '0.72rem',
      fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.1)',
      color: copied ? '#10b981' : 'rgba(255,255,255,0.7)',
      transition: 'all 0.2s ease',
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

// ─── Code block ───────────────────────────────────────────────
function CodeBlock({ label, content }: { label: string; content: string }) {
  return (
    <div style={{ marginBottom: '0.85rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>
        {label}
      </div>
      <div style={{ position: 'relative', background: '#0f1117', borderRadius: '8px', padding: '1rem 1rem 1rem 1.1rem', overflow: 'hidden' }}>
        <CopyButton text={content} />
        <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.8rem', lineHeight: 1.7, color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingRight: '3rem' }}>
          {content}
        </pre>
      </div>
    </div>
  );
}

// ─── Inline rich-text renderer ────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--brown-dark)' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '0.8em',
          background: 'rgba(0,0,0,0.07)',
          padding: '0.1em 0.38em',
          borderRadius: '3px',
          color: 'var(--brown-dark)',
        }}>{part.slice(1, -1)}</code>
      );
    }
    return part;
  });
}

// ─── Ring ─────────────────────────────────────────────────────
function Ring({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--parchment)" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${(pct/100)*circ} ${circ}`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function ClaudeCodeGuide() {
  const [done,        setDone]        = useState<Set<string>>(new Set());
  const [activeLevel, setActiveLevel] = useState(0);
  const [openLesson,  setOpenLesson]  = useState<string | null>('how-ai-works');
  const [mounted,     setMounted]     = useState(false);
  const levelRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); setDone(loadProgress()); }, []);

  /* Scroll active level tab to left edge when it changes */
  useEffect(() => {
    const row = levelRowRef.current;
    if (!row) return;
    const active = row.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (!active) return;
    const rowLeft = row.getBoundingClientRect().left;
    const btnLeft = active.getBoundingClientRect().left;
    row.scrollBy({ left: btnLeft - rowLeft - 12, behavior: 'smooth' });
  }, [activeLevel]);

  const toggleDone = useCallback((id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveProgress(next);
      return next;
    });
  }, []);

  const totalLessons = LEVELS.flatMap(l => l.lessons).length;
  const totalDone    = mounted ? LEVELS.flatMap(l => l.lessons).filter(l => done.has(l.id)).length : 0;
  const overallPct   = Math.round((totalDone / totalLessons) * 100);

  const level = LEVELS[activeLevel];

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem', paddingBottom: '6rem' }}>

      {/* ── Hero ── */}
      <section style={{ paddingTop: '4.5rem', paddingBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--terracotta)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              Interactive Guide — Based on Official Anthropic Courses
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, color: 'var(--brown-dark)', lineHeight: 1.15, marginBottom: '0.75rem' }}>
              Master Claude Code
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '50ch' }}>
              {totalLessons}{' '}hands-on lessons across 5 levels — from how AI works to building team-scale AI infrastructure. Sourced from Anthropic&apos;s official training courses. Tick each lesson as you complete it.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <a href="https://docs.anthropic.com/en/docs/claude-code/overview" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 600, textDecoration: 'none' }}>
                Official docs ↗
              </a>
              <a href="https://anthropic.skilljar.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 600, textDecoration: 'none' }}>
                Anthropic Academy ↗
              </a>
              <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: 'var(--terracotta)', fontWeight: 600, textDecoration: 'none' }}>
                MCP docs ↗
              </a>
            </div>
          </div>
          {/* Overall progress ring */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <Ring pct={overallPct} color="var(--terracotta)" size={80} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brown-dark)', lineHeight: 1 }}>{overallPct}%</span>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{totalDone}/{totalLessons} done</div>
          </div>
        </div>
      </section>

      {/* ── Level tabs ── */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: '2px', width: '3rem', background: 'linear-gradient(to right, transparent, var(--bg, #faf7f2))', pointerEvents: 'none', zIndex: 1 }} />
      <div ref={levelRowRef} style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px', paddingRight: '2rem' }}>
        {LEVELS.map((lv, i) => {
          const lvDone = mounted ? lv.lessons.filter(l => done.has(l.id)).length : 0;
          const lvPct  = Math.round((lvDone / lv.lessons.length) * 100);
          const active = activeLevel === i;
          return (
            <button key={lv.id} data-active={active ? 'true' : 'false'} onClick={() => { setActiveLevel(i); setOpenLesson(lv.lessons[0].id); }} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.55rem 1.1rem', borderRadius: '99px', flexShrink: 0,
              background: active ? lv.color : 'var(--warm-white)',
              color: active ? 'white' : 'var(--text-secondary)',
              border: active ? 'none' : '1px solid var(--parchment)',
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s ease',
              boxShadow: active ? '2px 2px 0 rgba(20,10,5,0.2)' : 'none',
            }}>
              <span>{lv.badge}</span>
              <span>{lv.title}</span>
              <span style={{ fontSize: '0.7rem', padding: '0.1em 0.45em', borderRadius: '99px', background: active ? 'rgba(255,255,255,0.22)' : 'var(--parchment)', color: active ? 'white' : 'var(--text-muted)', fontWeight: 700 }}>
                {lvPct}%
              </span>
            </button>
          );
        })}
      </div>
      </div>

      {/* ── Level header ── */}
      <div style={{ background: level.bg, borderRadius: '12px', padding: '1rem 1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{level.badge}</div>
        <div>
          <div style={{ fontWeight: 700, color: level.color, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{level.title}</div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{level.summary}</div>
        </div>
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          {(() => {
            const lvDone = mounted ? level.lessons.filter(l => done.has(l.id)).length : 0;
            const lvPct  = Math.round((lvDone / level.lessons.length) * 100);
            return (
              <div style={{ textAlign: 'center' }}>
                <Ring pct={lvPct} color={level.color} size={44} />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{lvDone}/{level.lessons.length}</div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Lessons accordion ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {level.lessons.map((lesson, idx) => {
          const isDone   = mounted && done.has(lesson.id);
          const isOpen   = openLesson === lesson.id;
          return (
            <div key={lesson.id} style={{
              border: `1.5px solid ${isOpen ? level.color + '60' : 'var(--parchment)'}`,
              borderRadius: '12px', overflow: 'hidden',
              background: 'var(--warm-white)',
              boxShadow: isOpen ? `0 2px 12px ${level.color}18` : 'none',
              transition: 'all 0.2s ease',
            }}>
              {/* Header */}
              <button
                onClick={() => setOpenLesson(isOpen ? null : lesson.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone ? '#d1fae5' : isOpen ? level.color : 'var(--parchment)',
                  color: isDone ? '#10b981' : isOpen ? 'white' : 'var(--text-muted)',
                  fontSize: isDone ? '0.9rem' : '0.78rem', fontWeight: 700,
                  border: isDone ? '1.5px solid #10b981' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  {isDone ? '✓' : idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>{lesson.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isDone ? '#10b981' : 'var(--brown-dark)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {lesson.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{lesson.tagline}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Content */}
              {isOpen && (
                <div style={{ padding: '0 1.1rem 1.2rem', borderTop: `1px solid ${level.color}25` }}>

                  {/* Concept */}
                  <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    {lesson.concept.split('\n').map((para, i) => {
                      if (!para.trim()) return <div key={i} style={{ height: '0.4rem' }} />;
                      if (para.startsWith('- ')) {
                        return (
                          <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0.15rem 0', paddingLeft: '1rem' }}>
                            •&nbsp;{renderInline(para.slice(2))}
                          </p>
                        );
                      }
                      const numMatch = para.match(/^(\d+)\.\s+(.*)/);
                      if (numMatch) {
                        return (
                          <p key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0.15rem 0', paddingLeft: '1.4rem', textIndent: '-1.4rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--brown-dark)', marginRight: '0.35rem' }}>{numMatch[1]}.</span>
                            {renderInline(numMatch[2])}
                          </p>
                        );
                      }
                      return (
                        <p key={i} style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: '0.2rem 0' }}>
                          {renderInline(para)}
                        </p>
                      );
                    })}
                  </div>

                  {/* Code blocks */}
                  {lesson.code && lesson.code.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      {lesson.code.map((block, i) => <CodeBlock key={i} label={block.label} content={block.content} />)}
                    </div>
                  )}

                  {/* Exercise */}
                  <div style={{ background: `${level.color}0d`, border: `1px solid ${level.color}30`, borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: level.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
                      🎯 Exercise
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{renderInline(lesson.exercise)}</p>
                  </div>

                  {/* Tip */}
                  <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>
                      💡 Pro tip
                    </div>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{renderInline(lesson.tip)}</p>
                  </div>

                  {/* Footer: docs link + mark done */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {lesson.docs && (
                      <a href={lesson.docs} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--terracotta)', fontWeight: 600, textDecoration: 'none' }}>
                        Official docs ↗
                      </a>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                      <button onClick={() => {
                        toggleDone(lesson.id);
                        if (!done.has(lesson.id)) {
                          const next = level.lessons[idx + 1];
                          if (next) setTimeout(() => setOpenLesson(next.id), 300);
                        }
                      }} style={{
                        padding: '0.45rem 1.1rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 600,
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: isDone ? '#d1fae5' : level.color,
                        color: isDone ? '#059669' : 'white',
                        transition: 'all 0.2s ease',
                      }}>
                        {isDone ? '✓ Completed' : 'Mark complete →'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Level complete banner ── */}
      {mounted && level.lessons.every(l => done.has(l.id)) && (
        <div style={{ marginTop: '1.5rem', padding: '1.2rem', borderRadius: '12px', background: level.bg, border: `1.5px solid ${level.color}40`, textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🎉</div>
          <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, color: level.color, marginBottom: '0.3rem' }}>
            {level.title} complete!
          </div>
          {activeLevel < LEVELS.length - 1 && (
            <button onClick={() => { setActiveLevel(a => a + 1); setOpenLesson(LEVELS[activeLevel + 1].lessons[0].id); }} style={{
              marginTop: '0.5rem', padding: '0.5rem 1.4rem', borderRadius: '99px',
              background: level.color, color: 'white', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 600, fontSize: '0.88rem',
            }}>
              Continue to {LEVELS[activeLevel + 1].title} {LEVELS[activeLevel + 1].badge}
            </button>
          )}
          {activeLevel === LEVELS.length - 1 && (
            <div style={{ fontSize: '0.88rem', color: level.color, fontWeight: 600 }}>
              You&apos;ve mastered Claude Code. Go build something extraordinary. 🚀
            </div>
          )}
        </div>
      )}
    </div>
  );
}
