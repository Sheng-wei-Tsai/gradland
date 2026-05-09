import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title:       'Privacy Policy — Gradland',
  description: 'How Gradland collects, uses, stores, and shares your personal information under the Australian Privacy Act 1988 and applicable data-protection laws.',
  alternates:  { canonical: '/privacy' },
};

const LAST_UPDATED = '9 May 2026';
const CONTACT_EMAIL = 'admin@gradland.au';

const SUBPROCESSORS: { name: string; purpose: string; region: string; url: string }[] = [
  { name: 'Vercel Inc.',          purpose: 'Hosting, edge delivery, serverless compute',  region: 'Global (default region: Sydney, AU)', url: 'https://vercel.com/legal/privacy-policy' },
  { name: 'Supabase Inc.',        purpose: 'Authentication, database, file storage',     region: 'Sydney, AU',                          url: 'https://supabase.com/privacy' },
  { name: 'Stripe Payments Australia Pty Ltd', purpose: 'Subscription billing + payment processing', region: 'AU + US',                            url: 'https://stripe.com/au/privacy' },
  { name: 'Anthropic PBC',        purpose: 'Generative-AI inference (Claude models)',    region: 'United States',                       url: 'https://www.anthropic.com/legal/privacy' },
  { name: 'OpenAI L.L.C.',        purpose: 'Generative-AI inference (GPT models — cover letter, quiz)', region: 'United States',       url: 'https://openai.com/policies/privacy-policy' },
  { name: 'Google LLC',           purpose: 'YouTube Data API v3 — learning-path video content', region: 'United States',               url: 'https://policies.google.com/privacy' },
  { name: 'Resend Inc.',          purpose: 'Transactional email delivery',               region: 'United States',                       url: 'https://resend.com/legal/privacy-policy' },
  { name: 'Logo.dev',             purpose: 'Company-logo image proxy',                   region: 'United States',                       url: 'https://logo.dev/privacy' },
  { name: 'Adzuna Ltd',           purpose: 'Job listing search (AU market)',             region: 'United Kingdom / AU',                 url: 'https://www.adzuna.com.au/about/privacy-policy' },
  { name: 'RapidAPI Inc. (JSearch)', purpose: 'Aggregated job listing search',          region: 'United States',                       url: 'https://rapidapi.com/privacy' },
  { name: 'ScraperAPI LLC',       purpose: 'Job listing scraping proxy',                 region: 'United States',                       url: 'https://www.scraperapi.com/privacy-policy' },
  { name: 'Sentry Inc.',          purpose: 'Error monitoring and performance observability', region: 'United States',                   url: 'https://sentry.io/privacy/' },
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
  fontSize: '0.88rem',
};

const cellStyle: React.CSSProperties = {
  padding: '0.65rem 0.75rem',
  borderBottom: '1px solid var(--parchment)',
  verticalAlign: 'top',
  textAlign: 'left',
};

