# Feature: Learn Anthropic & Claude — Interactive Terminal Learning

**Priority:** 🟡 Medium
**Status:** 🔲 Not started
**Branch:** `feature/learn-anthropic-claude`
**Started:** —
**Shipped:** —

---

## Goal

A gamified, terminal-based learning environment at `/learn/claude` where users master Claude, Claude Code, and AI workflow concepts by typing real commands in a browser-based terminal. It looks and feels like a real dev environment — but runs entirely in the browser (no Docker, no servers per user).

Users progress through interactive "missions" by typing commands, reading AI responses, and completing challenges. XP, badges, and streaks track their journey.

---

## Architecture Decision: Simulated Terminal (not Docker)

### Why NOT real Docker containers
| Approach | Cost | Complexity | Security | Verdict |
|----------|------|------------|----------|---------|
| Docker per user | ~$0.05–0.20/session | Very high (WebSocket, container lifecycle, sandbox) | Hard (user can run arbitrary code) | ❌ Too expensive for a blog |
| VM/VPS shared | High infra cost | High | Hard | ❌ |
| **xterm.js + simulated shell** | **$0 (client-side)** | **Medium** | **Safe** | **✅ Right choice** |

### The right approach: `xterm.js` + custom command interpreter

`xterm.js` renders a pixel-perfect terminal in the browser. Behind it, a JavaScript command interpreter handles typed commands — producing responses that teach the user. No real shell, no Docker. The same technique used by:
- **Cloudflare Workers playground**
- **GitHub Skills** (interactive GitHub courses)
- **Katacoda** (now retired, but pioneered this pattern)
- **web-based SSH tools**

The terminal responds like a real environment. Users feel like they're actually working in a Claude dev setup. It's educational theatre — and it works.

---

## The Terminal Experience

### What it looks like

```
╔══════════════════════════════════════════════════════╗
║  claude-lab  ~/missions/01-prompt-basics       🔥 5d ║
║                                            XP: 180   ║
╠══════════════════════════════════════════════════════╣
║  Welcome to Claude Lab! Type `missions` to start.    ║
║                                                      ║
║  $ missions                                          ║
║  ┌─ Available Missions ──────────────────────────┐   ║
║  │ ✅ 01. Anatomy of a Prompt          +25 XP    │   ║
║  │ 🔓 02. System Prompts Deep Dive     +25 XP    │   ║
║  │ 🔒 03. Tool Use & Function Calling  +40 XP    │   ║
║  │ 🔒 04. Build an Agentic Loop        +50 XP    │   ║
║  │ 🔒 05. Claude Code Workflows        +40 XP    │   ║
║  └────────────────────────────────────────────────┘  ║
║                                                      ║
║  $ start 02                                          ║
║  ► Mission 02: System Prompts Deep Dive              ║
║    You are a developer building a support bot.       ║
║    Task: Write a system prompt that makes Claude     ║
║    polite, brief, and only answer billing questions. ║
║                                                      ║
║    Try: claude --system "..." --message "hi"         ║
║                                                      ║
║  $ claude --system "You are a helpful billing       ▓║
║            assistant..." --message "hi"              ║
║  Claude: Hi! I can help with billing questions.      ║
║  How can I assist you today?                         ║
║                                                      ║
║  ✅ Looks good! +25 XP earned. Type `next` for       ║
║     the challenge or `hint` if you're stuck.         ║
║  $  _                                                ║
╚══════════════════════════════════════════════════════╝
```

### Available commands in the terminal

| Command | What it does |
|---------|-------------|
| `missions` | List all missions and progress |
| `start <n>` | Begin a mission |
| `claude --system "..." --message "..."` | Simulate a Claude API call (calls real Claude) |
| `hint` | Show a hint for the current challenge |
| `next` | Move to next challenge in mission |
| `skip` | Skip current challenge (no XP) |
| `status` | Show XP, level, badges, streak |
| `badges` | Show badge collection |
| `docs <topic>` | Open a mini in-terminal reference card |
| `help` | List all commands |
| `clear` | Clear terminal |

---

## The Three Learning Tracks

### Track 1 — Prompt Engineering Missions (5 missions)
Hands-on prompt writing. User types `claude` commands with different system prompts and messages. A lightweight Claude API call evaluates the output and gives pass/fail feedback.

