# Product Workflow — Idea to Shipped, with Agent Skills

How to take a product or feature from a spark to production in this workspace,
using the [mattpocock skills](https://github.com/mattpocock/skills), the PIV loop
(Plan · Implement · Validate from `AGENTS.md`), graphify as the memory layer, and
the CI automation already running in Gradland.

The skills are installed user-level (`~/.claude/skills`), so every command below
works in any repo. New product repos run `/setup-matt-pocock-skills` once to teach
the skills that repo's issue tracker, triage labels, and domain-doc layout.

---

## The loop at a glance

```
0 Prime  →  1 Validate  →  2 Plan  →  3 Scaffold  →  4 Implement
                                                          │
                          8 Evolve ← 7 Ship ← 6 Review ← 5 Validate
```

The **human path** is Plan → triage → review/approve. The **CI agents**
(`autonomous-loop`, `copilot-fallback`, `claude-analyst`) grind through
`ready-for-agent` issues between sessions. That split is what lets the product
move while you're AFK.

---

## Phase 0 — Prime

Load only enough context to work safely.

- `graphify <affected-area>` — surface god nodes and surprising connections before
  you grep. Read `graphify-out/GRAPH_REPORT.md` if it exists.
- Read the nearest `AGENTS.md` / `CLAUDE.md`, the `README`, and `PRD.md` if present.
- `git status` before touching anything.

## Phase 1 — Validate the idea

Stress-test before you commit code.

- `trend-researcher` agent — is there real demand? Who is it for?
- `/grill-me` — adversarial questioning of the concept; forces assumptions into the open.
- `/grill-with-docs` — same, but grounded in the actual library/framework docs when
  the idea is technical.

Output: a concept you can defend, with assumptions written down.

## Phase 2 — Plan

Turn the validated idea into tracked, agent-ready work.

- `/to-prd` → writes `PRD.md` (MVP, non-goals, users, architecture, success criteria,
  phased with validation gates).
- `/to-issues` → breaks the PRD into issues in the tracker.
- `/triage` → labels each issue. The label that matters most:
  - `ready-for-agent` — fully specified, an AFK agent can pick it up with zero human context.
  - `ready-for-human` — needs a human.
  - `needs-info` / `needs-triage` / `wontfix` — the rest of the state machine.

## Phase 3 — Scaffold (new repos only)

- `/setup-matt-pocock-skills` — interactive, per-repo. Records the issue tracker
  (GitHub / GitLab / local markdown), the triage label vocabulary, and whether the
  repo is single- or multi-context. Run before first use of `to-issues`, `triage`,
  `diagnose`, `tdd`, or `improve-codebase-architecture`.
- Create `AGENTS.md` (and `CLAUDE.md` with `@AGENTS.md`) plus the default layout
  (`.agents/`, `docs/`, `src/`, `tests/`, `scripts/`).

## Phase 4 — Implement

One owner per task. One branch per owner: `ai/<agent>/<task-id>-<slug>`. No
overlapping write scopes (see `.agents/ai-workflow/reference/multi-ai-operating-model.md`).

- `/tdd` — red → green → refactor. Default for anything that ships.
- `/prototype` — throwaway design exploration when the shape isn't known yet. Don't
  ship prototype code; harvest the learning, then rebuild with `/tdd`.

Follow the Karpathy standards from `AGENTS.md`: simplest code that works, surgical
changes only, state assumptions before coding.

## Phase 5 — Validate

- Run the repo's gate. In Gradland: `npm run check` (lockfile-sync + audit + content
  validation + build) plus `npm test`.
- `/diagnose` — for bugs, the disciplined reproduce → minimise → fix loop. Don't
  patch symptoms; root-cause first.

## Phase 6 — Review

Use a different agent than the author where practical.

- `/code-review` — correctness bugs + reuse/simplification/efficiency cleanups.
- `pr-review-toolkit` agents — `code-reviewer`, `silent-failure-hunter`,
  `type-design-analyzer`, `pr-test-analyzer` for deeper passes.

## Phase 7 — Ship

Follow the commit & push protocol (`AGENTS.md` §18):

- Atomic commits — one logical change each, independently revertable.
- Conventional message: `type(scope): summary` + body explaining what and why.
- Ask before pushing. CI gate (`deploy.yml` check job) must pass; deploy follows.

## Phase 8 — Evolve

- `/improve-codebase-architecture` — every few days, against accumulated drift.
- `/zoom-out` — re-orient when the codebase has grown past your mental model.
- `/handoff` — compact a session for the next agent (or your future self).
- `/write-a-skill` — when a lesson recurs, codify it so it stops recurring.
- `graphify update <path>` — refresh the memory layer so the next Phase 0 is accurate.
- Drop new lessons / papers / screenshots into `~/workspace/brain/raw/` and re-index.

---

## The autonomous CI layer (how Gradland actually runs this)

| Workflow | Role |
|----------|------|
| `autonomous-loop.yml` | Picks up `ready-for-agent` issues AFK; Copilot agent primary, Claude opt-in. |
| `copilot-fallback.yml` / `copilot-daily.yml` | GitHub Copilot Pro+ agent picks up tasks when Claude quota is exhausted. |
| `claude-analyst.yml` | Daily product/codebase analysis → files new issues. |
| `claude-pr-loop.yml` | Iterates on open PRs. |
| `deploy.yml` | Quality gate (lockfile + audit + tests + build) → Vercel deploy. |

The human stays in the loop at **Plan → triage → review/approve**. Everything
labelled `ready-for-agent` is fair game for the CI agents to implement, open a PR,
and iterate on — gated by the same `npm run check` you'd run locally.

---

## Replicating this in a new product

1. `git init`, push to GitHub.
2. `/setup-matt-pocock-skills` — configure tracker, labels, context layout.
3. `/to-prd` → `/to-issues` → `/triage`.
4. Copy Gradland's `.github/workflows/` automation (autonomous-loop, deploy gate,
   claude-analyst) and wire up the secrets (`CLAUDE_CODE_OAUTH_TOKEN`, deploy keys).
5. Start the loop. Triage incoming, review outgoing.
