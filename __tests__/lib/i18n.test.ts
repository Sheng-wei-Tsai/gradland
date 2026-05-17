import { describe, it, expect } from 'vitest';
import { isValidLocale, locales, defaultLocale } from '@/lib/i18n';

describe('i18n constants', () => {
  it('locales contains exactly en and zh-TW', () => {
    expect(locales).toEqual(['en', 'zh-TW']);
  });

  it('defaultLocale is en', () => {
    expect(defaultLocale).toBe('en');
  });
});

describe('isValidLocale', () => {
  it('returns true for "en"', () => {
    expect(isValidLocale('en')).toBe(true);
  });

  it('returns true for "zh-TW"', () => {
    expect(isValidLocale('zh-TW')).toBe(true);
  });

  it('returns false for unknown locale "fr"', () => {
    expect(isValidLocale('fr')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidLocale('')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidLocale(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidLocale(undefined)).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isValidLocale(123)).toBe(false);
  });

  it('returns false for an object', () => {
    expect(isValidLocale({})).toBe(false);
  });
});
