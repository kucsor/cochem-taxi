# Security Audit Report

## Executive Summary
A comprehensive security audit was performed on the `cochem-taxi.de` codebase. The audit focused on OWASP Top 10 vulnerabilities, dependency analysis, input validation, and configuration security.

**Overall Status:** Several Critical and High risks were identified, primarily related to outdated dependencies and missing HTTP security headers.

## Findings

### Critical Risks
*   **Vulnerable Dependencies**:
    *   `next` (v15.5.9) is vulnerable to a Denial of Service (DoS) attack via insecure React Server Components deserialization (GHSA-h25m-26qc-wcjf) and Image Optimizer remotePatterns (GHSA-9g9p-9gw9-jx7f).
    *   `fast-xml-parser` is vulnerable to a RangeError DoS (GHSA-37qj-frw5-hhjh).
    *   `@isaacs/brace-expansion` is vulnerable to Uncontrolled Resource Consumption (GHSA-7h2j-956f-4vf2).
    *   **Fix**: Update all packages to their patched versions (specifically `next` to >=15.5.10).

### High Risks
*   **Missing Content-Security-Policy (CSP)**: The application lacks a strict CSP, making it vulnerable to Cross-Site Scripting (XSS) and data injection attacks.
    *   **Fix**: Implement a strict CSP in `middleware.ts` using nonces for inline scripts.
*   **Missing Permissions-Policy**: The application does not define a Permissions-Policy, allowing unrestricted access to sensitive browser features (geolocation, camera, etc.) by embedded content.
    *   **Fix**: Add a `Permissions-Policy` header in `next.config.ts` restricting features like geolocation to 'self'.

### Medium Risks
*   **Unsafe HTML Rendering (`dangerouslySetInnerHTML`)**:
    *   Found in `src/app/[lang]/rechner/page.tsx` and `src/app/[lang]/legal/page.tsx`.
    *   The application renders HTML content from translation files (`dictionaries`). While currently trusted (static JSON), this pattern bypasses React's built-in XSS protection.
    *   **Fix**: Ensure translation files are strictly controlled. For an extra layer of security, use a sanitization library like `isomorphic-dompurify` before rendering, or refactor to use React components instead of raw HTML strings.

### Low Risks
*   **Public API Token**:
    *   `NEXT_PUBLIC_MAPBOX_TOKEN` is exposed in the client bundle.
    *   **Analysis**: This is required for client-side maps.
    *   **Fix**: Ensure this token is scoped to the specific domain (`cochem-taxi.de`) in the Mapbox dashboard to prevent misuse.

## Remediation Plan
1.  **Update Dependencies**: Run `pnpm update` for the affected packages.
2.  **Harden Headers**: Modify `middleware.ts` and `next.config.ts` to include CSP and Permissions-Policy.
3.  **Sanitize Inputs**: Review usage of `dangerouslySetInnerHTML`.

---
*Audit performed by Jules (Senior Security Engineer)*
