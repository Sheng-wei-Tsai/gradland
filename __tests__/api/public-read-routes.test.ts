import { describe, it, expect, vi } from 'vitest';
import type { Diagram } from '@/lib/diagrams';
import type { Post } from '@/lib/posts';

const mockDiagram: Diagram = {
  slug: 'test-diagram',
  title: 'Test Diagram',
  date: '2026-01-01',
  topic: 'System Design',
  difficulty: 'intermediate',
  mermaid: 'graph TD; A-->B',
  excerpt: 'A test diagram',
};

const mockPost: Post = {
  slug: 'test-visa-news',
  source: 'visa-news',
  title: 'Test Visa News',
  date: '2026-01-01',
  excerpt: 'Test excerpt',
  tags: ['482'],
  readingTime: '2 min read',
  content: 'Test content',
};

const mockGetAllDiagrams = vi.fn().mockReturnValue([mockDiagram]);
vi.mock('@/lib/diagrams', () => ({ getAllDiagrams: mockGetAllDiagrams }));

const mockGetAllVisaNews = vi.fn().mockReturnValue([mockPost]);
vi.mock('@/lib/posts', () => ({ getAllVisaNews: mockGetAllVisaNews }));

const { GET: getDiagramsList } = await import('@/app/api/diagrams/list/route');
const { GET: getAiUsage } = await import('@/app/api/ai-usage/route');
const { GET: getVisaNews } = await import('@/app/api/visa-news/route');

// ── /api/diagrams/list ──────────────────────────────────────────────────────

describe('GET /api/diagrams/list', () => {
  it('returns 200 with the diagrams array', async () => {
    const res = await getDiagramsList();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0].slug).toBe('test-diagram');
    expect(body[0].topic).toBe('System Design');
  });

  it('returns an empty array when no diagrams exist', async () => {
    mockGetAllDiagrams.mockReturnValueOnce([]);
    const res = await getDiagramsList();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});

// ── /api/ai-usage ───────────────────────────────────────────────────────────

describe('GET /api/ai-usage', () => {
  it('returns 200 with tools array and updatedAt field', async () => {
    const res = await getAiUsage();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.tools)).toBe(true);
    expect(body.tools.length).toBeGreaterThan(0);
    expect(body.updatedAt).toBeDefined();
  });

  it('includes Cache-Control header with s-maxage=3600', async () => {
    const res = await getAiUsage();
    const cacheControl = res.headers.get('Cache-Control');
    expect(cacheControl).toContain('s-maxage=3600');
    expect(cacheControl).toContain('stale-while-revalidate=86400');
  });
});

// ── /api/visa-news ──────────────────────────────────────────────────────────

describe('GET /api/visa-news', () => {
  it('returns 200 with array of visa news posts', async () => {
    const res = await getVisaNews();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0].slug).toBe('test-visa-news');
    expect(body[0].source).toBe('visa-news');
  });

  it('returns an empty array when no posts exist', async () => {
    mockGetAllVisaNews.mockReturnValueOnce([]);
    const res = await getVisaNews();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it('includes Cache-Control header with s-maxage=3600', async () => {
    const res = await getVisaNews();
    const cacheControl = res.headers.get('Cache-Control');
    expect(cacheControl).toContain('s-maxage=3600');
    expect(cacheControl).toContain('stale-while-revalidate=86400');
  });
});
