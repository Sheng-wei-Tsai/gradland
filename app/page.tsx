import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* Hero */}
      <section style={{ padding: '5rem 0 3.5rem', position: 'relative' }}>
        <p className="animate-fade-up font-handwritten" style={{
          fontSize: '1.3rem', color: 'var(--terracotta)', marginBottom: '0.6rem',
        }}>
          Hello, I'm glad you're here 👋
        </p>
        <h1 className="animate-fade-up delay-1" style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
          fontWeight: 700,
          color: 'var(--brown-dark)',
          lineHeight: 1.15,
          marginBottom: '1.2rem',
        }}>
          A warm little corner<br />of the internet
        </h1>
        <p className="animate-fade-up delay-2" style={{
          fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '50ch', lineHeight: 1.7, marginBottom: '2rem',
        }}>
          I write about tech, design, personal growth, and the everyday moments that make life interesting. Pull up a chair. ☕
        </p>
        <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/blog" style={{
            background: 'var(--terracotta)', color: 'white',
            padding: '0.65em 1.5em', borderRadius: '99px',
            fontWeight: 500, textDecoration: 'none', fontSize: '0.95rem',
            transition: 'background 0.2s',
          }}>
            Read the blog →
          </Link>
          <Link href="/about" style={{
            background: 'var(--parchment)', color: 'var(--brown-mid)',
            padding: '0.65em 1.5em', borderRadius: '99px',
            fontWeight: 500, textDecoration: 'none', fontSize: '0.95rem',
          }}>
            About me
          </Link>
        </div>

        {/* decorative dots */}
        <div style={{
          position: 'absolute', right: 0, top: '3rem',
          width: '120px', height: '120px', opacity: 0.12,
          backgroundImage: 'radial-gradient(var(--terracotta) 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
        }} />
      </section>

      {/* Recent Posts */}
      {posts.length > 0 && (
        <section style={{ paddingBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.4rem', color: 'var(--brown-dark)' }}>
              Recent writings
            </h2>
            <Link href="/blog" style={{ fontSize: '0.88rem', color: 'var(--terracotta)', textDecoration: 'none' }}>
              All posts →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {posts.map((post, i) => <PostCard key={post.slug} post={post} index={i} />)}
          </div>
        </section>
      )}

      {/* Topics */}
      <section style={{ paddingBottom: '4rem' }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.4rem', color: 'var(--brown-dark)', marginBottom: '1rem' }}>
          What I write about
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {['Tech & Coding', 'Design', 'Career', 'Personal Life', 'Tutorials', 'Tools'].map(t => (
            <span key={t} className="tag" style={{ fontSize: '0.9rem', padding: '0.3em 1em' }}>{t}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
