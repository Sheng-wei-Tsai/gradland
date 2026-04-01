export default function Footer() {
  return (
    <footer style={{
      marginTop: '5rem',
      borderTop: '3px solid var(--ink)',
      background: 'var(--warm-white)',
      boxShadow: '0 -3px 0 var(--vermilion)',
    }}>
      {/* Ink divider accent */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, transparent, var(--vermilion) 20%, var(--gold) 50%, var(--vermilion) 80%, transparent)',
      }} />

      <div style={{
        maxWidth: '720px', margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>
          Made with warmth & curiosity ☕
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          © {new Date().getFullYear()} Henry Tsai · Next.js · Vercel
        </p>
      </div>
    </footer>
  );
}
