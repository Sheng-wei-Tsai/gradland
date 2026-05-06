import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title:       'Cookies Policy — TechPath AU',
  description: 'What cookies and browser-storage TechPath AU sets, what each one is for, and how to manage your consent.',
  alternates:  { canonical: '/cookies' },
};

const LAST_UPDATED = '6 May 2026';
const CONTACT_EMAIL = 'admin@henrysdigitallife.com';

const cookies: { name: string; provider: string; category: 'Essential' | 'Analytics' | 'Preferences'; purpose: string; retention: string }[] = [
  { name: 'sb-access-token / sb-refresh-token', provider: 'Supabase Auth', category: 'Essential',   purpose: 'Maintains your signed-in session.',                     retention: 'Up to 1 year (cookie); session-only access token.' },
  { name: 'cookies-consent',                    provider: 'TechPath AU',   category: 'Essential',   purpose: 'Records your cookie-banner choice so we don&apos;t ask again.', retention: '12 months.' },
  { name: 'theme',                              provider: 'TechPath AU',   category: 'Preferences', purpose: 'Stores light / dark / system theme preference.',         retention: '12 months (localStorage).' },
  { name: 'lang',                               provider: 'TechPath AU',   category: 'Preferences', purpose: 'Stores language choice (en / zh-TW).',                   retention: '12 months (localStorage).' },
  { name: 'tp_session_id',                      provider: 'TechPath AU',   category: 'Analytics',   purpose: 'Anonymous session id for aggregated page-view counts.',  retention: 'Session only (cleared on browser close).' },
  { name: '__stripe_mid / __stripe_sid',        provider: 'Stripe',        category: 'Essential',   purpose: 'Set during Stripe Checkout for fraud prevention.',       retention: 'Set on Stripe domain; not on ours.' },
];

const containerStyle: React.CSSProperties = {
  maxWidth: '760px',
  margin: '0 auto',
  padding: '3rem 1.5rem 5rem',
  color: 'var(--text-primary)',
  lineHeight: 1.75,
};

const h1Style: React.CSSProperties = {
  fontFamily: "'Lora', serif",
  fontSize: '2rem',
  fontWeight: 700,
  color: 'var(--brown-dark)',
  marginBottom: '0.5rem',
};

const h2Style: React.CSSProperties = {
  fontFamily: "'Lora', serif",
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'var(--brown-dark)',
  marginTop: '2.25rem',
  marginBottom: '0.75rem',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  margin: '1rem 0 1.5rem',
  fontSize: '0.86rem',
};

const cellStyle: React.CSSProperties = {
  padding: '0.6rem 0.65rem',
  borderBottom: '1px solid var(--parchment)',
  verticalAlign: 'top',
  textAlign: 'left',
};

const badgeFor = (c: 'Essential' | 'Analytics' | 'Preferences'): React.CSSProperties => ({
  display: 'inline-block',
  padding: '0.15em 0.55em',
  borderRadius: '99px',
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'white',
  background: c === 'Essential' ? 'var(--terracotta)' : c === 'Analytics' ? 'var(--gold)' : 'var(--jade)',
});

export default function CookiesPage() {
  return (
    <div style={containerStyle}>
      <h1 style={h1Style}>Cookies Policy</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Last updated: {LAST_UPDATED}
      </p>

      <p>
        TechPath AU uses cookies and similar browser-storage mechanisms (localStorage) to make the
        site work, remember your preferences, and measure aggregate usage. This page lists every
        item we set, why we set it, and how to control it.
      </p>

      <h2 style={h2Style}>Categories</h2>
      <ul>
        <li><strong>Essential</strong> — required for the site to function (session, security, billing). Cannot be disabled if you wish to use the site.</li>
        <li><strong>Preferences</strong> — remember choices like theme and language. Disabling resets these on every visit.</li>
        <li><strong>Analytics</strong> — anonymous, aggregated usage metrics. <strong>Off by default</strong>; only set if you grant consent via the cookie banner.</li>
      </ul>

      <h2 style={h2Style}>Detailed list</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, fontWeight: 700, color: 'var(--brown-dark)' }}>Name</th>
            <th style={{ ...cellStyle, fontWeight: 700, color: 'var(--brown-dark)' }}>Provider</th>
            <th style={{ ...cellStyle, fontWeight: 700, color: 'var(--brown-dark)' }}>Category</th>
            <th style={{ ...cellStyle, fontWeight: 700, color: 'var(--brown-dark)' }}>Purpose</th>
            <th style={{ ...cellStyle, fontWeight: 700, color: 'var(--brown-dark)' }}>Retention</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map(c => (
            <tr key={c.name}>
              <td style={{ ...cellStyle, fontFamily: '"Courier New", monospace', fontSize: '0.82rem' }}>{c.name}</td>
              <td style={cellStyle}>{c.provider}</td>
              <td style={cellStyle}><span style={badgeFor(c.category)}>{c.category}</span></td>
              <td style={cellStyle}>{c.purpose}</td>
              <td style={cellStyle}>{c.retention}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={h2Style}>Manage your consent</h2>
      <p>You can change your preferences at any time:</p>
      <ul>
        <li>Click the <strong>&quot;Cookie preferences&quot;</strong> link in the footer.</li>
        <li>Clear the <code>cookies-consent</code> cookie / localStorage entry in your browser — the banner will reappear on the next visit.</li>
        <li>Use your browser&apos;s settings to block cookies entirely (this may break login).</li>
      </ul>

      <h2 style={h2Style}>Third-party cookies</h2>
      <p>
        We do not embed third-party advertising or social-media tracking pixels. The only cross-site
        cookies you may encounter come from <strong>Stripe</strong> during checkout (set on Stripe&apos;s
        domain, not ours). Stripe&apos;s cookie policy is published at{' '}
        <a href="https://stripe.com/au/cookie-settings" target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>
          stripe.com/au/cookie-settings
        </a>.
      </p>

      <h2 style={h2Style}>Do Not Track</h2>
      <p>
        We honour the <code>DNT</code> request header where the browser sends it: when set to <code>1</code>,
        analytics cookies are not loaded even if you previously granted consent.
      </p>

      <h2 style={h2Style}>Updates</h2>
      <p>
        If we add, remove, or change a cookie, we will update this page and (where the change is
        material) re-prompt you for consent.
      </p>

      <h2 style={h2Style}>Questions</h2>
      <p>
        See our <Link href="/privacy" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>Privacy Policy</Link>{' '}
        for the broader picture, or email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>.
      </p>
    </div>
  );
}
