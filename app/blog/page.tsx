import { getAllPosts, getAllTags } from '@/lib/posts';
import BlogList from '@/components/BlogList';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Blog' };

export default function BlogPage() {
  const posts = getAllPosts();
  const tags  = getAllTags();

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ paddingTop: '3.5rem', paddingBottom: '2rem' }}>
        <h1 className="animate-fade-up" style={{
          fontFamily: "'Lora', serif", fontSize: '2.4rem', fontWeight: 700,
          color: 'var(--brown-dark)', marginBottom: '0.5rem',
        }}>
          All Writings
        </h1>
        <p className="animate-fade-up delay-1" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} and counting
        </p>
      </div>

      <BlogList posts={posts} tags={tags} />
    </div>
  );
}
