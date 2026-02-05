## 2025-05-21 - API Proxy Validation Gap
**Vulnerability:** The `/api/calculate` endpoint proxied requests to Mapbox without validating input length or format.
**Learning:** External API wrappers often assume valid input, and frontend validation is insufficient. Cost/DoS attacks are possible via unvalidated proxies to paid APIs.
**Prevention:** Always validate input server-side (using Zod) before constructing requests to external services.

## 2025-05-21 - CSRF Protection via Origin Validation
**Vulnerability:** The `/api/calculate` endpoint did not validate the `Origin` header, potentially allowing Cross-Site Request Forgery (CSRF) or unauthorized usage of the paid Mapbox API from other domains.
**Learning:** Next.js App Router API routes do not have built-in CSRF protection like `next-auth` or Pages router. Explicit Origin validation is needed for public APIs that perform sensitive actions or incur costs.
**Prevention:** Implement an Origin check at the start of API routes: `if (origin && origin !== new URL(request.url).origin) return 403;`.

## 2025-05-21 - Missing Security Headers
**Vulnerability:** The application lacked standard HTTP security headers (HSTS, X-Frame-Options, X-Content-Type-Options), increasing risk of clickjacking, MIME sniffing, and downgrade attacks.
**Learning:** Next.js does not include these headers by default. They must be explicitly configured in `next.config.ts` or middleware.
**Prevention:** Use the `headers` key in `next.config.ts` to set strict defaults for all routes (`/:path*`).
