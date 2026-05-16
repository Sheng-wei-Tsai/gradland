import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatRelativeDate } from '@/lib/ia-feed';

// Fix "now" so all branch assertions are deterministic.
const NOW = new Date('2026-05-16T12:00:00Z');

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" when the date is earlier the same day', () => {
    const earlier = new Date('2026-05-16T06:00:00Z').toISOString();
    expect(formatRelativeDate(earlier)).toBe('Today');
  });

  it('returns "Yesterday" for a date ~26 hours ago', () => {
    const d = new Date('2026-05-15T10:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('Yesterday');
  });

  it('returns "Xd ago" for 3 days ago (< 7 branch)', () => {
    const d = new Date('2026-05-13T12:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('3d ago');
  });

  it('returns "Xd ago" for 6 days ago (upper edge of < 7 branch)', () => {
    const d = new Date('2026-05-10T12:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('6d ago');
  });

  it('returns "1w ago" for 7 days ago (first entry of < 30 branch)', () => {
    const d = new Date('2026-05-09T12:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('1w ago');
  });

  it('returns "2w ago" for 14 days ago (< 30 branch)', () => {
    const d = new Date('2026-05-02T12:00:00Z').toISOString();
    expect(formatRelativeDate(d)).toBe('2w ago');
  });

  it('returns a locale date string for 45 days ago (≥ 30 branch)', () => {
    const d = new Date('2026-04-01T12:00:00Z').toISOString();
    const result = formatRelativeDate(d);
    // en-AU locale formats as "1 Apr" — match digit + short-month rather than hardcode
    expect(result).toMatch(/^\d+ [A-Za-z]{3}$/);
  });

  it('returns "" for an invalid date string', () => {
    expect(formatRelativeDate('not-a-date')).toBe('');
  });
});
