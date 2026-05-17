import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  scheduleReview,
  clearReview,
  requestPermission,
  fireIfDue,
  getScheduledCount,
} from '@/lib/review-notifications';

const STORAGE_KEY = 'skill_review_schedule';

function stored(): Record<string, unknown> {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

// ── Notification mock ──────────────────────────────────────────────────────────

const mockNotificationConstructor = vi.fn();

function setupNotification(permission: NotificationPermission = 'granted') {
  Object.defineProperty(globalThis, 'Notification', {
    value: Object.assign(mockNotificationConstructor, { permission }),
    writable: true,
    configurable: true,
  });
  (globalThis.Notification as typeof Notification).requestPermission = vi.fn().mockResolvedValue(permission);
}

beforeEach(() => {
  mockNotificationConstructor.mockReset();
  setupNotification('granted');
});

afterEach(() => {
  // Remove Notification so tests that expect it absent start clean
  // (restored by the next beforeEach call)
  delete (globalThis as Record<string, unknown>).Notification;
});

// ── scheduleReview ─────────────────────────────────────────────────────────────

describe('scheduleReview()', () => {
  it('persists an entry to localStorage', () => {
    scheduleReview('path-1', 'skill-1', 'TypeScript Generics');
    const entry = stored()['path-1:skill-1'] as { skillName: string };
    expect(entry).toBeDefined();
    expect(entry.skillName).toBe('TypeScript Generics');
  });

  it('stores two future ISO reminder dates in ascending order', () => {
    const now = Date.now();
    scheduleReview('path-1', 'skill-1', 'TypeScript Generics');

    const entry = stored()['path-1:skill-1'] as { remindAt: string[] };
    expect(entry.remindAt).toHaveLength(2);

    const [d3, d7] = entry.remindAt.map((s: string) => new Date(s).getTime());
    // Both dates must be in the future
    expect(d3).toBeGreaterThan(now);
    expect(d7).toBeGreaterThan(d3);

    // addDays(n) normalises to 9 AM on day N, so the offset from now is roughly
    // n*24h ± 15h depending on time-of-day when the test runs.
    const h = 60 * 60 * 1000;
    expect(d3 - now).toBeGreaterThan(2 * 24 * h); // at least 2 days out
    expect(d3 - now).toBeLessThan(4 * 24 * h);    // at most 4 days out
    expect(d7 - now).toBeGreaterThan(6 * 24 * h); // at least 6 days out
    expect(d7 - now).toBeLessThan(8 * 24 * h);    // at most 8 days out
  });

  it('stores pathId and skillId on the entry', () => {
    scheduleReview('path-2', 'skill-3', 'REST APIs');
    const entry = stored()['path-2:skill-3'] as { pathId: string; skillId: string };
    expect(entry.pathId).toBe('path-2');
    expect(entry.skillId).toBe('skill-3');
  });

  it('overwrites an existing entry for the same path+skill pair', () => {
    scheduleReview('path-1', 'skill-1', 'First Name');
    scheduleReview('path-1', 'skill-1', 'Updated Name');
    const entry = stored()['path-1:skill-1'] as { skillName: string };
    expect(entry.skillName).toBe('Updated Name');
    expect(Object.keys(stored())).toHaveLength(1);
  });

  it('can schedule multiple distinct skills independently', () => {
    scheduleReview('path-1', 'skill-1', 'Skill A');
    scheduleReview('path-1', 'skill-2', 'Skill B');
    scheduleReview('path-2', 'skill-1', 'Skill C');
    expect(Object.keys(stored())).toHaveLength(3);
  });
});

// ── clearReview ────────────────────────────────────────────────────────────────

describe('clearReview()', () => {
  it('removes an existing entry', () => {
    scheduleReview('path-1', 'skill-1', 'TypeScript Generics');
    clearReview('path-1', 'skill-1');
    expect(stored()['path-1:skill-1']).toBeUndefined();
  });

  it('does not throw when the entry does not exist', () => {
    expect(() => clearReview('nope', 'nope')).not.toThrow();
  });

  it('leaves other entries untouched', () => {
    scheduleReview('path-1', 'skill-1', 'Skill A');
    scheduleReview('path-1', 'skill-2', 'Skill B');
    clearReview('path-1', 'skill-1');
    expect(stored()['path-1:skill-2']).toBeDefined();
    expect(Object.keys(stored())).toHaveLength(1);
  });
});

// ── getScheduledCount ──────────────────────────────────────────────────────────

describe('getScheduledCount()', () => {
  it('returns 0 when nothing is scheduled', () => {
    expect(getScheduledCount()).toBe(0);
  });

  it('returns the number of scheduled entries', () => {
    scheduleReview('path-1', 'skill-1', 'A');
    scheduleReview('path-1', 'skill-2', 'B');
    expect(getScheduledCount()).toBe(2);
  });

  it('decrements after clearReview()', () => {
    scheduleReview('path-1', 'skill-1', 'A');
    scheduleReview('path-1', 'skill-2', 'B');
    clearReview('path-1', 'skill-1');
    expect(getScheduledCount()).toBe(1);
  });

  it('returns 0 after all entries are cleared', () => {
    scheduleReview('path-1', 'skill-1', 'A');
    clearReview('path-1', 'skill-1');
    expect(getScheduledCount()).toBe(0);
  });
});

// ── requestPermission ──────────────────────────────────────────────────────────

describe('requestPermission()', () => {
  it('returns true when permission is already granted', async () => {
    setupNotification('granted');
    expect(await requestPermission()).toBe(true);
  });

  it('returns false when permission is denied', async () => {
    setupNotification('denied');
    expect(await requestPermission()).toBe(false);
  });

  it('calls Notification.requestPermission() when status is "default"', async () => {
    setupNotification('default' as NotificationPermission);
    (globalThis.Notification as typeof Notification).requestPermission = vi.fn().mockResolvedValue('granted');
    const result = await requestPermission();
    expect(result).toBe(true);
    expect((globalThis.Notification as typeof Notification).requestPermission).toHaveBeenCalledOnce();
  });

  it('returns false when "default" prompt is denied', async () => {
    setupNotification('default' as NotificationPermission);
    (globalThis.Notification as typeof Notification).requestPermission = vi.fn().mockResolvedValue('denied');
    expect(await requestPermission()).toBe(false);
  });

  it('returns false when Notification is not available', async () => {
    delete (globalThis as Record<string, unknown>).Notification;
    expect(await requestPermission()).toBe(false);
  });
});

// ── fireIfDue ──────────────────────────────────────────────────────────────────

describe('fireIfDue()', () => {
  it('does nothing when Notification is unavailable', () => {
    delete (globalThis as Record<string, unknown>).Notification;
    scheduleReview('path-1', 'skill-1', 'Test');
    // Manually put a past-due entry
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'path-1:skill-1': {
        skillName: 'Test', pathId: 'path-1', skillId: 'skill-1',
        remindAt: [new Date(Date.now() - 1000).toISOString()],
      },
    }));
    expect(() => fireIfDue()).not.toThrow();
    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it('does nothing when permission is not granted', () => {
    setupNotification('denied');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'path-1:skill-1': {
        skillName: 'Test', pathId: 'path-1', skillId: 'skill-1',
        remindAt: [new Date(Date.now() - 1000).toISOString()],
      },
    }));
    fireIfDue();
    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it('does not fire for future reminders', () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'path-1:skill-1': {
        skillName: 'Test', pathId: 'path-1', skillId: 'skill-1',
        remindAt: [future],
      },
    }));
    fireIfDue();
    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it('fires a notification for a past-due 3-day reminder', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'path-1:skill-1': {
        skillName: 'TypeScript Generics', pathId: 'path-1', skillId: 'skill-1',
        remindAt: [past, future],
      },
    }));
    fireIfDue();
    expect(mockNotificationConstructor).toHaveBeenCalledOnce();
    const [title, opts] = mockNotificationConstructor.mock.calls[0] as [string, NotificationOptions];
    expect(title).toBe('Review: TypeScript Generics');
    expect(opts.body).toContain('3-day');
  });

  it('fires a notification for a past-due 7-day (final) reminder', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'path-1:skill-1': {
        skillName: 'REST APIs', pathId: 'path-1', skillId: 'skill-1',
        remindAt: [past],
      },
    }));
    fireIfDue();
    expect(mockNotificationConstructor).toHaveBeenCalledOnce();
    const [, opts] = mockNotificationConstructor.mock.calls[0] as [string, NotificationOptions];
    expect(opts.body).toContain('7-day');
  });

  it('removes the entry entirely once both reminders are fired', () => {
    const past1 = new Date(Date.now() - 2000).toISOString();
    const past2 = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'path-1:skill-1': {
        skillName: 'Skill', pathId: 'path-1', skillId: 'skill-1',
        remindAt: [past1, past2],
      },
    }));
    fireIfDue();
    expect(stored()['path-1:skill-1']).toBeUndefined();
    expect(getScheduledCount()).toBe(0);
  });

  it('keeps the upcoming reminder after firing the first one', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'path-1:skill-1': {
        skillName: 'Skill', pathId: 'path-1', skillId: 'skill-1',
        remindAt: [past, future],
      },
    }));
    fireIfDue();
    const entry = stored()['path-1:skill-1'] as { remindAt: string[] };
    expect(entry).toBeDefined();
    expect(entry.remindAt).toHaveLength(1);
    expect(entry.remindAt[0]).toBe(future);
  });

  it('fires notifications for multiple due entries', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'path-1:skill-1': { skillName: 'Skill A', pathId: 'path-1', skillId: 'skill-1', remindAt: [past] },
      'path-1:skill-2': { skillName: 'Skill B', pathId: 'path-1', skillId: 'skill-2', remindAt: [past] },
    }));
    fireIfDue();
    expect(mockNotificationConstructor).toHaveBeenCalledTimes(2);
  });

  it('sets the tag to the storage key on each notification', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'path-1:skill-1': { skillName: 'Skill', pathId: 'path-1', skillId: 'skill-1', remindAt: [past] },
    }));
    fireIfDue();
    const [, opts] = mockNotificationConstructor.mock.calls[0] as [string, NotificationOptions];
    expect(opts.tag).toBe('path-1:skill-1');
  });
});
