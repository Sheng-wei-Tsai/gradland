/**
 * Australian skilled-migration pathway analyser.
 *
 * Pure deterministic rules engine — no AI calls. Returns eligibility scores
 * for the four mainstream skilled visa subclasses available to ICT graduates:
 *
 *   • 189 — Skilled Independent (points-tested, federal nomination)
 *   • 190 — Skilled Nominated (state nomination + 5 bonus points)
 *   • 491 — Skilled Work Regional (regional nomination + 15 bonus points, leads to 191)
 *   • 482 — Skills in Demand (Core Skills stream, employer-sponsored)
 *   • 186 — Employer Nomination Scheme (Direct Entry / TRT after 2yr on 482)
 *
 * Sources:
 *   - Subclass 189 / 190 / 491 points test (Home Affairs, current as of 2026)
 *     https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-table
 *   - Core Skills Occupation List (CSOL) — replaced MLTSSL/STSOL on 7 Dec 2024
 *     https://immi.homeaffairs.gov.au/visas/working-in-australia/skills-in-demand-visa/core-skills-occupation-list
 *   - 482 SID Core Skills stream (CSIT $76,515 from 7 Jul 2025)
 *   - State nomination occupation lists — refreshed each ~Jul/Sep
 *
 * The data tables below are deliberately small and explicit so review is
 * cheap when annual rule changes land. Update notes in supabase/README.md.
 */

import { CSIT_2025, SSIT_2025 } from './visa-rules';
import type { VisaStatus } from './visa-rules';

// ── INPUT ────────────────────────────────────────────────────────────────

export interface PathwayInput {
  currentVisa:     VisaStatus;
  anzsco:          string;     // 6-digit code, e.g. '261313'
  ageBracket:      AgeBracket;
  experienceYears: number;     // years of skilled work experience in occupation
  englishLevel:    EnglishLevel;
  educationLevel:  EducationLevel;
  salary:          number;     // current/offered AUD base
  state:           StateCode;  // user's target / current state
}

export type AgeBracket    = 'u25' | '25-32' | '33-39' | '40-44' | '45+';
export type EnglishLevel  = 'competent' | 'proficient' | 'superior';
export type EducationLevel = 'doctorate' | 'bachelor-or-master' | 'diploma' | 'aqf-recognised' | 'other';
export type StateCode     = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';

// ── OUTPUT ───────────────────────────────────────────────────────────────

export type PathwayVerdict = 'eligible' | 'eligible-with-nomination' | 'close' | 'blocked';

export interface PathwayResult {
  visa:               '189' | '190' | '491' | '482' | '186';
  visaName:           string;
  verdict:            PathwayVerdict;
  pointsScore:        number | null;     // null when subclass isn't points-tested
  pointsRequired:     number | null;
  missing:            string[];          // what the user still needs
  next:               string;            // single next-action line
  timeToEligibility?: string;            // e.g. "3 years on 482 first"
}

export interface PathwayAnalysis {
  pathways:    PathwayResult[];
  topPick:     PathwayResult;
  summary:     string;
  computedAt:  string;
}

// ── DATA TABLES ──────────────────────────────────────────────────────────

// Subclass 189 / 190 / 491 — minimum points to be invited (post-Nov 2024 trend)
// 189 invitations have run at 65–95 depending on occupation pool.
// 491 / 190 are typically invited above 65 with a much faster decision.
const POINTS_FLOOR_189 = 70;
const POINTS_FLOOR_190 = 65;
const POINTS_FLOOR_491 = 65;

// Core Skills Occupation List (CSOL) — the only ICT codes a graduate is
// likely to actually hold. Update annually per Home Affairs revision.
const CSOL_ICT = new Set([
  '261111', // ICT Business Analyst
  '261112', // Systems Analyst
  '261212', // Web Developer
  '261311', // Analyst Programmer
  '261312', // Developer Programmer
  '261313', // Software Engineer / Developer
  '261314', // Software Tester
  '262111', // Database Administrator
  '262112', // ICT Security Specialist
  '263111', // Computer Network and Systems Engineer
  '263112', // Network Administrator
  '263211', // ICT Quality Assurance Engineer
  '263212', // ICT Support Engineer
  '263213', // ICT Systems Test Engineer
  '263299', // ICT Support and Test Engineers nec
  '135112', // ICT Project Manager
  '135199', // ICT Managers nec
]);

