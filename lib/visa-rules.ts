/**
 * Australian visa salary thresholds for skilled work visas.
 *
 * Sources:
 * - Core Skills Income Threshold (CSIT) — Skills in Demand (SID 482) Core Skills stream
 *   Effective 7 July 2025: A$76,515. Indexed each 1 July.
 *   https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-482
 * - Specialist Skills Income Threshold (SSIT) — SID 482 Specialist Skills stream
 *   Effective 7 July 2025: A$135,000.
 * - Subclass 186 ENS Direct Entry — same income thresholds as 482 (CSIT/SSIT).
 *
 * Replaces legacy TSMIT (Temporary Skilled Migration Income Threshold) which
 * was A$73,150 from 1 July 2024 — now superseded by CSIT.
 *
 * The threshold tells the user: "If your offer is below this, the employer
 * cannot sponsor you on a Core Skills 482, your visa pathway is at risk."
 */

export const CSIT_2025 = 76_515;   // Core Skills Income Threshold (was TSMIT)
export const SSIT_2025 = 135_000;  // Specialist Skills Income Threshold

export const SALARY_THRESHOLD_EDITION = '2025-26 (effective 7 July 2025)';

export type VisaStatus = 'outside' | 'student' | 'graduate' | 'working' | 'resident' | 'unsure';

export type ComplianceVerdict = 'safe' | 'risky' | 'below' | 'na';

export interface SalaryComplianceResult {
  /** Minimum salary required for the user's relevant visa pathway. */
  floor:        number;
  /** Verdict against the floor. `na` when threshold doesn't apply. */
  verdict:      ComplianceVerdict;
  /** Short label for UI ("CSIT 2025–26", "Specialist Skills floor", etc.) */
  floorLabel:   string;
  /** One-sentence explanation tailored to visa status. */
  rationale:    string;
}

/**
 * The salary floor a user needs depending on their current visa.
 * Returns `null` when no skilled-visa floor is relevant (e.g. resident).
 */
export function getVisaSalaryFloor(visa: VisaStatus | null | undefined): number | null {
  if (!visa) return CSIT_2025;
  switch (visa) {
    case 'working':  return CSIT_2025;   // already on 482 — needs ≥ CSIT for renewal/186 transition
    case 'graduate': return CSIT_2025;   // 485 → 482 transition needs CSIT
    case 'student':  return CSIT_2025;   // post-study planning
    case 'outside':  return CSIT_2025;   // overseas applicants need CSIT for sponsorship
    case 'resident': return null;        // PR/citizen — no employer-sponsored floor
    case 'unsure':   return CSIT_2025;   // safe default
    default:         return CSIT_2025;
  }
}

/**
 * Evaluate an offered salary against the relevant visa floor.
 *
 * @param offer  AUD base salary per year
 * @param visa   onboarding_visa_status value
 */
export function checkSalaryCompliance(offer: number, visa: VisaStatus | null | undefined): SalaryComplianceResult {
  const floor = getVisaSalaryFloor(visa);

  if (floor === null) {
    return {
      floor:      0,
      verdict:    'na',
      floorLabel: 'No employer-sponsored floor',
      rationale:  "As an Australian resident or citizen, no visa salary threshold applies — negotiate to market rate.",
    };
  }

  // Use Specialist Skills label when offer comfortably clears SSIT
  if (offer >= SSIT_2025) {
    return {
      floor:      SSIT_2025,
      verdict:    'safe',
      floorLabel: `Specialist Skills floor — A$${SSIT_2025.toLocaleString()}`,
      rationale:  `Your offer clears the Specialist Skills threshold (SSIT ${SALARY_THRESHOLD_EDITION}) — eligible for the higher SID Specialist stream with faster processing.`,
    };
  }

  if (offer >= floor) {
    const buffer = offer - floor;
    return {
      floor,
      verdict:    'safe',
      floorLabel: `Core Skills floor — A$${floor.toLocaleString()}`,
      rationale:  `Your offer clears the Core Skills Income Threshold by A$${buffer.toLocaleString()}. Sponsorship-eligible.`,
    };
  }

  const gap = floor - offer;
  // Within 10% of floor → "risky" (employer might counter, indexation could push above)
  const verdict: ComplianceVerdict = gap <= floor * 0.1 ? 'risky' : 'below';

  return {
    floor,
    verdict,
    floorLabel: `Core Skills floor — A$${floor.toLocaleString()}`,
    rationale:
      verdict === 'risky'
        ? `Your offer is A$${gap.toLocaleString()} below CSIT. Sponsorship blocked at this number — push the base above A$${floor.toLocaleString()} to keep the 482 / 186 pathway open.`
        : `Your offer is A$${gap.toLocaleString()} below CSIT (${SALARY_THRESHOLD_EDITION}). An employer cannot sponsor a Core Skills 482 at this salary — accepting it forfeits the visa pathway.`,
  };
}
