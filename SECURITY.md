# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Contact the maintainers privately with reproduction steps and impact (for example via GitHub Security Advisories or a direct message to the repository owner). Response time goal: 48 hours.

We follow coordinated disclosure. You should receive:

- Acknowledgement within 48 hours
- Status update within 7 days
- Credit in the changelog (if desired) when the fix is released

## Known Threat Model (Updated April 2026)

### What drive-photos protects against

**1. API key client-side exposure**

The library emits a runtime warning when an API key is passed in a browser context without `options.listEndpoint`. The recommended architecture (Next.js proxy) keeps the key server-side at all times. The CI pipeline includes a build step that fails if disallowed API key references are found in the `@sholajapheth/drive-photos-react` bundle.

**2. SSRF (Server-Side Request Forgery)**

Addresses CVE-2024-34351, CVE-2025-57822, CVE-2025-6087 and related patterns:

- File IDs validated before URL construction (strict charset and length; URL decoding to catch `%2F`-style injection).
- Only allowlisted hostnames: `www.googleapis.com`, `drive.google.com`, `lh3.googleusercontent.com`.
- `redirect: 'manual'` on fetches — no blind redirect following; redirect destinations re-validated when handled.
- Private/internal host patterns blocked (defense in depth).
- HTTPS-only — no HTTP targets.

**3. Path traversal**

File IDs are validated before use. URL-encoded characters are decoded before validation to catch traversal-style payloads.

**4. XSS via file names**

Google Drive file names are sanitized before rendering: HTML-sensitive characters are stripped or normalized, control characters and null bytes removed, length capped. SVG responses are blocked at the proxy (415) — SVG is not proxied as image bytes through your domain.

**5. API quota exhaustion**

Server-side per-IP rate limiting is available via Next.js middleware (defaults documented in package). The core fetcher applies backoff when Google returns HTTP 429.

**6. npm supply chain attacks**

Response to 2025 incidents (Shai-Hulud, debug/chalk, Axios/UNC1069):

- `@sholajapheth/drive-photos-core` minimizes runtime dependencies.
- Dependencies pinned via lockfile in this repository.
- Optional Socket.dev scanning in CI when `SOCKET_SECURITY_KEY` is configured.
- Maintainers should use hardware-backed MFA on npm and automation-scoped publish tokens.

### What you are responsible for

- Keeping your Google Drive folder free of sensitive non-image files; the library can warn when non-images are present but cannot make files private for you.
- Restricting your API key to your domain and the Drive API in Google Cloud Console.
- Setting quota limits and billing alerts on your Google Cloud project.
- Keeping your own application dependencies updated and audited.
- Using the Next.js proxy pattern in production.

## Protecting Your npm Account (Maintainers)

Given the 2025 npm supply chain attacks (Shai-Hulud worm, debug/chalk compromise, Axios attack):

1. **Enable hardware MFA (FIDO2/WebAuthn)** on your npm account — not TOTP alone. Phishing-resistant keys reduce account takeover risk.

2. **Use an Automation token** for CI/CD — limit scope compared to a full publish token where possible.

3. **Do not trust** unsolicited links in emails claiming to be from npm support. Verify senders and domains (e.g. `npmjs.com` only).

4. **Enable “Require 2FA to publish”** on packages you maintain.

5. **Review CODEOWNERS** and limit who can merge to your default branch.
