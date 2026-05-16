import { describe, it, expect } from 'vitest';
import { deduplicateJobs, type DedupableJob } from '@/lib/jobs-dedup';

function job(overrides: Partial<DedupableJob> & Pick<DedupableJob, 'id' | 'title' | 'company' | 'url' | 'primary_source'>): DedupableJob {
  return {
    sources: [{ name: overrides.primary_source, url: overrides.url }],
    ...overrides,
  };
}

describe('deduplicateJobs()', () => {
  describe('Pass 1 — exact cluster_key match', () => {
    it('merges two identical title+company pairs into one job', () => {
      const jobs = [
        job({ id: '1', title: 'Software Engineer', company: 'Atlassian', url: 'https://a.com/1', primary_source: 'google' }),
        job({ id: '2', title: 'Software Engineer', company: 'Atlassian', url: 'https://b.com/2', primary_source: 'adzuna' }),
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(1);
    });

    it('is case-insensitive for title and company', () => {
      const jobs = [
        job({ id: '1', title: 'senior developer', company: 'CANVA', url: 'https://a.com/1', primary_source: 'google' }),
        job({ id: '2', title: 'Senior Developer', company: 'Canva',  url: 'https://b.com/2', primary_source: 'adzuna' }),
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(1);
    });

    it('keeps distinct title+company pairs separate', () => {
      const jobs = [
        job({ id: '1', title: 'Frontend Engineer', company: 'Canva',    url: 'https://a.com/1', primary_source: 'google' }),
        job({ id: '2', title: 'Backend Engineer',  company: 'Canva',    url: 'https://b.com/2', primary_source: 'google' }),
        job({ id: '3', title: 'Frontend Engineer', company: 'Atlassian',url: 'https://c.com/3', primary_source: 'google' }),
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(3);
    });
  });

  describe('Pass 2 — fuzzy Jaro-Winkler (≥ 0.92 on cluster_key, same company)', () => {
    it('merges near-identical titles at the same company', () => {
      const jobs = [
        job({ id: '1', title: 'Senior Software Engineer',  company: 'Atlassian', url: 'https://a.com/1', primary_source: 'google' }),
        job({ id: '2', title: 'Senior Software Engineer ', company: 'Atlassian', url: 'https://b.com/2', primary_source: 'adzuna' }),
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(1);
    });

    it('does NOT merge identical titles at different companies', () => {
      const jobs = [
        job({ id: '1', title: 'DevOps Engineer', company: 'Canva',    url: 'https://a.com/1', primary_source: 'google' }),
        job({ id: '2', title: 'DevOps Engineer', company: 'Atlassian',url: 'https://b.com/2', primary_source: 'google' }),
      ];
      // Exact key differs (different company), but title is same — should be separate unless exact key matches
      // These ARE separate (different company => different cluster_key in Pass 1)
      // Pass 2 won't merge: company names differ by >0.08 JW distance
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(2);
    });

    it('handles empty input', () => {
      expect(deduplicateJobs([])).toEqual([]);
    });

    it('returns single-element array unchanged', () => {
      const jobs = [job({ id: '1', title: 'ML Engineer', company: 'Canva', url: 'https://a.com/1', primary_source: 'google' })];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('Pass 3 — canonical URL dedup (UTM stripping)', () => {
    it('merges same URL with and without UTM params', () => {
      const jobs = [
        job({ id: '1', title: 'Job A', company: 'Co', url: 'https://example.com/jobs/42', primary_source: 'google' }),
        job({ id: '2', title: 'Job B', company: 'Co', url: 'https://example.com/jobs/42?utm_source=google&utm_medium=cpc', primary_source: 'adzuna' }),
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(1);
    });

    it('strips trailing slash before comparing', () => {
      const jobs = [
        job({ id: '1', title: 'Dev Role', company: 'X', url: 'https://x.com/jobs/1/',  primary_source: 'google' }),
        job({ id: '2', title: 'Dev Role', company: 'X', url: 'https://x.com/jobs/1',   primary_source: 'adzuna' }),
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(1);
    });

    it('keeps jobs with different URLs separate', () => {
      const jobs = [
        job({ id: '1', title: 'Frontend Engineer', company: 'Co', url: 'https://example.com/jobs/1', primary_source: 'google' }),
        job({ id: '2', title: 'Database Administrator', company: 'Co', url: 'https://example.com/jobs/2', primary_source: 'google' }),
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(2);
    });
  });

  describe('source precedence merge', () => {
    it('keeps the higher-precedence primary_source when merging', () => {
      // SOURCE_PRECEDENCE has direct ATS sources before aggregators
      // 'workable' > 'google' in precedence (lower index = higher priority)
      const jobs = [
        job({ id: '1', title: 'Engineer', company: 'Co', url: 'https://a.com/1', primary_source: 'google' }),
        job({ id: '2', title: 'Engineer', company: 'Co', url: 'https://b.com/2', primary_source: 'workable' }),
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(1);
      expect(result[0].primary_source).toBe('workable');
    });

    it('unions sources from both merged jobs without duplicates', () => {
      const jobs = [
        job({ id: '1', title: 'Engineer', company: 'Co', url: 'https://a.com/1', primary_source: 'google',  sources: [{ name: 'google', url: 'https://a.com/1' }] }),
        job({ id: '2', title: 'Engineer', company: 'Co', url: 'https://b.com/2', primary_source: 'adzuna', sources: [{ name: 'adzuna', url: 'https://b.com/2' }] }),
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(1);
      const names = result[0].sources.map(s => s.name);
      expect(names).toContain('google');
      expect(names).toContain('adzuna');
      expect(new Set(names).size).toBe(names.length); // no duplicates
    });

    it('deduplicates source names when merging', () => {
      const sharedSource = { name: 'google', url: 'https://a.com/1' };
      const jobs = [
        job({ id: '1', title: 'Engineer', company: 'Co', url: 'https://a.com/1', primary_source: 'google',  sources: [sharedSource] }),
        job({ id: '2', title: 'Engineer', company: 'Co', url: 'https://b.com/2', primary_source: 'adzuna', sources: [sharedSource, { name: 'adzuna', url: 'https://b.com/2' }] }),
      ];
      const result = deduplicateJobs(jobs);
      const names = result[0].sources.map(s => s.name);
      expect(names.filter(n => n === 'google')).toHaveLength(1);
    });
  });

  describe('extra job fields preserved through merge', () => {
    it('retains non-standard fields from the winning base job', () => {
      const jobs = [
        { ...job({ id: '1', title: 'Dev', company: 'Co', url: 'https://a.com', primary_source: 'workable' }), salary: '$120k' },
        { ...job({ id: '2', title: 'Dev', company: 'Co', url: 'https://b.com', primary_source: 'google'   }), location: 'Sydney' },
      ];
      const result = deduplicateJobs(jobs);
      expect(result).toHaveLength(1);
      expect((result[0] as typeof jobs[0]).salary).toBe('$120k');
    });
  });
});
