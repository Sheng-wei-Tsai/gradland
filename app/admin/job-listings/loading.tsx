export default function AdminJobListingsLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ height: '2.2rem', width: '40%', background: 'var(--parchment)', borderRadius: 8, marginBottom: '1.5rem', opacity: 0.5 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ height: '90px', background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: 12, marginBottom: '0.75rem', opacity: 0.7 }} />
      ))}
    </div>
  );
}
