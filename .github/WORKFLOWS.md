# GitHub Actions Workflows

All CI/CD workflows for the Journal app. Four of the five workflows are thin callers that delegate to the shared [reusable-workflow-vibecoded](https://github.com/Philippe-arnd/reusable-workflow-vibecoded) library.

---

## Architecture

```
Developer creates PR → main
        │
        ▼
┌──────────────────────────────────────────────────────┐
│             Parallel Validation Workflows             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────┐  ┌───────────────────────┐ │
│  │ ✅ PR Validation     │  │ 🔒🚀 Security &        │ │
│  │ (reusable caller)   │  │    Performance        │ │
│  │                     │  │ (reusable caller)     │ │
│  │ ✅ Quick Checks      │  │                       │ │
│  │  • Lint             │  │ 🔑 Secret Detection   │ │
│  │  • Infra validate   │  │ 🛡️ Security Scan       │ │
│  │  • Client build     │  │ 📦 Bundle Size        │ │
│  │  • Server build     │  │ 📋 Security Report    │ │
│  │                     │  └───────────────────────┘ │
│  │ 🧪 Vitest Tests     │                            │
│  │  • Migrations       │  ┌───────────────────────┐ │
│  │  • RLS policies     │  │ 🔒 Dependency Review  │ │
│  │  • Vitest + cov.   │  │ (reusable caller)     │ │
│  │                     │  │                       │ │
│  │ 🔒 RLS Tests        │  │ 🔎 Vuln. scan         │ │
│  │  • Migrations       │  │   (high/critical)     │ │
│  │  • RLS policies     │  └───────────────────────┘ │
│  │  • test:rls script  │                            │
│  │                     │  ┌───────────────────────┐ │
│  │ 📊 Test Report      │  │ 🐳 Docker Validation  │ │
│  └─────────────────────┘  │ (inline — path-       │ │
│                            │  triggered only)      │ │
│                            │                       │ │
│                            │ Build images          │ │
│                            │ Health check          │ │
│                            └───────────────────────┘ │
│                                                      │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
             ┌────────────────┐
             │  All Required  │
             │  Checks Pass?  │
             └───────┬────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
     ✅ YES                   ❌ NO
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│ 🤖 Auto-Merge   │    │ PR Blocked       │
│ (reusable       │    │ Manual Fix       │
│  caller)        │    │ Required         │
│                 │    └──────────────────┘
│ • Verify checks │
│ • Squash merge  │
│ • Comment       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Merged to main  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Webhook  │
│ → Coolify       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy to       │
│ Production      │
└─────────────────┘
```

---

## Workflow Files

| File | Type | Jobs | Purpose |
|------|------|------|---------|
| `pr-validation.yml` | Reusable caller | ✅ Quick Checks, 🧪 Vitest Tests, 🔒 RLS Tests, 📊 Test Report | Lint, builds, DB tests, RLS, coverage |
| `security-performance.yml` | Reusable caller | 🔑 Secret Detection, 🛡️ Security Scan, 📦 Bundle Size, 📋 Security Report | SAST, secret scan, bundle tracking |
| `dependency-review.yml` | Reusable caller | 🔎 Review Dependencies for Vulnerabilities | CVE scanning |
| `docker-validation.yml` | Inline | 🐳 Build & Test Docker Images | Docker build + health check (path-triggered) |
| `auto-merge.yml` | Reusable caller | 🤖 Auto Merge | Squash-merge on green checks |

Reusable workflow source: [`Philippe-arnd/reusable-workflow-vibecoded`](https://github.com/Philippe-arnd/reusable-workflow-vibecoded)

---

## Triggers

| Workflow | Trigger | Condition |
|----------|---------|-----------|
| PR Validation | `pull_request` → `main` | Non-draft only |
| Security & Performance | `pull_request` → `main` | Non-draft only |
| Dependency Review | `pull_request` → `main` | Always |
| Docker Validation | `pull_request` → `main` | Only when Docker files change |
| Auto-Merge | `workflow_run` completed | Triggered by the 4 above |

---

## Job Details

### PR Validation (`pr-validation.yml`)

Three jobs run in parallel (all skip draft PRs):

**✅ Quick Checks** (timeout: 5m)
- ESLint on client (`npm run lint:client`)
- Infrastructure validation (`npm run test:infra`)
- Client + server builds

**🧪 Vitest Tests** (timeout: 10m)
- Spins up a PostgreSQL 18 service container
- Creates `app_user`, runs migrations (`db:push`), applies RLS (`db:rls`)
- Runs Vitest with coverage (`json-summary` + `text` reporters)
- Posts/updates a PR comment with results and coverage %

**🔒 RLS Tests** (timeout: 10m, parallel with Vitest Tests)
- Same DB setup as Vitest Tests
- Runs `npm run test:rls` for RLS policy validation

### Security & Performance (`security-performance.yml`)

Four jobs, three run in parallel (skip draft PRs):

**🔑 Secret Detection** (timeout: 2m) — *blocking*
- Gitleaks scans full git history
- Config: `.gitleaks.toml`

**🛡️ Security Scan** (timeout: 5m) — *blocking on critical only*
- Semgrep SAST: `p/security-audit`, `p/javascript`, `p/react`, `p/nodejs`, `.semgrep.yml`
- Uploads SARIF to GitHub Security tab
- Critical errors block; warnings are non-blocking

**📦 Bundle Size** (timeout: 5m) — *non-blocking*
- Builds client and measures JS/CSS sizes
- Baselines: JS 543 KB, CSS 43 KB
- Warns if either increases >10% (never fails the check)

**📋 Security Report** (runs after all three)
- Posts/updates a single consolidated PR comment
- Fails if secret detection or SAST errored

### Dependency Review (`dependency-review.yml`)

Single job using `actions/dependency-review-action@v4`:
- Fails on high/critical severity CVEs in added/changed dependencies
- Shows OpenSSF Scorecard ratings
- License checking disabled by default (opt-in via reusable `license-check` input)

### Docker Validation (`docker-validation.yml`)

Only triggers when these paths change: `Dockerfile`, `*/Dockerfile`, `*.Dockerfile`, `docker-compose*.yml`, `.dockerignore`

Steps: builds server + client images in parallel, starts full stack, polls `/health` endpoint, tears down.

> **Note**: This workflow is kept inline (not using the reusable) because it requires creating a `.env` file before `docker compose build`, which cannot be injected into the reusable workflow's job.

### Auto-Merge (`auto-merge.yml`)

Triggered by `workflow_run` completion for any of the four validation workflows. Only proceeds if the triggering workflow succeeded. Then:
1. Finds the open PR for the branch (skips drafts, non-`main` targets, `major-update` label)
2. Verifies all **required checks** are `completed` + `success`
3. Squash-merges and posts a confirmation comment

---

## Required Checks (Branch Ruleset)

For a PR to merge, all of the following must pass:

| Check Name | Workflow | Description |
|------------|----------|-------------|
| `validation / ✅ Quick Checks` | PR Validation | ESLint, infra validation, builds |
| `validation / 🧪 Vitest Tests` | PR Validation | Migrations, RLS setup, Vitest + coverage |
| `validation / 🔒 RLS Tests` | PR Validation | RLS policy tests |
| `security-performance / 🔑 Secret Detection` | Security & Performance | No credentials in git history |
| `security-performance / 🛡️ Security Scan` | Security & Performance | No critical SAST findings |
| `dependency-review / 🔎 Review Dependencies for Vulnerabilities` | Dependency Review | No high/critical CVEs |

**Conditional** (blocks only if the check ran):
- `📦 Bundle Size` — runs on all PRs but never fails; conditional to catch build errors
- `Build & Test Docker Images` — only runs on Docker file changes

---

## Maintenance

### Updating Bundle Size Baselines

Edit `security-performance.yml`:
```yaml
bundle-js-baseline-kb: 543   # new baseline in KB
bundle-css-baseline-kb: 43   # new baseline in KB
```

### Modifying Auto-Merge Check Requirements

Edit `auto-merge.yml` — update the `required-checks` or `conditional-checks` inputs, **and** update the GitHub branch ruleset to match (Settings → Rules → Main).

### Modifying Reusable Workflow Logic

Changes to how jobs run (steps, tooling, report format) go in [`Philippe-arnd/reusable-workflow-vibecoded`](https://github.com/Philippe-arnd/reusable-workflow-vibecoded). The caller workflows in this repo only need changes when inputs/configuration change.

### Adding a New Required Check

1. Add the job to the appropriate reusable workflow (or create a new caller)
2. Add the check name to `required-checks` in `auto-merge.yml`
3. Add it to the branch ruleset via Settings → Rules → Main

---

## Common Failure Reasons

| Check | Reason | Solution |
|-------|--------|----------|
| ✅ Quick Checks | Lint errors | Run `npm run lint:client` before pushing |
| ✅ Quick Checks | Build failure | Run `npm run build --prefix client/server` locally |
| 🧪 Vitest Tests | Test failures | Run `npm run --prefix server test` locally |
| 🔒 RLS Tests | RLS policy issues | Run `npm run --prefix server test:rls` locally |
| 🔑 Secret Detection | Exposed credentials | Remove secrets, rotate keys, update `.gitleaks.toml` |
| 🛡️ Security Scan | Critical vulnerabilities | Fix `.semgrep.yml` rule matches |
| 🔎 Dependency Review | CVEs in new deps | Run `npm audit fix` or update to patched versions |
| 🐳 Docker Validation | Build failure | Check Dockerfile syntax and `docker compose` locally |

---

## Troubleshooting Commands

```bash
# View workflow run logs
gh run list --workflow=pr-validation.yml
gh run view <run-id> --log

# Re-run failed workflow
gh run rerun <run-id>

# Check all check statuses on a PR
gh pr view <pr-number> --json statusCheckRollup

# Local security checks
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source=/path --config=.gitleaks.toml
docker run --rm -v $(pwd):/src semgrep/semgrep semgrep --config=.semgrep.yml /src

# Local bundle size
cd client && npm run build && find dist/assets -name "*.js" -exec du -ch {} + | grep total
```
