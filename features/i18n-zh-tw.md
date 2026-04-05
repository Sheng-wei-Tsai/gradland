# Feature: English ↔ Traditional Chinese Language Toggle

**Priority:** 🟡 Medium
**Status:** 🔲 Not started
**Branch:** `feature/i18n-zh-tw`
**Started:** —
**Shipped:** —

---

## Goal

Add a language toggle button (EN / 繁) in the Header so visitors can switch the entire UI between English and Traditional Chinese. Henry's audience includes Taiwanese/Hong Kong readers and Mandarin-speaking Brisbane locals — offering 繁體中文 makes the site more personal and accessible to that community.

---

## Acceptance Criteria

- [ ] A toggle button (EN / 繁) appears in the Header next to the theme toggle, on both desktop and mobile nav
- [ ] Clicking the toggle switches all static UI strings (nav labels, buttons, headings, placeholder text) to Traditional Chinese
- [ ] Language preference is persisted in `localStorage` and restored on next visit
- [ ] Blog post **content** is NOT auto-translated — only the shell/UI is localised
- [ ] Blog post metadata (title, description in post lists) shows original English (or a translated frontmatter field if provided)
- [ ] All pages covered: Home, Blog list, Blog post, Jobs, Dashboard, Cover Letter, Interview Prep, Learn, About, Login, 404
- [ ] Dynamic content from Supabase (job titles, company names) stays in English — only static labels switch
- [ ] No runtime translation API calls — all strings are bundled at build time
- [ ] `npm run build` passes with zero TypeScript errors

---

## Recommended Approach: `next-intl`

Use [`next-intl`](https://next-intl-docs.vercel.app/) — the standard i18n library for Next.js App Router.

### Key decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Routing strategy | **No URL locale prefix** (e.g. stay on `/`, not `/zh-TW/`) | Simpler for a personal site; preference stored in localStorage |
| Translation scope | **UI strings only** — no blog content | Blog posts are English markdown; machine-translating them would be low quality |
| Translation storage | `/messages/en.json` + `/messages/zh-TW.json` | Flat JSON, easy to edit manually |
| Locale detection | `localStorage` key `lang`, default `en` | Consistent with how theme is handled |
| Provider | `NextIntlClientProvider` wrapping `<body>` in `layout.tsx` | Required for client components to access translations |

---

## Affected Files

| File | Action | Notes |
|------|--------|-------|
| `package.json` | Modify | Add `next-intl` dependency |
| `messages/en.json` | Create | All English UI strings |
| `messages/zh-TW.json` | Create | All Traditional Chinese UI strings |
| `lib/i18n.ts` | Create | Helper: `useLocale()` hook, `getMessages()` server util |
| `components/LangToggle.tsx` | Create | EN / 繁 button, mirrors ThemeToggle pattern |
| `components/Header.tsx` | Modify | Add `<LangToggle>`, replace hardcoded nav strings with `t('nav.jobs')` etc. |
| `app/layout.tsx` | Modify | Wrap body with `<NextIntlClientProvider>` |
| `app/page.tsx` | Modify | Replace hardcoded hero strings |
| `app/about/page.tsx` | Modify | Replace hardcoded strings |
| `app/jobs/page.tsx` | Modify | Labels, filters, empty state |
| `app/cover-letter/page.tsx` | Modify | Form labels, placeholders, CTAs |
| `app/interview-prep/[role]/InterviewSession.tsx` | Modify | UI labels only |
| `app/learn/page.tsx` | Modify | Section headings, labels |
| `app/login/page.tsx` | Modify | Form labels, OAuth button text |
| `app/dashboard/page.tsx` | Modify | Section headings, stat labels |
| `app/not-found.tsx` | Modify | 404 message, button text |

---

## Implementation Notes

### 1. Install
```bash
npm install next-intl
```

### 2. Message files

`messages/en.json` structure:
```json
{
  "nav": {
    "home": "Home", "jobs": "Jobs", "blog": "Blog",
    "learn": "Learn", "about": "About", "dashboard": "Dashboard",
    "signIn": "Sign in", "signOut": "Sign out"
  },
  "home": { "hero": "...", "cta": "Browse Jobs" },
  "jobs": { "title": "Job Board", "empty": "No jobs found", "saved": "Saved", "applied": "Applied" },
  "footer": { "built": "Built in Brisbane" }
}
```

`messages/zh-TW.json` mirrors the same keys in Traditional Chinese.

### 3. LangToggle component

Mirrors the ThemeToggle pattern — reads from `localStorage`, updates a React context, persists preference.

```tsx
// components/LangToggle.tsx
'use client';
export default function LangToggle() {
  const [lang, setLang] = useState<'en'|'zh-TW'>('en');
  const toggle = () => { /* swap, persist, trigger re-render */ };
  return <button onClick={toggle}>{lang === 'en' ? 'EN' : '繁'}</button>;
}
```

### 4. No-prefix routing (localStorage only)

Because we're not using URL-based locale routing, the locale is stored client-side in `localStorage('lang')` and passed into `NextIntlClientProvider` via a client wrapper. This means SSR always renders in English and the language switch happens on the client — acceptable for a personal site.

### 5. Blog posts stay in English

Blog `.mdx`/`.md` content is **never** passed through translation. If a post has a `titleZh` frontmatter field in the future, the blog list can display it — but this is optional and out of scope for v1.

### 6. Scope of 繁中 translation

Focus on UI chrome only. A good first pass covers ~80 strings. Do NOT attempt to translate:
- Blog post body content
- Job listing data from Supabase
- Interview questions generated by AI
- Cover letter output

---

## Senior Dev Test Checklist

### Functional
- [ ] Toggle switches EN → 繁 and back correctly
- [ ] Language persists after page refresh
- [ ] Language persists after navigating between pages
- [ ] All nav links, buttons, and labels translated
- [ ] Blog post bodies remain in English
- [ ] Dynamic Supabase data (job titles) remains untouched
- [ ] Mobile bottom nav labels translate
- [ ] 404 page translates

### Build & Types
- [ ] `npm run build` passes with zero errors
- [ ] No TypeScript `any` added
- [ ] `next-intl` types satisfied — no missing message key warnings

### Performance
- [ ] No extra network requests for translations (all bundled)
- [ ] No visible flash of untranslated content (FOUC) — lang applied before first paint if possible

---

## Post-Ship Checklist

- [ ] Tested on live Vercel URL
- [ ] Native Traditional Chinese speaker reviewed the 繁中 strings
- [ ] This file updated with ship date

---

## Notes / History

- **2026-04-05** — Spec created. Scoped to UI strings only; blog content stays English. Recommended library: `next-intl`. No URL-prefix routing — localStorage only for simplicity.
