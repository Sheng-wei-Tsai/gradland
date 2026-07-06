# Prime Workflow

Use this at the start of a Claude Code or Codex session.

## Objective

Build enough context to work safely without loading the whole repository.

## Steps

1. Read workspace and project instructions:
   - `/Users/tsaishengwei/workspace/AGENTS.md`
   - nearest project `AGENTS.md`
   - `CLAUDE.md` when using Claude Code
2. Inspect repository state:
   - `git status`
   - `git log -5 --oneline` when in a Git repo
3. Read core docs:
   - `README.md`
   - `PRD.md`
   - active plan, issue, or task file
4. Inspect project shape:
   - package manager files
   - build/test config
   - key entry points
5. Identify validation:
   - lint
   - typecheck
   - tests
   - build
   - manual/browser checks if UI is involved

## Output

Return a concise session brief:

- Project purpose.
- Current task or next phase.
- Tech stack.
- Key files likely relevant.
- Validation commands.
- Risks or missing information.

Do not modify files during prime unless explicitly asked.
