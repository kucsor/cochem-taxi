## 2025-05-21 - API Proxy Validation Gap
**Vulnerability:** The `/api/calculate` endpoint proxied requests to Mapbox without validating input length or format.
**Learning:** External API wrappers often assume valid input, and frontend validation is insufficient. Cost/DoS attacks are possible via unvalidated proxies to paid APIs.
**Prevention:** Always validate input server-side (using Zod) before constructing requests to external services.
