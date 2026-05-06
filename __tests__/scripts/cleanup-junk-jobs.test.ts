/**
 * Validates the isJunk() title filter used by cleanup-junk-jobs.ts before
 * any live deletes are run against the scraped_jobs table.
 */

import { isJunk } from '../../scripts/cleanup-junk-jobs';

describe('isJunk() — IT title filter', () => {
  describe('IT roles → should NOT be junk', () => {
    const itTitles = [
      'Software Engineer',
      'Senior Frontend Developer',
      'Full Stack Developer',
      'DevOps Engineer',
      'Cloud Architect',
      'Data Scientist',
      'Machine Learning Engineer',
      'Backend Developer (Python)',
      'QA Engineer',
      'Security Analyst',
      'Database Administrator',
      'Platform Engineer (AWS)',
      'Mobile Developer (iOS/Android)',
      'SRE – Infrastructure',
      'ICT Support Officer',
      'Product Manager – Tech',
      'UX/UI Designer',
      'Network Engineer',
      'Cyber Security Analyst',
    ];

    it.each(itTitles)('keeps "%s"', (title) => {
      expect(isJunk(title)).toBe(false);
    });
  });

  describe('Non-IT roles → should be junk', () => {
    const junkTitles = [
      'Receptionist',
      'Truck Driver',
      'Accountant',
      'Mining Engineer',
      'Mechanical Engineer',
      'Civil Engineer',
      'Structural Engineer',
      'Chemical Engineer',
      'Electrical Engineer',
      'Registered Nurse',
      'Chef de Partie',
      'Warehouse Operator',
      'Forklift Driver',
      'Electrician',
      'Plumber',
      'Barista',
      'Retail Assistant',
      'HR Business Partner',
      'Sales Manager',
      'Office Manager',
      'Financial Analyst',
      'Investment Banking Analyst',
      'Mortgage Broker',
      'Drillers Offsider',
    ];

    it.each(junkTitles)('rejects "%s"', (title) => {
      expect(isJunk(title)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('rejects a title that matches neither IT nor non-IT pattern', () => {
      expect(isJunk('Leasing Consultant')).toBe(true);
    });

    it('NON_IT_RE wins over a coincidental IT keyword match', () => {
      // "Risk Analyst" contains "analyst" (IT keyword) but NON_IT_RE matches "risk analyst" first
      expect(isJunk('Risk Analyst')).toBe(true);
    });

    it('is case-insensitive for IT titles', () => {
      expect(isJunk('software engineer')).toBe(false);
      expect(isJunk('BACKEND DEVELOPER')).toBe(false);
    });

    it('is case-insensitive for non-IT titles', () => {
      expect(isJunk('RECEPTIONIST')).toBe(true);
      expect(isJunk('Accountant')).toBe(true);
    });
  });
});
