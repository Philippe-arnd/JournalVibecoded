# GitHub Actions Workflows Overview

This document provides a visual overview of all GitHub Actions workflows in the Journal app.

---

## Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer/Renovate                       │
│                  Creates PR: dev → main                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Parallel Validation Workflows                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ PR Validation        │  │ Security & Performance   │    │
│  │                      │  │                          │    │
│  │ ┌──────────────────┐ │  │ ┌────────────────────┐  │    │
│  │ │ Quick Checks     │ │  │ │ Secret Detection   │  │    │
│  │ │ • Lint           │ │  │ │ (Gitleaks)         │  │    │
│  │ │ • Infra validate │ │  │ └────────────────────┘  │    │
│  │ │ • Client build   │ │  │ ┌────────────────────┐  │    │
│  │ │ • Server build   │ │  │ │ Security Scan      │  │    │
│  │ └──────────────────┘ │  │ │ (Semgrep SAST)     │  │    │
│  │ ┌──────────────────┐ │  │ └────────────────────┘  │    │
│  │ │ DB & API Tests   │ │  │ ┌────────────────────┐  │    │
│  │ │ • Migrations     │ │  │ │ Bundle Size        │  │    │
│  │ │ • RLS policies   │ │  │ │ (non-blocking)     │  │    │
│  │ │ • Vitest + cov.  │ │  │ └────────────────────┘  │    │
│  │ └──────────────────┘ │  │ ┌────────────────────┐  │    │
│  └──────────────────────┘  │ │ Report             │  │    │
│                             │ │ (PR comment)       │  │    │
│  ┌──────────────────────┐  │ └────────────────────┘  │    │
│  │ Dependency Review    │  └──────────────────────────┘    │
│  │ • CVEs (high/crit.)  │                                   │
│  │ • OpenSSF Scorecard  │  ┌──────────────────────────┐    │
│  └──────────────────────┘  │ Docker Validation        │    │
│                             │ (path-triggered only)    │    │
│                             │ • Build images           │    │
│                             │ • Health check           │    │
│                             └──────────────────────────┘    │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  All Required  │
              │  Checks Pass?  │
              └────────┬───────┘
                       │
          ┌────────────┴────────────┐
          │                         │
      ✅ YES                     ❌ NO
          │                         │
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│ Auto-Merge       │      │ PR Blocked       │
│ Workflow         │      │ Manual Fix       │
│                  │      │ Required         │
│ • Find PR        │      └──────────────────┘
│ • Verify checks  │
│ • Squash merge   │
│ • Comment        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Merged to main   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ GitHub Webhook   │
│ → Coolify        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Deploy to        │
│ Production       │
└──────────────────┘
```

---

## Workflow Triggers

| Workflow | Trigger | Target Branch | Purpose |
|----------|---------|---------------|---------|
| PR Validation | `pull_request` (opened, synchronize, reopened, ready_for_review) | `main` | Lint, builds, DB tests, RLS, coverage |
| Security & Performance | `pull_request` (opened, synchronize, reopened, ready_for_review) | `main` | Secret scan, SAST, bundle size |
| Dependency Review | `pull_request` | `main` | CVE and license scanning |
| Docker Validation | `pull_request` on Docker-related paths only | `main` | Docker image build and health check |
| Auto-Merge | `workflow_run` (on completion of validation workflows) | `main` | Automatically merge passing PRs |

---

## Workflow Details

### PR Validation (`pr-validation.yml`)

Two jobs run **in parallel** (both skip draft PRs):

**Quick Checks** (timeout: 5m)
- ESLint on client
- Infrastructure validation (`scripts/validate-deployment.ts`)
- Client + server builds (parallel)

**Database & API Tests** (timeout: 10m)
- Spins up a Postgres 18 service container
- Creates `app_user`, applies migrations (`db:push`), applies RLS (`db:rls`)
- Runs RLS policy tests (`test:rls`)
- Runs Vitest with coverage (json-summary + text reporters)
- Posts/updates a PR comment with results table and coverage %

### Security & Performance (`security-performance.yml`)

Four jobs, three run in **parallel** (all skip draft PRs):

**Secret Detection** (timeout: 2m) — *blocking*
- Gitleaks scans full git history
- Config: `.gitleaks.toml`

**Security Scan** (timeout: 3m) — *blocking on critical only*
- Semgrep SAST with rules: `p/security-audit`, `p/javascript`, `p/typescript`, `p/react`, `p/nodejs`, `.semgrep.yml`
- Errors block; warnings are non-blocking

**Bundle Size** (timeout: 5m) — *non-blocking*
- Builds client and measures JS/CSS sizes
- Baselines: JS 543 KB, CSS 43 KB
- Warns (non-blocking) if either increases >10%

**Generate Report** (runs after all three)
- Posts/updates a single consolidated PR comment
- Fails the job if secret or SAST checks failed

### Docker Validation (`docker-validation.yml`)

Only triggers when Docker-related files change:
- `Dockerfile`, `*/Dockerfile`, `*.Dockerfile`
- `docker-compose*.yml`, `.dockerignore`

Steps: builds server + client images in parallel, starts full stack, waits for `/health` endpoint, then tears down.

### Dependency Review (`dependency-review.yml`)

Uses `actions/dependency-review-action@v4`:
- Fails on high/critical severity CVEs
- Shows OpenSSF Scorecard ratings
- Posts detailed vulnerability comment on failure

### Auto-Merge (`auto-merge.yml`)

Triggered by `workflow_run` completion for any of:
- `✅ PR Validation`
- `🔒🚀 Security & Performance`
- `🔒 Dependency Review`
- `🐳 Docker Validation`

Only proceeds if the triggering workflow **succeeded**. Then:
1. Finds the open PR associated with the workflow's branch
2. Skips draft PRs and PRs not targeting `main`
3. Checks that all **required checks** are `completed` + `success`:
   - `Quick Checks`
   - `Database & API Tests`
   - `🔍 Secret Detection`
   - `🛡️ Security Scan`
   - `Review Dependencies for Vulnerabilities`
4. Verifies the PR is mergeable (no conflicts)
5. Squash-merges and posts a confirmation comment

---

## Success Criteria

For a PR to auto-merge, all of the following must pass:

| Requirement | Check Name | Description |
|-------------|------------|-------------|
| **Linting & Builds** | `Quick Checks` | ESLint, infra validation, client + server builds |
| **Database & API** | `Database & API Tests` | Migrations, RLS policies, Vitest suite + coverage |
| **Secret Detection** | `🔍 Secret Detection` | No credentials exposed in git history |
| **SAST** | `🛡️ Security Scan` | No critical security vulnerabilities |
| **Dependency CVEs** | `Review Dependencies for Vulnerabilities` | No high/critical CVEs in new dependencies |
| **No Conflicts** | (GitHub) | Branch must be mergeable |

Docker Validation is **not** a required check for auto-merge — it only runs on Docker-related file changes.

---

## Typical Workflow Timeline

```
00:00 → PR Created (non-draft, targeting main)
00:01 → Workflows triggered (parallel execution)
        ├─ PR Validation starts
        │   ├─ Quick Checks (lint + builds)
        │   └─ Database & API Tests (postgres service)
        ├─ Security & Performance starts
        │   ├─ Secret Detection
        │   ├─ Security Scan
        │   └─ Bundle Size
        └─ Dependency Review starts

