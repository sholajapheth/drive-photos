# Publishing

## First-time checklist

1. **npm user scope** — Packages are published as `@sholajapheth/drive-photos-core`, `@sholajapheth/drive-photos-react`, and `@sholajapheth/drive-photos-next`. Your [npm username](https://www.npmjs.com/settings/~/profile) must be **`sholajapheth`** (or change every `name` in `packages/*/package.json` to match the account you use to publish).

2. **Internal deps** — Published packages use the same semver as the workspace (e.g. `"@sholajapheth/drive-photos-core": "0.1.0"`). Linked `changeset version` bumps keep them aligned. `npm install` at the repo root links workspaces to satisfy those ranges.

3. **GitHub repo** — Replace `sholajapheth/drive-photos` in `package.json` files if your repository URL differs.

4. **Secrets** — For **GitHub Actions**, add an **`NPM_TOKEN`** that does **not** require OTP on every publish — see [Classic Automation token](#github-actions-and-eotp) below. See also [.github/SECRETS.md](.github/SECRETS.md).

5. **Dry run** (optional):

   ```bash
   npm run publish-packages -- --dry-run
   ```

6. **Changesets** — After features/fixes, run:

   ```bash
   npx changeset
   ```

   Commit the generated file under `.changeset/`, open a PR, merge to `main`. The release workflow opens or updates the “Version packages” PR; merging that PR runs `changeset publish` and publishes the three packages together (linked versioning).

## GitHub Actions and `EOTP`

CI **cannot** enter a one-time password. If the workflow fails with **`EOTP` / “This operation requires a one-time password”**, your token or account is treating publishes like a browser login.

**Fix (recommended):** create a **Classic** npm token with type **Automation** (Profile → Access Tokens). Automation tokens are meant for CI and **do not** ask for OTP on `npm publish`. Put that value in **`NPM_TOKEN`** in GitHub Actions secrets.

Do **not** use a “Publish” granular token that requires 2FA for every publish unless npm’s docs say it’s exempt for automation.

## Manual publish from your laptop (with 2FA / OTP)

Use this when you want to publish yourself and can open your authenticator app.

1. **Checkout `main`** and install: `npm ci`
2. **Log in to npm** (once per machine): `npm login` → use username, password, email OTP if asked.
3. **Build packages:**

   ```bash
   npm run build
   ```

4. **Publish with a fresh 6-digit code** from your authenticator (codes expire in about 30 seconds). npm reads OTP from the environment:

   ```bash
   NPM_CONFIG_OTP=123456 npm run publish-packages
   ```

   Replace `123456` with the current code, then run the command immediately.

If you prefer the flag style:

```bash
npm run build
npx turbo run build --filter='./packages/*'
npx changeset publish --otp=123456
```

(`changeset publish` forwards `--otp` to `npm publish` when supported by your CLI version.)

**Note:** If you use **npm provenance** (`NPM_CONFIG_PROVENANCE=true`) locally and it errors, unset it for this run: `NPM_CONFIG_PROVENANCE= npm run publish-packages` (with `NPM_CONFIG_OTP` set as above).

## Day-to-day (automated)

1. Branch from `main`, implement changes.
2. `npx changeset` → choose bump level → commit the changeset file.
3. Open PR → merge to `main`.
4. Merge the “Version packages” PR when ready → GitHub Actions publishes using **`NPM_TOKEN`** (Automation token).

## Manual publish (emergency, token in env)

From a clean `main`, with `NPM_TOKEN` or `npm login` already valid:

```bash
npm run build
npm run publish-packages
```

Prefer the automated flow so changelogs and GitHub Releases stay in sync.
