# Feature: Anonymous Job Seeker Network

**Priority:** 🟡 P4 — Moat / Differentiation
**Status:** 🔲 Not started
**Effort:** Extra Large (2–4 weeks)
**Started:** —
**Shipped:** —

---

## Problem

International IT graduates in Australia are isolated. They don't know each other. They don't know who else is looking for a data engineer role in Brisbane with a 485 graduate visa. LinkedIn shows a generic feed, not "people in your exact situation."

The referral channel is the most effective job-finding method in Australian IT. Companies like Atlassian, Canva, and REA fill 40–60% of roles internally before listing on Seek. An international grad with no local network has no access to this channel.

This is the defensive moat. An AI aggregator can copy every other feature. It cannot replicate a real community of people who trust and help each other.

---

## Goal

An opt-in, pseudonymous network where international IT job seekers can:
1. See who else is looking, in their city, for their role — without exposing their identity
2. Connect directly with people who got hired at their target company
3. Request or offer referrals through a trusted, moderated channel

---

## Core Principle: Privacy-First

No real names, no LinkedIn URLs, no profile photos. Users choose a pseudonym (can be their first name or a handle). The following is shown:
- Role seeking (e.g. "Data Engineer")
- Visa type (student / graduate / permanent resident)
- Skills (from their learning path progress)
- City
- Months actively looking
- 1 sentence bio (optional)

The following is **never shown publicly:**
- Full name
- Email
- Resume
- Employer name
- Which companies they've applied to

---

## Network Page (`/network`)

### Default view — "Who's looking near you"

```
┌──────────────────────────────────────────────────────────────────┐
│  The AU IT Job Seeker Network                                    │
│  Connect with people in your exact situation.                    │
│  [Join the network →]  (if not yet opted in)                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Filters: [City ▼]  [Role ▼]  [Visa ▼]                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Jay S.    •    Brisbane    •    485 Graduate Visa         │  │
│  │  Seeking: Data Engineer                                    │  │
│  │  Skills:  Python, SQL, Airflow, dbt  (from learning path)  │  │
│  │  Looking: 3 months                                         │  │
│  │  "Open to referrals at companies using dbt/Databricks"    │  │
│  │                          [Connect →]  [Request referral →] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Mei L.    •    Sydney    •    Student Visa (500)          │  │
│  │  Seeking: Frontend Developer                               │  │
│  │  Skills:  React, TypeScript, CSS  (8 topics mastered)      │  │
│  │  Looking: 6 weeks                                          │  │
│  │                          [Connect →]                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Showing 24 active seekers in Brisbane                          │
└──────────────────────────────────────────────────────────────────┘
```

### Referral board tab — "I can refer you"

People who are already employed (opted in to "I got hired") can post:

```
┌────────────────────────────────────────────────────────────┐
│  Alex P.   •   Data Engineer at REA Group   •   Melbourne  │
│                                                            │
│  "Happy to refer strong candidates for DE roles.           │
│  We're actively hiring junior data engineers with          │
│  Python + SQL. Message me if you have a solid project."    │
│                                                            │
│  Looking for: Python, SQL, dbt, cloud (AWS/GCP)           │
│                              [Send message →]              │
└────────────────────────────────────────────────────────────┘
```

This tab is the most valuable feature in the network. A single "I can refer you" post from an Atlassian engineer could help 50 candidates skip the application queue.

---

## Anti-Spam & Safety

This is the hardest part of any community feature. Measures:

1. **Account verification required** — must have completed at least 1 skill topic or 1 interview session (proves it's a real user, not a bot account)
2. **Message rate limit** — max 5 messages/day to new connections
3. **Block + report** — one-click, reviewed within 24h
4. **No external links in first message** — prevents phishing
5. **Admin moderation queue** — flagged messages reviewed before delivery
6. **Recruiter accounts banned** — network is for job seekers only, not a back-channel for recruiters to spam. Recruiters use `/post-a-role`.

---

## Direct Messaging

Pseudonymous, asynchronous. Not real-time (no WebSocket needed).

```
User A sends a connection request + message to User B
  ↓
User B gets an email notification: "Someone in the network wants to connect"
  (no sender name in email — must log in to see)
  ↓
User B accepts or declines in-app
  ↓
Thread is open — both can message, 5,000 char limit per message
  ↓
Email notification on new message (max 1 email/hour to prevent spam)
```

No read receipts. No typing indicators. Intentionally async.

---

## "I Got Hired" Feature

When a user marks themselves as hired (from the dashboard or visa tracker):
1. Prompted: "Want to help others by joining the referral network?"
2. If yes: their card appears in the "I can refer you" tab
3. They can specify which company, what skills they look for, and a short message
4. Stays active for 6 months (then prompts them to renew or remove)

This is the viral loop: the more people get hired through the platform, the more referrers appear, the more valuable the network becomes.

---

## Database

```sql
CREATE TABLE IF NOT EXISTS network_profiles (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users NOT NULL UNIQUE,
  handle       text NOT NULL,               -- pseudonym, e.g. "Jay S."
  role_seeking text,
  visa_status  text,
  city         text,
  bio          text,                        -- 280 chars max
  is_hired     boolean DEFAULT false,
  hired_company text,                       -- only if is_hired
  hired_skills  text[],                     -- skills they look for in referrals
  hired_message text,
  opted_in      boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE network_profiles ENABLE ROW LEVEL SECURITY;
-- Public: read opted-in profiles (no PII)
CREATE POLICY "Public read opted-in profiles" ON network_profiles
  FOR SELECT USING (opted_in = true);
-- Own: full access
CREATE POLICY "Own profile" ON network_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS network_messages (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id     uuid REFERENCES auth.users NOT NULL,
  recipient_id  uuid REFERENCES auth.users NOT NULL,
  body          text NOT NULL CHECK (length(body) <= 5000),
  read          boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE network_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can read messages" ON network_messages
  FOR SELECT USING (auth.uid() IN (sender_id, recipient_id));
CREATE POLICY "Sender can insert" ON network_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

---

## Skills Auto-Population

When a user joins the network, their skills are auto-populated from `skill_progress`:

```typescript
const masteredSkills = await sb
  .from('skill_progress')
  .select('skill_id')
  .eq('user_id', userId)
  .gte('review_count', 2)
  .limit(8);

// Map skill IDs to readable names from SKILL_PATHS
```

Users can edit before publishing. This makes onboarding to the network instant — no "add your skills" form.

---

## Files

| File | Change |
|------|--------|
| `app/network/page.tsx` | Create — main network page, tabs, filters |
| `app/network/messages/page.tsx` | Create — inbox + thread view |
| `app/api/network/profile/route.ts` | Create — opt-in / update profile |
| `app/api/network/messages/route.ts` | Create — send / list messages |
| `supabase/016_community_network.sql` | Create — network_profiles, network_messages |
| `app/dashboard/page.tsx` | Modify — "You got hired? Help others →" CTA |
| `components/Header.tsx` | Modify — "Network" link in nav (after nav redesign) |

---

## Acceptance Criteria

- [ ] User can opt-in to the network (pseudonym, role, city, visa status)
- [ ] Network page shows all opted-in seekers, filterable by role + city + visa
- [ ] Skills auto-populated from skill_progress (editable)
- [ ] Direct messages work (send, receive, email notification)
- [ ] No real names or email visible to other users
- [ ] Referral board shows "I got hired" profiles
- [ ] Anti-spam: max 5 messages/day to new connections
- [ ] Block + report works
- [ ] Admin moderation queue for flagged messages
- [ ] `npm run build` passes
