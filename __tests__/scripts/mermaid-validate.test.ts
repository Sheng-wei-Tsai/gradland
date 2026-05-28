import { describe, it, expect } from 'vitest';
import { validateMermaidSyntax } from '../../scripts/mermaid-validate';

describe('validateMermaidSyntax', () => {
  it('accepts a basic flowchart', async () => {
    const r = await validateMermaidSyntax('flowchart TD\n  A --> B');
    expect(r.ok).toBe(true);
  });

  it('rejects empty input', async () => {
    const r = await validateMermaidSyntax('');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/empty/);
  });

  it('rejects literal \\n inside a node label', async () => {
    // The actual failure mode that broke 2026-04-30-database-sharding.md +
    // 2026-04-30-how-a-load-balancer-works.md on /learn/diagrams. Mermaid
    // displays "\n" as literal text inside labels — use <br/> instead.
    const code = 'flowchart TD\n  A[Foo\\nBar] --> B';
    const r = await validateMermaidSyntax(code);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/\\n/);
  });

  it('rejects unquoted parens inside node labels', async () => {
    // Sharding diagram had: R[Shard Router\nhash(user_id) % 3]
    // Mermaid parser fails at the unquoted "(" — must be wrapped in quotes.
    const code = 'flowchart TD\n  R[hash(user_id)] --> A';
    const r = await validateMermaidSyntax(code);
    expect(r.ok).toBe(false);
  });

  it('accepts the same label when quoted', async () => {
    const r = await validateMermaidSyntax('flowchart TD\n  R["hash(user_id)"] --> A');
    expect(r.ok).toBe(true);
  });

  it('accepts a sequenceDiagram', async () => {
    const code = 'sequenceDiagram\n  Alice->>Bob: Hi\n  Bob-->>Alice: Hello';
    const r = await validateMermaidSyntax(code);
    expect(r.ok).toBe(true);
  });
});
