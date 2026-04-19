'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { findCompany } from '@/lib/companies';

type LogoTier = 'si' | 'logodev' | 'gfavicon' | 'initials';

function logoSrcFor(tier: LogoTier, domain?: string, siSlug?: string): string | null {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  switch (tier) {
    case 'si':       return siSlug ? `https://cdn.simpleicons.org/${siSlug}` : null;
    case 'logodev':  return domain && token ? `https://img.logo.dev/${domain}?token=${token}&size=200&format=png` : null;
    case 'gfavicon': return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
    default:         return null;
  }
}

interface CompanyLogoProps {
  name: string;
  size?: number;
  variant?: 'chip' | 'bare';
  tierColor?: string;
  borderColor?: string;
}

export default function CompanyLogo({ name, size = 32, variant = 'bare', tierColor, borderColor }: CompanyLogoProps) {
  const company = findCompany(name);
  const initialTier: LogoTier = company?.simpleIconSlug ? 'si' : company?.domain ? 'logodev' : 'initials';
  const [tier, setTier] = useState<LogoTier>(initialTier);

  const src = company ? logoSrcFor(tier, company.domain, company.simpleIconSlug) : null;
  const initials = name.split(/[\s/]+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  function handleError() {
    if (tier === 'si' && company?.domain)      setTier('logodev');
    else if (tier === 'logodev' && company?.domain) setTier('gfavicon');
    else setTier('initials');
  }

  // ── bare variant — logo image, links to official website when domain available ──
  if (variant === 'bare') {
    const logoEl = !src ? (
      <span style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '4px', flexShrink: 0,
        background: tierColor ?? 'var(--text-muted)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: `${Math.round(size * 0.35)}px`, fontWeight: 800, color: 'white',
      }}>
        {initials}
      </span>
    ) : (
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        unoptimized
        width={size}
        height={size}
        style={{ borderRadius: '4px', flexShrink: 0, objectFit: 'contain', display: 'block' }}
        onError={handleError}
      />
    );

    if (company?.domain) {
      return (
        <a
          href={`https://${company.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${name} website`}
          style={{ display: 'inline-flex', flexShrink: 0, borderRadius: '4px', lineHeight: 0 }}
        >
          {logoEl}
        </a>
      );
    }
    return logoEl;
  }

  // ── chip variant — full chip with ghost watermark + Framer spring ─────────
  const tileSize = size;
  const imgSize  = tier === 'si' ? Math.round(tileSize * 0.69) : Math.round(tileSize * 0.81);

  const logoTile = (
    <span style={{
      width: `${tileSize}px`, height: `${tileSize}px`,
      borderRadius: `${Math.round(tileSize * 0.19)}px`,
      background: tier === 'initials' ? (tierColor ?? 'var(--text-muted)') : 'white',
      border: '1px solid rgba(20,10,5,0.08)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(20,10,5,0.09)',
    }}>
      {src ? (
        <Image
          src={src}
          alt=""
          aria-hidden="true"
          unoptimized
          width={imgSize}
          height={imgSize}
          style={{ objectFit: 'contain', display: 'block' }}
          onError={handleError}
        />
      ) : (
        <span style={{
          fontSize: `${Math.round(tileSize * 0.35)}px`, fontWeight: 800,
          color: 'white', letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {initials}
        </span>
      )}
    </span>
  );

  const inner = (
    <motion.span
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.82rem', fontWeight: 600,
        padding: '0.3rem 0.7rem 0.3rem 0.35rem',
        borderRadius: '7px',
        background: 'var(--warm-white)',
        border: `1.5px solid ${borderColor ?? 'var(--parchment)'}`,
        boxShadow: '2px 2px 0 rgba(20,10,5,0.06)',
        color: tierColor ?? 'var(--text-primary)',
        textDecoration: 'none',
        cursor: company?.profileSlug ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'box-shadow 0.18s ease',
      }}
    >
      {logoTile}

      {/* Ghost watermark — decorative, aria-hidden */}
      {src && (
        <motion.img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute', right: '-10px', bottom: '-10px',
            width: '60px', height: '60px',
            objectFit: 'contain',
            filter: 'blur(3px) saturate(0)',
            pointerEvents: 'none', userSelect: 'none',
          }}
        />
      )}

      <span style={{ position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>
        {name}{company?.profileSlug ? ' →' : ''}
      </span>
    </motion.span>
  );

  return company?.profileSlug ? (
    <Link href={`/au-insights/companies/${company.profileSlug}`} style={{ textDecoration: 'none' }}>
      {inner}
    </Link>
  ) : inner;
}
