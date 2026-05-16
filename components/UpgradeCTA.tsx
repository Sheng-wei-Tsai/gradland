/**
 * UpgradeCTA — inline call-to-action for Pro features.
 *
 * Render in any page where a free user hits a Pro-gated capability.
 * Two variants:
 *   - "block" (default): full card with headline + body + button
 *   - "inline": one-line strip suitable for sitting under a free panel
 */

import Link from 'next/link';

interface Props {
  /** What the user was trying to do, e.g. "use the Visa Pathway Planner" */
  feature?:    string;
  /** Headline override; defaults to a feature-based one */
  headline?:   string;
  /** Body override; defaults to feature-aware copy */
  body?:       string;
  variant?:    'block' | 'inline';
  /** Where to send the user; defaults to /pricing */
  href?:       string;
  /** CTA button label */
  cta?:        string;
}

export default function UpgradeCTA({
  feature,
  headline,
  body,
  variant = 'block',
  href    = '/pricing',
  cta     = 'See Pro plans → A$9.99/mo',
}: Props) {
  const resolvedHeadline = headline ?? (
    feature ? `${capitalise(feature)} is a Pro feature` : 'Upgrade to Pro'
  );
  const resolvedBody = body ?? (
    feature
      ? `Pro unlocks ${feature} plus the Visa Pathway Planner, AI cover letters, resume gap analysis, interview coaching, and 100 daily AI calls across every Gradland tool.`
      : 'Unlock the Visa Pathway Planner, AI cover letters, resume gap analysis, interview coaching, and 100 daily AI calls across every Gradland tool.'
  );

  if (variant === 'inline') {
    return (
      <div style={inlineStyle}>
        <span style={{ fontSize: '0.88rem', color: 'var(--brown-dark)' }}>
          {feature ? `Pro unlocks ${feature}.` : 'Pro unlocks AI tools and Visa Pathway.'}
        </span>
        <Link href={href} style={inlineLinkStyle}>{cta}</Link>
      </div>
    );
  }

  return (
    <div style={blockStyle}>
      <span style={badgeStyle}>Pro feature</span>
      <h2 style={headingStyle}>{resolvedHeadline}</h2>
      <p style={bodyStyle}>{resolvedBody}</p>
      <Link href={href} style={primaryLinkStyle}>{cta}</Link>
    </div>
  );
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const blockStyle: React.CSSProperties = {
  background: 'rgba(192,40,28,0.04)',
  border: '1.5px solid rgba(192,40,28,0.3)',
  borderRadius: '14px',
  padding: '2rem 1.6rem',
  textAlign: 'center',
};

const inlineStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '1rem', flexWrap: 'wrap',
  background: 'rgba(192,40,28,0.04)',
  border: '1px solid rgba(192,40,28,0.25)',
  borderRadius: '10px',
  padding: '0.7rem 1rem',
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '0.7rem', fontWeight: 700,
  color: 'var(--terracotta)', background: 'rgba(192,40,28,0.08)',
  border: '1px solid rgba(192,40,28,0.25)', borderRadius: '99px',
  padding: '0.18rem 0.7rem', marginBottom: '0.9rem',
  textTransform: 'uppercase', letterSpacing: '0.08em',
};

const headingStyle: React.CSSProperties = {
  fontFamily: "'Lora', serif", fontSize: '1.3rem', fontWeight: 700,
  color: 'var(--brown-dark)', margin: '0 0 0.6rem',
};

const bodyStyle: React.CSSProperties = {
  fontSize: '0.9rem', color: 'var(--text-secondary)',
  lineHeight: 1.65, margin: '0 auto 1.2rem', maxWidth: '52ch',
};

const primaryLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.65rem 1.4rem', borderRadius: '99px',
  background: 'var(--terracotta)', color: 'white',
  fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
  fontFamily: 'inherit', boxShadow: '3px 3px 0 var(--ink)',
};

const inlineLinkStyle: React.CSSProperties = {
  fontSize: '0.85rem', fontWeight: 700,
  color: 'var(--terracotta)', textDecoration: 'none',
  whiteSpace: 'nowrap',
};
