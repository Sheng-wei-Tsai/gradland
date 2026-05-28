import { describe, it, expect } from 'vitest';

// The Claude CLI shim's quota pattern. Mirrors scripts/llm-claude.ts.
// Kept in sync via a copy because the module spawns child processes and is
// otherwise awkward to import in jsdom.
const QUOTA_PATTERN =
  /hit your (?:[A-Za-z]+\s+)?limit|credit balance is too low|quota.*exceeded|5-hour limit|usage limit reached|claude ai usage limit|weekly limit|try again.{0,30}(hour|later)|resets [0-9]{1,2}:[0-9]{2} ?(am|pm)|resets [A-Z][a-z]+ \d{1,2}/i;

describe('claude CLI quota pattern', () => {
  it('does NOT false-match diagram content containing "Rate Limit"', () => {
    // The exact payload that killed the diagrams pipeline for 27 days:
    // a Mermaid node label about API rate limiting.
    const diagramStdout = 'flowchart TD\n  A["Request"] --> D["Rate Limit"]\n  D --> B["Backend"]';
    expect(QUOTA_PATTERN.test(diagramStdout)).toBe(false);
  });

  it('matches the new Sonnet weekly limit message', () => {
    const msg = "You've hit your Sonnet limit · resets May 31, 11am (UTC)";
    expect(QUOTA_PATTERN.test(msg)).toBe(true);
  });

  it('matches the 5-hour limit message', () => {
    expect(QUOTA_PATTERN.test('You hit your 5-hour limit')).toBe(true);
  });

  it('matches the legacy "Claude AI usage limit" message', () => {
    expect(QUOTA_PATTERN.test('Claude AI usage limit reached for today')).toBe(true);
  });

  it('matches "credit balance is too low"', () => {
    expect(QUOTA_PATTERN.test('Your credit balance is too low')).toBe(true);
  });

  it('does NOT match a normal Mermaid response', () => {
    expect(QUOTA_PATTERN.test('flowchart TD\n  A --> B')).toBe(false);
  });

  it('does NOT match arbitrary text containing the word "limit"', () => {
    // e.g. content like "the rate limit pattern" mentioned in passing.
    expect(QUOTA_PATTERN.test('the rate limit pattern protects backends')).toBe(false);
  });
});
