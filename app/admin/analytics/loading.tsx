export default function AdminAnalyticsLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ height: '2.2rem', width: '40%', background: 'var(--parchment)', borderRadius: 8, marginBottom: '1.5rem', opacity: 0.5 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: '110px', background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: 14, opacity: 0.7 }} />
        ))}
      </div>
      <div style={{ height: '320px', background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: 14, opacity: 0.6 }} />
    </div>
  );
}
