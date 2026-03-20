import { Metadata } from 'next';

export const metadata: Metadata = { title: 'About — Henry Tsai' };

const stack = [
  'TypeScript', 'React', 'Next.js', 'React Native',
  'Node.js', 'Python', 'PostgreSQL', 'Supabase',
  'Docker', 'OpenAI API', 'Claude API',
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* Hero */}
      <section style={{ paddingTop: '4.5rem', paddingBottom: '3rem' }}>
        <p className="animate-fade-up font-handwritten" style={{
          fontSize: '1.2rem', color: 'var(--terracotta)', marginBottom: '0.8rem',
        }}>
          Hey, I'm Henry 👋
        </p>
        <h1 className="animate-fade-up delay-1" style={{
          fontFamily: "'Lora', serif",
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 700,
          color: 'var(--brown-dark)',
          lineHeight: 1.15,
          marginBottom: '1.2rem',
        }}>
          Full Stack Developer<br />
          based in Brisbane
        </h1>
        <p className="animate-fade-up delay-2" style={{
          color: 'var(--text-secondary)', fontSize: '1.05rem',
          lineHeight: 1.8, maxWidth: '52ch',
        }}>
          I graduated with a Master of Computer Science from QUT in 2024 and have been building
          real-world products ever since — from AI-powered tools to mobile apps. This blog is where
          I share what I'm learning, what I'm shipping, and what I'm thinking about.
        </p>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--parchment)', marginBottom: '3rem' }} />

      {/* Story */}
      <section className="animate-fade-up" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--brown-dark)' }}>
          My story
        </h2>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: '1.1rem', fontSize: '1rem' }}>
          <p>
            I came to Brisbane from Taiwan to study computer science, and somewhere between late-night
            debugging sessions and building my first full-stack app, I realised this is exactly what I
            want to do with my life.
          </p>
          <p>
            These days I'm deeply interested in AI integration — not just calling APIs, but thinking
            about how LLMs can genuinely improve the tools developers and job-seekers use. This site
            itself is a live experiment: it has a job search engine, an AI cover letter generator, and
            an automated weekly digest of AI research. All built by me, all running in production.
          </p>
          <p>
            I'm actively looking for junior or graduate developer roles in Brisbane (or remote).
            I have full Australian work rights on a 485 Graduate Visa. If you're hiring, I'd love to chat. ☕
          </p>
        </div>
      </section>

      {/* Stack */}
      <section className="animate-fade-up" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--brown-dark)' }}>
          What I work with
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {stack.map(s => (
            <span key={s} style={{
              background: 'var(--warm-white)', border: '1px solid var(--parchment)',
              padding: '0.3em 0.9em', borderRadius: '8px',
              fontSize: '0.88rem', color: 'var(--brown-mid)', fontWeight: 500,
            }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Connect */}
      <section className="animate-fade-up" style={{
        background: 'var(--warm-white)', border: '1px solid var(--parchment)',
        borderRadius: '16px', padding: '2rem', marginBottom: '5rem',
      }}>
        <p className="font-handwritten" style={{ fontSize: '1.25rem', color: 'var(--terracotta)', marginBottom: '0.4rem' }}>
          Let's connect
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.4rem', lineHeight: 1.6 }}>
          Whether you have a role in mind, want to collaborate, or just want to talk tech — my inbox is open.
        </p>
        <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
          <a href="https://github.com/Sheng-wei-Tsai" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/henry-tsai-973438294" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            LinkedIn
          </a>
          <a href="mailto:henrytsaiqut@gmail.com" style={{ ...linkStyle, background: 'var(--terracotta)', color: 'white', borderColor: 'transparent' }}>
            Email me →
          </a>
        </div>
      </section>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  background: 'var(--parchment)', color: 'var(--brown-mid)',
  border: '1px solid var(--parchment)',
  padding: '0.5em 1.2em', borderRadius: '99px',
  textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500,
};
