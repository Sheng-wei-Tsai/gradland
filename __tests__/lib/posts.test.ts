import { describe, it, expect } from 'vitest';
import { getAllPosts, getPostBySlug, getAllClaudeSkills, getClaudeSkillBySlug } from '@/lib/posts';

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

describe('getAllClaudeSkills()', () => {
  it('returns a non-empty array', () => {
    const skills = getAllClaudeSkills();
    expect(Array.isArray(skills)).toBe(true);
    expect(skills.length).toBeGreaterThan(0);
  });

  it('every item has source === "claude-skills" and required Post fields', () => {
    const skills = getAllClaudeSkills();
    for (const s of skills) {
      expect(s.source).toBe('claude-skills');
      expect(typeof s.slug).toBe('string');
      expect(s.slug.length).toBeGreaterThan(0);
      expect(typeof s.title).toBe('string');
      expect(s.title.length).toBeGreaterThan(0);
      expect(typeof s.date).toBe('string');
      expect(s.date.length).toBeGreaterThan(0);
      expect(typeof s.content).toBe('string');
      expect(typeof s.readingTime).toBe('string');
    }
  });

  it('is sorted newest-first by date', () => {
    const skills = getAllClaudeSkills();
    if (skills.length < 2) return;
    const first = new Date(skills[0].date).getTime();
    const second = new Date(skills[1].date).getTime();
    expect(first).toBeGreaterThanOrEqual(second);
  });

  it('at least one skill has claude-skills-specific fields (tier, xpReward, category)', () => {
    const skills = getAllClaudeSkills();
    const withTier = skills.filter(s => typeof s.tier === 'number');
    expect(withTier.length).toBeGreaterThan(0);
    const withXp = skills.filter(s => typeof s.xpReward === 'number');
    expect(withXp.length).toBeGreaterThan(0);
    const withCategory = skills.filter(s => typeof s.category === 'string' && s.category.length > 0);
    expect(withCategory.length).toBeGreaterThan(0);
  });
});

describe('getClaudeSkillBySlug()', () => {
  it('returns a Post for a known slug', () => {
    const skill = getClaudeSkillBySlug('2026-05-29-help-command');
    expect(skill).not.toBeNull();
    expect(skill!.slug).toBe('2026-05-29-help-command');
    expect(skill!.source).toBe('claude-skills');
    expect(typeof skill!.title).toBe('string');
    expect(skill!.title.length).toBeGreaterThan(0);
  });

  it('parses claude-skills frontmatter fields correctly', () => {
    const skill = getClaudeSkillBySlug('2026-05-29-help-command');
    expect(skill).not.toBeNull();
    expect(skill!.tier).toBe(1);
    expect(skill!.xpReward).toBe(20);
    expect(skill!.category).toBe('slash-commands');
  });

  it('parses terminalScenario correctly', () => {
    const skill = getClaudeSkillBySlug('2026-05-29-help-command');
    expect(skill).not.toBeNull();
    expect(skill!.terminalScenario).toBeDefined();
    expect(typeof skill!.terminalScenario!.prompt).toBe('string');
    expect(skill!.terminalScenario!.expectedInput).toBe('/help');
    expect(skill!.terminalScenario!.match).toBe('exact');
  });

  it('parses quiz array with required QuizQuestion fields', () => {
    const skill = getClaudeSkillBySlug('2026-05-29-help-command');
    expect(skill).not.toBeNull();
    expect(Array.isArray(skill!.quiz)).toBe(true);
    expect(skill!.quiz!.length).toBeGreaterThan(0);
    const q = skill!.quiz![0];
    expect(typeof q.q).toBe('string');
    expect(Array.isArray(q.options)).toBe(true);
    expect(typeof q.answer).toBe('number');
    expect(typeof q.explanation).toBe('string');
  });

  it('returns null for a non-existent slug', () => {
    expect(getClaudeSkillBySlug('this-skill-does-not-exist-abc123')).toBeNull();
  });

  it('rejects path traversal attempts', () => {
    expect(getClaudeSkillBySlug('../../etc/passwd')).toBeNull();
    expect(getClaudeSkillBySlug('../admin')).toBeNull();
    expect(getClaudeSkillBySlug('.hidden')).toBeNull();
  });
});
