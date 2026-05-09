import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title:       'Terms of Service — Gradland',
  description: 'Service terms, acceptable-use policy, subscription, refund and dispute resolution rules for the Gradland career platform.',
  alternates:  { canonical: '/terms' },
};

const LAST_UPDATED = '6 May 2026';
const CONTACT_EMAIL = 'admin@gradland.au';

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

export default function TermsPage() {
  return (
    <div style={containerStyle}>
      <h1 style={h1Style}>Terms of Service</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Last updated: {LAST_UPDATED}
      </p>

      <p>
        These Terms govern your use of Gradland (the &quot;<strong>Service</strong>&quot;), operated by
        Henry Tsai as a sole-trader business in Australia. By creating an account, subscribing, or
        using the Service, you agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <h2 style={h2Style}>1. Eligibility</h2>
      <p>
        You must be at least 18 years old and legally able to enter into a contract under
        Australian law. By using the Service you represent that you meet these requirements.
      </p>

      <h2 style={h2Style}>2. Accounts</h2>
      <p>
        You authenticate via GitHub or Google OAuth. You are responsible for the security of your
        OAuth account and for all activity under your Gradland profile. Notify us immediately
        if you suspect unauthorised access.
      </p>

      <h2 style={h2Style}>3. The Service</h2>
      <p>
        Gradland provides career-preparation tooling for international IT graduates targeting
        the Australian job market. Tools include resume analysis, cover-letter generation,
        interview preparation, gap analysis, and aggregated job-listing search.
      </p>
      <p>
        The Service relies on third-party AI providers (Anthropic, OpenAI). AI-generated output is
        provided <strong>&quot;as is&quot;</strong> and may contain errors, omissions, or hallucinated
        facts. <strong>You must independently verify any AI-generated content</strong> before using
        it in a job application or formal communication. We do not guarantee employment outcomes.
      </p>

      <h2 style={h2Style}>4. Subscription &amp; billing</h2>
      <ul>
        <li>The Pro plan is offered as a recurring monthly subscription, billed in advance through Stripe.</li>
        <li>Pricing is displayed at <Link href="/pricing" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>/pricing</Link> and may be updated with at least 14 days&apos; notice via email.</li>
        <li>You can cancel at any time from your dashboard or via the Stripe customer portal. On cancellation, access continues until the end of the current billing period.</li>
        <li>Failed payments may result in suspension of paid features until the issue is resolved.</li>
      </ul>

      <h2 style={h2Style}>5. Refunds (Australian Consumer Law)</h2>
      <p>
        Our goods and services come with consumer guarantees that cannot be excluded under the
        Australian Consumer Law (ACL). You are entitled to a refund or remedy for a major failure
        and to compensation for any reasonably foreseeable loss or damage.
      </p>
      <ul>
        <li><strong>Voluntary refund window:</strong> if you contact us within 7 days of your first paid charge and have used fewer than 25 AI calls, we will refund that charge in full, no questions asked.</li>
        <li><strong>Mid-cycle cancellation:</strong> we do not pro-rate unused days of an active billing period.</li>
        <li><strong>Statutory refund rights:</strong> regardless of the above, your rights under the ACL are not affected.</li>
        <li>Refunds are processed via the original payment method through Stripe and typically appear within 5-10 business days.</li>
      </ul>

      <h2 style={h2Style}>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Reverse-engineer, scrape, or automate access to the Service beyond reasonable manual use.</li>
        <li>Submit content that is unlawful, defamatory, harassing, infringing, or that contains malware.</li>
        <li>Use the Service to generate or distribute spam, phishing material, or fraudulent applications.</li>
        <li>Share your account, transfer your subscription, or resell access.</li>
        <li>Use the Service to apply to jobs in someone else&apos;s name without their authorisation.</li>
        <li>Attempt to bypass rate limits, fair-use caps, or paid-feature gates.</li>
      </ul>

      <h2 style={h2Style}>7. User-generated content</h2>
      <p>
        You retain ownership of content you submit (resumes, cover letters, comments, profile
        text). You grant us a non-exclusive, worldwide licence to store, process, and display that
        content solely to operate the Service for you. We do <strong>not</strong> use your content
        to train AI models.
      </p>
      <p>
        Public-facing content (comments, public profile fields) may be moderated, edited, or removed
        at our discretion if it breaches the acceptable-use rules above.
      </p>

      <h2 style={h2Style}>8. Intellectual property</h2>
      <p>
        The Gradland brand, design, code, and aggregated content (excluding your own
        submissions) are owned by Henry Tsai and protected by Australian and international IP law.
        You receive a personal, non-transferable, non-exclusive licence to use the Service for the
        duration of your account.
      </p>

      <h2 style={h2Style}>9. Third-party links and content</h2>
      <p>
        The Service includes links to third-party job listings, tutorial videos, and company
        websites. We do not control those sites and are not responsible for their content,
        availability, or privacy practices.
      </p>

      <h2 style={h2Style}>10. Termination</h2>
      <p>
        You may close your account at any time from your dashboard. We may suspend or terminate
        accounts that breach these Terms or that pose a security or financial risk. On termination
        you forfeit unused subscription credits except where required by the ACL.
      </p>

      <h2 style={h2Style}>11. Disclaimers</h2>
      <p>
        Gradland is an independent platform and is <strong>not affiliated with, endorsed by, or
        sponsored by</strong> any company, recruiter, university, or government agency referenced
        on the site. Visa-related information is general guidance only and is not a substitute for
        advice from a registered Migration Agent (MARN). Always verify with the Department of Home
        Affairs (immi.gov.au).
      </p>
      <p>
        To the maximum extent permitted by law, the Service is provided &quot;as is&quot; without
        warranty of merchantability, fitness for a particular purpose, or non-infringement.
      </p>

      <h2 style={h2Style}>12. Limitation of liability</h2>
      <p>
        Our liability to you is limited to the greater of (a) the fees you paid in the 3 months
        before the claim arose, or (b) AUD 100. Nothing in these Terms excludes or limits
        liability that cannot be excluded under Australian law (including the ACL).
      </p>

      <h2 style={h2Style}>13. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of New South Wales, Australia. The parties submit to
        the non-exclusive jurisdiction of the courts of that state. Before commencing legal action,
        you agree to attempt good-faith resolution by emailing{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>{' '}
        and giving us 30 days to respond.
      </p>

      <h2 style={h2Style}>14. Changes to these Terms</h2>
      <p>
        We may update these Terms as the Service evolves. Material changes will be announced
        via in-app notice or transactional email at least 14 days before they take effect.
        Continued use after that period constitutes acceptance.
      </p>

      <h2 style={h2Style}>15. Contact</h2>
      <p>
        Questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>{' '}
        — or use the form at{' '}
        <Link href="/contact" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>/contact</Link>.
      </p>
    </div>
  );
}
