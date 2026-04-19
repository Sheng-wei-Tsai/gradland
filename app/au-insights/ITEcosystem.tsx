'use client';
import CompanyLogo from '@/components/CompanyLogo';

const LAYERS = [
  {
    id: 'vendors',
    role: 'Who Builds',
    label: 'Software Vendors',
    color: 'var(--terracotta)',
    bg: '#fef4f0',
    border: '#f5c6b4',
    description: 'Companies that create the software products — SaaS platforms sold to enterprises worldwide.',
    auExamples: ['Atlassian', 'Canva', 'SafetyCulture', 'Rokt', 'Envato'],
    globalAU: ['Workday', 'Salesforce', 'ServiceNow', 'SAP'],
    roles: ['Product Engineer', 'Platform Engineer', 'SRE', 'R&D Engineer'],
    upside: 'Highest ownership, greenfield work, best long-term comp',
    watchOut: 'Most competitive — requires strong portfolio and fundamentals',
    forYou: 'Want to build actual product and see your code in production',
  },
  {
    id: 'integrators',
    label: 'System Integrators',
    role: 'Who Connects',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fcd34d',
    description: 'Companies that wire vendor software into enterprise environments. They don\'t build — they connect.',
    auExamples: ['DATACOM', 'DXC Technology', 'Fujitsu AU'],
    globalAU: ['HPE', 'IBM GTS', 'Capgemini'],
    roles: ['Cloud/Infra Engineer', 'Integration Architect', 'Migration Specialist'],
    upside: 'Broad enterprise architecture exposure; great for cloud / solutions architect path',
    watchOut: 'Can drift into maintenance mode; advancement via certifications + tenure',
    forYou: 'Want AWS/Azure certs, enterprise scale, and a path to cloud architect',
  },
  {
    id: 'consultancies',
    label: 'Consultancies',
    role: 'Who Customises',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#c4b5fd',
    description: 'Companies hired to customise vendor software for clients and run technology transformation programs.',
    auExamples: ['Accenture AU', 'FDM Group', 'Capgemini AU'],
    globalAU: ['Deloitte Digital', 'KPMG Tech', 'PwC Consulting'],
    roles: ['Graduate Analyst', 'Technology Consultant', 'Business Analyst', 'Developer'],
    upside: 'Multiple clients per year; fast commercial awareness; structured grad programs',
    watchOut: 'Billable-hours culture; risk of only knowing how to customise, not build',
    forYou: 'Want variety, client exposure, and a structured grad program on your first job',
  },
  {
    id: 'consumers',
    label: 'End Consumers',
    role: 'Who Buys',
    color: '#374151',
    bg: '#f9fafb',
    border: '#d1d5db',
    description: 'Large non-tech organisations with internal IT teams that buy and operate software from the other layers.',
    auExamples: ['Medibank', 'Commonwealth Bank', 'Woolworths', 'Telstra', 'AGL'],
    globalAU: ['Queensland Government', 'ATO', 'Service NSW', 'Department of Defence'],
    roles: ['Internal Developer', 'DevOps Engineer', 'Business Analyst', 'Data Analyst'],
    upside: 'Stability, work-life balance, visa-friendly; good base while upskilling',
    watchOut: 'IT is a cost centre; long ship cycles; innovation is slow',
    forYou: 'Want stability while building skills or navigating a visa pathway',
  },
];

const ARROW = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '0.2rem 0',
  }}>
    <div style={{
      width: '2px', height: '20px', background: 'var(--parchment)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: '6px solid var(--parchment)',
      }} />
    </div>
  </div>
);

export default function ITEcosystem() {
  return (
    <div style={{ paddingBottom: '4rem' }}>

      <div style={{
        background: '#f0f9ff', border: '1px solid #7dd3fc',
        borderRadius: '10px', padding: '1rem 1.2rem', marginBottom: '1.5rem',
        fontSize: '0.85rem', color: '#0c4a6e', lineHeight: 1.6,
      }}>
        <strong>The money flows upward:</strong> End consumers pay consultancies to implement vendor software through system integrators.
        Each layer takes margin. Vendors (Layer 1) have the highest margins. Consumers (Layer 4) have the most headcount.
        Knowing which layer you work in shapes your entire career trajectory.
      </div>

      {/* Layer stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {LAYERS.map((layer, i) => (
          <div key={layer.id}>
            <div style={{
              background: layer.bg,
              border: `1.5px solid ${layer.border}`,
              borderRadius: '12px',
              padding: '1.2rem 1.4rem',
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, color: layer.color,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  background: 'rgba(255,255,255,0.7)', border: `1px solid ${layer.border}`,
                  padding: '0.15rem 0.6rem', borderRadius: '99px',
                  whiteSpace: 'nowrap',
                }}>
                  Layer {i + 1} — {layer.role}
                </span>
                <span style={{
                  fontFamily: "'Lora', serif", fontWeight: 700,
                  fontSize: '1.05rem', color: layer.color,
                }}>
                  {layer.label}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.9rem', lineHeight: 1.55 }}>
                {layer.description}
              </p>

              {/* Company chips */}
              <div style={{ marginBottom: '0.9rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  AU Companies
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[...layer.auExamples, ...layer.globalAU].map(c => (
                    <span key={c} style={{
                      fontSize: '0.77rem', fontWeight: 600,
                      padding: '0.2rem 0.5rem 0.2rem 0.35rem', borderRadius: '4px',
                      background: 'rgba(255,255,255,0.7)', border: `1px solid ${layer.border}`,
                      color: layer.color,
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    }}>
                      <CompanyLogo name={c} size={16} variant="bare" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Roles */}
              <div style={{ marginBottom: '0.9rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  Typical Roles
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {layer.roles.map(r => (
                    <span key={r} style={{
                      fontSize: '0.77rem', padding: '0.2rem 0.6rem', borderRadius: '4px',
                      background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.08)',
                      color: 'var(--text-secondary)',
                    }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Upside / watchout / for you */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.6rem',
              }}>
                {[
                  { label: '✓ Upside', value: layer.upside },
                  { label: '⚠ Watch out', value: layer.watchOut },
                  { label: '→ Best if you...', value: layer.forYou },
                ].map(fact => (
                  <div key={fact.label} style={{
                    background: 'rgba(255,255,255,0.6)', borderRadius: '6px',
                    padding: '0.5rem 0.7rem',
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: layer.color, marginBottom: '0.2rem' }}>
                      {fact.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {fact.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {i < LAYERS.length - 1 && <ARROW />}
          </div>
        ))}
      </div>

      {/* Decision table */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{
          fontFamily: "'Lora', serif", fontSize: '1.1rem', fontWeight: 700,
          color: 'var(--brown-dark)', marginBottom: '1rem',
        }}>
          Which layer should you target?
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { goal: 'Build real product, high ownership', layer: 'Layer 1 — Vendors' },
            { goal: 'Cloud certifications + infrastructure career', layer: 'Layer 2 — Integrators' },
            { goal: 'Variety, client exposure, fast structured promotion', layer: 'Layer 3 — Consultancies' },
            { goal: 'Stability while on a visa or upskilling', layer: 'Layer 4 — End Consumers' },
          ].map(row => (
            <div key={row.goal} style={{
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              background: 'var(--warm-white)', border: '1px solid var(--parchment)',
              borderRadius: '8px', padding: '0.75rem 1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: 2, minWidth: '160px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {row.goal}
              </div>
              <div style={{
                flex: 1, minWidth: '140px', fontSize: '0.85rem', fontWeight: 600,
                color: 'var(--terracotta)',
              }}>
                → {row.layer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
