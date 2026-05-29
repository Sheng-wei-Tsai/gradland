'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface VideoMeta {
  id:           string;
  title?:       string;
  channelTitle?: string;
  thumbnail?:   string;
  duration?:    string;
}

interface Props {
  videoIds: string[];
}

export default function VideoDeepDive({ videoIds }: Props) {
  const [videos, setVideos] = useState<VideoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (videoIds.length === 0) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      videoIds.map(id =>
        fetch(`/api/learn/video-meta?videoId=${encodeURIComponent(id)}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => data ? { id, ...data } : { id })
          .catch(() => ({ id }))
      ),
    ).then(results => {
      if (!cancelled) {
        setVideos(results);
        setLoading(false);
      }
    }).catch(err => {
      if (!cancelled) { setError((err as Error).message); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [videoIds]);

  if (videoIds.length === 0) return null;

  return (
    <section style={{ margin: '2rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
        <span style={{ fontSize: '1.4rem' }}>📺</span>
        <h2 style={{
          margin: 0,
          fontFamily: "'Lora', serif", fontSize: '1.25rem', color: 'var(--brown-dark)',
        }}>
          Deep dive — community videos
        </h2>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.9rem' }}>
        Curated talks and tutorials. Each opens a Gradland study guide with key concepts + chapter timestamps.
      </p>

      {loading && (
        <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto' }}>
          {videoIds.map(id => <Skeleton key={id} />)}
        </div>
      )}
      {error && <div style={{ color: 'var(--vermilion)', fontSize: '0.85rem' }}>Couldn&apos;t load videos: {error}</div>}

      {!loading && !error && (
        <div style={{ display: 'flex', gap: '0.9rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
          {videos.map(v => (
            <Link
              key={v.id}
              href={`/learn/youtube/${v.id}`}
              style={{
                flex: '0 0 280px',
                background: 'var(--warm-white)',
                border: 'var(--panel-border)',
                borderRadius: '12px',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: 'var(--panel-shadow)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#1a1a1a' }}>
                {v.thumbnail ? (
                  <Image src={v.thumbnail} alt={v.title ?? v.id} fill sizes="(max-width: 640px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    📺
                  </div>
                )}
                {v.duration && (
                  <span style={{
                    position: 'absolute', bottom: '6px', right: '6px',
                    background: 'rgba(0,0,0,0.78)', color: 'white',
                    fontSize: '0.72rem', padding: '0.15rem 0.4rem', borderRadius: '4px',
                  }}>
                    {v.duration}
                  </span>
                )}
              </div>
              <div style={{ padding: '0.7rem 0.85rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.35, color: 'var(--brown-dark)' }}>
                  {v.title ?? v.id}
                </div>
                {v.channelTitle && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                    {v.channelTitle}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Skeleton() {
  return (
    <div style={{
      flex: '0 0 280px',
      background: 'var(--warm-white)',
      border: 'var(--panel-border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{ width: '100%', paddingTop: '56.25%', background: 'var(--parchment)' }} />
      <div style={{ padding: '0.7rem 0.85rem' }}>
        <div style={{ height: '0.9rem', width: '80%', background: 'var(--parchment)', borderRadius: '4px', marginBottom: '0.4rem' }} />
        <div style={{ height: '0.7rem', width: '50%', background: 'var(--parchment)', borderRadius: '4px' }} />
      </div>
    </div>
  );
}
