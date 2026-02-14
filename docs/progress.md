# Development Progress Log

---

## 2026-02-14 — Fix Docker Build Broken by PR #52

**Branch**: `fix/automerge-workflow`
**PR**: [#60](https://github.com/Philippe-arnd/JournalVibecoded/pull/60)
**Commit**: `fix: restore docker build broken by PR #52 test coverage changes`

### Problem

PR #52 (`chore: improve server test coverage above 80%`) broke the Coolify production deployment. The Docker build failed at the `npm run build` (`tsc`) step with exit code 1.

### Root Causes

Two distinct issues, both introduced by PR #52:

**1. TypeScript strict-mode errors in test files** (`entries.test.ts`)
- `server/tsconfig.json` had `"include": ["src/**/*"]` with no exclusions
- `tsc` compiled test files under `strict: true`, causing 8 `TS7006` errors on untyped mock callback parameters:
  ```typescript
  // Problem: userId and cb have implicit `any` under noImplicitAny
  (withRLS as any).mockImplementation(async (userId, cb) => { ... });
  ```
- Fix: Excluded test files from the production TypeScript compilation:
  ```json
  "exclude": ["src/**/*.test.ts", "src/__tests__/**/*"]
  ```

**2. Missing `vi.mock` for `send-email` in two test files**
- `health.test.ts` and `auth-protection.test.ts` imported `app` without mocking `send-email` first
- Module-load chain: `server → auth → send-email → new Resend(process.env.RESEND_API_KEY)` throws `Missing API key` when env var is unset
- Fix: Added `vi.mock('../utils/send-email', ...)` before `import app` in both files, matching the pattern already used in `auth.test.ts`

### Files Changed

| File | Change |
|------|--------|
| `server/tsconfig.json` | Added `"exclude"` array for test files |
| `server/src/__tests__/health.test.ts` | Added `vi.mock('../utils/send-email', ...)` |
| `server/src/__tests__/auth-protection.test.ts` | Added `vi.mock('../utils/send-email', ...)` |

### Verification

- `npx tsc --noEmit` → clean (no output)
- `npm run test:all` → 6 suites, 18 tests, all pass

### Key Patterns

- Vitest's `vi.mock()` must be hoisted before any `import` that triggers the mocked module's constructor
- Test files should always be excluded from production `tsconfig.json` when using `strict: true`

---

## 2026-02-14 — Fix Workflow Docs Drift and Semgrep SAST Failures

**Branch**: `fix/automerge-workflow`

### Problems

Two separate issues addressed in this session:

**1. Documentation drift in `.github/*.md`**
- `.github/WORKFLOWS.md` referenced a non-existent `code-coverage.yml` workflow, showed Docker Validation as always-on, used wrong auto-merge trigger (`check_suite` instead of `workflow_run`), listed wrong required check names, and was missing the `security-performance.yml` workflow entirely.
- `.github/CICD-SETUP.md` had similar drift: old auto-merge flow diagram, stale required check names (`Run All Validations`, `Validate Docker Images`), and incorrect expected behavior on test PRs.
- `.github/SETUP-CHECKLIST.md` referenced a non-existent `WORKFLOW-OPTIMIZATION.md` file in two places.

**2. Semgrep SAST not running in CI**
- Security scan job in `security-performance.yml` failed with: `semgrep error: invalid language: jsx`
- Local Docker validation revealed two additional issues after the language fix: a parse error in the XSS rule pattern, and path deprecation warnings across all rules.
- A false positive was also detected: `DOMPurify.sanitize(content || "...")` in `HomeView.jsx` was flagged by the XSS rule because `pattern-not` used `$VAR` (single metavariable) instead of `...` (ellipsis for any arguments).

### Root Causes

**Documentation drift**: Docs were written before several workflow optimizations (PRs #50–52) that restructured jobs, renamed checks, and changed auto-merge trigger. No one updated the docs.

**`invalid language: jsx`**: Rule #7 (`xss-risk-dangerous-html`) listed `jsx` and `tsx` as Semgrep language identifiers. These are not valid — Semgrep uses `javascript` for `.jsx` files and `typescript` for `.tsx` files.

**Parse error in XSS rule**: The original pattern `dangerouslySetInnerHTML={{ __html: $VAR }}` is JSX attribute syntax and cannot be parsed as a standalone Semgrep JS pattern. The underlying JS object literal `{__html: $VAR}` is the correct representation.

**Path deprecation warnings**: All `include` paths like `server/src/routes/**` were bare patterns. Semgrepignore v2 interprets these as anchored to repo root, so they never matched. Fix: prefix all paths with `**/` and quote them.

**False positive**: `pattern-not: {__html: DOMPurify.sanitize($VAR)}` only excludes single-argument calls. The actual code uses `DOMPurify.sanitize(content || "No entry recorded.")` — a compound expression — which didn't match. Fix: use `...` (Semgrep ellipsis) to match any arguments.

### Files Changed

| File | Change |
|------|--------|
| `.github/WORKFLOWS.md` | Complete rewrite to match actual workflow state |
| `.github/CICD-SETUP.md` | Updated workflow descriptions, auto-merge flow diagram, branch protection check names, expected behavior |
| `.github/SETUP-CHECKLIST.md` | Fixed two references from `WORKFLOW-OPTIMIZATION.md` → `WORKFLOWS.md` |
| `.semgrep.yml` | Removed invalid `jsx`/`tsx` language identifiers; rewrote XSS rule pattern; added `**/` prefix to all include paths; fixed `pattern-not` to use ellipsis |

### Semgrep Fix Details

```yaml
# Rule 7 — languages: removed invalid jsx/tsx
languages:
  - javascript
  - typescript

# Rule 7 — pattern: rewrote XSS patterns (JSX attr syntax → JS object literal)
patterns:
  - pattern-either:
      - pattern: |
          {__html: $VAR}
      - pattern: |
          $EL.innerHTML = $VAR
  - pattern-not: |
      {__html: DOMPurify.sanitize(...)}

# All rules — paths: prefixed with **/ for Semgrepignore v2
paths:
  include:
    - "**/server/src/routes/**"
    - "**/client/**"
```

### Verification

Three iterative local Docker semgrep runs:
1. Confirmed `invalid language: jsx` gone → revealed parse error and path warnings
2. After fixing parse error and paths → 2 findings (1 legitimate, 1 false positive)
3. After fixing `pattern-not` ellipsis → ✅ 1 legitimate finding only

**Final scan**: 10 rules run, 37 files scanned, 0 errors, 1 legitimate finding:
- `editorRef.current.innerHTML = value || ''` in `client/src/views/EntryCreationView.jsx:39` (known, intentional direct DOM mutation in a rich-text editor)

### Key Patterns

- Semgrep does not support `jsx` or `tsx` as language identifiers — use `javascript`/`typescript`
- JSX attribute syntax (`dangerouslySetInnerHTML={{ ... }}`) cannot be used as a Semgrep pattern; target the underlying JS object literal instead
- Semgrep `pattern-not` with `$VAR` only excludes single-variable matches; use `...` (ellipsis) to exclude any arguments
- All `include` path patterns must be prefixed with `**/` in Semgrepignore v2 to match anywhere in the repo
