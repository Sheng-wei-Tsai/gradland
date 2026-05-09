import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title:       'Contact — Gradland',
  description: 'Get in touch with Gradland about privacy requests, billing questions, partnership enquiries, or general feedback.',
  alternates:  { canonical: '/contact' },
};

const CONTACT_EMAIL = 'admin@gradland.au';

const containerStyle: React.CSSProperties = {
  maxWidth: '680px',
  margin: '0 auto',
  padding: '3rem 1.5rem 5rem',
  color: 'var(--text-primary)',
  lineHeight: 1.7,
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
  fontSize: '1.15rem',
  fontWeight: 700,
  color: 'var(--brown-dark)',
  marginTop: '2rem',
  marginBottom: '0.75rem',
};

export default function ContactPage() {
  return (
    <div style={containerStyle}>
      <h1 style={h1Style}>Contact</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
        Gradland is run as a sole trader in Sydney, Australia. Email is the fastest way to reach us.
      </p>

      <h2 style={h2Style}>Email</h2>
      <p>
        General enquiries, billing, privacy requests, partnership ideas:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--terracotta)', textDecoration: 'underline', fontWeight: 600 }}>
          {CONTACT_EMAIL}
        </a>
      </p>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        Typical response time: within 2 business days. For privacy-related requests under the
        Australian Privacy Act, please use the subject line <em>&quot;Privacy request — &lt;type&gt;&quot;</em>{' '}
        — see our <Link href="/privacy" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>Privacy Policy</Link>.
      </p>

      <h2 style={h2Style}>Send a message</h2>
      <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Prefer a form? Use this and we&apos;ll route it to the same inbox.
      </p>
      <ContactForm />

      <h2 style={h2Style}>Other channels</h2>
      <ul>
        <li>GitHub: <a href="https://github.com/Sheng-wei-Tsai" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>@Sheng-wei-Tsai</a></li>
        <li>LinkedIn: <a href="https://www.linkedin.com/in/sheng-wei-tsai/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>Sheng-Wei Tsai</a></li>
      </ul>

      <h2 style={h2Style}>Postal address</h2>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        Available on request for legal correspondence. Please email first.
      </p>
    </div>
  );
}
