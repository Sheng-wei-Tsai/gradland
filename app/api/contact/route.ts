import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/rate-limit-db';

const SUPPORT_INBOX = 'admin@gradland.au';
const FROM          = 'Gradland <noreply@gradland.au>';

const VALID_TOPICS = new Set(['general', 'billing', 'privacy', 'bug', 'partnership']);

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (await checkRateLimit('contact:' + ip, 3600, 5)) {
    return NextResponse.json(
      { error: 'Too many messages. Please email admin@gradland.au directly.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const name    = String(body.name    ?? '').slice(0, 80).trim();
  const email   = String(body.email   ?? '').slice(0, 120).trim();
  const topic   = String(body.topic   ?? 'general');
  const message = String(body.message ?? '').slice(0, 4000).trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }
  if (!message || message.length < 10) {
    return NextResponse.json({ error: 'Message is too short.' }, { status: 400 });
  }
  const safeTopic = VALID_TOPICS.has(topic) ? topic : 'general';

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[contact] RESEND_API_KEY unset — logging instead', { ip, email, safeTopic, len: message.length });
    }
    return NextResponse.json({ ok: true, transport: 'none' });
  }

  const resend = new Resend(apiKey);
  const escapedMessage = message
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  try {
    await resend.emails.send({
      from:     FROM,
      to:       SUPPORT_INBOX,
      subject:  `[contact:${safeTopic}] ${name || email}`,
      replyTo:  email,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #140a05; margin-top: 0;">Contact form submission</h2>
          <p style="color: #7a5030; font-size: 13px;">Topic: <strong>${safeTopic}</strong> · IP: ${ip}</p>
          <table style="font-size: 14px; margin: 12px 0;">
            <tr><td style="padding: 4px 12px 4px 0; color:#7a5030;">From</td><td>${name || '(no name)'} &lt;${email}&gt;</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e8d5a8; margin: 16px 0;" />
          <div style="font-size: 14px; line-height: 1.6;">${escapedMessage}</div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[contact] resend send failed', err);
    return NextResponse.json(
      { error: 'Could not send right now. Please email admin@gradland.au.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
