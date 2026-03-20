import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'About' };

const skills = ['TypeScript', 'React', 'Next.js', 'Node.js', 'Figma', 'CSS/Tailwind'];
const interests = ['☕ Coffee rituals', '📚 Reading', '🎨 Design', '🌿 Nature walks', '🎵 Music', '✈️ Travel'];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* Hero */}
      <section style={{ paddingTop: '4rem', paddingBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-fade-up" style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--terracotta), var(--amber))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
        }}>
          🧑‍💻
        </div>
        <h1 className="animate-fade-up delay-1" style={{
          fontFamily: "'Lora', serif", fontSize: '2.4rem',
          fontWeight: 700, color: 'var(--brown-dark)',
        }}>
          Hey, I'm [Your Name]
        </h1>
        <p className="animate-fade-up delay-2 font-handwritten" style={{
          fontSize: '1.25rem', color: 'var(--terracotta)',
        }}>
          Developer · Designer · Storyteller
        </p>
        <p className="animate-fade-up delay-3" style={{
          color: 'var(--text-secondary)', fontSize: '1.05rem',
          lineHeight: 1.75, maxWidth: '55ch',
        }}>
          I'm a developer who loves building things for the web and writing about the journey.
          This blog is my personal space to share what I learn, what I build, and what I think about — 
          no filter, just honest thoughts.
        </p>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--parchment)', margin: '0.5rem 0 2.5rem' }} />

      {/* Story */}
      <section className="animate-fade-up" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brown-dark)' }}>
          My story
        </h2>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>
            I started coding because I wanted to build things I could share with others. 
            What began as late-night tinkering turned into a career, and then a calling.
          </p>
          <p>
            These days I focus on frontend development and design — I care deeply about the 
            experience of using software, not just the code that powers it.
          </p>
          <p>
            Outside of screens, you'll find me with a good book, exploring new neighbourhoods, 
            or hunting for the perfect flat white. ☕
          </p>
        </div>
      </section>

      {/* Skills */}
      <section className="animate-fade-up" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brown-dark)' }}>
          What I work with
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {skills.map(s => (
            <span key={s} style={{
              background: 'var(--warm-white)', border: '1px solid var(--parchment)',
              padding: '0.35em 1em', borderRadius: '8px',
              fontSize: '0.9rem', color: 'var(--brown-mid)', fontWeight: 500,
            }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Interests */}
      <section className="animate-fade-up" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brown-dark)' }}>
          When I'm not coding
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.7rem' }}>
          {interests.map(item => (
            <div key={item} style={{
              background: 'var(--warm-white)', border: '1px solid var(--parchment)',
              borderRadius: '10px', padding: '0.75rem 1rem',
              fontSize: '0.9rem', color: 'var(--text-secondary)',
            }}>{item}</div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="animate-fade-up" style={{
        background: 'var(--warm-white)', border: '1px solid var(--parchment)',
        borderRadius: '16px', padding: '2rem', marginBottom: '4rem',
        textAlign: 'center',
      }}>
        <p className="font-handwritten" style={{ fontSize: '1.3rem', color: 'var(--terracotta)', marginBottom: '0.5rem' }}>
          Let's connect!
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
          I'm always happy to chat about tech, design, or just life in general.
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: '🐙 GitHub', href: 'https://github.com' },
            { label: '🐦 Twitter/X', href: 'https://twitter.com' },
            { label: '💼 LinkedIn', href: 'https://linkedin.com' },
          ].map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{
              background: 'var(--parchment)', color: 'var(--brown-mid)',
              padding: '0.5em 1.2em', borderRadius: '99px',
              textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500,
              transition: 'background 0.2s',
            }}>{link.label}</a>
          ))}
        </div>
      </section>
    </div>
  );
}