| # | Mission | Key Skill | XP |
|---|---------|-----------|-----|
| 01 | Anatomy of a Prompt | System / human / assistant roles | +25 |
| 02 | System Prompt Design | Persona, constraints, format instructions | +25 |
| 03 | Chain-of-Thought | Making Claude reason step by step | +30 |
| 04 | Handling Edge Cases | Refusal, ambiguity, off-topic requests | +30 |
| 05 | Prompt Injection Defence | Recognising and blocking injection attempts | +40 |

### Track 2 — Claude Code Missions (5 missions)
Simulated Claude Code CLI workflow. User runs `claude-code` commands that simulate what Claude Code actually does.

| # | Mission | Key Skill | XP |
|---|---------|-----------|-----|
| 06 | First Claude Code Session | `/help`, reading files, basic edits | +25 |
| 07 | Slash Commands | `/commit`, `/review-pr`, `/test` | +25 |
| 08 | Hooks & Automation | Writing a pre-tool-call hook | +40 |
| 09 | MCP Servers | Adding a tool via MCP config | +40 |
| 10 | Multi-Agent Patterns | Spawning a subagent for parallel work | +50 |

### Track 3 — AI Workflow Missions (5 missions)
Architecture-level thinking. User reads a scenario, types a design command, and the terminal evaluates their architecture choice.

| # | Mission | Key Skill | XP |
|---|---------|-----------|-----|
| 11 | RAG Pipeline | When and how to use retrieval | +30 |
| 12 | Tool Use Design | Picking the right tools for an agent | +40 |
| 13 | Evaluation Strategy | Testing AI outputs systematically | +40 |
| 14 | Cost Optimisation | Model selection, caching, batching | +30 |
| 15 | Production Guardrails | Rate limits, prompt injection, fallbacks | +50 |

---

## Gamification

### XP & Levels
| Level | Name | XP required |
|-------|------|-------------|
| 0 | Curious | 0 |
| 1 | Builder | 100 |
| 2 | Practitioner | 300 |
| 3 | Engineer | 600 |
| 4 | Expert | 1000 |
| 5 | Claude Whisperer | 1500 |

### Badges
| Badge | Condition |
|-------|-----------|
| 🎓 First Deploy | Complete mission 01 |
| 🔧 Tool Caller | Complete mission 03 (tool use) |
| 🤖 Agent Builder | Complete mission 10 (multi-agent) |
| 🛡 Prompt Guardian | Complete mission 05 (injection defence) |
| 🔥 On Fire | 7-day streak |
| ⚡ Speed Demon | Complete any mission in under 3 minutes |
| 🏆 Claude Whisperer | Reach level 5 |
| 📜 Full Stack AI | Complete all 15 missions |

### Streak
- One "active day" = any XP earned that calendar day (AEST)
- Displayed in terminal header: `🔥 5d`
- Losing a streak shows a sympathetic message: `streak lost — type 'missions' to rebuild 💪`

---

## Technical Stack

### Frontend
- **`xterm.js`** — industry standard browser terminal emulator (`npm install @xterm/xterm @xterm/addon-fit @xterm/addon-web-links`)
- **Custom command parser** — a switch/router in TypeScript, similar to TamaDevice.tsx's `run()` function but more sophisticated
- **React wrapper** — `components/terminal/ClaudeLab.tsx` mounts xterm into a div ref

### Backend (minimal)
- **`/api/learn/claude-lab`** — proxies real Claude API calls for `claude --system "..." --message "..."` commands so the API key stays server-side. Rate-limited to 20 calls/user/hour.
- **`/api/learn/claude-progress`** (reuse from original spec) — saves XP, badges, streak to Supabase

### No Docker needed
All terminal logic is a JavaScript state machine. The "filesystem" is fake — `ls`, `cat mission.md`, etc. return hardcoded educational content. Only the `claude` command makes a real network call (to our own API route).

---

## Affected Files

| File | Action | Notes |
|------|--------|-------|
| `components/terminal/ClaudeLab.tsx` | Create | xterm.js mount + resize observer |
| `components/terminal/commandParser.ts` | Create | All command logic, mission state machine |
| `components/terminal/missions.ts` | Create | All 15 mission definitions, challenges, hints |
| `components/terminal/fakeFs.ts` | Create | Fake filesystem responses (ls, cat, pwd) |
| `app/learn/claude/page.tsx` | Create | Page wrapping ClaudeLab + XP bar + badge grid |
| `app/api/learn/claude-lab/route.ts` | Create | Claude API proxy, rate-limited |
| `app/api/learn/claude-progress/route.ts` | Create | XP/badge/streak upsert |
| `supabase/007_claude_track.sql` | Create | `claude_progress` table |
| `app/learn/page.tsx` | Modify | Add Claude Lab card |
| `package.json` | Modify | Add `@xterm/xterm`, `@xterm/addon-fit` |

