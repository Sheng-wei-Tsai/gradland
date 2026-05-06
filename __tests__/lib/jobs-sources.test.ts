import { describe, it, expect } from 'vitest';
import {
  sourceLabel,
  formatAttribution,
  pickPrimarySource,
  makeSingleSource,
  SOURCE_PRECEDENCE,
  type SourceRef,
} from '@/lib/jobs-sources';

describe('sourceLabel()', () => {
  it('returns human-readable label for known ATS sources', () => {
    expect(sourceLabel('workable')).toBe('Workable');
    expect(sourceLabel('recruitee')).toBe('Recruitee');
    expect(sourceLabel('breezy')).toBe('Breezy HR');
    expect(sourceLabel('comeet')).toBe('Comeet');
    expect(sourceLabel('icims')).toBe('iCIMS');
    expect(sourceLabel('successfactors')).toBe('SAP SuccessFactors');
    expect(sourceLabel('taleo')).toBe('Oracle Taleo');
  });

  it('returns human-readable label for AU gov job boards', () => {
    expect(sourceLabel('nsw-iworkfor')).toBe('NSW iWorkFor');
    expect(sourceLabel('vic-careers')).toBe('VIC Careers');
    expect(sourceLabel('qld-smartjobs')).toBe('QLD SmartJobs');
    expect(sourceLabel('wa-jobs')).toBe('WA Government Jobs');
  });

  it('returns human-readable label for aggregators and legacy sources', () => {
    expect(sourceLabel('greenhouse')).toBe('Greenhouse');
    expect(sourceLabel('lever')).toBe('Lever');
    expect(sourceLabel('workday')).toBe('Workday');
    expect(sourceLabel('ashby')).toBe('Ashby');
    expect(sourceLabel('adzuna')).toBe('Adzuna');
    expect(sourceLabel('jora')).toBe('Jora');
    expect(sourceLabel('jsearch')).toBe('Google Jobs');
    expect(sourceLabel('google_jobs')).toBe('Google Jobs');
    expect(sourceLabel('smartrec')).toBe('Smartrecruiters');
    expect(sourceLabel('apsjobs')).toBe('APS Jobs');
    expect(sourceLabel('hatch')).toBe('Hatch');
  });

  it('returns the raw name for an unknown source (graceful fallback)', () => {
    expect(sourceLabel('some-unknown-ats')).toBe('some-unknown-ats');
    expect(sourceLabel('')).toBe('');
  });

  it('every entry in SOURCE_PRECEDENCE has a non-raw label', () => {
    const rawFallbacks = SOURCE_PRECEDENCE.filter(s => sourceLabel(s) === s);
    expect(rawFallbacks).toEqual([]);
  });
});

describe('formatAttribution()', () => {
  it('returns empty string for an empty sources array', () => {
    expect(formatAttribution([])).toBe('');
  });

  it('returns "via <label>" for a single source', () => {
    const sources: SourceRef[] = [{ name: 'greenhouse', label: 'Greenhouse', apply_url: 'https://boards.greenhouse.io/x' }];
    expect(formatAttribution(sources)).toBe('via Greenhouse');
  });

  it('returns "via <primary> + N ↗" when multiple sources exist', () => {
    const sources: SourceRef[] = [
      { name: 'greenhouse', label: 'Greenhouse', apply_url: 'https://boards.greenhouse.io/x' },
      { name: 'lever',      label: 'Lever',      apply_url: 'https://jobs.lever.co/x' },
      { name: 'workable',   label: 'Workable',   apply_url: 'https://apply.workable.com/x' },
    ];
    expect(formatAttribution(sources)).toBe('via Greenhouse + 2 ↗');
  });
});

describe('pickPrimarySource()', () => {
  it('picks the source with the highest precedence', () => {
    const sources: SourceRef[] = [
      { name: 'adzuna',     label: 'Adzuna',     apply_url: 'https://adzuna.com.au/x' },
      { name: 'greenhouse', label: 'Greenhouse', apply_url: 'https://boards.greenhouse.io/x' },
    ];
    // greenhouse ranks above adzuna in SOURCE_PRECEDENCE
    expect(pickPrimarySource(sources)).toBe('greenhouse');
  });

  it('workable ranks above adzuna', () => {
    const sources: SourceRef[] = [
      { name: 'adzuna',   label: 'Adzuna',   apply_url: 'https://adzuna.com.au/x' },
      { name: 'workable', label: 'Workable', apply_url: 'https://apply.workable.com/x' },
    ];
    expect(pickPrimarySource(sources)).toBe('workable');
  });

  it('returns "unknown" for an empty array', () => {
    expect(pickPrimarySource([])).toBe('unknown');
  });

  it('falls back to first entry when no source matches precedence list', () => {
    const sources: SourceRef[] = [
      { name: 'obscure-board', label: 'Obscure', apply_url: 'https://obscure.io/x' },
    ];
    expect(pickPrimarySource(sources)).toBe('obscure-board');
  });
});

describe('makeSingleSource()', () => {
  it('creates a SourceRef with the correct label for a known source', () => {
    const refs = makeSingleSource('workable', 'https://apply.workable.com/company/j/job-id/');
    expect(refs).toHaveLength(1);
    expect(refs[0].name).toBe('workable');
    expect(refs[0].label).toBe('Workable');
    expect(refs[0].apply_url).toBe('https://apply.workable.com/company/j/job-id/');
  });

  it('falls back to raw name as label for unknown source', () => {
    const refs = makeSingleSource('new-ats', 'https://new-ats.io/job');
    expect(refs[0].label).toBe('new-ats');
  });
});
