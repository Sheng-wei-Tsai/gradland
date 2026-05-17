'use client';
import { useEffect, useState } from 'react';

/**
 * Floating "↑" button that appears once the user has scrolled past the
 * threshold. Mobile-only via CSS — desktop has plenty of vertical chrome
 * (sidebar, large viewport) so a back-to-top button feels redundant there.
 */
const SHOW_AFTER_PX = 600;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}
