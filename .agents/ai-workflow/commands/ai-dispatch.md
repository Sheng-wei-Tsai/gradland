# AI Dispatch Workflow

Use this before assigning work to Claude Code, Codex, Copilot, or ChatGPT.

## Objective

Assign one task to one owner agent without branch, file, or responsibility conflicts.

## Inputs

- Project `AGENTS.md` and `CLAUDE.md`.
- `PRD.md` or active issue.
- Current GitHub issue/PR board or `docs/ai/WORK_QUEUE.md`.
- Current branches and open PRs.

## Steps

1. Confirm the task has a clear goal and acceptance criteria.
2. Identify allowed and forbidden file scopes.
3. Check for existing open issues, PRs, branches, or worktrees touching the same scope. **Reject if scope intersects an active story.**
4. **Classify by SDLC role first** (see `reference/role-tool-matrix.md`):
   - analyst, pm, architect, ux, ux-research, market-research, product-research, frontend, backend, full-stack, devops, security, qa, review, docs, shipper.
5. **Pick the owner-tool from the matrix** (do not pick by tool first):
   - Default to **claude** for most roles.
   - Use **copilot** for ≤50 LOC, IDE-bound, doc/comment, routine boilerplate.
   - Use **codex** ONLY for cross-tool PR review or genuinely parallel implementation when Claude is occupied. Reserve quota.
   - Use **chatgpt** for live web research / PRD ideation only.
6. Create or update the issue/work-queue row with:
   - id, status, **role**, owner-tool, **story-file**, branch, scope (allowed/forbidden paths), blocked-by, validation, updated.
7. Use the branch convention:

```text
ai/<role>/<task-id>-<slug>
```

(Was `ai/<agent>/...` — now keyed by role, since the same role may be served by different tools per task.)

8. Dispatch with the story file path, PRD reference, scope, and validation commands.

## Output

Return:

- Selected owner and why.
- Branch/worktree name.
- Allowed paths.
- Forbidden paths.
- Validation commands.
- Reviewer agent.
- Any detected conflict or dependency.

Do not dispatch if another active task owns overlapping scope.
