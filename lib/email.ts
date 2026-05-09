/**
 * Email helpers using Resend.
 * All functions are graceful — if RESEND_API_KEY is unset they log a warning
 * and return without throwing, so the caller's main flow is never interrupted.
 */
import { Resend } from 'resend';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gradland.au';
const FROM    = 'Gradland <noreply@gradland.au>';

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendJobListingConfirmation(opts: {
  to:      string;
  company: string;
  title:   string;
  listingId: string;
}): Promise<void> {
  const resend = getClient();
  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[email] RESEND_API_KEY not set — skipping confirmation email');
    }
    return;
  }

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Your job listing has been received — ${opts.title} at ${opts.company}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #140a05;">Listing received</h2>
        <p>Thanks for posting <strong>${opts.title}</strong> at <strong>${opts.company}</strong> on Gradland.</p>
        <p>Your listing is currently under review. We typically approve listings within 24 hours.
           You'll receive another email once it goes live.</p>
        <p>Your listing will remain active for <strong>30 days</strong> after approval.</p>
        <hr style="border: none; border-top: 1px solid #e8d5a8; margin: 24px 0;" />
        <p style="color: #7a5030; font-size: 13px;">
          Questions? Reply to this email or contact us at
          <a href="mailto:admin@gradland.au">admin@gradland.au</a>.
        </p>
      </div>
    `,
  });
}

export async function sendJobListingApproved(opts: {
  to:        string;
  company:   string;
  title:     string;
  expiresAt: string;
}): Promise<void> {
  const resend = getClient();
  if (!resend) return;

  const expiryDate = new Date(opts.expiresAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Your listing is live — ${opts.title} at ${opts.company}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #140a05;">Your listing is live!</h2>
        <p><strong>${opts.title}</strong> at <strong>${opts.company}</strong> is now visible to candidates on Gradland.</p>
        <p>
          <a href="${APP_URL}/jobs" style="display:inline-block; background:#c0281c; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:600;">
            View on jobs page →
          </a>
        </p>
        <p style="color: #7a5030;">Listing expires: <strong>${expiryDate}</strong></p>
        <hr style="border: none; border-top: 1px solid #e8d5a8; margin: 24px 0;" />
        <p style="color: #7a5030; font-size: 13px;">
          Questions? Contact us at
          <a href="mailto:admin@gradland.au">admin@gradland.au</a>.
        </p>
      </div>
    `,
  });
}

export async function sendJobListingRenewalReminder(opts: {
  to:        string;
  company:   string;
  title:     string;
  expiresAt: string;
}): Promise<void> {
  const resend = getClient();
  if (!resend) return;

  const expiryDate = new Date(opts.expiresAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Your listing expires in 5 days — ${opts.title} at ${opts.company}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #140a05;">Listing expiring soon</h2>
        <p>Your listing <strong>${opts.title}</strong> at <strong>${opts.company}</strong>
           expires on <strong>${expiryDate}</strong>.</p>
        <p>To keep reaching visa-aware IT candidates, post a new listing:</p>
        <p>
          <a href="${APP_URL}/post-a-role" style="display:inline-block; background:#c0281c; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:600;">
            Renew listing — $99 AUD →
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e8d5a8; margin: 24px 0;" />
        <p style="color: #7a5030; font-size: 13px;">
          Questions? Contact us at
          <a href="mailto:admin@gradland.au">admin@gradland.au</a>.
        </p>
      </div>
    `,
  });
}

export async function sendJobListingExpired(opts: {
  to:      string;
  company: string;
  title:   string;
}): Promise<void> {
  const resend = getClient();
  if (!resend) return;

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Your listing has expired — ${opts.title} at ${opts.company}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #140a05;">Listing expired</h2>
        <p>Your listing <strong>${opts.title}</strong> at <strong>${opts.company}</strong>
           has expired and is no longer visible to candidates.</p>
        <p>Post a new listing to continue reaching visa-aware IT graduates in Australia:</p>
        <p>
          <a href="${APP_URL}/post-a-role" style="display:inline-block; background:#c0281c; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:600;">
            Post a new listing →
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e8d5a8; margin: 24px 0;" />
        <p style="color: #7a5030; font-size: 13px;">
          Questions? Contact us at
          <a href="mailto:admin@gradland.au">admin@gradland.au</a>.
        </p>
      </div>
    `,
  });
}
