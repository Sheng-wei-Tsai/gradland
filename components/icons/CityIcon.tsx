import React from 'react';

export type CityName =
  | 'Brisbane' | 'Sydney' | 'Melbourne' | 'Perth' | 'Adelaide'
  | 'Canberra' | 'Hobart' | 'Darwin'
  | 'Remote'   | 'Australia';

interface CityIconProps {
  city:    string;
  size?:   number;
  className?: string;
  style?:  React.CSSProperties;
  title?:  string;
}

/**
 * Monoline geometric city marks. 24×24 viewBox, currentColor stroke so the icon
 * inherits the parent's color (CitySelector tints the icon container vermilion;
 * other surfaces can recolour without touching the SVG). Stroke 1.6, round caps.
 *
 * Designed to read as architectural primitives at 16px and still hold shape at
 * 64px+. No fill except for two-or-three accent dots that anchor the silhouette.
 */
const COMMON: React.SVGProps<SVGSVGElement> = {
  fill:           'none',
  stroke:         'currentColor',
  strokeWidth:    1.6,
  strokeLinecap:  'round',
  strokeLinejoin: 'round',
  xmlns:          'http://www.w3.org/2000/svg',
};

function paths(city: string) {
  switch (city) {
    /* Sydney — three nested Opera House sails over harbour line */
    case 'Sydney':
      return (
        <>
          <path d="M 3 19 L 21 19" />
          <path d="M 5 19 Q 6.5 12 9 19" />
          <path d="M 8 19 Q 11 9 14.5 19" />
          <path d="M 13 19 Q 16 11 19 19" />
        </>
      );

    /* Melbourne — W-class tram: rounded body, pole, two wheels */
    case 'Melbourne':
      return (
        <>
          <path d="M 4 16 V 10 Q 4 8 6 8 H 18 Q 20 8 20 10 V 16" />
          <path d="M 3.5 16 H 20.5" />
          <path d="M 6.5 11 H 10.5 V 13 H 6.5 Z" />
          <path d="M 13.5 11 H 17.5 V 13 H 13.5 Z" />
          <path d="M 12 8 V 5 H 8" />
          <circle cx="7.5" cy="18.5" r="1.1" />
          <circle cx="16.5" cy="18.5" r="1.1" />
        </>
      );

    /* Brisbane — Story Bridge: twin towers + cantilever cross-bracing */
    case 'Brisbane':
      return (
        <>
          <path d="M 3 19 L 21 19" />
          <path d="M 5.5 6 V 19" />
          <path d="M 18.5 6 V 19" />
          <path d="M 5.5 6 L 18.5 6" />
          <path d="M 5.5 14 L 18.5 14" />
          <path d="M 5.5 6 L 18.5 14" />
          <path d="M 18.5 6 L 5.5 14" />
        </>
      );

    /* Perth — Black swan silhouette: body ellipse + S-neck + beak + ripple */
    case 'Perth':
      return (
        <>
          <path d="M 4 16 Q 8 19 14 17 Q 18 16 18 13 Q 18 11 16 11" />
          <path d="M 16 11 Q 14 9 15 6 Q 16 4 18 4" />
          <path d="M 18 4 L 20 5" />
          <circle cx="16.6" cy="5.6" r="0.4" fill="currentColor" stroke="none" />
          <path d="M 4 19 Q 7 18.4 10 19 Q 13 18.4 16 19" />
        </>
      );

    /* Adelaide — Festival Centre: three triangular roof peaks */
    case 'Adelaide':
      return (
        <>
          <path d="M 2.5 19 H 21.5" />
          <path d="M 3 19 L 7.5 9 L 12 19" />
          <path d="M 8 19 L 12.5 7 L 17 19" />
          <path d="M 13 19 L 16.5 11 L 21 19" />
        </>
      );

    /* Canberra — Parliament Hill mound + flagpole + flag */
    case 'Canberra':
      return (
        <>
          <path d="M 3 19 H 21" />
          <path d="M 3 19 Q 12 11 21 19" />
          <path d="M 12 12 V 4" />
          <path d="M 12 4 L 17 4 L 15.8 6 L 17 8 L 12 8" />
        </>
      );

    /* Hobart — Mt Wellington: jagged peaks with snow caps */
    case 'Hobart':
      return (
        <>
          <path d="M 2 19 H 22" />
          <path d="M 2 19 L 7 11 L 11 14 L 15 7 L 19 13 L 22 19" />
          <path d="M 6 13 L 7 11 L 8.2 12.2" />
          <path d="M 13.8 9 L 15 7 L 16.2 8.6" />
        </>
      );

    /* Darwin — Palm tree: curved trunk + 5 radiating fronds + coconut dots */
    case 'Darwin':
      return (
        <>
          <path d="M 8 19 H 16" />
          <path d="M 12.5 19 Q 11.5 15 12 11" />
          <path d="M 12 11 Q 9 10 5.5 11.5" />
          <path d="M 12 11 Q 9.5 7 7 5" />
          <path d="M 12 11 Q 12.5 6 13.5 3.5" />
          <path d="M 12 11 Q 15.5 8 18 7.5" />
          <path d="M 12 11 Q 15.5 11.5 18.5 13.5" />
          <circle cx="11.5" cy="11.5" r="0.55" fill="currentColor" stroke="none" />
          <circle cx="13"   cy="11.7" r="0.55" fill="currentColor" stroke="none" />
        </>
      );

    /* Remote — Globe + signal arcs */
    case 'Remote':
      return (
        <>
          <circle cx="11" cy="14" r="5" />
          <path d="M 6 14 H 16" />
          <path d="M 11 9 Q 7.5 14 11 19" />
          <path d="M 11 9 Q 14.5 14 11 19" />
          <path d="M 16.5 4.5 Q 19 5.5 19.5 8" />
          <path d="M 15 6.5 Q 16.5 7.5 17 9" />
          <circle cx="14" cy="8" r="0.6" fill="currentColor" stroke="none" />
        </>
      );

    /* Australia — simplified continent outline + Tasmania dot */
    case 'Australia':
      return (
        <>
          <path d="M 4 11
                   Q 4.5 8 7 7
                   Q 9 6 11 6.5
                   Q 13 6 14.5 5.5
                   Q 17 5 19 7
                   Q 21 9 20.5 12
                   Q 20 15 18 17
                   Q 14 19 10 18.5
                   Q 6 18 4.5 15
                   Q 3.5 13 4 11 Z" />
          <circle cx="14.5" cy="20.5" r="0.7" fill="currentColor" stroke="none" />
        </>
      );

    /* Default — generic pin */
    default:
      return (
        <>
          <path d="M 12 4 Q 17 4 17 9.5 Q 17 13.5 12 20 Q 7 13.5 7 9.5 Q 7 4 12 4 Z" />
          <circle cx="12" cy="9.5" r="1.6" />
        </>
      );
  }
}

const CityIcon: React.FC<CityIconProps> = ({ city, size = 20, className, style, title }) => (
  <svg
    {...COMMON}
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    style={style}
    role={title ? 'img' : 'presentation'}
    aria-hidden={title ? undefined : true}
  >
    {title && <title>{title}</title>}
    {paths(city)}
  </svg>
);

export default CityIcon;
