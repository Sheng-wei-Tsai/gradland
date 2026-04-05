# Feature: Auth Expansion + Comments + Admin Panel

**Priority:** 🔴 High (Google/Facebook OAuth, comments) · 🟡 Medium (admin panel)
**Status:** 🔲 Not started
**Branch:** `feature/auth-comments-admin` (create when starting)
**Started:** —
**Shipped:** —

---

## Context — What Already Exists

Do NOT rebuild what is already there:

| What | Where | Status |
|------|-------|--------|
| Supabase Auth + session management | `components/AuthProvider.tsx` | ✅ Done |
| GitHub OAuth (`signInWithGithub`) | `AuthProvider.tsx:49` | ✅ Done |
| Email/password sign-in + register | `app/login/page.tsx` | ✅ Done |
| Auth callback route | `app/auth/callback/` | ✅ Done |
| `profiles` table (id, email, full_name, avatar_url) | `supabase/schema.sql:7` | ✅ Done |
| Auto-create profile trigger on signup | `supabase/schema.sql:15` | ✅ Done |

**What is missing:** Google OAuth, Facebook OAuth, `role` column on profiles, comments table + UI, admin panel.

---

## Goal

1. Let users sign in with Google and Facebook in addition to GitHub + email.
2. Let any signed-in user comment on every blog post, edit their own comments, and delete them.
3. Give Henry (admin) a private panel to manage users, moderate all comments, and view site stats.

---

## Acceptance Criteria

### Part 1 — Google + Facebook OAuth

