import { describe, it, expect } from 'vitest';
import {
  TOOLS_LAND,
  TOOLS_TRACK,
  INSIGHTS_CONTENT,
  INSIGHTS_MARKET,
  ACCOUNT_LINKS,
  TOOLS_MENU,
  INSIGHTS_MENU,
  ALL_TOOLS_HREFS,
  ALL_INSIGHTS_HREFS,
} from '@/lib/nav';

function checkNavItems(items: typeof TOOLS_LAND) {
  for (const item of items) {
    expect(typeof item.href).toBe('string');
    expect(item.href.length).toBeGreaterThan(0);
    expect(typeof item.tKey).toBe('string');
    expect(item.tKey.length).toBeGreaterThan(0);
    expect(typeof item.icon).toBe('string');
    expect(item.icon.length).toBeGreaterThan(0);
  }
}

describe('TOOLS_LAND', () => {
  it('is non-empty', () => {
    expect(TOOLS_LAND.length).toBeGreaterThan(0);
  });

  it('every item has required fields', () => {
    checkNavItems(TOOLS_LAND);
  });

  it('contains /resume', () => {
    expect(TOOLS_LAND.some(i => i.href === '/resume')).toBe(true);
  });
});

describe('TOOLS_TRACK', () => {
  it('is non-empty', () => {
    expect(TOOLS_TRACK.length).toBeGreaterThan(0);
  });

  it('every item has required fields', () => {
    checkNavItems(TOOLS_TRACK);
  });

  it('contains /dashboard', () => {
    expect(TOOLS_TRACK.some(i => i.href === '/dashboard')).toBe(true);
  });
});

describe('INSIGHTS_CONTENT', () => {
  it('is non-empty', () => {
    expect(INSIGHTS_CONTENT.length).toBeGreaterThan(0);
  });

  it('every item has required fields', () => {
    checkNavItems(INSIGHTS_CONTENT);
  });
});

describe('INSIGHTS_MARKET', () => {
  it('is non-empty', () => {
    expect(INSIGHTS_MARKET.length).toBeGreaterThan(0);
  });

  it('every item has required fields', () => {
    checkNavItems(INSIGHTS_MARKET);
  });
});

describe('ACCOUNT_LINKS', () => {
  it('is non-empty', () => {
    expect(ACCOUNT_LINKS.length).toBeGreaterThan(0);
  });

  it('every item has required fields', () => {
    checkNavItems(ACCOUNT_LINKS);
  });
});

describe('ALL_TOOLS_HREFS', () => {
  it('length equals TOOLS_LAND + TOOLS_TRACK', () => {
    expect(ALL_TOOLS_HREFS.length).toBe(TOOLS_LAND.length + TOOLS_TRACK.length);
  });

  it('contains no duplicate hrefs', () => {
    expect(new Set(ALL_TOOLS_HREFS).size).toBe(ALL_TOOLS_HREFS.length);
  });

  it('all hrefs start with /', () => {
    for (const href of ALL_TOOLS_HREFS) {
      expect(href).toMatch(/^\//);
    }
  });

  it('contains /resume', () => {
    expect(ALL_TOOLS_HREFS).toContain('/resume');
  });
});

describe('ALL_INSIGHTS_HREFS', () => {
  it('length equals INSIGHTS_CONTENT + INSIGHTS_MARKET', () => {
    expect(ALL_INSIGHTS_HREFS.length).toBe(INSIGHTS_CONTENT.length + INSIGHTS_MARKET.length);
  });

  it('contains no duplicate hrefs', () => {
    expect(new Set(ALL_INSIGHTS_HREFS).size).toBe(ALL_INSIGHTS_HREFS.length);
  });

  it('all hrefs start with /', () => {
    for (const href of ALL_INSIGHTS_HREFS) {
      expect(href).toMatch(/^\//);
    }
  });
});

describe('TOOLS_MENU', () => {
  it('land.items === TOOLS_LAND', () => {
    expect(TOOLS_MENU.land.items).toBe(TOOLS_LAND);
  });

  it('track.items === TOOLS_TRACK', () => {
    expect(TOOLS_MENU.track.items).toBe(TOOLS_TRACK);
  });

  it('has tKey on each section', () => {
    expect(typeof TOOLS_MENU.land.tKey).toBe('string');
    expect(typeof TOOLS_MENU.track.tKey).toBe('string');
  });
});

describe('INSIGHTS_MENU', () => {
  it('content.items === INSIGHTS_CONTENT', () => {
    expect(INSIGHTS_MENU.content.items).toBe(INSIGHTS_CONTENT);
  });

  it('market.items === INSIGHTS_MARKET', () => {
    expect(INSIGHTS_MENU.market.items).toBe(INSIGHTS_MARKET);
  });

  it('has tKey on each section', () => {
    expect(typeof INSIGHTS_MENU.content.tKey).toBe('string');
    expect(typeof INSIGHTS_MENU.market.tKey).toBe('string');
  });
});
