# Multi-AI Operating Model

Last updated: 2026-05-02.

This model is for using Claude Code Pro, GitHub Copilot Pro+, ChatGPT Pro, and Codex across many projects without duplicate work or agent conflicts.

## Position

Do not make every AI tool do the same job. Use GitHub issues or a local work queue as the control plane, then route each task to one owner agent.

**Two-layer dispatch**: classify each task by SDLC **role** first (analyst, PM, architect, UX, dev, QA, reviewer, docs), then pick the **owner-tool** for that role from the role→tool matrix. See `reference/role-tool-matrix.md`.

The workflow is:

```text
Research -> PRD -> Task Queue -> Role Classification -> Tool Owner Dispatch -> Isolated Branch/Worktree -> PR -> Review -> Merge -> Memory Update
```

## Role layer (NEW)

Roles are backed by BMAD-METHOD agents (Analyst, PM, Architect, UX, Dev, Tech Writer) and contains-studio cherry-picks (UX researcher, UI designer, growth hacker, sprint prioritizer, trend researcher, feedback synthesizer, project shipper). All available globally via `~/.claude/agents/`. Per-project opt-in via `~/workspace/.agents/scripts/team-init.sh`.

Role → tool mapping is canonical in `reference/role-tool-matrix.md`. Current budget bias: heavy Claude + Copilot, sparing Codex (reserved for cross-tool PR review).

Branch convention extended: `ai/<role>/<story-id>-<slug>` (was `ai/<agent>/...`).

## Tool Roles

### ChatGPT Pro

Primary role: portfolio architect and research lead.

Use for:

- Deep research with citations.
- Product strategy, user research, competitive research, and technical option analysis.
- PRD creation and refinement.
- Cross-project prioritization.
- Reviewing multiple PRs or issue summaries at a higher level.

Avoid using it for:

- Blind implementation inside a local repo when Codex or Claude Code can run tests directly.

### Codex

Primary role: parallel implementation worker and reviewer.

Use for:

- Isolated GitHub/cloud tasks.
- Multiple small-to-medium implementation tasks in parallel.
- Codebase questions.
- PR review.
- Frontend iteration where visual verification is available.
- Background work across projects.

Avoid using it for:

- Editing the same branch or same file scope as Claude or Copilot at the same time.

### Claude Code Pro

Primary role: local senior engineer and complex refactor/debug worker.

Use for:

- Messy local debugging.
- High-context refactors.
- Architecture-sensitive implementation.
- Terminal-heavy workflows.
- Codebase exploration with subagents.
- Test failure analysis.

Avoid using it for:

- Many shallow backlog tasks when Copilot or Codex cloud can run them asynchronously.

### GitHub Copilot Pro+

Primary role: IDE acceleration and GitHub-native task worker.

Use for:

- Inline suggestions while you code.
- Small issue-based tasks.
- Documentation updates.
- Test coverage improvement.
- PR summaries and PR review.
- GitHub Agent HQ dispatch for Copilot, Claude, or Codex agents when tasks are already issue-shaped.

Avoid using it for:

- Broad multi-repository changes in one task.
- Ambiguous features without a PRD or acceptance criteria.

## No-Conflict Rules

Every AI task must have one owner.

Use these required fields in a GitHub issue, project board item, or local work queue row:

- `id`: stable task ID.
- `project`: repository or project path.
- `owner`: `human`, `claude`, `codex`, `copilot`, or `chatgpt`.
- `status`: `backlog`, `ready`, `claimed`, `working`, `review`, `blocked`, `done`.
- `branch`: branch or worktree name.
- `scope`: directories and files the agent may touch.
- `blocked_by`: related issue, PR, migration, dependency, or design decision.
- `validation`: commands and manual checks required.
- `handoff`: PR link, summary, failures, and follow-up tasks.

Hard rules:

- One issue equals one owner agent.
- One owner agent equals one branch.
- Never let two agents edit the same branch.
- Never let two agents edit overlapping file scopes unless one is read-only review.
- Every agent must claim before work starts and hand off before review.
- If scope changes, update the issue before editing outside the original scope.
- Cross-repository work must be split into separate issues, one per repository.

## Branch And Worktree Convention

Branch naming:

```text
ai/<agent>/<task-id>-<slug>
```

Examples:

```text
ai/claude/42-fix-auth-refresh
ai/codex/57-add-settings-page
ai/copilot/61-docs-install-steps
```

Local worktree naming:

```text
../<repo>.worktrees/<task-id>-<agent>-<slug>
```

Examples:

```text
../my-app.worktrees/42-claude-auth-refresh
../my-app.worktrees/57-codex-settings-page
```