- [ ] "Continue with Google" button appears on `/login` above the divider, styled consistently
- [ ] "Continue with Facebook" button appears on `/login`, styled consistently
- [ ] `AuthProvider.tsx` exports `signInWithGoogle()` and `signInWithFacebook()`
- [ ] Both use Supabase OAuth (`supabase.auth.signInWithOAuth`) with `redirectTo: /auth/callback`
- [ ] Redirect after login goes to `/dashboard` (same as GitHub)
- [ ] `profiles` auto-create trigger correctly captures `full_name` and `avatar_url` from Google/Facebook metadata
- [ ] Login page shows all 3 social buttons + email/password — no redundancy
- [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` documented in `.env.example` (set in Supabase Dashboard, NOT in `.env.local`)

### Part 2 — Comments on Blog Posts

#### Database

- [ ] `post_comments` table created via new migration `supabase/005_comments.sql`:
  ```sql
  create table public.post_comments (
    id          uuid default gen_random_uuid() primary key,
    post_slug   text not null,
    user_id     uuid references public.profiles(id) on delete cascade not null,
    content     text not null,
    parent_id   uuid references public.post_comments(id) on delete cascade,
    edited_at   timestamptz,
    created_at  timestamptz default now()
  );
  -- Indexes
  create index on public.post_comments (post_slug, created_at);
  create index on public.post_comments (parent_id);
  -- RLS
  alter table public.post_comments enable row level security;
  create policy "Public read"    on public.post_comments for select using (true);
  create policy "Auth insert"    on public.post_comments for insert with check (auth.uid() = user_id);
  create policy "Own edit"       on public.post_comments for update using (auth.uid() = user_id);
  create policy "Own delete"     on public.post_comments for delete using (auth.uid() = user_id);
  -- Admin can delete any comment (requires role check — see Part 3)
  ```
- [ ] `profiles` table gets `role` column: `alter table public.profiles add column if not exists role text not null default 'user'`
- [ ] Admin user (Henry) is set manually in Supabase: `update profiles set role = 'admin' where email = 'henrytsaiqut@gmail.com'`

#### API — `app/api/comments/route.ts`

- [ ] `GET /api/comments?slug=<slug>` — returns all comments for a post, joined with `profiles.full_name` and `profiles.avatar_url`, ordered by `created_at` ASC. No auth required.
- [ ] `POST /api/comments` — creates a new comment. Requires auth session. Body: `{ post_slug, content, parent_id? }`. Validates: `content` not empty, max 2000 chars, `post_slug` alphanumeric + hyphens only (prevent injection). Returns created comment.
- [ ] `PATCH /api/comments/[id]` — edits own comment content. Requires auth. Sets `edited_at = now()`. Only the comment owner can edit (enforced both in API and by RLS). Body: `{ content }`.
- [ ] `DELETE /api/comments/[id]` — deletes own comment or any comment if role = admin. Requires auth. Soft-delete is NOT used — hard delete is fine (replies are cascade-deleted).

#### Component — `components/Comments.tsx`

- [ ] Exported as a **client component** (`'use client'`)
- [ ] Props: `{ slug: string }`
- [ ] Fetches comments from `GET /api/comments?slug=slug` on mount
- [ ] Shows comment count in section header: "3 comments" (or "Be the first to comment" if empty)
- [ ] Each comment card shows:
  - Avatar (from `profiles.avatar_url`) or fallback initial circle
  - Display name (`profiles.full_name`)
  - Relative timestamp using `date-fns formatDistanceToNow` (e.g. "2 hours ago") with `edited_at` shown as "(edited)" if present
  - Comment text (rendered as plain text — NOT markdown — to prevent XSS)
  - "Reply" button (authenticated users only) — opens inline reply textarea
  - "Edit" + "Delete" buttons (own comments only), "Delete" button (admin only, on any comment)
- [ ] Threaded replies: replies are indented 24px under parent, max 1 level deep (no infinite nesting)
- [ ] **Add comment form** at the top of the section:
  - Shown only to authenticated users
  - Unauthenticated users see: "Sign in to join the conversation →" linking to `/login`
  - Textarea with 140-char minimum visible (resize: vertical), placeholder "Share your thoughts…"
  - Submit button: "Post comment" — disabled while empty or submitting
  - Optimistic UI: comment appears immediately, removed on error
- [ ] **Edit mode**: clicking "Edit" on own comment replaces the text with an editable textarea pre-filled with current content. "Save" and "Cancel" buttons. Sends `PATCH /api/comments/[id]`. Updates in-place on success.
- [ ] **Delete confirmation**: clicking "Delete" shows inline "Are you sure? [Yes, delete] [Cancel]" — no modal.
- [ ] Error states: if fetch fails, show "Comments couldn't be loaded" (not raw error). If post fails, show inline red message under the form.
- [ ] Loading state: show 2 skeleton comment cards while fetching (grey animated bars, same width as real comments)
- [ ] Comment count updates reactively after add/delete without page reload

#### Integration into Blog Posts

- [ ] `app/blog/[slug]/page.tsx` — import and render `<Comments slug={params.slug} />` below the post content, separated by a `<hr>` styled consistently with the blog
- [ ] `app/blog/[slug]/page.tsx` is a server component — `Comments` is a client component imported with `dynamic(..., { ssr: false })` to avoid hydration mismatch

### Part 3 — Admin Panel

#### Access Control

- [ ] `middleware.ts` (create at project root) — redirects `/admin/*` requests to `/login?next=/admin` if no Supabase session cookie exists
- [ ] All `/admin/*` server components additionally check `profiles.role === 'admin'` via a server-side Supabase client; return 404 if not admin (do not expose the existence of admin routes to non-admins)
- [ ] `components/AdminGuard.tsx` — client-side guard for admin client components; reads user from `useAuth()`, checks role from `profiles`; redirects to 404 if not admin

#### Admin Panel Pages

##### `/admin` — Dashboard

- [ ] Accessible only to admin
- [ ] Shows live stats cards:
  - Total registered users
  - Total comments (all posts)
  - Total saved jobs (all users)
  - Total cover letters generated (all users)
- [ ] Recent activity feed: last 10 comments (user name, post slug, snippet, timestamp)
- [ ] Quick links: "Manage Users →", "Moderate Comments →"

##### `/admin/users` — User Management

- [ ] Table of all users: avatar, name, email, role, joined date, last seen (from `auth.users.last_sign_in_at` — server-side only, never expose to client)
- [ ] Search/filter by name or email (client-side)
- [ ] Toggle role button: "Make Admin" / "Revoke Admin" — calls `PATCH /api/admin/users/[id]`
- [ ] Cannot revoke own admin role (button disabled for own row with tooltip "Can't revoke yourself")

##### `/admin/comments` — Comment Moderation

- [ ] Table of all comments: post slug (links to post), user, snippet, created at, action
- [ ] Filter by post slug (dropdown populated from distinct slugs in `post_comments`)
- [ ] "Delete" button on each row — calls `DELETE /api/comments/[id]` — removes immediately with optimistic update
- [ ] Bulk delete: checkbox per row + "Delete selected" button
- [ ] Shows reply thread indicator if comment has children

#### Admin API Routes

- [ ] `GET /api/admin/stats` — returns user count, comment count, saved_jobs count, cover_letters count. Requires admin role server-side.
- [ ] `PATCH /api/admin/users/[id]` — sets `role` to `admin` or `user`. Requires admin role. Validates target user exists. Cannot target self.
- [ ] All `/api/admin/*` routes verify `profiles.role === 'admin'` via server-side Supabase client using `cookies()` — return 403 otherwise.

---

## Database Migration File

File: `supabase/005_comments.sql`

```sql
-- Add role to profiles
alter table public.profiles
  add column if not exists role text not null default 'user';

-- Comments table
create table if not exists public.post_comments (
  id          uuid default gen_random_uuid() primary key,
  post_slug   text not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  content     text not null check (char_length(content) between 1 and 2000),
  parent_id   uuid references public.post_comments(id) on delete cascade,
  edited_at   timestamptz,
  created_at  timestamptz default now()
);

create index if not exists post_comments_slug_idx   on public.post_comments (post_slug, created_at);
create index if not exists post_comments_parent_idx on public.post_comments (parent_id);

alter table public.post_comments enable row level security;

create policy "Public can read comments"
  on public.post_comments for select using (true);

create policy "Authenticated users can post"
  on public.post_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can edit own comments"
  on public.post_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.post_comments for delete
  using (auth.uid() = user_id);

-- Admin bypass: service role key bypasses RLS entirely (used in admin API routes)
-- Set your own admin email:
-- update public.profiles set role = 'admin' where email = 'henrytsaiqut@gmail.com';
```

---

## Affected Files

| File | Action | Notes |
|------|--------|-------|
| `components/AuthProvider.tsx` | Modify | Add `signInWithGoogle`, `signInWithFacebook` |
| `app/login/page.tsx` | Modify | Add Google + Facebook buttons |
| `app/api/comments/route.ts` | Create | GET + POST |
| `app/api/comments/[id]/route.ts` | Create | PATCH + DELETE |
| `app/api/admin/stats/route.ts` | Create | Admin stats |
| `app/api/admin/users/[id]/route.ts` | Create | Toggle role |
| `components/Comments.tsx` | Create | Full comment UI |
| `app/blog/[slug]/page.tsx` | Modify | Add `<Comments>` below post |
| `app/admin/page.tsx` | Create | Admin dashboard |
| `app/admin/users/page.tsx` | Create | User management |
| `app/admin/comments/page.tsx` | Create | Comment moderation |
| `components/AdminGuard.tsx` | Create | Client-side admin check |
| `middleware.ts` | Create | Protect `/admin/*` routes |
| `supabase/005_comments.sql` | Create | Migration — role + comments |

---

## Supabase Dashboard Setup (Manual Steps)

These are done once in the Supabase Dashboard — not in code.

### Enable Google OAuth
1. Supabase Dashboard → Authentication → Providers → Google → Enable
2. Create a Google OAuth app at console.cloud.google.com → OAuth 2.0 Credentials
3. Authorised redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Paste Client ID and Client Secret into Supabase
5. Add Google to the login page buttons

### Enable Facebook OAuth
1. Supabase Dashboard → Authentication → Providers → Facebook → Enable
2. Create a Facebook app at developers.facebook.com → Facebook Login
3. Valid OAuth redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Paste App ID and App Secret into Supabase
5. Note: Facebook requires a privacy policy URL and App Review for public use

### Set Admin User
```sql
-- Run in Supabase SQL Editor after running 005_comments.sql
update public.profiles set role = 'admin' where email = 'henrytsaiqut@gmail.com';
```

---

## Implementation Order

Build in this exact order — each step is independently testable:

1. **`supabase/005_comments.sql`** — run migration first, everything else depends on it
2. **`AuthProvider.tsx` + `app/login/page.tsx`** — add Google + Facebook buttons (test OAuth redirect works)
3. **`app/api/comments/route.ts` + `app/api/comments/[id]/route.ts`** — build and test API with curl/Postman before touching UI
4. **`components/Comments.tsx`** — build the component against the working API
5. **`app/blog/[slug]/page.tsx`** — integrate Comments component
6. **`middleware.ts` + `components/AdminGuard.tsx`** — set up admin access control
7. **`app/api/admin/*` routes** — stats + user management API
8. **`app/admin/*` pages** — dashboard, users, comments

---

## Security Checklist

- [ ] Comment `content` displayed as plain text (`textContent`, not `innerHTML`) — no XSS
- [ ] `post_slug` validated server-side: `/^[a-z0-9-]+$/` — no path traversal
- [ ] `content` length checked both client-side (UX) and server-side (security)
- [ ] Admin role checked server-side on every admin API call — never trust client
- [ ] `/api/admin/*` uses server Supabase client (cookies) — not the public anon client
- [ ] `GOOGLE_CLIENT_ID` and similar never in `.env.local` — set only in Supabase Dashboard
- [ ] Delete operations on comments are scoped to `user_id` in the query (double-check besides RLS)
- [ ] `middleware.ts` only blocks `/admin/*` — does not interfere with other routes

---

## Senior Dev Test Checklist

### Auth
- [ ] "Continue with Google" → redirects to Google consent screen → returns to `/dashboard`
- [ ] "Continue with Facebook" → redirects to Facebook → returns to `/dashboard`
- [ ] Profile is auto-created with correct `full_name` and `avatar_url` from Google/Facebook metadata
- [ ] Email + password flow still works after changes to `AuthProvider`

### Comments
- [ ] Unauthenticated visitor sees "Sign in to join the conversation" — no form
- [ ] Logged-in user can post a comment — appears immediately (optimistic)
- [ ] Comment text is plain text — pasting `<script>alert(1)</script>` shows literal text, does not execute
- [ ] Edit: user can edit own comment — "(edited)" appears on timestamp
- [ ] Delete: user can delete own comment — disappears immediately with inline confirm
- [ ] Reply: reply is indented under parent — appears in correct order
- [ ] Admin can delete any comment via admin panel
- [ ] Attempting `DELETE /api/comments/[otherId]` as non-owner returns 403

### Admin
- [ ] `/admin` returns 404 for non-logged-in users
- [ ] `/admin` returns 404 for logged-in non-admin users
- [ ] Admin dashboard shows correct stats (verify against Supabase table counts)
- [ ] Toggling a user's role to admin is reflected immediately on next `/admin/users` load
- [ ] Cannot revoke own admin role via the UI or the API

### Build
- [ ] `npm run check` passes (npm audit + next build) with zero errors
- [ ] No TypeScript `any` added to comment or admin types
- [ ] `/sitemap.xml` still valid after new routes added

---

## Post-Ship Checklist

- [ ] Run `supabase/005_comments.sql` migration on production Supabase project
- [ ] Set `role = 'admin'` for Henry in production
- [ ] Enable Google + Facebook OAuth in production Supabase dashboard
- [ ] Test comment flow on a live blog post URL
- [ ] Test admin panel on live Vercel URL
- [ ] Update this file with ship date

---

## Notes / History

- **2026-04-04** — Spec written. GitHub OAuth already works. Need Google + Facebook + comments + admin.
- Facebook OAuth requires App Review for public access — may be delayed until site has real traffic.
- Replies are max 1 level deep intentionally — Reddit-style infinite nesting is overkill for a blog.
- Admin panel uses direct Supabase client with service-role key for user management — keep this server-side only.
