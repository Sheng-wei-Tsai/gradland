import { describe, it, expect } from 'vitest';
import {
  CSIT_2025,
  SSIT_2025,
  getVisaSalaryFloor,
  checkSalaryCompliance,
} from '@/lib/visa-rules';

describe('getVisaSalaryFloor', () => {
  it('returns CSIT for null', () => {
    expect(getVisaSalaryFloor(null)).toBe(CSIT_2025);
  });

  it('returns CSIT for undefined', () => {
    expect(getVisaSalaryFloor(undefined)).toBe(CSIT_2025);
  });

  it('returns CSIT for "working" (already on 482)', () => {
    expect(getVisaSalaryFloor('working')).toBe(CSIT_2025);
  });

  it('returns CSIT for "graduate" (485 → 482 transition)', () => {
    expect(getVisaSalaryFloor('graduate')).toBe(CSIT_2025);
  });

  it('returns CSIT for "student"', () => {
    expect(getVisaSalaryFloor('student')).toBe(CSIT_2025);
  });

  it('returns CSIT for "outside" (overseas applicants)', () => {
    expect(getVisaSalaryFloor('outside')).toBe(CSIT_2025);
  });

  it('returns CSIT for "unsure" (safe default)', () => {
    expect(getVisaSalaryFloor('unsure')).toBe(CSIT_2025);
  });

  it('returns null for "resident" (PR/citizen — no employer-sponsored floor)', () => {
    expect(getVisaSalaryFloor('resident')).toBeNull();
  });
});

describe('checkSalaryCompliance', () => {
  describe('resident visa → "na" verdict', () => {
    it('returns na with floor=0 for "resident" regardless of offer', () => {
      const result = checkSalaryCompliance(50_000, 'resident');
      expect(result.verdict).toBe('na');
      expect(result.floor).toBe(0);
      expect(result.floorLabel).toBe('No employer-sponsored floor');
    });

    it('returns na even for a high offer', () => {
      const result = checkSalaryCompliance(200_000, 'resident');
      expect(result.verdict).toBe('na');
    });
  });

  describe('offer ≥ SSIT → "safe" with Specialist Skills label', () => {
    it('returns safe at exactly SSIT', () => {
      const result = checkSalaryCompliance(SSIT_2025, 'graduate');
      expect(result.verdict).toBe('safe');
      expect(result.floor).toBe(SSIT_2025);
      expect(result.floorLabel).toContain('Specialist Skills');
    });

    it('returns safe above SSIT', () => {
      const result = checkSalaryCompliance(200_000, 'working');
      expect(result.verdict).toBe('safe');
      expect(result.floor).toBe(SSIT_2025);
    });
  });

  describe('CSIT ≤ offer < SSIT → "safe" with Core Skills label', () => {
    it('returns safe at exactly CSIT', () => {
      const result = checkSalaryCompliance(CSIT_2025, 'student');
      expect(result.verdict).toBe('safe');
      expect(result.floor).toBe(CSIT_2025);
      expect(result.floorLabel).toContain('Core Skills');
    });

    it('returns safe for offer clearly between CSIT and SSIT', () => {
      const result = checkSalaryCompliance(100_000, 'outside');
      expect(result.verdict).toBe('safe');
      expect(result.floor).toBe(CSIT_2025);
      expect(result.rationale).toContain('A$23,485'); // buffer = 100000 - 76515
    });
  });

  describe('offer within 10% below CSIT → "risky"', () => {
    it('returns risky when gap is exactly 10% of CSIT (boundary)', () => {
      // gap = CSIT * 0.1 = 7651.5, offer = CSIT - 7651 = 68864 (gap 7651 ≤ 7651.5)
      const offer = Math.ceil(CSIT_2025 - CSIT_2025 * 0.1);
      const result = checkSalaryCompliance(offer, 'graduate');
      expect(result.verdict).toBe('risky');
      expect(result.floor).toBe(CSIT_2025);
    });

    it('returns risky for an offer just under CSIT', () => {
      const result = checkSalaryCompliance(72_000, 'working');
      expect(result.verdict).toBe('risky');
      expect(result.rationale).toContain('below CSIT');
    });
  });

  describe('offer > 10% below CSIT → "below"', () => {
    it('returns below for a salary well under the threshold', () => {
      const result = checkSalaryCompliance(50_000, 'student');
      expect(result.verdict).toBe('below');
      expect(result.floor).toBe(CSIT_2025);
      expect(result.rationale).toContain('cannot sponsor');
    });

    it('returns below at offer = 0', () => {
      const result = checkSalaryCompliance(0, 'outside');
      expect(result.verdict).toBe('below');
    });
  });

  describe('null visa defaults to CSIT floor', () => {
    it('treats null visa the same as "graduate" for a safe offer', () => {
      const withNull = checkSalaryCompliance(80_000, null);
      const withGrad = checkSalaryCompliance(80_000, 'graduate');
      expect(withNull.verdict).toBe(withGrad.verdict);
      expect(withNull.floor).toBe(withGrad.floor);
    });
  });
});
