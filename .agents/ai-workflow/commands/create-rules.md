# Create Rules Workflow

Use this to create project-specific AI instructions.

## Objective

Create or update project `AGENTS.md` and `CLAUDE.md` so Claude Code and Codex follow the same standard.

## Analyze

Inspect:

- `README.md`
- package manager and workspace files
- build/test/lint/typecheck config
- source layout
- tests
- CI config
- deployment config
- existing `AGENTS.md`, `CLAUDE.md`, `.claude/rules/`, or `.agents/`

## Generate `AGENTS.md`

Include only durable, always-needed context:

- Project overview.
- Tech stack.
- Commands.
- Architecture.
- Project structure.
- Coding conventions.
- Testing strategy.
- Security/configuration rules.
- Key files.
- On-demand reference index.
- PR/commit/review expectations if relevant.

Keep it concise. Move long details into reference docs.

## Generate `CLAUDE.md`

If no Claude-specific behavior is required, use:

```md
@AGENTS.md
```

If Claude-specific behavior is required, add it below the import.

## Output

Summarize:

- Files created or updated.
- Validation commands discovered.
- Any missing project facts the user should fill in.
