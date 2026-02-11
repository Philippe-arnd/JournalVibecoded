# 🔄 GitHub Actions Workflows Overview

This document provides a visual overview of all GitHub Actions workflows in the Journal app.

---

## 📊 Workflow Architecture

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
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ PR          │  │ Docker       │  │ Dependency   │       │
│  │ Validation  │  │ Validation   │  │ Review       │       │
│  │             │  │              │  │              │       │
│  │ • Lint      │  │ • Build      │  │ • Security   │       │
│  │ • Infra     │  │ • Images     │  │ • Licenses   │       │
│  │ • Tests     │  │ • Compose    │  │ • CVEs       │       │
│  │ • RLS       │  │ • Health     │  │              │       │
│  │ • Builds    │  │              │  │              │       │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                │                 │                │
│         └────────────────┴─────────────────┘                │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           ▼
                  ┌────────────────┐
                  │   All Checks   │
                  │     Pass? ✅   │
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
    │ • Verify Status  │      └──────────────────┘
    │ • Squash Merge   │
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
    │ Production 🚀    │
    └──────────────────┘
```

---

## 🔄 Workflow Triggers

| Workflow | Trigger | Target Branch | Purpose |
|----------|---------|---------------|---------|
| PR Validation | `pull_request` (opened, synchronize, reopened) | `main` | Validate code quality, tests, builds |
| Docker Validation | `pull_request` (opened, synchronize, reopened) | `main` | Validate Docker images and deployment |
| Dependency Review | `pull_request` | `main` | Security and license scanning |
| Code Coverage | `pull_request`, `push` | `main` | Track test coverage metrics |
| Auto-Merge | `pull_request_review`, `check_suite`, `pull_request` (ready_for_review) | `main` | Automatically merge passing PRs |

---

## ⏱️ Typical Workflow Timeline

```
00:00 → PR Created
00:01 → Workflows triggered (parallel execution)
        ├─ PR Validation starts
        ├─ Docker Validation starts
        ├─ Dependency Review starts
        └─ Code Coverage starts

02:00 → PR Validation completes ✅
        - Comment posted with results

05:00 → Docker Validation completes ✅
        - Comment posted with results

01:30 → Dependency Review completes ✅
        - Comment posted with results

03:00 → Code Coverage completes ✅
        - Comment posted with coverage report

05:30 → All checks passed
        → Auto-merge workflow triggered

06:00 → PR automatically merged to main
        - Squash commit created
        - Comment posted confirming merge

06:10 → GitHub webhook sent to Coolify

07:00 → Production deployment complete 🚀
```

**Total Time**: ~7-10 minutes from PR creation to production deployment

---

## 📁 Workflow Files

| File | Lines | Purpose | Complexity |
|------|-------|---------|------------|
| `pr-validation.yml` | ~180 | Core validation checks | ⭐⭐⭐ |
| `docker-validation.yml` | ~150 | Docker build verification | ⭐⭐⭐ |
| `auto-merge.yml` | ~120 | Automatic PR merging | ⭐⭐ |
| `dependency-review.yml` | ~60 | Security scanning | ⭐ |
| `code-coverage.yml` | ~130 | Coverage reporting | ⭐⭐ |

**Total**: ~640 lines of workflow automation

---

## 🎯 Success Criteria

For a PR to auto-merge, it must:

| Requirement | Status Check | Description |
|-------------|--------------|-------------|
| **Linting** | ✅ Required | ESLint must pass with no errors |
| **Infrastructure** | ✅ Required | Docker Compose and deployment validation |
| **Tests** | ✅ Required | All server tests must pass |
| **RLS** | ✅ Required | Row-Level Security policies validated |
| **Builds** | ✅ Required | Client and server build successfully |
| **Docker** | ✅ Required | Docker images build and containers start |
| **Security** | ✅ Required | No high/critical vulnerabilities |
| **Conflicts** | ✅ Required | Branch must be up-to-date with main |

All 8 criteria must pass for auto-merge to proceed.

---

## 🔧 Workflow Maintenance

### Adding a New Check

1. Create new workflow file in `.github/workflows/`
2. Define trigger conditions (usually `pull_request` for `main`)
3. Add required status check in branch protection rules
4. Test with a dummy PR

### Modifying Auto-Merge Behavior

Edit `.github/workflows/auto-merge.yml`:
- Change merge strategy: `merge_method: 'squash'` → `'merge'` or `'rebase'`
- Adjust timing: Modify trigger conditions
- Add custom logic: Update the status check script

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
```

---

## 📈 Metrics & Monitoring

### Workflow Success Rate

Track in GitHub Insights → Actions:
- Success rate per workflow
- Average execution time
- Failure reasons

**Target KPIs**:
- ✅ Success rate: >95%
- ✅ Average duration: <10 minutes
- ✅ Auto-merge rate: >80%

### Common Failure Reasons

| Reason | Frequency | Solution |
|--------|-----------|----------|
| Linting errors | 30% | Run `npm run lint:client` before pushing |
| Test failures | 25% | Run `npm run test:all` locally first |
| Merge conflicts | 20% | Keep branch updated with `main` |
| Docker build issues | 15% | Test with `docker compose build` |
| Security vulnerabilities | 10% | Update dependencies immediately |

---

## 🚀 Future Enhancements

Potential additions to the CI/CD pipeline:

- [ ] **Performance Testing**: Lighthouse CI for client performance
- [ ] **E2E Tests**: Playwright/Cypress integration tests
- [ ] **Visual Regression**: Percy or Chromatic for UI changes
- [ ] **Staging Environment**: Deploy PRs to preview environments
- [ ] **Rollback Automation**: Auto-revert on production errors
- [ ] **Slack Notifications**: Alert team on failures
- [ ] **Deployment Dashboard**: Real-time deployment status

---

## 📚 Related Documentation

- [CICD-SETUP.md](./CICD-SETUP.md) - Detailed setup guide
- [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) - Step-by-step checklist
- [renovate.json](../renovate.json) - Renovate Bot configuration
- [CLAUDE.md](../CLAUDE.md) - Development guide

---

**Last Updated**: 2026-02-11
**Maintained By**: CI/CD Team