// State nomination availability per occupation (190 + 491 streams).
// Heuristic mapping based on 2025–26 state lists — verify each year.
// For 2-letter occupation prefix `2613xx` we assume software dev family.
const STATE_NOMINATION_BY_PREFIX: Record<string, StateCode[]> = {
  '2611': ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT'],
  '2612': ['NSW', 'VIC', 'QLD', 'TAS', 'ACT'],
  '2613': ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
  '2621': ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT'],
  '2631': ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'],
  '2632': ['NSW', 'VIC', 'QLD', 'TAS'],
  '1351': ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT'],
};

// ── POINTS TEST ──────────────────────────────────────────────────────────

const AGE_POINTS: Record<AgeBracket, number> = {
  'u25':   25,
  '25-32': 30,
  '33-39': 25,
  '40-44': 15,
  '45+':    0,
};

const ENGLISH_POINTS: Record<EnglishLevel, number> = {
  competent:  0,
  proficient: 10,
  superior:   20,
};

const EDUCATION_POINTS: Record<EducationLevel, number> = {
  'doctorate':           20,
  'bachelor-or-master':  15,
  'diploma':             10,
  'aqf-recognised':      10,
  'other':                0,
};

function experiencePoints(years: number): number {
  // Skilled employment outside Australia (overseas) or in Australia
  // We use the AU-employment ladder which is more generous and reflects
  // the typical 485 → 482 pathway journey.
  if (years >= 8) return 20;
  if (years >= 5) return 15;
  if (years >= 3) return 10;
  if (years >= 1) return  5;
  return 0;
}

function salaryBonusPoints(salary: number): number {
  // Not a points-test category but used by 491/186 viability: salaries above
  // CSIT clear sponsor floor; SSIT salaries unlock Specialist Skills stream.
  if (salary >= SSIT_2025) return 10;
  if (salary >= CSIT_2025) return 5;
  return 0;
}

export function calculatePoints(input: PathwayInput): {
  base:       number;
  withState:  number;       // base + 5 (190)
  withRegional: number;     // base + 15 (491)
  breakdown:  Array<{ category: string; points: number }>;
} {
  const breakdown: Array<{ category: string; points: number }> = [];

  const age = AGE_POINTS[input.ageBracket];
  breakdown.push({ category: `Age (${input.ageBracket})`, points: age });

  const eng = ENGLISH_POINTS[input.englishLevel];
  breakdown.push({ category: `English (${input.englishLevel})`, points: eng });

  const edu = EDUCATION_POINTS[input.educationLevel];
  breakdown.push({ category: `Education (${input.educationLevel})`, points: edu });

  const exp = experiencePoints(input.experienceYears);
  breakdown.push({ category: `Skilled experience (${input.experienceYears} yr)`, points: exp });

  const salaryBonus = salaryBonusPoints(input.salary);
  if (salaryBonus > 0) {
    breakdown.push({ category: `Salary above CSIT`, points: salaryBonus });
  }

  const base = age + eng + edu + exp + salaryBonus;
  return {
    base,
    withState:    base + 5,
    withRegional: base + 15,
    breakdown,
  };
}

// ── ELIGIBILITY HELPERS ──────────────────────────────────────────────────

function inCSOL(anzsco: string): boolean {
  return CSOL_ICT.has(anzsco);
}

function statesForAnzsco(anzsco: string): StateCode[] {
  const prefix = anzsco.slice(0, 4);
  return STATE_NOMINATION_BY_PREFIX[prefix] ?? [];
}

function gapMissing(score: number, floor: number): string[] {
  if (score >= floor) return [];
  return [`Need ${floor - score} more points to reach ${floor}-point invitation floor`];
}

// ── PATHWAY ANALYSIS ─────────────────────────────────────────────────────

