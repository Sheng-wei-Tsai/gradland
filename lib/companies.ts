export interface Company {
  name: string;
  domain: string;
  simpleIconSlug?: string;
  profileSlug?: string;
  aliases?: string[];
}

export const COMPANIES: Company[] = [
  // ── SSS / God Tier ──────────────────────────────────────────────────────────
  { name: 'Palantir',     domain: 'palantir.com',      simpleIconSlug: 'palantir' },
  { name: 'TGS',          domain: 'tgs.com' },
  { name: 'Radix',        domain: 'radixtrading.com' },
  { name: 'Optiver',      domain: 'optiver.com',       profileSlug: 'optiver' },
  { name: 'IMC Trading',  domain: 'imc.com' },

  // ── S+ / S — Premium Product ─────────────────────────────────────────────
  { name: 'Canva',            domain: 'canva.com',        simpleIconSlug: 'canva',    profileSlug: 'canva' },
  { name: 'Atlassian',        domain: 'atlassian.com',    simpleIconSlug: 'atlassian', profileSlug: 'atlassian' },
  { name: 'Afterpay / Block', domain: 'afterpay.com',     simpleIconSlug: 'afterpay' },
  { name: 'Seek',             domain: 'seek.com.au' },
  { name: 'Rokt',             domain: 'rokt.com' },
  { name: 'SafetyCulture',    domain: 'safetyculture.com', profileSlug: 'safetyCulture' },

  // ── A+ — FAANG-adjacent ──────────────────────────────────────────────────
  { name: 'Google AU',  domain: 'google.com',    simpleIconSlug: 'google',   profileSlug: 'google-au' },
  { name: 'Meta AU',    domain: 'meta.com',      simpleIconSlug: 'meta' },
  { name: 'Apple AU',   domain: 'apple.com',     simpleIconSlug: 'apple' },
  { name: 'AWS',        domain: 'amazonaws.com', profileSlug: 'amazon-aws', aliases: ['Amazon / AWS AU', 'Amazon / AWS'] },
  { name: 'Stripe',     domain: 'stripe.com',    simpleIconSlug: 'stripe' },
  { name: 'Airbnb',     domain: 'airbnb.com',    simpleIconSlug: 'airbnb' },
  { name: 'Uber',       domain: 'uber.com',      simpleIconSlug: 'uber' },

  // ── A — Strong Mid-tier ──────────────────────────────────────────────────
  { name: 'Notion',      domain: 'notion.so',     simpleIconSlug: 'notion' },
  { name: 'Discord',     domain: 'discord.com',   simpleIconSlug: 'discord' },
  { name: 'Figma',       domain: 'figma.com',     simpleIconSlug: 'figma' },
  { name: 'Spotify AU',  domain: 'spotify.com',   simpleIconSlug: 'spotify' },
  { name: 'LinkedIn AU', domain: 'linkedin.com' },
  { name: 'Dropbox',     domain: 'dropbox.com',   simpleIconSlug: 'dropbox' },
  { name: 'Pinterest',   domain: 'pinterest.com', simpleIconSlug: 'pinterest' },

  // ── B+ — Large Tech / Enterprise ─────────────────────────────────────────
  { name: 'Salesforce AU', domain: 'salesforce.com', aliases: ['Salesforce'] },
  { name: 'Adobe AU',      domain: 'adobe.com' },
  { name: 'Cloudflare',    domain: 'cloudflare.com', simpleIconSlug: 'cloudflare' },
  { name: 'GitHub',        domain: 'github.com',     simpleIconSlug: 'github' },
  { name: 'Twilio',        domain: 'twilio.com' },
  { name: 'Oracle AU',     domain: 'oracle.com' },

  // ── B — Traditional Enterprise ───────────────────────────────────────────
  { name: 'IBM AU',        domain: 'ibm.com',       profileSlug: 'ibm-au',          aliases: ['IBM', 'IBM GTS'] },
  { name: 'Accenture',     domain: 'accenture.com', simpleIconSlug: 'accenture',    profileSlug: 'accenture', aliases: ['Accenture AU'] },
  { name: 'Deloitte Tech', domain: 'deloitte.com',  profileSlug: 'deloitte-digital', aliases: ['Deloitte', 'Deloitte Digital', 'Deloitte Digital AU'] },
  { name: 'Booking.com',   domain: 'booking.com',   simpleIconSlug: 'bookingdotcom' },
  { name: 'Morgan Stanley AU', domain: 'morganstanley.com' },
  { name: 'Intel',         domain: 'intel.com',     simpleIconSlug: 'intel' },

  // ── B− — Body Shops & Bank IT ────────────────────────────────────────────
  { name: 'TCS',           domain: 'tcs.com',       simpleIconSlug: 'tcs', profileSlug: 'tcs', aliases: ['TCS AU', 'Tata Consultancy Services (TCS)'] },
  { name: 'HCL',           domain: 'hcltech.com' },
  { name: 'Infosys',       domain: 'infosys.com',   simpleIconSlug: 'infosys' },
  { name: 'Citi AU ops',   domain: 'citi.com' },
  { name: 'Booz Allen AU', domain: 'boozallen.com' },
  { name: 'DXC',           domain: 'dxc.com',       aliases: ['DXC Technology'] },

  // ── AU Banks ─────────────────────────────────────────────────────────────
  { name: 'CBA / CommBank', domain: 'commbank.com.au', profileSlug: 'cba', aliases: ['Commonwealth Bank (CBA)', 'Commonwealth Bank', 'Commonwealth Bank of Australia (CBA)'] },
  { name: 'Westpac',        domain: 'westpac.com.au' },
  { name: 'ANZ Bank',       domain: 'anz.com.au' },
  { name: 'NAB',            domain: 'nab.com.au' },

  // ── IT Services & Consulting ─────────────────────────────────────────────
  { name: 'Wipro',          domain: 'wipro.com',       simpleIconSlug: 'wipro' },
  { name: 'Cognizant',      domain: 'cognizant.com' },
  { name: 'Capgemini',      domain: 'capgemini.com',   aliases: ['Capgemini AU'] },
  { name: 'Datacom',        domain: 'datacom.com',     aliases: ['DATACOM'] },
  { name: 'EY',             domain: 'ey.com' },
  { name: 'KPMG',           domain: 'kpmg.com',        aliases: ['KPMG Tech'] },
  { name: 'PwC',            domain: 'pwc.com',         aliases: ['PwC Consulting'] },
  { name: 'FDM Group',      domain: 'fdmgroup.com' },
  { name: 'WiseTech Global', domain: 'wisetechglobal.com' },

  // ── IT Ecosystem — Software Vendors ─────────────────────────────────────
  { name: 'Envato',      domain: 'envato.com' },
  { name: 'Workday',     domain: 'workday.com',    simpleIconSlug: 'workday' },
  { name: 'ServiceNow',  domain: 'servicenow.com', simpleIconSlug: 'servicenow' },
  { name: 'SAP',         domain: 'sap.com',        simpleIconSlug: 'sap' },
  { name: 'Fujitsu AU',  domain: 'fujitsu.com',    aliases: ['Fujitsu'] },
  { name: 'HPE',         domain: 'hpe.com' },

  // ── End Consumers (non-tech enterprises) ─────────────────────────────────
  { name: 'Medibank',              domain: 'medibank.com.au' },
  { name: 'Woolworths',            domain: 'woolworths.com.au' },
  { name: 'Telstra',               domain: 'telstra.com.au' },
  { name: 'AGL',                   domain: 'agl.com.au' },
  { name: 'Queensland Government', domain: 'qld.gov.au' },
  { name: 'ATO',                   domain: 'ato.gov.au' },
  { name: 'Service NSW',           domain: 'service.nsw.gov.au' },
  { name: 'Department of Defence', domain: 'defence.gov.au' },
];

const _index = new Map<string, Company>(
  COMPANIES.flatMap(c => [
    [c.name, c],
    ...(c.aliases ?? []).map(a => [a, c] as [string, Company]),
  ])
);

export function findCompany(name: string): Company | undefined {
  return _index.get(name);
}