## Dispatch Matrix

| Task Type | Best Owner | Reason |
| --- | --- | --- |
| Market/product research | ChatGPT Pro | Deep research, citations, synthesis |
| PRD and roadmap | ChatGPT Pro, then human approval | Better at broad synthesis before code |
| Large architecture decision | ChatGPT Pro for research, Claude Code for local design check | Separate external research from repo-grounded feasibility |
| Complex local debugging | Claude Code | Best fit for terminal-heavy iterative diagnosis |
| Large refactor | Claude Code or Codex, one branch only | Needs high context and tests |
| Parallel independent features | Codex cloud/app | Designed for isolated parallel tasks |
| Small GitHub issue | Copilot cloud agent or Codex | Issue-shaped async work |
| Test coverage sweep | Copilot or Codex | Narrow acceptance criteria and isolated diffs |
| Documentation cleanup | Copilot | Low-risk backlog throughput |
| PR review | Different agent than implementer | Independent failure detection |
| UI polish | Codex or Claude Code | Use whichever can run visual checks in that project |
| Dependency upgrade | Codex or Claude Code | Needs lockfile/test validation |

## Quota Strategy

Do not try to burn all quota randomly. Treat quota as a portfolio throughput budget.

Daily usage pattern:

1. Use ChatGPT Pro for one portfolio triage pass: rank projects, create tasks, define acceptance criteria.
2. Dispatch 3-8 independent tasks to Codex or GitHub Agent HQ.
3. Use Claude Code locally for the hardest active task only.
4. Use Copilot in the IDE continuously for completions and small local assists.
5. Use remaining Copilot premium requests near the end of the monthly cycle on backlog cleanup, docs, tests, and issue triage.
6. Use remaining ChatGPT deep research quota on future project research, not implementation churn.

Use higher-cost models only when the task has high ambiguity, high risk, or broad architecture impact.

## Review Topology

Use a different reviewer from the implementer:

- Claude implements -> Codex or Copilot reviews.
- Codex implements -> Claude or Copilot reviews.
- Copilot implements -> Claude or Codex reviews.
- Human implements -> Copilot first-pass review, then Claude/Codex for deeper review if risky.

Review prompt should include:

- Issue/PRD link.
- Acceptance criteria.
- Touched files.
- Test output.
- Request for bugs, regressions, security risks, missing tests, and maintainability issues.

## Work Queue Template

Use GitHub Issues when the repo is on GitHub. For local-only projects, create `docs/ai/WORK_QUEUE.md`:

```md
# AI Work Queue

| ID | Status | Owner | Project | Branch | Scope | Validation | Handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AI-001 | ready | unassigned | my-app | | src/auth, tests/auth | pnpm test auth | |
```

Issue body template:

```md
## Goal

## Acceptance Criteria

## Scope

Allowed paths:

Forbidden paths:

## Validation

## Agent Assignment

Owner:
Branch:
Worktree:

## Handoff

PR:
Checks:
Known risks:
Follow-ups:
```

## Recommended Weekly Cadence

Monday:

- ChatGPT Pro deep research or planning pass.
- Refresh `PRD.md` and task queue.
- Dispatch safe parallel tasks.

Tuesday to Thursday:

- Claude Code handles the hardest local implementation.
- Codex and Copilot handle isolated issue branches.
- Use independent cross-agent reviews before merge.

Friday:

- Merge/rebase cleanup.
- Update `AGENTS.md`, `CLAUDE.md`, PRDs, and memory notes.
- Spend leftover quota on docs, tests, dependency checks, and backlog grooming.

## Existing GitHub Patterns Worth Studying

- `bmad-code-org/BMAD-METHOD`: structured agile AI workflows, specialist agents, and lifecycle coverage.
- `stellarlinkco/myclaude`: multi-backend orchestration across Claude, Codex, Gemini, and OpenCode.

Do not copy these wholesale into every project. Use them as references for agent roles, prompts, and lifecycle design. Your safer baseline is still `AGENTS.md`, `CLAUDE.md`, PRDs, issues, branches, and one owner per task.

## Source Notes

- GitHub third-party agents can be started from the Agents tab, issues, PR comments, GitHub Mobile, or VS Code; supported agents include Claude and Codex in public preview.
- GitHub Copilot cloud agent is limited to one repository, one branch, and one PR per assigned task.
- Codex cloud can work on background tasks in parallel with its own environment.
- Claude Code subagents use separate context windows and are best for isolated research or review tasks.
- Claude Code reads `CLAUDE.md`; importing `AGENTS.md` keeps Claude and Codex aligned.
- AGENTS.md is the cross-agent project instruction convention.
