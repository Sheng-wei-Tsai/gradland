import { describe, it, expect } from 'vitest';
import { UNIVERSAL_QUESTIONS } from '@/lib/universal-questions';
import type { UniversalQuestion } from '@/lib/universal-questions';

describe('UNIVERSAL_QUESTIONS', () => {
  it('is non-empty', () => {
    expect(UNIVERSAL_QUESTIONS.length).toBeGreaterThan(0);
  });

  it('every question has required fields', () => {
    for (const q of UNIVERSAL_QUESTIONS) {
      expect(typeof q.id).toBe('string');
      expect(q.id.length).toBeGreaterThan(0);
      expect(typeof q.text).toBe('string');
      expect(q.text.length).toBeGreaterThan(0);
      expect(typeof q.scenario).toBe('string');
      expect(q.scenario.length).toBeGreaterThan(0);
      expect(typeof q.focus).toBe('string');
      expect(q.focus.length).toBeGreaterThan(0);
      expect(Array.isArray(q.concepts)).toBe(true);
      expect(q.concepts.length).toBeGreaterThan(0);
      expect(typeof q.framework).toBe('string');
      expect(q.framework.length).toBeGreaterThan(0);
      expect(q.questionType).toBe('text');
    }
  });

  it('contains no duplicate question ids', () => {
    const ids = UNIVERSAL_QUESTIONS.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every questionType is "text"', () => {
    for (const q of UNIVERSAL_QUESTIONS) {
      expect(q.questionType).toBe('text');
    }
  });

  it('every concepts array has at least one entry', () => {
    for (const q of UNIVERSAL_QUESTIONS) {
      expect(q.concepts.length).toBeGreaterThan(0);
    }
  });

  it('find by known id "uq1" returns the tell-me-about-yourself question', () => {
    const q = UNIVERSAL_QUESTIONS.find(q => q.id === 'uq1');
    expect(q).toBeDefined();
    expect(q!.text).toBe('Tell me about yourself.');
  });

  it('find by unknown id returns undefined', () => {
    expect(UNIVERSAL_QUESTIONS.find(q => q.id === 'does-not-exist')).toBeUndefined();
  });

  it('has 8 questions covering key AU interview topics', () => {
    expect(UNIVERSAL_QUESTIONS.length).toBe(8);
  });

  it('last question covers "questions for us" (closing question)', () => {
    const last = UNIVERSAL_QUESTIONS[UNIVERSAL_QUESTIONS.length - 1];
    expect(last.text).toContain('questions for us');
  });
});
