import React from 'react';

type LogoMarkProps = {
  size?:    number;
  /** Kept for backward-compat. The new mark has its own framed border so this is now a no-op. */
  withShadow?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
  style?:   React.CSSProperties;
  ariaLabel?: string;
  decorative?: boolean;
};

/**
 * Brand mark — horizon design (sun, contour line, three colour bands).
 * Sourced from public/logos/gradland-mark-{light,dark}.svg; rendered inline
 * so the component scales crisply with the `size` prop and stays themable.
 */
const LogoMark: React.FC<LogoMarkProps> = ({
  size = 40,
  variant = 'light',
  className,
  style,
  ariaLabel = 'Gradland',
  decorative = false,
}) => {
  const a11y = decorative
    ? { 'aria-hidden': true as const, role: 'presentation' as const }
    : { 'aria-label': ariaLabel, role: 'img' as const };

  const isDark = variant === 'dark';
  const frameOuter = isDark ? '#0a0805' : '#1a1410';
  const frameInner = isDark ? '#1a1410' : '#f5efe1';
  const frameStroke = isDark ? '#f5efe1' : '#1a1410';
  const sun         = '#d4a04c';
  const contour     = isDark ? '#5b9970' : '#2d5f3f';
  const dune1       = '#e0a982';
  const dune2       = '#d4a04c';
  const dune3       = isDark ? '#5b9970' : '#2d5f3f';
  const clipId      = isDark ? 'lm-frame-dark' : 'lm-frame-light';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      {...a11y}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="4" y="4" width="180" height="180" rx="22" />
        </clipPath>
      </defs>
      <rect x="12" y="12" width="180" height="180" rx="22" fill={frameOuter} />
      <rect x="4" y="4" width="180" height="180" rx="22" fill={frameInner} stroke={frameStroke} strokeWidth="2" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx="130" cy="38" r="8" fill={sun} />
        <path d="M 4 55 C 60 50, 100 60, 184 53" stroke={contour} strokeWidth="1.5" fill="none" strokeDasharray="3 2.5" strokeLinecap="round" />
        <path d="M 4 65 C 50 60, 100 72, 184 65 L 184 184 L 4 184 Z" fill={dune1} />
        <path d="M 4 90 C 45 80, 100 95, 184 88 L 184 184 L 4 184 Z" fill={dune2} />
        <path d="M 4 115 C 45 108, 100 113, 184 118 L 184 184 L 4 184 Z" fill={dune3} />
      </g>
    </svg>
  );
};

export default LogoMark;