export function analysePathways(input: PathwayInput): PathwayAnalysis {
  const points = calculatePoints(input);
  const onCSOL = inCSOL(input.anzsco);
  const states = statesForAnzsco(input.anzsco);

  const pathways: PathwayResult[] = [];

  // ── Subclass 189 — Skilled Independent ────────────────────────────
  pathways.push((() => {
    const missing: string[] = [];
    if (!onCSOL) missing.push('Occupation not on Core Skills Occupation List (CSOL)');
    missing.push(...gapMissing(points.base, POINTS_FLOOR_189));

    const verdict: PathwayVerdict =
      !onCSOL                                       ? 'blocked'  :
      points.base >= POINTS_FLOOR_189               ? 'eligible' :
      points.base >= POINTS_FLOOR_189 - 10          ? 'close'    :
                                                       'blocked';

    return {
      visa: '189' as const,
      visaName: 'Skilled Independent (189)',
      verdict,
      pointsScore:    points.base,
      pointsRequired: POINTS_FLOOR_189,
      missing,
      next: verdict === 'eligible'
        ? 'Lodge an Expression of Interest (EOI) on SkillSelect now.'
        : verdict === 'close'
          ? 'Bump English to Proficient or Superior, or accumulate 1+ year skilled experience.'
          : !onCSOL
            ? 'Switch to a CSOL-listed occupation, or pursue 482 / 186 employer-sponsored route.'
            : 'Strengthen English, education or experience — see point breakdown.',
    };
  })());

  // ── Subclass 190 — State Nominated ─────────────────────────────────
  pathways.push((() => {
    const eligibleStates = states.filter(_ => true); // already filtered by ANZSCO
    const stateAvailable = eligibleStates.includes(input.state);
    const missing: string[] = [];
    if (!onCSOL)         missing.push('Occupation not on CSOL');
    if (!stateAvailable) missing.push(`${input.state} does not currently nominate ANZSCO ${input.anzsco}`);
    missing.push(...gapMissing(points.withState, POINTS_FLOOR_190));

    const verdict: PathwayVerdict =
      !onCSOL || !stateAvailable                ? 'blocked'  :
      points.withState >= POINTS_FLOOR_190      ? 'eligible-with-nomination' :
      points.withState >= POINTS_FLOOR_190 - 10 ? 'close'    :
                                                  'blocked';

    return {
      visa: '190' as const,
      visaName: 'Skilled Nominated (190)',
      verdict,
      pointsScore:    points.withState,
      pointsRequired: POINTS_FLOOR_190,
      missing,
      next: verdict === 'eligible-with-nomination'
        ? `Apply to ${input.state} for state nomination — adds 5 pts and unlocks 190.`
        : verdict === 'close'
          ? 'Boost English or work in a regional area to qualify for nomination.'
          : !stateAvailable && eligibleStates.length > 0
            ? `Try ${eligibleStates[0]} which nominates this ANZSCO.`
            : 'No state currently nominates this ANZSCO at points level — prioritise 482 or 491.',
    };
  })());

  // ── Subclass 491 — Skilled Work Regional ──────────────────────────
  pathways.push((() => {
    const eligibleStates = states; // 491 follows same state lists for ICT
    const stateAvailable = eligibleStates.includes(input.state);
    const missing: string[] = [];
    if (!onCSOL)         missing.push('Occupation not on CSOL');
    if (!stateAvailable) missing.push(`${input.state} does not currently nominate ANZSCO ${input.anzsco} for 491`);
    missing.push(...gapMissing(points.withRegional, POINTS_FLOOR_491));

    const verdict: PathwayVerdict =
      !onCSOL || !stateAvailable                  ? 'blocked'  :
      points.withRegional >= POINTS_FLOOR_491     ? 'eligible-with-nomination' :
      points.withRegional >= POINTS_FLOOR_491 - 5 ? 'close'    :
                                                    'blocked';

    return {
      visa: '491' as const,
      visaName: 'Skilled Work Regional (491)',
      verdict,
      pointsScore:    points.withRegional,
      pointsRequired: POINTS_FLOOR_491,
      missing,
      next: verdict === 'eligible-with-nomination'
        ? `Apply to ${input.state} regional area for nomination — 491 adds 15 pts and leads to 191 PR after 3 yr.`
        : 'Move to a regional area willing to nominate, or improve English/experience.',
      timeToEligibility: '491 is provisional — convert to 191 PR after 3 yr regional residence + income test.',
    };
  })());

  // ── Subclass 482 — Skills in Demand (Core Skills) ─────────────────
  pathways.push((() => {
    const missing: string[] = [];
    if (!onCSOL)                       missing.push('Occupation not on CSOL — ineligible for Core Skills 482');
    if (input.salary < CSIT_2025)      missing.push(`Salary A$${input.salary.toLocaleString()} below CSIT A$${CSIT_2025.toLocaleString()}`);
    if (input.experienceYears < 1)     missing.push('Need at least 1 year of relevant skilled experience');

    const blocked = !onCSOL || input.salary < CSIT_2025 || input.experienceYears < 1;
    const close   = !blocked && input.salary < CSIT_2025 * 1.05;

    const verdict: PathwayVerdict = blocked ? 'blocked' : close ? 'close' : 'eligible';

    const stream = input.salary >= SSIT_2025 ? 'Specialist Skills' : 'Core Skills';

    return {
      visa: '482' as const,
      visaName: `Skills in Demand 482 — ${stream}`,
      verdict,
      pointsScore:    null,
      pointsRequired: null,
      missing,
      next: verdict === 'eligible'
        ? `Find an accredited sponsor — push your offer above A$${CSIT_2025.toLocaleString()} (CSIT) and lock in ${stream} stream.`
        : verdict === 'close'
          ? 'Negotiate offer above CSIT to clear the threshold with margin (10% buffer recommended).'
          : !onCSOL
            ? 'Switch to an occupation on CSOL — software developer / engineer codes 261313, 261312, 261311.'
            : 'Resolve the blockers above before approaching a sponsor.',
      timeToEligibility: stream === 'Specialist Skills'
        ? '4-year visa, accelerated processing, 1 yr to 186 ENS Direct Entry.'
        : '4-year visa, 2 yr at sponsor unlocks 186 ENS TRT pathway to PR.',
    };
  })());

  // ── Subclass 186 — Employer Nomination Scheme ─────────────────────
  pathways.push((() => {
    const missing: string[] = [];
    const onTRT = input.currentVisa === 'working' && input.experienceYears >= 2;
    const directEntry = input.experienceYears >= 3 && onCSOL && input.salary >= CSIT_2025;

    if (!onCSOL && !onTRT)               missing.push('Occupation not on CSOL (Direct Entry route)');
    if (input.salary < CSIT_2025)        missing.push(`Salary below CSIT A$${CSIT_2025.toLocaleString()}`);
    if (!directEntry && !onTRT)          missing.push('Need 2 yr at a 482 sponsor (TRT) or 3+ yr experience (Direct Entry)');

    const verdict: PathwayVerdict =
      onTRT || directEntry ? 'eligible' :
      input.experienceYears >= 1 && input.salary >= CSIT_2025 * 0.95 ? 'close' : 'blocked';

    return {
      visa: '186' as const,
      visaName: 'Employer Nomination Scheme (186)',
      verdict,
      pointsScore:    null,
      pointsRequired: null,
      missing,
      next: onTRT
        ? 'TRT pathway: ask your 482 sponsor to nominate you for 186 PR — no points test, no skills assessment if same role.'
        : directEntry
          ? 'Direct Entry: find an employer willing to sponsor 186 directly — 3 yr experience prerequisite met.'
          : input.currentVisa !== 'working'
            ? 'Get onto a 482 first, hit 2 yr with the same sponsor, then transition via TRT — fastest realistic PR for most international grads.'
            : 'Hold position with sponsor until 2 yr TRT eligibility, or build to 3 yr experience for Direct Entry.',
      timeToEligibility: onTRT
        ? 'Eligible now — TRT processes in 6–9 months.'
        : input.currentVisa === 'working'
          ? `${Math.max(0, 2 - input.experienceYears)} yr remaining on current 482 to reach TRT.`
          : 'Typically 3–5 yr from 485 → 482 → 186 TRT.',
    };
  })());

  // ── PICK TOP RESULT ────────────────────────────────────────────────
  // Rank: eligible > eligible-with-nomination > close > blocked
  const RANK: Record<PathwayVerdict, number> = {
    'eligible': 4, 'eligible-with-nomination': 3, 'close': 2, 'blocked': 1,
  };
  const sorted = [...pathways].sort((a, b) => RANK[b.verdict] - RANK[a.verdict]);
  const topPick = sorted[0];

  const summary =
    topPick.verdict === 'eligible'                  ? `You qualify for the ${topPick.visaName} now — that's your fastest path.` :
    topPick.verdict === 'eligible-with-nomination'  ? `${topPick.visaName} is open with state nomination — apply for that nomination first.` :
    topPick.verdict === 'close'                     ? `Closest path is ${topPick.visaName}. Address: ${topPick.missing.slice(0, 2).join('; ')}.` :
                                                      'No subclass open right now — get onto a 482 first via an accredited sponsor.';

  return {
    pathways,
    topPick,
    summary,
    computedAt: new Date().toISOString(),
  };
}
