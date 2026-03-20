export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--parchment)',
      background: 'var(--warm-white)',
      marginTop: '5rem',
      padding: '2.5rem 1.5rem',
      textAlign: 'center',
    }}>
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.15rem', color: 'var(--brown-light)' }}>
        Made with warmth & curiosity ☕
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        © {new Date().getFullYear()} · Built with Next.js · Hosted on Vercel
      </p>
    </footer>
  );
}
