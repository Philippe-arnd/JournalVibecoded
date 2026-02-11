# ✅ CI/CD Setup Checklist

Use this checklist to configure the automated CI/CD pipeline for the Journal app.

## 📋 Pre-Setup

- [ ] Repository is on GitHub
- [ ] You have admin access to the repository
- [ ] Repository has `main` and `dev` branches

---

## 🔧 GitHub Repository Settings

### 1. Actions Permissions

Go to: **Settings → Actions → General**

- [ ] Set **Workflow permissions** to: **Read and write permissions**
- [ ] Enable: **Allow GitHub Actions to create and approve pull requests**
- [ ] Save changes

### 2. Branch Protection Rules

Go to: **Settings → Branches → Add rule**

**For `main` branch**:

- [ ] Branch name pattern: `main`
- [ ] ✅ Check: **Require a pull request before merging**
  - [ ] Required approvals: `0`
  - [ ] ✅ Dismiss stale pull request approvals when new commits are pushed
- [ ] ✅ Check: **Require status checks to pass before merging**
  - [ ] ✅ Require branches to be up to date before merging
  - [ ] Add required status checks (after first workflow runs):
    - [ ] `Run All Validations`
    - [ ] `Validate Docker Images`
    - [ ] `Review Dependencies for Vulnerabilities`
- [ ] ✅ Check: **Require conversation resolution before merging**
- [ ] ✅ Check: **Do not allow bypassing the above settings**
- [ ] ✅ Check: **Include administrators**
- [ ] ❌ Uncheck: **Allow force pushes**
- [ ] ❌ Uncheck: **Allow deletions**
- [ ] Click **Create** or **Save changes**

---

## 🤖 Install Renovate Bot

### Option A: Organization-Level Install (Recommended)

- [ ] Go to: **Organization Settings → GitHub Apps**
- [ ] Search for "Renovate" in GitHub Marketplace
- [ ] Click **Install** or **Configure**
- [ ] Select repositories: Choose this repository or all repositories
- [ ] Grant permissions: Read/write for contents and pull requests
- [ ] Complete installation

### Option B: Repository-Level Install

- [ ] Go to: https://github.com/apps/renovate
- [ ] Click **Install**
- [ ] Select your account/organization
- [ ] Choose: **Only select repositories** → Select `journal`
- [ ] Complete installation

**Verify Installation**:
- [ ] Check that Renovate created a "Configure Renovate" PR
- [ ] Merge the configure PR (or it will use the existing `renovate.json`)

---

## 📝 Update README Badges

The README.md file has placeholder badges. Update them:

- [ ] Open `README.md`
- [ ] Replace `YOUR_USERNAME` with your GitHub username/org name:
  ```markdown
  [![PR Validation](https://github.com/YOUR_USERNAME/journal/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/YOUR_USERNAME/journal/actions/workflows/pr-validation.yml)
  ```
- [ ] Commit and push changes

---

## 🧪 Test the Setup

### Test 1: Create a Test PR

- [ ] Create a test branch from `dev`:
  ```bash
  git checkout dev
  git pull
  git checkout -b test-ci-pipeline
  ```

- [ ] Make a small change (e.g., add a comment in README)
  ```bash
  echo "<!-- CI/CD test -->" >> README.md
  git add README.md
  git commit -m "test: verify CI/CD pipeline"
  git push -u origin test-ci-pipeline
  ```

- [ ] Open PR on GitHub targeting `main`

- [ ] Verify workflows run:
  - [ ] PR Validation appears and runs
  - [ ] Docker Validation appears and runs
  - [ ] Dependency Review appears and runs
  - [ ] Code Coverage appears and runs

- [ ] Wait for all checks to pass (green checkmarks)

- [ ] Verify auto-merge workflow runs

- [ ] Verify PR auto-merges (should take 1-5 minutes after checks pass)

- [ ] Verify Coolify deploys to production

### Test 2: Verify Branch Protection

- [ ] Try to push directly to `main`:
  ```bash
  git checkout main
  git pull
  echo "test" >> test.txt
  git add test.txt
  git commit -m "test: direct push"
  git push
  ```

- [ ] **Expected**: Push should be rejected with branch protection error ✅

### Test 3: Verify Renovate

- [ ] Check for "Dependency Dashboard" issue in repository
- [ ] Verify Renovate configuration is detected
- [ ] Wait 24-48 hours for first Renovate PR (if dependencies are outdated)

---

## 🔍 Verify All Status Checks

After first PR is created, verify status checks appear:

Go to: **Settings → Branches → Edit rule for `main`**

Under "Require status checks to pass before merging", search for and add:

- [ ] `Run All Validations` (from pr-validation.yml)
- [ ] `Validate Docker Images` (from docker-validation.yml)
- [ ] `Review Dependencies for Vulnerabilities` (from dependency-review.yml)

**Note**: Status checks only appear after the workflow has run at least once.

---

## 📊 Optional: Enable GitHub Insights

- [ ] Go to: **Insights → Community Standards**
- [ ] Check completion status
- [ ] Add any recommended files (CODE_OF_CONDUCT, CONTRIBUTING, etc.)

---

## ✅ Final Verification

Run through this checklist to confirm everything works:

- [ ] PRs to `main` trigger all validation workflows
- [ ] Status checks appear on PRs
- [ ] Comments are posted on PRs with status
- [ ] Direct pushes to `main` are blocked
- [ ] Auto-merge works when all checks pass
- [ ] Coolify deploys after merge to `main`
- [ ] Renovate Bot is creating PRs (may take 24-48h)
- [ ] README badges show correct status

---

## 🎉 Setup Complete!

If all items are checked, your CI/CD pipeline is fully operational!

### What Happens Now?

1. **Dev workflow**: Work on `dev` branch, create PR to `main` when ready
2. **Validation**: All checks run automatically on PR
3. **Auto-merge**: PR merges automatically if all checks pass
4. **Deployment**: Coolify deploys to production automatically
5. **Dependencies**: Renovate keeps dependencies updated automatically

### Next Steps

- [ ] Read `.github/CICD-SETUP.md` for detailed documentation
- [ ] Customize `renovate.json` if needed
- [ ] Set up Slack/Discord notifications (optional)
- [ ] Configure code coverage reporting dashboard (optional)

---

## 🆘 Troubleshooting

If something doesn't work:

1. Check [CICD-SETUP.md](.github/CICD-SETUP.md) troubleshooting section
2. Review workflow logs in **Actions** tab
3. Verify all GitHub permissions are granted
4. Check branch protection rules are saved correctly
5. Ensure no typos in workflow file names

---

**Setup Date**: ___________
**Setup By**: ___________
**Status**: ⬜ In Progress / ✅ Complete
