export default function InterviewPrepLoading() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ height: '2.2rem', width: '45%', background: 'var(--parchment)', borderRadius: 8, marginBottom: '1.5rem', opacity: 0.5 }} />
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: '36px', width: '120px', background: 'var(--parchment)', borderRadius: 18, opacity: 0.5 }} />
        ))}
      </div>
      <div style={{ height: '320px', background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: 14, opacity: 0.6 }} />
    </div>
  );
}
