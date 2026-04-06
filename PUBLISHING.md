# Publishing

## First-time checklist

1. **npm user scope** — Packages are published as `@sholajapheth/drive-photos-core`, `@sholajapheth/drive-photos-react`, and `@sholajapheth/drive-photos-next`. Your [npm username](https://www.npmjs.com/settings/~/profile) must be **`sholajapheth`** (or change every `name` in `packages/*/package.json` to match the account you use to publish).

2. **Internal deps** — Published packages use the same semver as the workspace (e.g. `"@sholajapheth/drive-photos-core": "0.1.0"`). Linked `changeset version` bumps keep them aligned. `npm install` at the repo root links workspaces to satisfy those ranges.

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

   Commit the generated file under `.changeset/`, open a PR, merge to `main`. The release workflow opens or updates the “Version packages” PR; merging that PR runs `changeset publish` and publishes the three packages together (linked versioning).

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
