import { describe, it, expect } from 'vitest';
import { SKILL_CONTENT } from '@/lib/skill-content';

describe('SKILL_CONTENT', () => {
  const entries = Object.entries(SKILL_CONTENT);

  it('has exactly 9 entries', () => {
    expect(entries).toHaveLength(9);
  });

  it('every entry has required top-level fields', () => {
    for (const [key, entry] of entries) {
      expect(typeof entry.realWorld, `${key}.realWorld`).toBe('string');
      expect(entry.realWorld.length, `${key}.realWorld non-empty`).toBeGreaterThan(0);

      expect(Array.isArray(entry.takeaways), `${key}.takeaways is array`).toBe(true);
      expect(entry.takeaways.length, `${key}.takeaways non-empty`).toBeGreaterThan(0);

      expect(Array.isArray(entry.topics), `${key}.topics is array`).toBe(true);
      expect(entry.topics.length, `${key}.topics non-empty`).toBeGreaterThan(0);
    }
  });

  it('every takeaway is a non-empty string', () => {
    for (const [key, entry] of entries) {
      for (const takeaway of entry.takeaways) {
        expect(typeof takeaway, `${key} takeaway type`).toBe('string');
        expect(takeaway.length, `${key} takeaway non-empty`).toBeGreaterThan(0);
      }
    }
  });

  it('every topic has required fields as non-empty strings', () => {
    for (const [key, entry] of entries) {
      for (const topic of entry.topics) {
        expect(typeof topic.id,      `${key}:${topic.id} id`).toBe('string');
        expect(topic.id.length,      `${key}:${topic.id} id non-empty`).toBeGreaterThan(0);
        expect(typeof topic.text,    `${key}:${topic.id} text`).toBe('string');
        expect(topic.text.length,    `${key}:${topic.id} text non-empty`).toBeGreaterThan(0);
        expect(typeof topic.detail,  `${key}:${topic.id} detail`).toBe('string');
        expect(topic.detail.length,  `${key}:${topic.id} detail non-empty`).toBeGreaterThan(0);
        expect(typeof topic.example, `${key}:${topic.id} example`).toBe('string');
        expect(topic.example.length, `${key}:${topic.id} example non-empty`).toBeGreaterThan(0);
      }
    }
  });

  it('no duplicate topic IDs within any skill entry', () => {
    for (const [key, entry] of entries) {
      const ids = entry.topics.map(t => t.id);
      const unique = new Set(ids);
      expect(unique.size, `${key} has no duplicate topic ids`).toBe(ids.length);
    }
  });

  it('lookup by known key returns correct entry', () => {
    const entry = SKILL_CONTENT['html-basics'];
    expect(entry).toBeDefined();
    expect(entry.realWorld).toMatch(/HTML/i);
    expect(entry.topics.some(t => t.id === 'document-structure')).toBe(true);
  });

  it('lookup by unknown key returns undefined', () => {
    expect(SKILL_CONTENT['nonexistent-skill']).toBeUndefined();
  });
});
