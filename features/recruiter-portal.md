# Feature: B2B Recruiter / Company Job Posting Portal

**Priority:** 🟡 P3 — Revenue
**Status:** 🔲 Not started
**Effort:** Medium (4–5 days)
**Started:** —
**Shipped:** —

---

## Problem

Stripe is implemented for user subscriptions. That covers individual users paying $X/month. But there is a second, higher-margin revenue stream sitting untouched: companies and recruiters who want to reach exactly this audience.

The platform's audience is:
- International IT graduates with AU work rights
- Actively job-seeking, motivated, and skills-building
- Concentrated in Brisbane, Sydney, Melbourne

Recruiters at AU tech companies pay $300–$500 per Seek job posting to reach a generic audience. A targeted posting to "verified international IT grads, actively upskilling" is worth more and has no competition.

Starting at $99 AUD — lower than Seek, higher margin because the audience is pre-qualified.

---

## Goal

A self-serve job posting flow for recruiters and companies:
1. Post a role ($99 AUD, 30-day listing)
2. Role appears at the top of `/jobs` with a "Featured" badge
3. Role also surfaces in the personalised dashboard for matched users
4. Auto-expires after 30 days with a renewal email

This is B2B revenue with no ongoing ops cost — pure Stripe automation.

---

## User Flow (Recruiter)

```
Recruiter lands on /post-a-role
  ↓
Reads: "Reach 500+ international IT graduates actively job-seeking in Australia"
Sees stats: avg monthly active users, top skills, cities
  ↓
Fills out form:
  - Company name + logo upload
  - Job title
  - Role type (Full-time / Contract / Graduate program)
  - Location (Sydney / Melbourne / Brisbane / Remote / Hybrid)
  - Description (rich text, 2000 chars max)
  - Salary range (optional)
  - Application URL
  - Contact email (for admin to reach them)
  ↓
Clicks "Post for $99 AUD →"
  ↓
Stripe Checkout (payment_intent + metadata)
  ↓
On success: webhook fires → listing created in DB with expires_at = now + 30 days
Confirmation email sent via Resend
  ↓
Listing appears in admin queue for approval (default: auto-approve for now)
  ↓
Appears on /jobs with "Featured" badge for 30 days
  ↓
Day 25: renewal email sent ("Your listing expires in 5 days — renew for $99")
Day 30: listing auto-expires, removed from /jobs
```

---

