# Publishing

## First-time checklist

1. **npm scope** — Log in and ensure the `@drive-photos` scope is available under your npm org or user.  
   [npm scope docs](https://docs.npmjs.com/about-organizations)

2. **Internal deps** — Published packages use the same semver as the workspace (e.g. `"@drive-photos/core": "0.1.0"`). Linked `changeset version` bumps keep them aligned. `npm install` at the repo root links workspaces to satisfy those ranges.

3. **GitHub repo** — Replace `sholajapheth/drive-photos` in `package.json` files if your repository URL differs.

4. **Secrets** — Add `NPM_TOKEN` for Actions (see [.github/SECRETS.md](.github/SECRETS.md)).

5. **Dry run** (optional):

   ```bash
   npm run publish-packages -- --dry-run
   ```

6. **Changesets** — After features/fixes, run:

   ```bash
   npx changeset
   ```

   Commit the generated file under `.changeset/`, open a PR, merge to `main`. The release workflow opens or updates the “Version packages” PR; merging that PR runs `changeset publish` and publishes `@drive-photos/core`, `@drive-photos/react`, and `@drive-photos/next` together (linked versioning).

## Day-to-day

1. Branch from `main`, implement changes.
2. `npx changeset` → choose bump level → commit the changeset file.
3. Open PR → merge to `main`.
4. Merge the “Version packages” PR when ready → npm publish runs in GitHub Actions.

## Manual publish (emergency only)

From a clean `main`, with `NPM_TOKEN` in the environment:

```bash
npm run build
npm run publish-packages
```

Prefer the automated flow so changelogs and GitHub Releases stay in sync.
