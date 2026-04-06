# GitHub Actions secrets

Configure under **Settings → Secrets and variables → Actions**.

## Required for npm publish (`release.yml`)

### `NPM_TOKEN` (strongly recommended)

CI **cannot** type an OTP. If you see **`EOTP`** in Actions, your workflow is not using a token that is exempt from OTP for automation.

1. [npmjs.com](https://www.npmjs.com/) → **Access Tokens** → **Generate New Token** → **Classic** (not granular, unless you know granular supports automation for your account).
2. Choose type **Automation** — [documented by npm](https://docs.npmjs.com/about-access-tokens) as intended for CI/CD and **not** requiring a one-time password when publishing.
3. Add repository secret **`NPM_TOKEN`** with that token value.

**Common mistakes**

- Using a **granular** “Publish” token while 2FA is required for writes — often still triggers **EOTP** in CI.
- Expecting to “enter OTP” in GitHub Actions — you cannot; use an **Automation** classic token, or publish from your laptop with `NPM_CONFIG_OTP` (see [PUBLISHING.md](../PUBLISHING.md)).

If `NPM_TOKEN` is missing, npm may try **OIDC trusted publishing**; that path can still hit **EOTP** if your account requires OTP for publishes.

**Do not** use a token that requires 2FA on every `npm publish` unless you only publish manually from your machine.

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
