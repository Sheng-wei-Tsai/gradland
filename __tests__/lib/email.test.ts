import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.fn().mockResolvedValue({ id: 'mock-email-id' });

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function MockResend() {
    return { emails: { send: mockSend } };
  }),
}));

const {
  sendJobListingConfirmation,
  sendJobListingApproved,
  sendJobListingRenewalReminder,
  sendJobListingExpired,
} = await import('@/lib/email');

const FUTURE_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const XSS_TITLE   = '<script>alert(1)</script>';
const XSS_COMPANY = '<img/src=x onerror=alert(2)>';

describe('lib/email — HTML escaping in transactional email bodies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-resend-key';
  });

  it('sendJobListingConfirmation: escapes title and company in HTML body', async () => {
    await sendJobListingConfirmation({
      to:        'employer@example.com',
      title:     XSS_TITLE,
      company:   XSS_COMPANY,
      listingId: 'abc123',
    });
    const html = (mockSend.mock.calls[0][0] as { html: string }).html;
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img/src=x');
    expect(html).not.toContain('<img/src=x');
  });

  it('sendJobListingApproved: escapes title and company in HTML body', async () => {
    await sendJobListingApproved({
      to:        'employer@example.com',
      title:     XSS_TITLE,
      company:   XSS_COMPANY,
      expiresAt: FUTURE_DATE,
    });
    const html = (mockSend.mock.calls[0][0] as { html: string }).html;
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img/src=x');
    expect(html).not.toContain('<img/src=x');
  });

  it('sendJobListingRenewalReminder: escapes title and company in HTML body', async () => {
    await sendJobListingRenewalReminder({
      to:        'employer@example.com',
      title:     XSS_TITLE,
      company:   XSS_COMPANY,
      expiresAt: FUTURE_DATE,
    });
    const html = (mockSend.mock.calls[0][0] as { html: string }).html;
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img/src=x');
    expect(html).not.toContain('<img/src=x');
  });

  it('sendJobListingExpired: escapes title and company in HTML body', async () => {
    await sendJobListingExpired({
      to:      'employer@example.com',
      title:   XSS_TITLE,
      company: XSS_COMPANY,
    });
    const html = (mockSend.mock.calls[0][0] as { html: string }).html;
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;img/src=x');
    expect(html).not.toContain('<img/src=x');
  });

  it('sendJobListingConfirmation: no-op when RESEND_API_KEY is unset', async () => {
    delete process.env.RESEND_API_KEY;
    await sendJobListingConfirmation({
      to:        'employer@example.com',
      title:     'Software Engineer',
      company:   'Acme Corp',
      listingId: 'abc123',
    });
    expect(mockSend).not.toHaveBeenCalled();
  });
});