## Landing Page (`/post-a-role`)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Hire international IT talent in Australia                 │
│                                                            │
│  Our readers are:                                          │
│  • International IT graduates with Australian work rights  │
│  • Actively job-seeking and skills-building daily          │
│  • Based in Sydney, Melbourne, and Brisbane                │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  500+    │  │  82%     │  │  3.2×    │  │  $99     │  │
│  │ monthly  │  │ have     │  │ more     │  │  per     │  │
│  │  readers │  │ AU work  │  │ engaged  │  │ listing  │  │
│  │          │  │ rights   │  │ than Seek│  │ 30 days  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Post a role — $99 AUD for 30 days                   │  │
│  │                                                      │  │
│  │  Company name: [________________________]            │  │
│  │  Job title:    [________________________]            │  │
│  │  Location:     [Sydney ▼]                            │  │
│  │  Type:         [Full-time ▼]                         │  │
│  │  Description:  [                        ]            │  │
│  │  Apply URL:    [________________________]            │  │
│  │  Salary:       [________________________] (optional) │  │
│  │                                                      │  │
│  │  [Post for $99 AUD →]                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Questions? hello@henrysdigitallife.com                    │
└────────────────────────────────────────────────────────────┘
```

---

## Job Listings on `/jobs`

Featured listings appear pinned above organic JSearch results:

```
Featured                                    [badge: orange border]
──────────────────────────────────────────────────────────────────
🏢 Canva  |  Data Engineer  |  Sydney  |  $90k–$110k  |  Full-time
Apply at: canva.com/careers/[role]        [Apply now →]  [Save ♡]
──────────────────────────────────────────────────────────────────
Sponsored · Posted 3 days ago · Expires in 27 days
```

Max 3 featured listings shown at once to avoid overwhelming organic results.

---

## Database

```sql
CREATE TABLE IF NOT EXISTS job_listings (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company     text NOT NULL,
  logo_url    text,
  title       text NOT NULL,
  location    text NOT NULL,
  job_type    text NOT NULL,          -- 'full-time' | 'contract' | 'graduate'
  description text NOT NULL,
  apply_url   text NOT NULL,
  salary      text,
  contact_email text NOT NULL,
  status      text DEFAULT 'pending', -- 'pending' | 'active' | 'expired'
  stripe_session_id text,
  posted_at   timestamptz DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- No RLS needed — no user-owned data, admin manages via service role
CREATE INDEX IF NOT EXISTS job_listings_status_idx ON job_listings (status, expires_at);
```

---

## Stripe Integration

New price in Stripe dashboard: `price_job_listing_99aud` — one-time payment, $99 AUD.

```typescript
// POST /api/stripe/job-listing
// Creates a Stripe Checkout session for a job posting

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  currency: 'aud',
  line_items: [{
    price: process.env.STRIPE_JOB_LISTING_PRICE_ID,
    quantity: 1,
  }],
  metadata: {
    type:         'job_listing',
    company:      body.company,
    title:        body.title,
    location:     body.location,
    jobType:      body.jobType,
    description:  body.description.slice(0, 500),
    applyUrl:     body.applyUrl,
    salary:       body.salary ?? '',
    contactEmail: body.contactEmail,
  },
  success_url: `${BASE_URL}/post-a-role/success`,
  cancel_url:  `${BASE_URL}/post-a-role`,
});
```

Webhook (`checkout.session.completed`) inserts the job listing:

```typescript
if (session.metadata?.type === 'job_listing') {
  await sb.from('job_listings').insert({
    company:       session.metadata.company,
    title:         session.metadata.title,
    // ... all metadata fields
    status:        'active',
    expires_at:    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    stripe_session_id: session.id,
  });
  // Send confirmation email via Resend
}
```

---

## Renewal Emails (Resend)

Vercel Cron job runs daily at 9am AEST:

```typescript
// app/api/cron/job-listings/route.ts
// Runs daily: check for listings expiring in 5 days → send renewal email

const expiringSoon = await sb
  .from('job_listings')
  .select('*')
  .eq('status', 'active')
  .gte('expires_at', new Date(Date.now() + 4 * 86400000).toISOString())
  .lte('expires_at', new Date(Date.now() + 5 * 86400000).toISOString());

for (const listing of expiringSoon.data ?? []) {
  await resend.emails.send({
    to:      listing.contact_email,
    subject: `Your "${listing.title}" listing expires in 5 days`,
    html:    renewalEmailTemplate(listing),
  });
}
```

---

## Admin Panel Integration

New section in `/admin` — "Job Listings":
- Table: company, title, status, posted_at, expires_at, payment
- Actions: approve (pending → active), reject, extend by 30 days
- Auto-approve toggle (on by default for trusted domains)

---

## Files

| File | Change |
|------|--------|
| `app/post-a-role/page.tsx` | Create — recruiter landing + form |
| `app/post-a-role/success/page.tsx` | Create — post-payment confirmation |
| `app/api/stripe/job-listing/route.ts` | Create — create Checkout session |
| `app/api/stripe/webhook/route.ts` | Modify — handle `job_listing` metadata |
| `app/api/cron/job-listings/route.ts` | Create — daily expiry + renewal emails |
| `app/jobs/page.tsx` | Modify — show featured listings above organic results |
| `app/admin/page.tsx` | Modify — link to job listings management |
| `app/admin/job-listings/page.tsx` | Create — admin table + approve/reject |
| `supabase/015_job_listings.sql` | Create — table |
| `vercel.json` | Create/modify — cron job definition |

---

## Acceptance Criteria

- [ ] `/post-a-role` page loads and is mobile-friendly
- [ ] Stripe Checkout completes successfully in test mode
- [ ] Webhook creates listing in DB with `expires_at = now + 30 days`
- [ ] Featured listing appears on `/jobs` with "Featured" badge
- [ ] Max 3 featured listings shown at once
- [ ] Expired listings are hidden from `/jobs` (filtered by status + expires_at)
- [ ] Admin can approve/reject pending listings
- [ ] Renewal email sends 5 days before expiry (tested with Resend test mode)
- [ ] `npm run build` passes
