# Branch protection (manual setup)

Apply these to the `main` branch in **GitHub → Settings → Branches → Add rule** (branch name pattern: `main`).

## Recommended settings

- [ ] Require a pull request before merging
  - Required approvals: **1**
  - [ ] Dismiss stale approvals when new commits are pushed
- [ ] Require status checks to pass before merging
  - Required checks (names must match your Actions jobs after the first run):
    - `Lint`
    - `Typecheck`
    - `Test (Node 18)`
    - `Test (Node 20)`
    - `Security audit`
    - `Build`
  - Add `Dependency Review` if you use that workflow on PRs.
- [ ] Require branches to be up to date before merging
- [ ] Require conversation resolution before merging
- [ ] Do not allow bypassing the above settings (for admins, optional)

Job names are defined in `.github/workflows/ci.yml` and may appear with workflow name prefix in the UI (e.g. `CI / Lint`). Pick the checks that correspond to each job.