---

## Mission State Machine

Each mission has a sequence of challenges. The terminal tracks current state in React:

```typescript
type Challenge = {
  id: string;
  prompt: string;          // instruction shown to user
  hint: string;
  validate: (input: string, output?: string) => ValidationResult;
  xp: number;
  successMessage: string;
};

type ValidationResult = {
  pass: boolean;
  feedback: string;
  partialCredit?: boolean;
};
```

Validation types:
- **Regex match** — user's command matches an expected pattern
- **Claude eval** — user's prompt is sent to Claude, Claude's response evaluated by a second Claude call ("did this response stay on topic?")
- **Keyword check** — response contains required concepts
- **Free form** — user types anything, shown correct answer, self-marks

---

## Fake Filesystem (feel like a real dev environment)

```
$ pwd
/home/claude-learner/missions/02-system-prompts

$ ls
README.md   challenge-01.md   challenge-02.md   solution/

$ cat README.md
# Mission 02: System Prompt Design
...educational content...

$ cat challenge-01.md
Your task: build a customer support bot that only answers
questions about billing. Be polite and concise.

Run: claude --system "<your system prompt>" --message "What is your return policy?"
```

---

## Acceptance Criteria

- [ ] `/learn/claude` loads with a working xterm.js terminal
- [ ] All basic commands work: `missions`, `start`, `hint`, `next`, `skip`, `status`, `help`, `clear`
- [ ] All 15 missions are playable start to finish
- [ ] `claude --system "..." --message "..."` calls real Claude via the API route
- [ ] XP awarded correctly per challenge; level updates in terminal header
- [ ] Badges unlock and persist
- [ ] Streak tracked per day
- [ ] Progress saved to Supabase (auth) or localStorage (guest)
- [ ] Terminal resizes correctly on window resize (xterm FitAddon)
- [ ] Mobile: terminal scrollable, on-screen keyboard doesn't break layout
- [ ] Rate limiting on `/api/learn/claude-lab` (20 calls/user/hour)
- [ ] `npm run build` passes with zero errors

---

## Senior Dev Test Checklist

### Functional
- [ ] Complete a full mission end to end
- [ ] XP and level update without page refresh
- [ ] Badge unlocks trigger a visible celebration in terminal
- [ ] `hint` shows relevant hint for current challenge
- [ ] `skip` skips without awarding XP
- [ ] Terminal history scrollable
- [ ] Arrow-up command history works

### Security
- [ ] API key never exposed to client
- [ ] Claude API route validates session before calling Anthropic
- [ ] Rate limit enforced per user (not just per IP)
- [ ] User input to `--system` and `--message` flags sanitised before forwarding to Claude

### Build & Types
- [ ] `npm run build` passes
- [ ] No `any` types in command parser or mission definitions

---

## Implementation Order

1. Install xterm.js, verify it renders in a Next.js Client Component
2. Build `ClaudeLab.tsx` — basic terminal mount + input/output
3. Build `commandParser.ts` — `help`, `missions`, `clear`, `status`
4. Build `fakeFs.ts` — `ls`, `cat`, `pwd`
5. Write mission 01 and 02 content in `missions.ts`
6. Wire `start <n>`, `hint`, `next`, `skip` commands
7. Build Claude API proxy route + rate limiter
8. Implement `claude --system --message` command
9. Add XP/badge/streak logic + Supabase progress route
10. Write remaining 13 missions
11. Build `/learn/claude/page.tsx` with XP bar + badge grid framing the terminal
12. Link from `/learn`

---

## Post-Ship Checklist

- [ ] Tested on live Vercel URL
- [ ] All 15 missions playable end to end
- [ ] Claude API rate limit confirmed working
- [ ] This file updated with ship date

---

## Notes / History

- **2026-04-05** — Spec created. Chose simulated terminal over real Docker. Real containers would cost $0.05–0.20 per session and require a container orchestration backend — not justified for a personal blog. `xterm.js` gives identical UX at zero server cost. Only the `claude` command makes a real API call (proxied server-side). Same pattern used by Cloudflare's interactive tutorials and GitHub Skills.
