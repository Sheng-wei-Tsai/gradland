# PIV Plan Workflow

PIV means Plan, Implement, Validate.

Use this for one PRD phase, one issue, or one feature. Do not plan the whole product unless asked.

## Inputs

- `PRD.md` or issue/task description.
- Current project `AGENTS.md`.
- Relevant on-demand references.
- Current codebase state.

## Plan Format

Produce a plan with:

1. Goal
2. Success Criteria
3. Scope
4. Non-Scope
5. Files Likely To Change
6. Data/Config/Environment Needs
7. Implementation Steps
8. Validation Strategy
9. Risks And Assumptions

## Validation Strategy

Define validation before implementation:

- Static checks.
- Unit tests.
- Integration tests.
- End-to-end or browser checks.
- Manual acceptance path.

## Context Reset Guidance

For long planning discussions, save the final plan to a file such as `docs/plans/<feature>.md`, then start implementation from a fresh session using only:

- project instructions
- PRD
- final plan
- required references
