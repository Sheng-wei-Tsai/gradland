import { describe, it, expect } from 'vitest';
import { getAllDiagrams, getDiagramsByTopic, getDiagram } from '@/lib/diagrams';

describe('getAllDiagrams()', () => {
  it('returns a non-empty array', () => {
    const diagrams = getAllDiagrams();
    expect(Array.isArray(diagrams)).toBe(true);
    expect(diagrams.length).toBeGreaterThan(0);
  });

  it('every item has required Diagram fields of correct types', () => {
    const diagrams = getAllDiagrams();
    const d = diagrams[0];
    expect(typeof d.slug).toBe('string');
    expect(d.slug.length).toBeGreaterThan(0);
    expect(typeof d.title).toBe('string');
    expect(d.title.length).toBeGreaterThan(0);
    expect(typeof d.date).toBe('string');
    expect(d.date.length).toBeGreaterThan(0);
    expect(typeof d.topic).toBe('string');
    expect(typeof d.difficulty).toBe('string');
    expect(typeof d.mermaid).toBe('string');
    expect(typeof d.excerpt).toBe('string');
  });

  it('is sorted newest-first by date', () => {
    const diagrams = getAllDiagrams();
    expect(diagrams.length).toBeGreaterThanOrEqual(2);
    const first = diagrams[0].date;
    const second = diagrams[1].date;
    expect(first.localeCompare(second)).toBeGreaterThanOrEqual(0);
  });

  it('difficulty field is one of the allowed values', () => {
    const diagrams = getAllDiagrams();
    const valid = new Set(['beginner', 'intermediate', 'advanced']);
    for (const d of diagrams) {
      expect(valid.has(d.difficulty)).toBe(true);
    }
  });
});

describe('getDiagramsByTopic()', () => {
  it('returns only diagrams with topic === Databases', () => {
    const all = getAllDiagrams();
    const filtered = getDiagramsByTopic('Databases');
    expect(filtered.length).toBeGreaterThan(0);
    for (const d of filtered) {
      expect(d.topic).toBe('Databases');
    }
    // every filtered result is in getAllDiagrams()
    const slugs = new Set(all.map(d => d.slug));
    for (const d of filtered) {
      expect(slugs.has(d.slug)).toBe(true);
    }
  });

  it('returns a strict subset of getAllDiagrams()', () => {
    const all = getAllDiagrams();
    const filtered = getDiagramsByTopic('System Design');
    expect(filtered.length).toBeLessThanOrEqual(all.length);
  });
});

describe('getDiagram()', () => {
  it('returns a Diagram for a known slug', () => {
    const d = getDiagram('2026-04-30-database-sharding');
    expect(d).toBeDefined();
    expect(d!.slug).toBe('2026-04-30-database-sharding');
    expect(d!.title.length).toBeGreaterThan(0);
    expect(d!.mermaid.length).toBeGreaterThan(0);
  });

  it('returns undefined for an unknown slug', () => {
    expect(getDiagram('this-diagram-does-not-exist-abc')).toBeUndefined();
  });

  it('returned diagram matches the entry in getAllDiagrams()', () => {
    const all = getAllDiagrams();
    const first = all[0];
    const found = getDiagram(first.slug);
    expect(found).toBeDefined();
    expect(found!.slug).toBe(first.slug);
    expect(found!.title).toBe(first.title);
  });
});
