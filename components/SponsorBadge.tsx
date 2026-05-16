/**
 * SponsorBadge — visa sponsorship indicator on job cards.
 *
 * The job aggregator (`/api/jobs`) sets `sponsor_signal=true` when:
 *  1. The employer is on Home Affairs' accredited 482 sponsor list, OR
 *  2. The job description mentions "visa sponsor", "482", "TSS", or
 *     "sponsorship available" (keyword scan in lib/sponsor-detect.ts)
 *
 * For users on 485 / 482 visas, this is the single most important signal
 * — it answers the question that determines whether to apply at all.
 */

interface Props {
  signal: boolean | undefined;
}

export default function SponsorBadge({ signal }: Props) {
  if (!signal) return null;
  return (
    <span
      title="This employer sponsors visas (482 / TSS) — appears on Home Affairs accredited list or mentions sponsorship in the listing"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25em',
        padding: '0.18rem 0.55rem',
        borderRadius: '99px',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--jade)',
        background: 'rgba(30,122,82,0.08)',
        border: '1px solid rgba(30,122,82,0.3)',
        lineHeight: 1.4,
      }}
    >
      <span aria-hidden="true">✓</span>
      Sponsors visa
    </span>
  );
}
