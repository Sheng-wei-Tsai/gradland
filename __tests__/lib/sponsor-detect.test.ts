import { describe, it, expect } from 'vitest';
import { detectSponsorSignal } from '@/lib/sponsor-detect';

describe('detectSponsorSignal', () => {
  it('returns false for null', () => {
    expect(detectSponsorSignal(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(detectSponsorSignal(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(detectSponsorSignal('')).toBe(false);
  });

  it('returns false when no pattern matches', () => {
    expect(detectSponsorSignal('Competitive salary and great team culture')).toBe(false);
  });

  it('returns true for "will sponsor visa"', () => {
    expect(detectSponsorSignal('We will sponsor visa for the right candidate')).toBe(true);
  });

  it('returns true for "482 visa sponsorship available"', () => {
    expect(detectSponsorSignal('482 visa sponsorship available for eligible candidates')).toBe(true);
  });

  it('returns true for "accredited sponsor"', () => {
    expect(detectSponsorSignal('We are an accredited sponsor and can support your visa')).toBe(true);
  });

  it('returns true for "sponsorship provided"', () => {
    expect(detectSponsorSignal('Sponsorship provided for outstanding applicants')).toBe(true);
  });

  it('returns false when NEGATIVE overrides a POSITIVE match', () => {
    expect(detectSponsorSignal('No visa sponsorship — must have full Australian work rights')).toBe(false);
  });

  it('returns false for "Australian citizens only"', () => {
    expect(detectSponsorSignal('Australian citizens only. Competitive package offered.')).toBe(false);
  });

  it('returns false for "citizens and permanent residents only"', () => {
    expect(detectSponsorSignal('Citizens and permanent residents only need apply')).toBe(false);
  });

  it('returns false for "cannot sponsor"', () => {
    expect(detectSponsorSignal('Unfortunately we cannot sponsor visa applicants at this time')).toBe(false);
  });

  it('NEGATIVE "no visa sponsorship" overrides any POSITIVE keyword in the same text', () => {
    expect(detectSponsorSignal('482 visa available but no visa sponsorship offered for this role')).toBe(false);
  });
});
