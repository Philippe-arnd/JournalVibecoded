# 🚀 CI/CD Setup Guide

This document explains the complete automated CI/CD pipeline for the Journal application, including validation workflows, auto-merge, and Renovate Bot integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Auto-Merge Process](#auto-merge-process)
- [Renovate Bot Configuration](#renovate-bot-configuration)
- [Branch Protection Rules](#branch-protection-rules)
- [GitHub Settings Required](#github-settings-required)

---

## Overview

The Journal app uses a **fully automated CI/CD pipeline** that:

1. ✅ Validates all PRs to `main` with comprehensive checks
2. 🤖 Automatically merges PRs when all checks pass
3. 🔄 Keeps dependencies updated via Renovate Bot
4. 🚀 Deploys to production via Coolify webhook on merge

**Zero human interaction required** when all checks pass!

---

## Workflows

### 1. 🔍 PR Validation (`pr-validation.yml`)

**Triggers**: When PR is opened/updated targeting `main`

**Checks**:
- ✅ ESLint (client code quality)
- ✅ Infrastructure validation (Docker compliance)
- ✅ Server tests (Vitest + Supertest)
- ✅ RLS policy tests (Row-Level Security)
- ✅ Client build
- ✅ Server build

**Outputs**: Comments on PR with pass/fail status

---

### 2. 🐳 Docker Build Validation (`docker-validation.yml`)

**Triggers**: When PR is opened/updated targeting `main`

**Checks**:
- ✅ Server Docker image builds
- ✅ Client Docker image builds
- ✅ Docker Compose starts all services
- ✅ Server health check passes

**Purpose**: Ensures production deployment will succeed

---

### 3. 🔒 Dependency Review (`dependency-review.yml`)

**Triggers**: When PR is opened targeting `main`

**Checks**:
- ✅ Scans for security vulnerabilities in dependencies
- ✅ Checks license compliance
- ✅ Fails on high/critical severity issues

**Auto-fails on**:
- High or critical CVEs
- GPL/AGPL licenses (copyleft issues)

---

### 4. 📊 Code Coverage (`code-coverage.yml`)

**Triggers**: When PR is opened/updated targeting `main`, or push to `main`

**Checks**:
- ✅ Runs server tests with coverage
- ✅ Generates coverage report
- ✅ Comments coverage metrics on PR

**Thresholds**:
- ✅ 80%+ = Excellent
- ⚠️ 60-79% = Warning
- ❌ <60% = Needs improvement

---

### 5. 🤖 Auto-Merge (`auto-merge.yml`)

**Triggers**:
- When PR review is submitted
- When check suite completes
- When PR becomes ready for review

**Process**:
1. Checks that all validation workflows passed
2. Verifies PR is mergeable (no conflicts)
3. Automatically merges PR with squash strategy
4. Comments on PR with merge confirmation
5. Coolify webhook triggers production deployment

**Merge Strategy**: Squash merge (clean commit history)

---

## Auto-Merge Process

### Flow Diagram

```
Developer/Renovate creates PR targeting main
           ↓
All validation workflows run in parallel:
  - PR Validation ✅
  - Docker Validation ✅
  - Dependency Review ✅
  - Code Coverage ✅
           ↓
All checks pass ✅
           ↓
Auto-merge workflow triggers
           ↓
PR is squash-merged to main 🎉
           ↓
GitHub webhook triggers Coolify
           ↓
Coolify deploys to production 🚀
```

### Requirements for Auto-Merge

For a PR to auto-merge, **ALL** of the following must be true:

1. ✅ All status checks passed
2. ✅ No merge conflicts
3. ✅ PR is not in draft mode
4. ✅ PR targets `main` branch
5. ✅ No security vulnerabilities detected

---

## Renovate Bot Configuration

Renovate Bot is configured in `renovate.json` to automatically update dependencies.

### Key Settings

**Base Branch**: `dev` (Renovate creates PRs to `dev`, not `main`)

**Auto-Merge Rules**:
- ✅ **Patch updates** (e.g., 1.0.0 → 1.0.1): Auto-merge
- ✅ **Minor devDependencies** (e.g., 1.0.0 → 1.1.0): Auto-merge
- ❌ **Major updates**: Require manual review
- ❌ **Minor runtime dependencies**: Require manual review

**Grouping**:
- ESLint packages grouped together
- TypeScript packages grouped together
- React packages grouped together
- Vite packages grouped together

**Security**:
- Vulnerability alerts enabled
- Immediate PR creation for security issues
- Never auto-merge security fixes (require review)

**Schedule**:
- Weekdays: After 10pm, before 5am
- Weekends: Anytime
- Max 3 concurrent PRs

### Renovate Workflow

```
Renovate detects outdated dependency
           ↓
Creates PR to dev branch
           ↓
Validation workflows run
           ↓
If patch/minor dev dependency AND all checks pass:
  → Auto-merges to dev ✅
           ↓
Developer creates PR: dev → main
           ↓
Validation workflows run again
           ↓
Auto-merge to main ✅
           ↓
Deploy to production 🚀
```

---

## Branch Protection Rules

### Required Settings for `main` Branch

Go to: **Settings → Branches → Branch protection rules → `main`**

**Required Settings**:

1. ✅ **Require a pull request before merging**
   - Require approvals: 0 (auto-merge enabled)
   - Dismiss stale pull request approvals when new commits are pushed

2. ✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Required status checks:
     - `Run All Validations` (pr-validation.yml)
     - `Validate Docker Images` (docker-validation.yml)
     - `Review Dependencies for Vulnerabilities` (dependency-review.yml)

3. ✅ **Require conversation resolution before merging**

4. ✅ **Do not allow bypassing the above settings**
   - Include administrators

5. ❌ **Allow force pushes**: Disabled

6. ❌ **Allow deletions**: Disabled

### Optional Settings for `dev` Branch

- Less strict (allow direct pushes for development)
- Can require status checks if desired
- Renovate PRs target this branch

---

## GitHub Settings Required

### 1. Actions Permissions

**Settings → Actions → General**

- ✅ Allow all actions and reusable workflows
- ✅ Workflow permissions: **Read and write permissions**
- ✅ Allow GitHub Actions to create and approve pull requests

### 2. Repository Secrets

**Settings → Secrets and variables → Actions**

No secrets required for basic workflows. PostgreSQL credentials are hardcoded for CI.

**Optional** (for enhanced features):
- `ANTHROPIC_API_KEY`: For AI-powered tests
- `RESEND_API_KEY`: For email testing

### 3. Renovate Bot Installation

**Organization Settings → GitHub Apps → Renovate**

- ✅ Install Renovate Bot on this repository
- ✅ Grant read/write access to repository contents and pull requests

Configuration is read from `renovate.json` automatically.

---

## Testing the Setup

### Manual Test

1. Create a test branch from `dev`:
   ```bash
   git checkout dev
   git pull
   git checkout -b test-ci-cd
   ```

2. Make a trivial change (e.g., add comment to README)

3. Push and create PR to `main`:
   ```bash
   git add .
   git commit -m "test: CI/CD pipeline"
   git push -u origin test-ci-cd
   ```

4. Open PR on GitHub targeting `main`

5. Watch workflows run automatically

6. If all pass, PR auto-merges after ~5-10 minutes

### Expected Behavior

- ✅ 4 workflow runs appear (PR validation, Docker, Dependency Review, Coverage)
- ✅ Comments posted on PR with status
- ✅ All checks turn green
- ✅ Auto-merge workflow runs
- ✅ PR merges automatically
- ✅ Coolify deploys to production

---

## Troubleshooting

### Auto-Merge Not Working

**Check**:
1. Branch protection rules are configured correctly
2. All required status checks are listed
3. Workflow permissions include "Allow GitHub Actions to create and approve pull requests"
4. PR is not in draft mode
5. No merge conflicts exist

### Workflows Failing

**Common Issues**:
- Missing environment variables (check `.env.example`)
- Docker image build failures (check Dockerfile syntax)
- Test failures (run `npm run test:all` locally first)
- RLS policy issues (run `npm run --prefix server test:rls`)

### Renovate Not Creating PRs

**Check**:
1. Renovate Bot is installed on repository
2. `renovate.json` is valid JSON
3. Check Renovate dashboard issue in repository
4. Verify schedule settings (may be waiting for schedule window)

---

## Maintenance

### Weekly

- Review Renovate dashboard issue
- Check for pending major updates

### Monthly

- Review code coverage trends
- Update Renovate config if needed
- Review auto-merge logs

### As Needed

- Update branch protection rules if workflows change
- Adjust Renovate schedule if too noisy
- Modify auto-merge rules based on team preferences

---

## Support

For issues with:
- **Workflows**: Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- **Renovate**: Check [Renovate documentation](https://docs.renovatebot.com/)
- **Auto-merge**: Check workflow logs in `.github/workflows/auto-merge.yml`

---

**Status**: ✅ Fully Automated
**Last Updated**: 2026-02-11
