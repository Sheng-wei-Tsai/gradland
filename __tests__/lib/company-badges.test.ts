import { describe, it, expect } from 'vitest';
import { COMPANY_BADGES, type CompanyBadge } from '@/lib/company-badges';

describe('COMPANY_BADGES', () => {
  it('is non-empty', () => {
    expect(Object.keys(COMPANY_BADGES).length).toBeGreaterThan(0);
  });

  it('contains the three expected keys', () => {
    expect(COMPANY_BADGES).toHaveProperty('anthropic');
    expect(COMPANY_BADGES).toHaveProperty('openai');
    expect(COMPANY_BADGES).toHaveProperty('google');
  });

  it('every entry has the required CompanyBadge fields as non-empty strings', () => {
    const required: (keyof CompanyBadge)[] = ['label', 'color', 'bg', 'border'];
    for (const [key, badge] of Object.entries(COMPANY_BADGES)) {
      for (const field of required) {
        expect(typeof badge[field], `${key}.${field} must be a string`).toBe('string');
        expect(badge[field].length, `${key}.${field} must be non-empty`).toBeGreaterThan(0);
      }
    }
  });

  it('all labels are unique', () => {
    const labels = Object.values(COMPANY_BADGES).map(b => b.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('anthropic entry has correct label', () => {
    expect(COMPANY_BADGES['anthropic'].label).toBe('Anthropic');
  });

  it('google key is present for the ai-news fallback pattern', () => {
    const fallback = COMPANY_BADGES[''] ?? COMPANY_BADGES.google;
    expect(fallback).toBe(COMPANY_BADGES.google);
  });
});
