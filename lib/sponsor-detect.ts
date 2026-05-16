/**
 * Heuristic sponsorship detection from a job listing's title + description.
 *
 * Used as a fallback for sources that don't tag accredited-sponsor status
 * (Adzuna, Google Jobs, JSearch, Remotive, Jobicy etc). The scraped_jobs
 * pipeline tags employers from the Home Affairs accredited list — those
 * arrive with `sponsor_signal=true` already and bypass this scan.
 *
 * Conservative: must mention sponsorship affirmatively. "Australian
 * citizen only" / "no visa sponsorship" override to false.
 */

const POSITIVE = [
  /\bvisa\s+sponsor(?:ship)?\b/i,
  /\b(?:482|tss|sid)\s+(?:visa|sponsor)/i,
  /\bsponsor(?:ship)?\s+(?:available|offered|provided)/i,
  /\bwill\s+sponsor\b/i,
  /\baccredited\s+sponsor\b/i,
  /\b(?:482|tss)\s+visa\b/i,
];

const NEGATIVE = [
  /\bno\s+(?:visa\s+)?sponsorship\b/i,
  /\bcannot\s+sponsor\b/i,
  /\bunable\s+to\s+sponsor\b/i,
  /\bdo\s+not\s+(?:offer|provide)\s+sponsorship\b/i,
  /\bmust\s+have\s+(?:full\s+)?(?:australian|au)\s+(?:work\s+)?rights?\b/i,
  /\baustralian\s+citizens?\s+only\b/i,
  /\bcitizens?\s+(?:and|or)\s+permanent\s+residents?\s+only\b/i,
];

export function detectSponsorSignal(text: string | null | undefined): boolean {
  if (!text) return false;
  if (NEGATIVE.some(re => re.test(text))) return false;
  return POSITIVE.some(re => re.test(text));
}
