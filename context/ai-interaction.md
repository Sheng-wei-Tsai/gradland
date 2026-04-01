# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly
- Ask before large refactors or architectural changes
- Don't add features not in the project spec
- Never delete files without clarification

---

## Workflow

Follow this sequence for every single feature or fix — no shortcuts.

1. **Document** — Write the feature spec in `context/current-feature.md` before touching code
2. **Branch** — Create a new branch (`feature/[name]` or `fix/[name]`)
3. **Implement** — Build exactly what is in `context/current-feature.md`
4. **Test** — Verify it works in the browser; run `npm run build` and fix all errors
5. **Iterate** — Adjust based on feedback
6. **Commit** — Only after the build passes; ask before committing
7. **Merge** — Merge branch into `main`
8. **Delete Branch** — Delete the feature branch after merge
9. **Review** — Review AI-generated code periodically and on demand
10. **Close out** — Mark completed in `context/current-feature.md`; add to history

> **Do NOT commit without permission and until `npm run build` passes cleanly.**

---

## Branching

Create a new branch for every feature or fix.

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/[name]` | `feature/interview-prep` |
| Bug fix | `fix/[description]` | `fix/digest-timeout` |
| Chore | `chore/[description]` | `chore/update-nav-links` |

Ask to delete the branch once it has been merged.

---

## Commits

- Ask before committing — never auto-commit
- Use conventional commit format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Keep commits focused — one logical change per commit
- Never put "Generated With Claude" or any AI attribution in commit messages
- Write commit messages that explain *why*, not just *what*

---

## When Stuck

- If something isn't working after 2–3 attempts, stop and explain the issue clearly
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

---

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless explicitly asked
- Don't add "nice to have" features beyond the spec
- Preserve existing patterns in the codebase — read before writing

---

## Code Review

Review AI-generated code periodically, especially for:

- **Security** — auth checks, input validation, no secrets exposed
- **Performance** — unnecessary re-renders, N+1 queries, large bundle additions
- **Logic errors** — edge cases, off-by-one, unhandled nulls
- **Patterns** — does it match the existing codebase style?
