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

**Triggers**: When PR is opened/updated targeting `main` **and** the changes touch Docker-related files (`Dockerfile`, `*/Dockerfile`, `*.Dockerfile`, `docker-compose*.yml`, `.dockerignore`). Does **not** run on code-only PRs.

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

### 4. 🔒🚀 Security & Performance (`security-performance.yml`)

**Triggers**: When PR is opened/updated targeting `main` (skips drafts)

**Jobs** (three run in parallel):

- 🔍 **Secret Detection** (timeout: 2m) — Gitleaks scans full git history for exposed credentials. Blocks PR on failure. Config: `.gitleaks.toml`
- 🛡️ **Security Scan** (timeout: 3m) — Semgrep SAST with `p/security-audit`, `p/javascript`, `p/typescript`, `p/react`, `p/nodejs`, and `.semgrep.yml` custom rules. Critical errors block; warnings are non-blocking.
- 📦 **Bundle Size** (timeout: 5m) — Builds client, compares JS/CSS sizes against baselines (JS: 543 KB, CSS: 43 KB). Warns if either grows >10% (non-blocking).
- 📋 **Generate Report** — Posts/updates a single consolidated PR comment. Fails the check if secret or SAST jobs failed.

**Coverage** is now part of `pr-validation.yml` (`Database & API Tests` job), not a separate workflow.

---

### 5. 🤖 Auto-Merge (`auto-merge.yml`)

**Triggers**: `workflow_run` completion for any of:
- `✅ PR Validation`
- `🔒🚀 Security & Performance`
- `🔒 Dependency Review`
- `🐳 Docker Validation`

Only runs when the triggering workflow **succeeded**.

**Process**:
1. Finds the open PR associated with the workflow's head branch
2. Skips draft PRs and PRs not targeting `main`
3. Queries all check runs and verifies all required checks are `completed` + `success`
4. Verifies PR is mergeable (no conflicts)
5. Squash-merges and posts a confirmation comment
6. Coolify webhook triggers production deployment

**Merge Strategy**: Squash merge (clean commit history)

---

## Auto-Merge Process

### Flow Diagram

```
Developer/Renovate creates PR targeting main
           ↓
Validation workflows run in parallel:
  - PR Validation (Quick Checks + DB & API Tests) ✅
  - Security & Performance (Secret Detection + SAST + Bundle Size) ✅
  - Dependency Review ✅
  - Docker Validation (only if Docker files changed) ✅
           ↓
Each workflow completes → triggers auto-merge workflow via workflow_run
           ↓
Auto-merge checks: are ALL 5 required checks completed + successful?
  - Quick Checks ✅
  - Database & API Tests ✅
  - 🔍 Secret Detection ✅
  - 🛡️ Security Scan ✅
  - Review Dependencies for Vulnerabilities ✅
           ↓
Is PR mergeable (no conflicts, not draft)?
           ↓
PR is squash-merged to main 🎉
           ↓
GitHub webhook triggers Coolify
           ↓
Coolify deploys to production 🚀
```

### Requirements for Auto-Merge

For a PR to auto-merge, **ALL** of the following must be true:

1. ✅ PR targets `main` branch
2. ✅ PR is not in draft mode
3. ✅ No merge conflicts (PR is mergeable)
4. ✅ `Quick Checks` passed (lint, infra, builds)
5. ✅ `Database & API Tests` passed (migrations, RLS, Vitest + coverage)
6. ✅ `🔍 Secret Detection` passed (no exposed credentials)
7. ✅ `🛡️ Security Scan` passed (no critical vulnerabilities)
8. ✅ `Review Dependencies for Vulnerabilities` passed (no high/critical CVEs)

**Note**: Docker Validation and Bundle Size are **not** required for auto-merge. Docker only runs on Docker file changes; Bundle Size is informational only.

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
     - `Quick Checks` (pr-validation.yml)
     - `Database & API Tests` (pr-validation.yml)
     - `🔍 Secret Detection` (security-performance.yml)
     - `🛡️ Security Scan` (security-performance.yml)
     - `Review Dependencies for Vulnerabilities` (dependency-review.yml)
   - Optional (non-blocking):
     - `📦 Bundle Size` (security-performance.yml)
     - `Build & Test Docker Images` (docker-validation.yml — path-triggered)

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

- ✅ 3 workflow runs appear (PR Validation, Security & Performance, Dependency Review)
- ✅ Docker Validation does **not** run (no Docker files changed)
- ✅ PR Validation posts a unified comment with lint/build/test/coverage results
- ✅ Security & Performance posts a unified comment with secret/SAST/bundle results
- ✅ All 5 required checks turn green
- ✅ Auto-merge workflow triggers via `workflow_run` on each completion
- ✅ PR squash-merges automatically once all checks pass
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
**Last Updated**: 2026-02-14
