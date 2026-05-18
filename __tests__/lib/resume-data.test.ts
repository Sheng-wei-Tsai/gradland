import { describe, it, expect } from 'vitest';
import { resume } from '@/lib/resume-data';

describe('resume-data', () => {
  it('is defined', () => {
    expect(resume).toBeDefined();
  });

  it('has non-empty contact fields', () => {
    expect(typeof resume.name).toBe('string');
    expect(resume.name.length).toBeGreaterThan(0);
    expect(typeof resume.title).toBe('string');
    expect(resume.title.length).toBeGreaterThan(0);
    expect(typeof resume.location).toBe('string');
    expect(resume.location.length).toBeGreaterThan(0);
    expect(typeof resume.email).toBe('string');
    expect(resume.email.length).toBeGreaterThan(0);
  });

  it('has at least 4 skill categories each with non-empty arrays', () => {
    const categories = Object.entries(resume.skills);
    expect(categories.length).toBeGreaterThanOrEqual(4);
    for (const [, skills] of categories) {
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
      for (const skill of skills) {
        expect(typeof skill).toBe('string');
        expect(skill.length).toBeGreaterThan(0);
      }
    }
  });

  it('has at least 5 projects', () => {
    expect(resume.projects.length).toBeGreaterThanOrEqual(5);
  });

  it('every project has required non-empty fields', () => {
    for (const project of resume.projects) {
      expect(typeof project.name).toBe('string');
      expect(project.name.length).toBeGreaterThan(0);
      expect(typeof project.description).toBe('string');
      expect(project.description.length).toBeGreaterThan(0);
      expect(Array.isArray(project.highlights)).toBe(true);
      expect(project.highlights.length).toBeGreaterThan(0);
      expect(Array.isArray(project.tech)).toBe(true);
      expect(project.tech.length).toBeGreaterThan(0);
    }
  });

  it('gradland project is present (by portfolio URL in demo field)', () => {
    const gradland = resume.projects.find(p => p.demo?.includes('gradland.au'));
    expect(gradland).toBeDefined();
  });

  it('has at least 1 education entry with required fields', () => {
    expect(resume.education.length).toBeGreaterThanOrEqual(1);
    for (const edu of resume.education) {
      expect(typeof edu.degree).toBe('string');
      expect(edu.degree.length).toBeGreaterThan(0);
      expect(typeof edu.institution).toBe('string');
      expect(edu.institution.length).toBeGreaterThan(0);
      expect(typeof edu.location).toBe('string');
      expect(edu.location.length).toBeGreaterThan(0);
      expect(typeof edu.period).toBe('string');
      expect(edu.period.length).toBeGreaterThan(0);
    }
  });

  it('languages is a non-empty string array', () => {
    expect(Array.isArray(resume.languages)).toBe(true);
    expect(resume.languages.length).toBeGreaterThan(0);
    for (const lang of resume.languages) {
      expect(typeof lang).toBe('string');
      expect(lang.length).toBeGreaterThan(0);
    }
  });
});
