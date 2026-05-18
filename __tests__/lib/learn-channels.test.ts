import { describe, it, expect } from 'vitest';
import { LEARN_CHANNELS } from '@/lib/learn-channels';
import type { LearnChannel } from '@/lib/learn-channels';

describe('LEARN_CHANNELS', () => {
  it('is non-empty', () => {
    expect(LEARN_CHANNELS.length).toBeGreaterThan(0);
  });

  it('every channel has required fields', () => {
    for (const ch of LEARN_CHANNELS) {
      expect(typeof ch.id).toBe('string');
      expect(ch.id.length).toBeGreaterThan(0);
      expect(typeof ch.channelId).toBe('string');
      expect(ch.channelId.length).toBeGreaterThan(0);
      expect(typeof ch.name).toBe('string');
      expect(ch.name.length).toBeGreaterThan(0);
      expect(typeof ch.handle).toBe('string');
      expect(ch.handle.length).toBeGreaterThan(0);
      expect(typeof ch.description).toBe('string');
      expect(ch.description.length).toBeGreaterThan(0);
      expect(Array.isArray(ch.focus)).toBe(true);
      expect(ch.focus.length).toBeGreaterThan(0);
      expect(typeof ch.emoji).toBe('string');
      expect(ch.emoji.length).toBeGreaterThan(0);
    }
  });

  it('contains no duplicate channel ids', () => {
    const ids = LEARN_CHANNELS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('contains no duplicate YouTube channelIds', () => {
    const channelIds = LEARN_CHANNELS.map(c => c.channelId);
    expect(new Set(channelIds).size).toBe(channelIds.length);
  });

  it('every handle starts with @', () => {
    for (const ch of LEARN_CHANNELS) {
      expect(ch.handle).toMatch(/^@/);
    }
  });

  it('every focus array has at least one entry', () => {
    for (const ch of LEARN_CHANNELS) {
      expect(ch.focus.length).toBeGreaterThan(0);
    }
  });

  it('find by known id "ibm" returns IBM Technology', () => {
    const ch = LEARN_CHANNELS.find(c => c.id === 'ibm');
    expect(ch).toBeDefined();
    expect(ch!.name).toBe('IBM Technology');
  });

  it('find by unknown id returns undefined', () => {
    expect(LEARN_CHANNELS.find(c => c.id === 'does-not-exist')).toBeUndefined();
  });

  it('first channel is ibm', () => {
    expect(LEARN_CHANNELS[0].id).toBe('ibm');
  });
});
