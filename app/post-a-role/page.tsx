import Link from 'next/link';

const BENEFITS = [
  {
    icon: '🎓',
    title: 'Qualified international talent',
    body: 'Our audience is international IT graduates from Australian universities — motivated, degree-qualified, and ready to contribute from day one.',
  },
  {
    icon: '🛂',
    title: 'Visa-aware candidates',
    body: 'Every candidate on TechPath AU understands working rights. Many hold 485 graduate visas or 482 sponsorship-eligible profiles — reducing your screening workload.',
  },
  {
    icon: '💻',
    title: 'Tech-stack filtered',
    body: 'Candidates self-select by role and stack. Your listing lands in front of developers, data engineers, and cloud specialists — not generic job board noise.',
  },
  {
    icon: '📍',
    title: 'Australia-focused, always',
    body: 'No global spray-and-pray. TechPath AU is exclusively for IT roles based in Australia. Your listing reaches people who live here and want to build their career here.',
  },
];

const STEPS = [
  { num: '01', title: 'Send us your role details', body: 'Email your job title, description, requirements, and location. We\'ll format and publish within 24 hours.' },
  { num: '02', title: 'Your listing goes live', body: 'Featured at the top of our Jobs page with a "Hiring" badge. Visible to all visitors — no login required to browse.' },
  { num: '03', title: 'Candidates apply directly', body: 'Applications go straight to your inbox or ATS. No middleman, no per-application fees — just direct access.' },
];

const FAQS = [
  ['Who sees my listing?', 'All TechPath AU visitors — including logged-out users. The Jobs page is public and indexed by search engines. International IT grads and visa holders make up the majority of our returning audience.'],
  ['How long does a listing stay live?', 'Each listing is active for 30 days from the date it goes live. You can renew at the same rate if the role is still open.'],
  ['Can I post multiple roles?', 'Yes — each role is priced separately at $99 AUD per 30 days. Volume pricing is available for 5+ concurrent listings; email us to discuss.'],
  ['What roles are a good fit?', 'Software engineering, data & analytics, cloud/DevOps, cybersecurity, product, and IT consulting. Roles that require Australian working rights or offer 482 sponsorship perform best.'],
  ['How do I get started?', 'Email hello@henrysdigitallife.com with your role details and we will invoice you and get your listing live within 24 hours.'],
];