02:00 → Quick Checks complete ✅
02:30 → Secret Detection complete ✅
03:00 → Security Scan complete ✅
03:30 → Bundle Size complete + Report posted ✅
04:00 → Dependency Review complete ✅
05:00 → Database & API Tests complete ✅
        → PR Validation comment posted

05:01 → Auto-Merge triggered (by last workflow_run)
        → All 5 required checks verified
05:10 → PR squash-merged to main

05:20 → GitHub webhook sent to Coolify
06:30 → Production deployment complete
```

**Total Time**: ~6-7 minutes from PR creation to production deployment

---

## Workflow Files

| File | Jobs | Purpose |
|------|------|---------|
| `pr-validation.yml` | Quick Checks, Database & API Tests | Lint, builds, DB tests, RLS, coverage |
| `security-performance.yml` | Secret Detection, Security Scan, Bundle Size, Report | SAST, secret scan, bundle tracking |
| `dependency-review.yml` | Review Dependencies for Vulnerabilities | CVE and license scanning |
| `docker-validation.yml` | Build & Test Docker Images | Docker build + health check (path-triggered) |
| `auto-merge.yml` | Auto-Merge if All Checks Pass | Squash-merge on green checks |

---

## Workflow Maintenance

### Adding a New Required Check

1. Create a new workflow file in `.github/workflows/`
2. Define trigger: `pull_request` → `main`
3. Add the job name to the `requiredChecks` array in `auto-merge.yml`
4. Add the check to branch protection rules in GitHub Settings
5. Test with a dummy PR

### Modifying Auto-Merge Behavior

Edit `.github/workflows/auto-merge.yml`:
- Change merge strategy: `merge_method: 'squash'` → `'merge'` or `'rebase'`
- Add/remove required checks: update the `requiredChecks` array
- Skip specific PR authors or labels: add conditions to the `if` expression

### Updating Bundle Size Baselines

Edit `.github/workflows/security-performance.yml`:
```bash
JS_BASE=543   # Change to new baseline in KB
CSS_BASE=43   # Change to new baseline in KB
```
Document the reason in your PR description.

### Disabling Auto-Merge Temporarily

1. Go to: **Settings → Branches → Edit rule for `main`**
2. Uncheck: **Require status checks to pass before merging**
3. Auto-merge will stop (PRs require manual merge)
4. Re-enable when ready

### Workflow Troubleshooting Commands

```bash
# View workflow run logs
gh run list --workflow=pr-validation.yml
gh run view <run-id> --log

