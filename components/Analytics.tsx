'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

function getOrCreateSessionId(): string {
  const key = 'hd_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

function getDevice(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function hasAnalyticsConsent(): boolean {
  if (typeof document === 'undefined') return false;
  // Honour Do Not Track regardless of stored consent
  const dnt = (navigator as Navigator & { doNotTrack?: string; msDoNotTrack?: string }).doNotTrack
    ?? (window as Window & { doNotTrack?: string }).doNotTrack;
  if (dnt === '1' || dnt === 'yes') return false;
  const match = document.cookie.match(/(?:^|;\s*)cookies-consent=([^;]+)/);
  return match ? decodeURIComponent(match[1]) === 'accepted' : false;
}

export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState(false);

  // Track consent state — re-render on user choice without page reload
  useEffect(() => {
    setConsent(hasAnalyticsConsent());
    const onChange = () => setConsent(hasAnalyticsConsent());
    window.addEventListener('cookies-consent-changed', onChange);
    return () => window.removeEventListener('cookies-consent-changed', onChange);
  }, []);

  useEffect(() => {
    if (!consent) return;
    if (pathname.startsWith('/admin')) return;

    const sessionId = getOrCreateSessionId();
    const device = getDevice();
    const referrer = document.referrer || null;

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer, device, sessionId }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, consent]);

  return null;
}
