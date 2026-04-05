# Auth & Paywall — Security Hardening + Subscription Gate

## Overview
Secure all AI-powered routes behind authentication and a subscription check.
The platform owner (env `OWNER_EMAIL`) gets unlimited free access.
All other users must hold an active Pro subscription to call any paid AI endpoint.

---

## Access Tiers

| Tier     | Who                          | AI Features | Rate Limit       |
|----------|------------------------------|-------------|------------------|
| `admin`  | `OWNER_EMAIL` (env var)      | All, free   | Unlimited        |
| `pro`    | Paying subscribers           | All         | 100 calls / day  |
| `free`   | Signed-in, not subscribed    | None        | 0                |
| Guest    | Not signed in                | None        | 0                |

---

## Free vs Paid Features

### Always Free (no login required)
- Blog, About, Home
- Job search (read-only)
- `/learn` path listing
- YouTube video list

### Requires Login (free tier)
- Dashboard (save/track applications)
- Job alerts
- Comments

### Requires Pro Subscription
- Cover letter generation (`/api/cover-letter`)
- Resume match (`/api/resume-match`)
- Interview questions, chat, mentor, evaluate (`/api/interview/*`)
- Video study guide + quiz (`/api/learn/analyse`, `/api/learn/quiz`)

---

## Security Model

### Server-Side Only — Never Exposed to Client
- `OWNER_EMAIL` — owner's email (hardcoded in env, never sent to browser)
- `SUPABASE_SERVICE_ROLE_KEY` — used only for subscription writes + usage tracking
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — Stripe server-side keys

### Auth Flow
1. User authenticates via Supabase (GitHub/Google/email — all kept)
2. On every protected API call:
   a. Validate session via `supabase.auth.getUser()` (server-side, not JWT decode)
   b. Check owner email → unlimited access
   c. Check `subscription_tier = 'pro'` + `subscription_expires_at > now()`
   d. If neither → 403 `SUBSCRIPTION_REQUIRED`
3. Rate limit check (for pro users): 100 AI calls / 24h window

### Admin Route Protection
- Next.js `middleware.ts` intercepts `/admin/*` on the server
- Validates session + checks owner email before page renders
- No client-side flash — redirect happens before HTML is sent

---

## Database Changes (Migration 008)

```sql
-- profiles: add subscription fields
subscription_tier        text  default 'free'  -- 'free' | 'pro' | 'admin'
subscription_expires_at  timestamptz           -- null = lifetime
stripe_customer_id       text  unique          -- Stripe customer ref

-- api_usage: rate limit tracking
user_id, endpoint, called_at
```

Trigger prevents users from self-upgrading `subscription_tier` — only service role can update it.

---

## API Routes Changed

| Route | Before | After |
|-------|--------|-------|
| `POST /api/interview/questions` | ❌ No auth | ✅ requireSubscription |
| `POST /api/interview/chat`      | ❌ No auth | ✅ requireSubscription |
| `POST /api/interview/mentor`    | ❌ No auth | ✅ requireSubscription |
| `POST /api/learn/analyse`       | ❌ No auth | ✅ requireSubscription |
| `POST /api/learn/quiz`          | ❌ No auth | ✅ requireSubscription |
| `POST /api/cover-letter`        | ✅ Auth only | ✅ requireSubscription |
| `POST /api/interview/evaluate`  | ✅ Auth only | ✅ requireSubscription |

---

## New Files

```
lib/auth-server.ts          — getServerUser, requireAuth, isOwner
lib/subscription.ts         — requireSubscription, checkRateLimit
middleware.ts               — Next.js edge middleware (admin + auth routes)
app/admin/layout.tsx        — Server-side admin layout (replaces AdminGuard flash)
app/pricing/page.tsx        — Pricing page with Stripe checkout
app/api/stripe/checkout/    — Create Stripe Checkout session
app/api/stripe/webhook/     — Handle payment success / cancellation
app/api/stripe/portal/      — Customer portal (manage / cancel)
supabase/008_subscription.sql
```

---

## Stripe Plan
- Product: "Henry Blog Pro"
- Price: $9.99 USD / month (recurring)
- On `checkout.session.completed`: set `subscription_tier = 'pro'`, set expiry to period end
- On `customer.subscription.deleted`: set `subscription_tier = 'free'`
- On `invoice.payment_failed`: keep access until `subscription_expires_at`

---

## Error Codes Returned by API
```json
{ "error": "Authentication required",   "code": "UNAUTHENTICATED" }   // 401
{ "error": "Subscription required",     "code": "SUBSCRIPTION_REQUIRED" }  // 403
{ "error": "Rate limit exceeded",       "code": "RATE_LIMIT_EXCEEDED" }    // 429
```
Frontend reads `code` to show the right prompt (login modal vs upgrade modal).
