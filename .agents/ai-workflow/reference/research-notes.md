# Research Notes: Workspace AI Workflow Standard

Last updated: 2026-04-27.

## Video Guide Extract

Source: `https://www.youtube.com/watch?v=goOZSXmrYQ4`

Title found via YouTube page: "My COMPLETE Agentic Coding Workflow to Build Anything (No Fluff or Overengineering)".

Transcript source used: Tubrief transcript page for video `goOZSXmrYQ4`.

Key extracted workflow:

- Start greenfield projects by creating an AI layer before coding.
- The AI layer contains the PRD/spec, global rules, reusable commands, subagents, and reference context.
- The PRD defines what to build; rules define how to build it.
- Keep global rules concise because they load every session.
- Use on-demand reference docs for specialized context such as frontend, API, database, or style guidance.
- Use subagents for research because they isolate large exploratory context and return only findings.
- Avoid using subagents as the default implementation mechanism when the main agent needs all implementation details.
- Use a `prime` workflow at the start of every session to understand project state and next work.
- Split implementation into small phases.
- Run every phase through PIV: Plan, Implement, Validate.
- Create a structured plan with success criteria, task list, documentation references, and validation strategy before writing code.
- Reset or reduce context between planning and implementation when the planning discussion becomes long.
- Set up required environment variables before implementation so validation can be real, not mocked.
- Validate with tests, builds, manual review, and user-flow checks.
- Evolve the codebase, testbase, and AI layer together after bugs, review feedback, or repeated mistakes.

## Claude Code Compatibility

Source: Claude Code documentation, "How Claude remembers your project".

Relevant facts:

- Claude Code reads `CLAUDE.md`, not `AGENTS.md`.
- Claude recommends importing `AGENTS.md` from `CLAUDE.md` when a repository already uses `AGENTS.md`.
- Claude loads `CLAUDE.md` files by walking up the directory tree.
- Claude supports project-level `CLAUDE.md`, user-level `~/.claude/CLAUDE.md`, local `CLAUDE.local.md`, and modular `.claude/rules/`.
- Claude guidance recommends keeping instructions specific and concise; detailed or task-specific guidance should move to skills/rules/on-demand files.

## Codex Compatibility

Sources: OpenAI "Introducing Codex" appendix and AGENTS.md documentation.

Relevant facts:

- Codex uses `AGENTS.md` for project instructions such as coding conventions, project organization, and test commands.
- The scope of an `AGENTS.md` file is the directory tree rooted at the folder that contains it.
- For files touched by the agent, nested `AGENTS.md` files with narrower scope take precedence.
- If `AGENTS.md` lists programmatic checks, Codex is expected to make a best effort to run them after changes.

## Design Decision

Use `AGENTS.md` as the shared source of truth because it is the Codex-native convention and broadly supported by coding agents. Use `CLAUDE.md` only as a Claude Code bridge with `@AGENTS.md`, plus optional Claude-specific notes.

This avoids drift between Claude and Codex instructions while preserving each tool's expected loading mechanism.
