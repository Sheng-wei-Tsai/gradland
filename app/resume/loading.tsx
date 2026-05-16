export default function ResumeLoading() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ height: '2.2rem', width: '55%', background: 'var(--parchment)', borderRadius: 8, marginBottom: '1.5rem', opacity: 0.5 }} />
      <div style={{ height: '180px', background: 'var(--warm-white)', border: '1px dashed var(--parchment)', borderRadius: 14, marginBottom: '1.25rem', opacity: 0.7 }} />
      <div style={{ height: '320px', background: 'var(--warm-white)', border: '1px solid var(--parchment)', borderRadius: 14, opacity: 0.6 }} />
    </div>
  );
}
