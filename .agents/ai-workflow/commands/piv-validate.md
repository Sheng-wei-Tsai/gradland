# PIV Validate Workflow

Use this after implementation and before completion.

## Objective

Prove the change meets the plan and does not create obvious regressions.

## Steps

1. Inspect changes:
   - `git status`
   - `git diff`
2. Map changes back to the plan:
   - implemented scope
   - skipped scope
   - changed assumptions
3. Run validation commands from project instructions:
   - format
   - lint
   - typecheck
   - tests
   - build
4. For UI changes:
   - run the app if possible
   - verify the user flow manually or with browser tooling
   - check responsive and error states when relevant
5. Update the AI layer:
   - add missing rules
   - add regression tests
   - update PRD or plan status

## Output

Report:

- Checks run and results.
- Manual validation performed.
- Files changed.
- Known residual risks.
- Follow-up tasks.