export default function PrivacyPage() {
  return (
    <div style={containerStyle}>
      <h1 style={h1Style}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Last updated: {LAST_UPDATED}
      </p>

      <p>
        Gradland (&quot;<strong>Gradland</strong>&quot;, &quot;<strong>we</strong>&quot;, &quot;<strong>us</strong>&quot;)
        is operated by Henry Tsai as a sole-trader business in Australia. This Privacy Policy explains
        how we handle your personal information in accordance with the{' '}
        <em>Privacy Act 1988</em> (Cth), the Australian Privacy Principles (APPs), and — where
        applicable — the EU General Data Protection Regulation (GDPR) and the UK Data Protection Act 2018.
      </p>

      <h2 style={h2Style}>1. What we collect</h2>
      <p>We collect only what we need to deliver the service:</p>
      <ul>
        <li><strong>Account data</strong> — email address, display name, avatar, and OAuth identifier (provided by GitHub or Google when you sign in).</li>
        <li><strong>Profile inputs</strong> — career stage, target role, visa type, location preferences, skills, and study notes you choose to enter.</li>
        <li><strong>Generated content</strong> — resumes you upload (PDF), cover letters, gap-analysis results, interview answers, and quiz responses.</li>
        <li><strong>Usage telemetry</strong> — page views, anonymised device/country derived from your IP address (truncated, never stored in raw form), and AI-call counts for fair-use enforcement.</li>
        <li><strong>Payment records</strong> — Stripe customer ID and subscription status. Card details are handled exclusively by Stripe and never reach our servers.</li>
        <li><strong>Communications</strong> — content of any email, contact-form, or in-app message you send us.</li>
      </ul>
      <p>We do <strong>not</strong> collect government identifiers (TFN, passport number, visa-grant number) or health information.</p>

      <h2 style={h2Style}>2. How we use it (APP 6 — purposes)</h2>
      <ul>
        <li>To provide, maintain, and improve the career-tools we publish at this site.</li>
        <li>To authenticate you and prevent abuse, fraud, and rate-limit evasion.</li>
        <li>To process subscription payments via Stripe and to issue tax-compliant receipts.</li>
        <li>To send transactional email (account, billing, content moderation outcomes).</li>
        <li>To produce de-identified aggregate analytics (e.g., &quot;~12% of users target Sydney&quot;).</li>
        <li>To comply with our legal obligations under Australian or foreign law.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell or rent your personal information, and we do not use your
        generated content (resumes, cover letters, etc.) to train AI models. Calls to our AI
        sub-processors are made under <em>zero-data-retention</em> terms where the provider supports
        them.
      </p>

      <h2 style={h2Style}>3. Sub-processors</h2>
      <p>
        We use the following third parties to deliver the service. Each is bound by a Data Processing
        Agreement (DPA) requiring them to handle your data only on our documented instructions and to
        notify us of any breach without undue delay.
      </p>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, fontWeight: 700, color: 'var(--brown-dark)' }}>Processor</th>
            <th style={{ ...cellStyle, fontWeight: 700, color: 'var(--brown-dark)' }}>Purpose</th>
            <th style={{ ...cellStyle, fontWeight: 700, color: 'var(--brown-dark)' }}>Region</th>
          </tr>
        </thead>
        <tbody>
          {SUBPROCESSORS.map(p => (
            <tr key={p.name}>
              <td style={cellStyle}>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                   style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>
                  {p.name}
                </a>
              </td>
              <td style={cellStyle}>{p.purpose}</td>
              <td style={cellStyle}>{p.region}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={h2Style}>4. Cross-border disclosure (APP 8)</h2>
      <p>
        Some sub-processors above operate from the United States. By using Gradland, you consent
        to this transfer. Where a DPA is in place, we rely on Standard Contractual Clauses (SCCs) or
        equivalent transfer mechanisms.
      </p>

      <h2 style={h2Style}>5. Cookies and similar technologies</h2>
      <p>
        We use a small number of cookies and browser-storage entries. See our{' '}
        <Link href="/cookies" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>
          Cookies Policy
        </Link>{' '}
        for the categorised list and to manage your preferences. Analytics cookies are <strong>off
        by default</strong> until you grant consent via the banner shown on first visit.
      </p>

      <h2 style={h2Style}>6. Retention</h2>
      <ul>
        <li><strong>Account data</strong> — kept while your account is active; deleted within 30 days of account closure.</li>
        <li><strong>Generated content</strong> — kept until you delete it from your dashboard or close your account.</li>
        <li><strong>Payment records</strong> — kept for 7 years to comply with Australian tax law (<em>Income Tax Assessment Act 1997</em>).</li>
        <li><strong>Audit logs</strong> — kept for 90 days for security investigation.</li>
      </ul>

      <h2 style={h2Style}>7. Your rights (APPs 12 + 13, GDPR Arts. 15-22)</h2>
      <p>You may at any time:</p>
      <ul>
        <li><strong>Access</strong> — request a copy of the personal information we hold about you.</li>
        <li><strong>Correct</strong> — ask us to fix inaccurate information; most fields are user-editable in your dashboard.</li>
        <li><strong>Delete</strong> — <Link href="/dashboard/account/delete" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>delete your account</Link> in your dashboard settings; your data is removed within 30 days.</li>
        <li><strong>Object</strong> — object to processing for direct marketing (we do not currently send marketing email).</li>
        <li><strong>Port</strong> — receive a machine-readable export of your data.</li>
        <li><strong>Withdraw consent</strong> — revoke previously-granted analytics consent via the banner.</li>
      </ul>
      <p>
        Email <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>{' '}
        with the subject line <em>&quot;Privacy request — &lt;type&gt;&quot;</em>. We will respond within
        30 days.
      </p>

      <h2 style={h2Style}>8. Security</h2>
      <p>
        We use TLS 1.3 for all traffic, Row-Level Security on every database table containing user
        data, signed-cookie sessions, and a content-security-policy header on every response.
        Passwords are not stored: authentication is delegated entirely to GitHub / Google OAuth and
        Supabase&apos;s managed identity service. We retain audit logs of administrative actions for 90 days.
      </p>

      <h2 style={h2Style}>9. Children</h2>
      <p>
        Gradland is intended for adult users (18 +). We do not knowingly collect information from
        children under 16. If you believe a minor has created an account, contact us and we will
        delete it.
      </p>

      <h2 style={h2Style}>10. Complaints</h2>
      <p>
        If you believe we have breached the Australian Privacy Principles, please first contact us
        at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>.
        If unresolved, you may lodge a complaint with the{' '}
        <a href="https://www.oaic.gov.au/privacy/privacy-complaints" target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>
          Office of the Australian Information Commissioner (OAIC)
        </a>.
      </p>

      <h2 style={h2Style}>11. Changes to this policy</h2>
      <p>
        We may update this policy as the service evolves. Material changes will be announced
        via in-app notice or transactional email at least 14 days before they take effect.
      </p>

      <h2 style={h2Style}>12. Contact</h2>
      <p>
        Questions or requests:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>{' '}
        — or use the form at{' '}
        <Link href="/contact" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>/contact</Link>.
      </p>
    </div>
  );
}
