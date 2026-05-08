/**
 * Sends a phone-friendly notification when claude-pr-loop opens a PR.
 *
 * Channels:
 *   - Telegram (TELEGRAM_BOT_TOKEN, TELEGRAM_OWNER_CHAT_ID)
 *   - Resend email (RESEND_API_KEY → henry88002605@gmail.com)
 *   - GitHub mobile push: handled natively by GitHub when the PR is created;
 *     no code path needed here.
 *
 * Each channel fails open: if a secret is missing or an HTTP call fails, we log
 * and continue — never block PR creation on a notification side-effect.
 *
 * Invoked from the workflow as:
 *   tsx scripts/notify-pr-opened.ts <pr-url> <task-id> <risk> <auto-merge> <ci-status>
 */

import { Resend } from 'resend';

const OWNER_EMAIL = 'henry88002605@gmail.com';
const FROM_EMAIL  = 'Gradland <noreply@henrysdigitallife.com>';

interface NotifyArgs {
  prUrl:      string;
  taskId:     string;
  risk:       'low' | 'risky' | 'needs-review';
  autoMerge:  boolean;
  ciStatus:   'green' | 'red' | 'pending';
  title:      string;
  filesCount: number;
  additions:  number;
  deletions:  number;
  planUrl?:   string;
}

function buildSubject(a: NotifyArgs): string {
  const tag = a.autoMerge ? '[auto]' : a.risk === 'needs-review' ? '[review]' : '[risky]';
  return `${tag} ${a.title}`;
}

function buildPlainBody(a: NotifyArgs): string {
  const lines = [
    `[Gradland PR] ${a.title}`,
    '',
    `Auto-merge: ${a.autoMerge ? 'yes' : 'no'}    Risk: ${a.risk}`,
    `Files: ${a.filesCount} changed (+${a.additions}/-${a.deletions})`,
    `CI: ${a.ciStatus}`,
    '',
    `PR:   ${a.prUrl}`,
  ];
  if (a.planUrl) lines.push(`Plan: ${a.planUrl}`);
  return lines.join('\n');
}

function buildHtmlBody(a: NotifyArgs): string {
  const colour = a.ciStatus === 'green' ? '#1e7a52' : a.ciStatus === 'red' ? '#c0281c' : '#c88a14';
  const planLine = a.planUrl
    ? `<p><a href="${a.planUrl}" style="color:#140a05;">View plan</a></p>`
    : '';
  return `
    <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 16px;">
      <h2 style="color:#140a05; font-family: Georgia, serif; margin: 0 0 12px;">${a.title}</h2>
      <table style="border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 4px 12px 4px 0; color:#7a5030;">Auto-merge</td><td><strong>${a.autoMerge ? 'yes' : 'no'}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color:#7a5030;">Risk</td><td><strong>${a.risk}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color:#7a5030;">Files</td><td>${a.filesCount} (+${a.additions}/-${a.deletions})</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color:#7a5030;">CI</td><td style="color:${colour};"><strong>${a.ciStatus}</strong></td></tr>
      </table>
      <p style="margin: 16px 0 8px;">
        <a href="${a.prUrl}" style="background:#c0281c;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;display:inline-block;">Open PR on GitHub</a>
      </p>
      ${planLine}
    </div>
  `;
}

async function notifyTelegram(a: NotifyArgs): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (!token || !chatId) {
    console.warn('[notify] Telegram skipped — TELEGRAM_BOT_TOKEN or TELEGRAM_OWNER_CHAT_ID unset');
    return;
  }
  const text = buildPlainBody(a);
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: false }),
  }).catch(err => {
    console.warn('[notify] Telegram fetch failed:', err);
    return null;
  });
  if (res && !res.ok) {
    console.warn(`[notify] Telegram non-2xx: ${res.status} ${await res.text().catch(() => '')}`);
  }
}

async function notifyEmail(a: NotifyArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[notify] Email skipped — RESEND_API_KEY unset');
    return;
  }
  const resend = new Resend(key);
  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      OWNER_EMAIL,
      subject: buildSubject(a),
      html:    buildHtmlBody(a),
      text:    buildPlainBody(a),
    });
  } catch (err) {
    console.warn('[notify] Email send failed:', err);
  }
}

async function main(): Promise<void> {
  const [prUrl, taskId, risk, autoMergeStr, ciStatus] = process.argv.slice(2);
  if (!prUrl || !taskId) {
    console.error('Usage: tsx notify-pr-opened.ts <pr-url> <task-id> <risk> <auto-merge> <ci-status>');
    process.exit(1);
  }

  const args: NotifyArgs = {
    prUrl,
    taskId,
    risk:       (risk as NotifyArgs['risk'])       ?? 'needs-review',
    autoMerge:  autoMergeStr === 'true',
    ciStatus:   (ciStatus as NotifyArgs['ciStatus']) ?? 'pending',
    title:      process.env.NOTIFY_TITLE        ?? `PR for task ${taskId}`,
    filesCount: parseInt(process.env.NOTIFY_FILES        ?? '0', 10),
    additions:  parseInt(process.env.NOTIFY_ADDITIONS    ?? '0', 10),
    deletions:  parseInt(process.env.NOTIFY_DELETIONS    ?? '0', 10),
    planUrl:    process.env.NOTIFY_PLAN_URL,
  };

  await Promise.allSettled([notifyTelegram(args), notifyEmail(args)]);
  console.log('[notify] done');
}

main().catch(err => {
  console.error('[notify] unexpected error:', err);
  process.exit(0);
});
