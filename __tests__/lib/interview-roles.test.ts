import { describe, it, expect } from 'vitest';
import { getRoleById, getLevelFromXp, INTERVIEW_ROLES, XP_LEVELS } from '@/lib/interview-roles';

describe('getRoleById', () => {
  it('returns the correct role for a known id', () => {
    const role = getRoleById('junior-frontend');
    expect(role).toBeDefined();
    expect(role!.id).toBe('junior-frontend');
    expect(role!.title).toBe('Junior Frontend Developer');
  });

  it('returns undefined for an unknown id', () => {
    expect(getRoleById('does-not-exist')).toBeUndefined();
  });

  it('returns the universal role', () => {
    const role = getRoleById('universal');
    expect(role).toBeDefined();
    expect(role!.difficulty).toBe('Entry');
    expect(role!.demand).toBe('Very High');
  });

  it('every role in INTERVIEW_ROLES is retrievable by id', () => {
    for (const role of INTERVIEW_ROLES) {
      expect(getRoleById(role.id)).toBe(role);
    }
  });
});

describe('getLevelFromXp', () => {
  it('returns level 1 at xp=0 with progress 0', () => {
    const result = getLevelFromXp(0);
    expect(result.current.level).toBe(1);
    expect(result.current.title).toBe('Beginner');
    expect(result.next).toBeDefined();
    expect(result.next!.level).toBe(2);
    expect(result.progress).toBe(0);
  });

  it('returns level 1 for xp below the level 2 threshold', () => {
    const result = getLevelFromXp(499);
    expect(result.current.level).toBe(1);
    expect(result.next!.xpRequired).toBe(500);
    // progress = Math.round((499 / 500) * 100) = 100
    expect(result.progress).toBe(100);
  });

  it('advances to level 2 exactly at xp=500 with progress 0', () => {
    const result = getLevelFromXp(500);
    expect(result.current.level).toBe(2);
    expect(result.current.title).toBe('Novice');
    expect(result.next!.level).toBe(3);
    expect(result.progress).toBe(0);
  });

  it('calculates progress correctly mid-level', () => {
    // Level 2: 500–1499. At xp=1000: (1000-500)/(1500-500) * 100 = 50
    const result = getLevelFromXp(1000);
    expect(result.current.level).toBe(2);
    expect(result.progress).toBe(50);
  });

  it('advances through all non-max levels at exact thresholds with progress 0', () => {
    // All levels except the last have a "next" level, so progress at the exact threshold is 0
    const nonMaxLevels = XP_LEVELS.slice(0, -1);
    nonMaxLevels.forEach((lvl, i) => {
      const result = getLevelFromXp(lvl.xpRequired);
      expect(result.current.level).toBe(i + 1);
      expect(result.progress).toBe(0);
    });
  });

  it('returns level 5 at xp=7000 with undefined next and progress 100', () => {
    const result = getLevelFromXp(7000);
    expect(result.current.level).toBe(5);
    expect(result.current.title).toBe('Interview Ready');
    expect(result.next).toBeUndefined();
    expect(result.progress).toBe(100);
  });

  it('returns progress 100 for xp beyond the max level', () => {
    const result = getLevelFromXp(99999);
    expect(result.current.level).toBe(5);
    expect(result.next).toBeUndefined();
    expect(result.progress).toBe(100);
  });

  it('progress is always an integer (Math.round)', () => {
    // xp=1 in level 1: (1/500)*100 = 0.2 → rounds to 0
    expect(getLevelFromXp(1).progress).toBe(0);
    // xp=250 in level 1: (250/500)*100 = 50 → 50
    expect(getLevelFromXp(250).progress).toBe(50);
  });
});