# Re-run failed workflow
gh run rerun <run-id>

# Cancel running workflow
gh run cancel <run-id>

# Watch workflow in real-time
gh run watch <run-id>

# Check all check statuses on a PR
gh pr checks <pr-number>
```

---

## Local Security Testing

```bash
# Secret detection
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source=/path --config=.gitleaks.toml

# SAST security scan
docker run --rm -v $(pwd):/src semgrep/semgrep semgrep --config=.semgrep.yml /src

# Bundle size check
cd client && npm run build
find dist/assets -name "*.js" -exec du -ch {} + | grep total
```

---

## Common Failure Reasons

| Reason | Check | Solution |
|--------|-------|----------|
| Linting errors | Quick Checks | Run `npm run lint:client` before pushing |
| Build failures | Quick Checks | Run `npm run build --prefix client` locally |
| Test failures | Database & API Tests | Run `npm run test:server` locally |
| RLS policy issues | Database & API Tests | Run `npm run --prefix server test:rls` |
| Exposed secrets | Secret Detection | Remove credentials, rotate keys, update `.gitleaks.toml` |
| Security vulnerabilities | Security Scan | Fix issues in `.semgrep.yml` rule matches |
| Dependency CVEs | Dependency Review | Run `npm audit fix` or update dependencies |
| Merge conflicts | (GitHub) | Rebase branch on latest `main` |

---

## Related Documentation

- [CICD-SETUP.md](./CICD-SETUP.md) - Detailed setup guide
- [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) - Step-by-step checklist
- [renovate.json](../renovate.json) - Renovate Bot configuration
- [CLAUDE.md](../CLAUDE.md) - Development guide

---

**Last Updated**: 2026-02-14
**Maintained By**: CI/CD Team