export default function PostARolePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

      {/* Hero */}
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <p className="font-handwritten" style={{
          fontSize: '1.1rem', color: 'var(--vermilion)',
          marginBottom: '0.75rem',
        }}>
          For employers & recruiters
        </p>
        <h1 style={{
          fontFamily: "'Lora', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 700, color: 'var(--brown-dark)',
          lineHeight: 1.25, marginBottom: '1.25rem',
        }}>
          Hire international IT talent<br />actively job-seeking in Australia
        </h1>
        <p style={{
          fontSize: '1.05rem', color: 'var(--text-secondary)',
          lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 2rem',
        }}>
          TechPath AU is where international IT graduates and visa holders come
          to find jobs, prep for interviews, and build their Australian career.
          Put your role in front of the people who are ready to work.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="mailto:hello@henrysdigitallife.com?subject=Post%20a%20Role%20on%20TechPath%20AU&body=Hi%2C%20I%27d%20like%20to%20post%20a%20role%20on%20TechPath%20AU.%0A%0ARole%20title%3A%20%0ALocation%3A%20%0ADescription%3A%20%0A"
            style={{
              display: 'inline-block',
              padding: '0.8rem 1.75rem',
              background: 'var(--vermilion)',
              color: 'var(--warm-white)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              border: 'var(--panel-border)',
              boxShadow: 'var(--panel-shadow)',
            }}
          >
            Post a role — $99 AUD
          </a>
          <Link
            href="/jobs"
            style={{
              display: 'inline-block',
              padding: '0.8rem 1.75rem',
              background: 'transparent',
              color: 'var(--brown-dark)',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              border: '2px solid var(--parchment)',
            }}
          >
            Browse current listings →
          </Link>
        </div>
      </section>

      {/* Social proof strip */}
      <div style={{
        display: 'flex', gap: '2rem', justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: '4rem',
        padding: '1.5rem', background: 'var(--warm-white)',
        border: '1px solid var(--parchment)', borderRadius: '14px',
      }}>
        {[
          ['$99 AUD', '30-day listing, flat fee'],
          ['24 hrs', 'Live within one business day'],
          ['Direct', 'Applicants contact you directly'],
        ].map(([stat, label]) => (
          <div key={stat} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brown-dark)', marginBottom: '0.1rem' }}>{stat}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{
          fontFamily: "'Lora', serif", fontSize: '1.5rem', fontWeight: 700,
          color: 'var(--brown-dark)', marginBottom: '1.75rem', textAlign: 'center',
        }}>
          Why TechPath AU?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}>
          {BENEFITS.map(({ icon, title, body }) => (
            <div key={title} style={{
              padding: '1.5rem',
              background: 'var(--warm-white)',
              border: '1px solid var(--parchment)',
              borderRadius: '14px',
            }}>
              <p style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{icon}</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brown-dark)', marginBottom: '0.4rem' }}>{title}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{
          fontFamily: "'Lora', serif", fontSize: '1.5rem', fontWeight: 700,
          color: 'var(--brown-dark)', marginBottom: '1.75rem', textAlign: 'center',
        }}>
          How it works
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {STEPS.map(({ num, title, body }) => (
            <div key={num} style={{
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              padding: '1.5rem',
              background: 'var(--warm-white)',
              border: '1px solid var(--parchment)',
              borderRadius: '14px',
            }}>
              <span style={{
                fontFamily: "'Lora', serif",
                fontSize: '1.4rem', fontWeight: 800,
                color: 'var(--vermilion)', flexShrink: 0, lineHeight: 1,
                minWidth: '2rem',
              }}>{num}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brown-dark)', marginBottom: '0.3rem' }}>{title}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing card */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{
          fontFamily: "'Lora', serif", fontSize: '1.5rem', fontWeight: 700,
          color: 'var(--brown-dark)', marginBottom: '1.75rem', textAlign: 'center',
        }}>
          Simple pricing
        </h2>
        <div style={{
          maxWidth: '440px', margin: '0 auto',
          padding: '2rem',
          background: 'var(--warm-white)',
          border: 'var(--panel-border)',
          borderRadius: '16px',
          boxShadow: 'var(--panel-shadow)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--vermilion)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem',
          }}>
            Featured listing
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brown-dark)' }}>$99</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>AUD / 30 days</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            One flat fee. No hidden costs, no per-click charges, no success fees.
            Your listing appears at the top of the Jobs page with a "Hiring" badge.
          </p>
          <ul style={{
            listStyle: 'none', padding: 0, margin: '0 0 1.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.6rem',
            textAlign: 'left',
          }}>
            {[
              'Pinned at top of /jobs for 30 days',
              '"Hiring" badge — stands out from aggregated listings',
              'Direct applications — no middleman',
              'Indexed by search engines',
              'Renew anytime at the same rate',
            ].map(f => (
              <li key={f} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--brown-dark)' }}>
                <span style={{ color: 'var(--jade)', flexShrink: 0 }}>✓</span>{f}
              </li>
            ))}
          </ul>
          <a
            href="mailto:hello@henrysdigitallife.com?subject=Post%20a%20Role%20on%20TechPath%20AU&body=Hi%2C%20I%27d%20like%20to%20post%20a%20role%20on%20TechPath%20AU.%0A%0ARole%20title%3A%20%0ALocation%3A%20%0ADescription%3A%20%0A"
            style={{
              display: 'block',
              padding: '0.8rem',
              background: 'var(--vermilion)',
              color: 'var(--warm-white)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            Get in touch to post your role
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '620px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Lora', serif", fontSize: '1.5rem', fontWeight: 700,
          color: 'var(--brown-dark)', marginBottom: '1.5rem', textAlign: 'center',
        }}>
          Common questions
        </h2>
        {FAQS.map(([q, a]) => (
          <div key={q} style={{ borderBottom: '1px solid var(--parchment)', padding: '1rem 0' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--brown-dark)', marginBottom: '0.4rem' }}>{q}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{a}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
