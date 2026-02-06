import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { i18n } from './i18n-config'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // CSP: Generate nonce
  // Using btoa(crypto.randomUUID()) for Edge compatibility
  const nonce = btoa(crypto.randomUUID())

  // CSP: Construct header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: http: 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://www.google-analytics.com https://www.googletagmanager.com;
    block-all-mixed-content;
    upgrade-insecure-requests;
  `
  // Replace newlines with spaces and trim
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public`
  if (
    [
      '/manifest.json',
      '/favicon.ico',
    ].includes(pathname)
  ) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)
    return response
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = i18n.defaultLocale

    // Use 308 Permanent Redirect for SEO
    const response = NextResponse.redirect(
      new URL(
        `/${locale}${pathname === '/' ? '' : pathname}`,
        request.url
      ),
      308
    )
    response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)
    return response
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  return response
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/` and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\..*).*)'],
}
