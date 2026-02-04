## 2025-05-21 - API Proxy Validation Gap
**Vulnerability:** The `/api/calculate` endpoint proxied requests to Mapbox without validating input length or format.
**Learning:** External API wrappers often assume valid input, and frontend validation is insufficient. Cost/DoS attacks are possible via unvalidated proxies to paid APIs.
**Prevention:** Always validate input server-side (using Zod) before constructing requests to external services.

## 2025-05-21 - API Origin Check
**Vulnerability:** The `/api/calculate` endpoint allowed requests from any origin, enabling potential CSRF and hotlinking of the paid Mapbox API.
**Learning:** Checking `Origin` against `request.nextUrl.origin` is a robust way to implement strict Same-Origin policy in Next.js Route Handlers without maintaining hardcoded lists of domains/ports.
**Prevention:** Implement `if (origin && origin !== request.nextUrl.origin) return 403;` in sensitive API routes.
