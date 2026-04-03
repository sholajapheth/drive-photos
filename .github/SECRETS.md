# GitHub Actions secrets

Configure under **Settings → Secrets and variables → Actions**.

## Required for npm publish (`release.yml`)

### `NPM_TOKEN`

1. [npmjs.com](https://www.npmjs.com/) → Access Tokens → **Granular** or **Classic** (automation-capable).
2. Add repository secret `NPM_TOKEN` with the token value.
3. Used by `changesets/action` to run `changeset publish` with provenance (`NPM_CONFIG_PROVENANCE`).

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

## After secrets are set

Push to `main` to run CI. After you add changesets and merge the “Version packages” PR, the release workflow publishes to npm when `NPM_TOKEN` is configured.
