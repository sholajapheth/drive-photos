# GitHub Actions secrets

Configure under **Settings → Secrets and variables → Actions**.

## Required for npm publish (`release.yml`)

### `NPM_TOKEN` (strongly recommended)

CI **cannot** use an interactive OTP. If your npm account has **2FA enabled for publishing**, you must use a token that is allowed to publish **without** a one-time password.

1. [npmjs.com](https://www.npmjs.com/) → **Access Tokens** → **Generate New Token** → **Classic**.
2. Choose type **Automation** (classic automation tokens bypass 2FA when publishing from CI).
3. Add repository secret **`NPM_TOKEN`** with that token value.

If `NPM_TOKEN` is missing, npm may try **OIDC trusted publishing**; if that is not fully configured on the npm side, publish can still fail with **`EOTP`** (one-time password required).

**Do not** use a “Publish” token that requires 2FA on every publish.

### Granular tokens

If you use a **granular** token instead, ensure it has permission to publish packages under **`@sholajapheth`** and is allowed for automation (per npm’s UI).

## Required for docs deploy (`docs.yml`)

### `VERCEL_TOKEN`

[Vercel](https://vercel.com/) → Account Settings → Tokens → create token.

### `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`

From the linked project, e.g. after `vercel link` in `apps/docs`, read `.vercel/project.json` (do not commit that file).

## Optional

### `CODECOV_TOKEN`

[Codecov](https://codecov.io/) upload token for coverage reports from `ci.yml`. If omitted, the Codecov step is a no-op (`fail_ci_if_error: false`).

### `DOCS_DEMO_FOLDER_ID`

Google Drive folder id for the public demo on the docs app (passed as `NEXT_PUBLIC_DEMO_FOLDER_ID` during the docs build in CI).

## npm publish `404` / scope

If `changeset publish` fails with **`404 Not Found - PUT ... @sholajapheth%2f...`**, your npm user may not own the **`@sholajapheth`** scope (npm username must match), or the token cannot publish to that scope.

## After secrets are set

Push to `main` to run CI. After you add changesets and merge the “Version packages” PR, the release workflow publishes to npm when `NPM_TOKEN` is configured.
