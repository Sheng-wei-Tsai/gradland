/**
 * Single source of truth for the primary navigation.
 *
 * Owned by Header.tsx (desktop + mobile). Anything else that needs to render
 * a nav-shaped link list (sitemap section, footer, breadcrumbs) imports from
 * here. Don't duplicate these arrays elsewhere — that's what the previous
 * AU_INSIGHTS_DEF / AU_MEGA_DEF split caused.
 *
 * Labels and descriptions are i18n keys, NOT literal strings. They resolve
 * via `useTranslations('nav')` inside components.
 *
 * Order in each array = order on screen.
 */

import type { EIconName } from '@/components/icons/EIcon';

export interface NavItem {
  href:  string;
  tKey:  string;       // translation key for label
  tDesc?: string;      // translation key for description (mega-menu only)
  icon:  EIconName;
  /** Show "New" badge in nav (e.g. for career-edge launch) */
  isNew?: boolean;
  /** Show "Daily" badge */
  isDaily?: boolean;
}

export interface NavSection {
  /** Translation key for the column header */
  tKey:   string;
  items:  NavItem[];
}

/* ── Tools mega-menu ─────────────────────────────────────────────────── */
/* Job-to-be-done labels (verbs), not taxonomy nouns (Resume Analyser) */

export const TOOLS_LAND: NavItem[] = [
  { href: '/resume',         tKey: 'tools_resume',      tDesc: 'tools_resume_desc',      icon: 'resume'        },
  { href: '/cover-letter',   tKey: 'tools_coverLetter', tDesc: 'tools_coverLetter_desc', icon: 'pencil-letter' },
  { href: '/interview-prep', tKey: 'tools_interview',   tDesc: 'tools_interview_desc',   icon: 'target'        },
  { href: '/jobs',           tKey: 'tools_jobs',        tDesc: 'tools_jobs_desc',        icon: 'briefcase'     },
  { href: '/learn',          tKey: 'tools_learn',       tDesc: 'tools_learn_desc',       icon: 'books'         },
];

export const TOOLS_TRACK: NavItem[] = [
  { href: '/dashboard',                tKey: 'tools_dashboard', tDesc: 'tools_dashboard_desc', icon: 'chart'    },
  { href: '/dashboard/visa-tracker',   tKey: 'tools_visa',      tDesc: 'tools_visa_desc',      icon: 'passport' },
  { href: '/au-insights?tab=salary',   tKey: 'tools_salary',    tDesc: 'tools_salary_desc',    icon: 'coin'     },
  { href: '/au-insights?tab=skillmap', tKey: 'tools_skills',    tDesc: 'tools_skills_desc',    icon: 'map'      },
];

export const TOOLS_MENU: { land: NavSection; track: NavSection } = {
  land:  { tKey: 'tools_landRole',     items: TOOLS_LAND  },
  track: { tKey: 'tools_stayOnTrack',  items: TOOLS_TRACK },
};

/* ── Insights mega-menu ──────────────────────────────────────────────── */

export const INSIGHTS_CONTENT: NavItem[] = [
  { href: '/posts/career-edge', tKey: 'insights_careerEdge', tDesc: 'insights_careerEdge_desc', icon: 'target',    isDaily: true },
  { href: '/posts/blog',        tKey: 'insights_blog',       tDesc: 'insights_blog_desc',       icon: 'brush'    },
  { href: '/posts/ai-news',     tKey: 'insights_aiNews',     tDesc: 'insights_aiNews_desc',     icon: 'newspaper' },
  { href: '/digest',            tKey: 'insights_digest',     tDesc: 'insights_digest_desc',     icon: 'newspaper' },
  { href: '/posts/githot',      tKey: 'insights_githot',     tDesc: 'insights_githot_desc',     icon: 'fire'      },
  { href: '/posts',             tKey: 'insights_allPosts',   tDesc: 'insights_allPosts_desc',   icon: 'books'    },
];

export const INSIGHTS_MARKET: NavItem[] = [
  { href: '/au-insights',                  tKey: 'insights_companyTiers', tDesc: 'insights_companyTiers_desc', icon: 'trophy'   },
  { href: '/au-insights?tab=sponsorship',  tKey: 'insights_visaSponsors', tDesc: 'insights_visaSponsors_desc', icon: 'passport' },
  { href: '/au-insights?tab=gradprograms', tKey: 'insights_grads',        tDesc: 'insights_grads_desc',        icon: 'cap'      },
  { href: '/posts/visa-news',              tKey: 'insights_visaNews',     tDesc: 'insights_visaNews_desc',     icon: 'plane'    },
  { href: '/au-insights?tab=ecosystem',    tKey: 'insights_ecosystem',    tDesc: 'insights_ecosystem_desc',    icon: 'chart'    },
];

export const INSIGHTS_MENU: { content: NavSection; market: NavSection } = {
  content: { tKey: 'insights_content', items: INSIGHTS_CONTENT },
  market:  { tKey: 'insights_market',  items: INSIGHTS_MARKET  },
};

/* ── Account / signed-in popover ─────────────────────────────────────── */

export const ACCOUNT_LINKS: NavItem[] = [
  { href: '/dashboard',              tKey: 'user_dashboard',   icon: 'chart'    },
  { href: '/dashboard/visa-tracker', tKey: 'user_visaTracker', icon: 'passport' },
  { href: '/pricing',                tKey: 'user_upgradePro',  icon: 'sparkles' },
  { href: '/about',                  tKey: 'user_about',       icon: 'wave'     },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

export const ALL_TOOLS_HREFS    = [...TOOLS_LAND, ...TOOLS_TRACK].map(i => i.href);
export const ALL_INSIGHTS_HREFS = [...INSIGHTS_CONTENT, ...INSIGHTS_MARKET].map(i => i.href);
