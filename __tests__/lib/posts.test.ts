import { describe, it, expect } from 'vitest';
import { getAllPosts, getPostBySlug } from '@/lib/posts';

describe('getPostBySlug — path traversal protection', () => {
  it('returns null for slug with .. (deep traversal)', () => {
    expect(getPostBySlug('../../etc/passwd')).toBeNull();
  });

  it('returns null for slug with .. (single level)', () => {
    expect(getPostBySlug('../admin')).toBeNull();
  });

  it('returns null for slug starting with . (hidden-file attempt)', () => {
    expect(getPostBySlug('.hidden')).toBeNull();
  });

  it('returns null for slug with < > (XSS attempt)', () => {
    expect(getPostBySlug('<script>alert(1)</script>')).toBeNull();
  });

  it('returns null for slug with spaces', () => {
    expect(getPostBySlug('spaces in slug')).toBeNull();
  });

  it('returns null for slug with forward slash (subdir traversal)', () => {
    expect(getPostBySlug('subdir/file')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getPostBySlug('')).toBeNull();
  });

  it('returns null for a valid-format slug that does not exist', () => {
    expect(getPostBySlug('this-post-does-not-exist-abc123')).toBeNull();
  });

  it('returns a Post object for a known real slug', () => {
    const post = getPostBySlug('2026-03-21-securing-nextjs-app-router');
    expect(post).not.toBeNull();
    expect(post?.slug).toBe('2026-03-21-securing-nextjs-app-router');
    expect(post?.source).toBe('blog');
    expect(typeof post?.title).toBe('string');
    expect(post!.title.length).toBeGreaterThan(0);
    expect(typeof post?.date).toBe('string');
    expect(typeof post?.content).toBe('string');
    expect(post!.content.length).toBeGreaterThan(0);
    expect(Array.isArray(post?.tags)).toBe(true);
    expect(typeof post?.readingTime).toBe('string');
  });
});

describe('getAllPosts', () => {
  it('returns a non-empty array', () => {
    const posts = getAllPosts();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  it('every item has required Post fields', () => {
    const posts = getAllPosts();
    const p = posts[0];
    expect(typeof p.slug).toBe('string');
    expect(p.source).toBe('blog');
    expect(typeof p.title).toBe('string');
    expect(typeof p.date).toBe('string');
    expect(typeof p.content).toBe('string');
    expect(Array.isArray(p.tags)).toBe(true);
    expect(typeof p.readingTime).toBe('string');
  });

  it('is sorted newest-first', () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThanOrEqual(2);
    const first = new Date(posts[0].date).getTime();
    const second = new Date(posts[1].date).getTime();
    expect(first).toBeGreaterThanOrEqual(second);
  });

  it('no slug starts with . or contains .. (filesystem safety invariant)', () => {
    const posts = getAllPosts();
    for (const p of posts) {
      expect(p.slug.startsWith('.')).toBe(false);
      expect(p.slug.includes('..')).toBe(false);
    }
  });
});
