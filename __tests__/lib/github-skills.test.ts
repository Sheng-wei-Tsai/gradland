import { describe, it, expect } from 'vitest';
import { GITHUB_LEVELS, ALL_GH_COURSES, TOTAL_GH_COURSES } from '@/lib/github-skills';
import type { GitHubCourse, GitHubLevel } from '@/lib/github-skills';

describe('GITHUB_LEVELS', () => {
  it('is non-empty', () => {
    expect(GITHUB_LEVELS.length).toBeGreaterThan(0);
  });

  it('every level has required fields', () => {
    for (const level of GITHUB_LEVELS) {
      expect(typeof level.id).toBe('string');
      expect(level.id.length).toBeGreaterThan(0);
      expect(typeof level.title).toBe('string');
      expect(level.title.length).toBeGreaterThan(0);
      expect(typeof level.badge).toBe('string');
      expect(Array.isArray(level.courses)).toBe(true);
      expect(level.courses.length).toBeGreaterThan(0);
    }
  });

  it('first level is "foundation"', () => {
    expect(GITHUB_LEVELS[0].id).toBe('foundation');
    expect(GITHUB_LEVELS[0].title).toBe('Foundation');
  });
});

describe('ALL_GH_COURSES', () => {
  it('length equals TOTAL_GH_COURSES', () => {
    expect(ALL_GH_COURSES.length).toBe(TOTAL_GH_COURSES);
  });

  it('is non-empty', () => {
    expect(ALL_GH_COURSES.length).toBeGreaterThan(0);
  });

  it('contains no duplicate course ids', () => {
    const ids = ALL_GH_COURSES.map(c => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every course has required fields', () => {
    for (const course of ALL_GH_COURSES) {
      expect(typeof course.id).toBe('string');
      expect(course.id.length).toBeGreaterThan(0);
      expect(typeof course.title).toBe('string');
      expect(course.title.length).toBeGreaterThan(0);
      expect(typeof course.githubUrl).toBe('string');
      expect(course.githubUrl.length).toBeGreaterThan(0);
      expect(Array.isArray(course.whatYoullLearn)).toBe(true);
      expect(Array.isArray(course.prerequisites)).toBe(true);
      expect(Array.isArray(course.topics)).toBe(true);
    }
  });

  it('find by known id returns the correct course', () => {
    const course = ALL_GH_COURSES.find(c => c.id === 'introduction-to-git');
    expect(course).toBeDefined();
    expect(course!.title).toBe('Introduction to Git');
  });

  it('find by unknown id returns undefined', () => {
    expect(ALL_GH_COURSES.find(c => c.id === 'does-not-exist')).toBeUndefined();
  });

  it('every githubUrl contains the template_owner=skills marker', () => {
    for (const course of ALL_GH_COURSES) {
      expect(course.githubUrl).toContain('template_owner=skills');
    }
  });

  it('courses are the union of all level courses arrays', () => {
    const fromLevels = GITHUB_LEVELS.flatMap(l => l.courses);
    expect(ALL_GH_COURSES).toEqual(fromLevels);
  });
});
