export default function LearnLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ height: '2.2rem', width: '50%', background: 'var(--parchment)', borderRadius: 8, marginBottom: '1.5rem', opacity: 0.5 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: '180px', background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: 14, opacity: 0.7 }} />
        ))}
      </div>
    </div>
  );
}
