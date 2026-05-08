import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Fail-closed: empty string means isOwner never matches if env var is unset.
const OWNER_EMAIL = process.env.OWNER_EMAIL?.toLowerCase() ?? '';

function buildCsp(): string {
  const isDev = process.env.NODE_ENV === 'development';
  return [
    "default-src 'self'",
    // Static prerender + ISR caching means inline scripts in cached HTML can't
    // carry a per-request nonce. With nonce present, modern browsers (CSP2+)
    // ignore 'unsafe-inline' and block all unnonced inline scripts, breaking
    // React hydration. Until pages are dynamic OR nonce is plumbed through
    // <Script> at render time, fall back to 'unsafe-inline' only.
    // unsafe-eval is dev-only: React uses it for error-stack reconstruction.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://js.stripe.com https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.googleusercontent.com https://*.githubusercontent.com https://img.youtube.com https://i.ytimg.com https://cdn.simpleicons.org https://img.logo.dev https://www.google.com",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.anthropic.com https://api.openai.com https://generativelanguage.googleapis.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const csp = buildCsp();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('content-security-policy', csp);

  // Protected routes need a Supabase auth check.
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set('Content-Security-Policy', csp);

    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll:  () => request.cookies.getAll(),
          setAll: (pairs) =>
            pairs.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            ),
        },
      },
    );

    // getUser() validates against Supabase Auth — not just a JWT decode.
    const { data: { user } } = await sb.auth.getUser();

    if (pathname.startsWith('/admin')) {
      if (!user || user.email?.toLowerCase() !== OWNER_EMAIL) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // All other page routes — set CSP, no auth check needed.
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Run on all pages except Next.js internals, static assets, and API routes.
      // API routes don't serve HTML so CSP headers are irrelevant there.
      source: '/((?!_next/static|_next/image|favicon.ico|api).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
