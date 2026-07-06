# AI Handoff Workflow

Use this when an agent finishes implementation or review.

## Objective

Create a clean handoff so another agent or human can review without rereading the full session.

## Required Handoff

```md
## Handoff

Task:
Owner:
Branch:
PR:

## What Changed

## Files Touched

## Validation Run

## Validation Not Run

## Known Risks

## Follow-Ups

## Suggested Reviewer
```

## Rules

- Include test output summaries, not full logs unless the failure matters.
- State skipped validation explicitly.
- Mention any scope expansion.
- Update the issue or `docs/ai/WORK_QUEUE.md`.
- If implementation changed a durable convention, update `AGENTS.md`, `CLAUDE.md`, or a focused reference file.
