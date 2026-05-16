import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  getNextReviewDate,
  getReviewLabel,
  getPathById,
  getAllSkillIds,
  REVIEW_INTERVALS,
} from '@/lib/skill-paths';

describe('getReviewLabel', () => {
  it('returns "1 day" for count 0', () => {
    expect(getReviewLabel(0)).toBe('1 day');
  });

  it('returns "3 days" for count 1', () => {
    expect(getReviewLabel(1)).toBe('3 days');
  });

  it('returns "7 days" for count 2', () => {
    expect(getReviewLabel(2)).toBe('7 days');
  });

  it('returns "2 weeks" for count 3', () => {
    expect(getReviewLabel(3)).toBe('2 weeks');
  });

  it('returns "30 days → Mastered!" for count 4', () => {
    expect(getReviewLabel(4)).toBe('30 days → Mastered!');
  });

  it('clamps to last label for count 5', () => {
    expect(getReviewLabel(5)).toBe('30 days → Mastered!');
  });

  it('clamps to last label for large count', () => {
    expect(getReviewLabel(99)).toBe('30 days → Mastered!');
  });
});

describe('getNextReviewDate', () => {
  const FIXED_NOW = new Date('2026-05-16T01:00:00.000Z');

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it.each([
    [0, REVIEW_INTERVALS[0]],
    [1, REVIEW_INTERVALS[1]],
    [2, REVIEW_INTERVALS[2]],
    [3, REVIEW_INTERVALS[3]],
    [4, REVIEW_INTERVALS[4]],
  ] as const)('count %i → +%i days from now at 9am local', (count, days) => {
    const result = getNextReviewDate(count);
    const expected = new Date(FIXED_NOW);
    expected.setDate(expected.getDate() + days);
    expected.setHours(9, 0, 0, 0);
    expect(result.getTime()).toBe(expected.getTime());
  });

  it('clamps to max interval for count ≥ 5', () => {
    const result5 = getNextReviewDate(5);
    const result4 = getNextReviewDate(4);
    expect(result5.getTime()).toBe(result4.getTime());
  });

  it('returned date has hours=9, minutes=0, seconds=0, ms=0', () => {
    const result = getNextReviewDate(0);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe('getPathById', () => {
  it('returns a SkillPath for a known id', () => {
    const path = getPathById('junior-frontend');
    expect(path).toBeDefined();
    expect(path?.id).toBe('junior-frontend');
    expect(path?.title).toBe('Junior Frontend Developer');
  });

  it('returns undefined for an unknown id', () => {
    expect(getPathById('nonexistent-path')).toBeUndefined();
  });

  it('returned path has at least one phase with at least one skill', () => {
    const path = getPathById('junior-frontend')!;
    expect(path.phases.length).toBeGreaterThan(0);
    expect(path.phases[0].skills.length).toBeGreaterThan(0);
  });
});

describe('getAllSkillIds', () => {
  it('returns a flat array matching total skill count across all phases', () => {
    const path = getPathById('junior-frontend')!;
    const ids = getAllSkillIds(path);
    const total = path.phases.reduce((sum, ph) => sum + ph.skills.length, 0);
    expect(ids).toHaveLength(total);
  });

  it('all returned IDs are non-empty strings', () => {
    const path = getPathById('junior-frontend')!;
    getAllSkillIds(path).forEach(id => {
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  it('first ID matches first skill of first phase', () => {
    const path = getPathById('junior-frontend')!;
    const ids = getAllSkillIds(path);
    expect(ids[0]).toBe(path.phases[0].skills[0].id);
  });
});
