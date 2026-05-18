import { describe, it, expect } from 'vitest';
import { findCompany, COMPANIES } from '@/lib/companies';

describe('COMPANIES array', () => {
  it('is non-empty', () => {
    expect(COMPANIES.length).toBeGreaterThan(0);
  });

  it('every entry has a name and domain', () => {
    for (const c of COMPANIES) {
      expect(typeof c.name).toBe('string');
      expect(c.name.length).toBeGreaterThan(0);
      expect(typeof c.domain).toBe('string');
      expect(c.domain.length).toBeGreaterThan(0);
    }
  });
});

describe('findCompany', () => {
  it('returns undefined for unknown name', () => {
    expect(findCompany('Nonexistent Co')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(findCompany('')).toBeUndefined();
  });

  it('returns the canonical entry for a known direct name "Canva"', () => {
    const result = findCompany('Canva');
    expect(result).toBeDefined();
    expect(result!.name).toBe('Canva');
    expect(result!.domain).toBe('canva.com');
    expect(result!.simpleIconSlug).toBe('canva');
    expect(result!.profileSlug).toBe('canva');
  });

  it('returns the canonical entry when called with an alias ("IBM" → IBM AU)', () => {
    const result = findCompany('IBM');
    expect(result).toBeDefined();
    expect(result!.name).toBe('IBM AU');
    expect(result!.domain).toBe('ibm.com');
  });

  it('returns the canonical entry for another alias ("Amazon / AWS AU" → AWS)', () => {
    const result = findCompany('Amazon / AWS AU');
    expect(result).toBeDefined();
    expect(result!.name).toBe('AWS');
    expect(result!.domain).toBe('amazonaws.com');
  });

  it('is case-sensitive — "canva" returns undefined', () => {
    expect(findCompany('canva')).toBeUndefined();
  });

  it('is case-sensitive — "canva.com" (domain, not name) returns undefined', () => {
    expect(findCompany('canva.com')).toBeUndefined();
  });

  it('returns the same object reference as in COMPANIES', () => {
    const result = findCompany('Canva');
    const canonical = COMPANIES.find(c => c.name === 'Canva');
    expect(result).toBe(canonical);
  });
});
