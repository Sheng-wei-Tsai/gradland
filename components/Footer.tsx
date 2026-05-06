import React from 'react';
import Link from 'next/link';
import EIcon, { EIconName } from '@/components/icons/EIcon';

const COL_TOOLS: { href: string; label: string; icon: EIconName }[] = [
  { href: '/jobs',                      label: 'Job Search',       icon: 'briefcase'    },
  { href: '/dashboard/resume-analyser', label: 'Resume Analyser',  icon: 'resume'       },
  { href: '/interview-prep',            label: 'Interview Prep',   icon: 'target'       },
  { href: '/learn',                     label: 'Learning Paths',   icon: 'books'        },
  { href: '/au-insights',               label: 'AU Insights',      icon: 'map'          },
  { href: '/dashboard',                 label: 'Dashboard',        icon: 'chart'        },
];

const COL_CONTENT: { href: string; label: string; icon: EIconName }[] = [
  { href: '/posts',          label: 'All Posts',   icon: 'brush'        },
  { href: '/posts/research', label: 'AI Digest',   icon: 'robot'        },
  { href: '/posts/githot',   label: 'GitHub Hot',  icon: 'fire'         },
  { href: '/visa-news',      label: 'Visa News',   icon: 'passport'     },
  { href: '/about',          label: 'About',       icon: 'wave'         },
  { href: '/pricing',        label: 'Pricing',     icon: 'card'         },
];

const COL_LEGAL: { href: string; label: string; icon: EIconName }[] = [
  { href: '/contact', label: 'Contact', icon: 'pencil-letter' },
  { href: '/privacy', label: 'Privacy', icon: 'scale'         },
  { href: '/terms',   label: 'Terms',   icon: 'newspaper'     },
  { href: '/cookies', label: 'Cookies', icon: 'tag'           },
];

export default function Footer() {
  return (
    <footer style={{
      marginTop: '6rem',
      borderTop: '1px solid var(--parchment)',
      background: 'var(--warm-white)',
    }}>
      {/* Accent line */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, transparent, var(--vermilion) 20%, var(--gold) 50%, var(--vermilion) 80%, transparent)',
      }} />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem 2rem' }}>

        {/* Brand row */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: '1.15rem', color: 'var(--brown-dark)' }}>
              TechPath AU
            </div>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href="https://github.com/Sheng-wei-Tsai" target="_blank" rel="noopener noreferrer"
                aria-label="GitHub profile" className="footer-icon-link">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/sheng-wei-tsai/" target="_blank" rel="noopener noreferrer"
                aria-label="LinkedIn profile" className="footer-icon-link">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, maxWidth: '44ch' }}>
            Practical tools for international IT grads landing their first job in Australia.
            Built by someone who went through it.
          </p>
        </div>

        {/* Link columns */}
        <div className="footer-link-grid" style={{ marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.8rem' }}>
              Career Tools
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {COL_TOOLS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-nav-link">
                    <EIcon name={l.icon} size={14} style={{ marginRight: '0.4em', opacity: 0.75 }} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.8rem' }}>
              Content
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {COL_CONTENT.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-nav-link">
                    <EIcon name={l.icon} size={14} style={{ marginRight: '0.4em', opacity: 0.75 }} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.8rem' }}>
              Legal
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {COL_LEGAL.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-nav-link">
                    <EIcon name={l.icon} size={14} style={{ marginRight: '0.4em', opacity: 0.75 }} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--parchment)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: '1.05rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35em' }}>
            Made with warmth &amp; curiosity
            <EIcon name="sparkle" size={14} style={{ opacity: 0.6 }} />
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              © {new Date().getFullYear()} Henry Tsai · Next.js · Vercel
            </p>
            <a href="https://logo.dev" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.7, textDecoration: 'none' }}>
              Logos provided by Logo.dev
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
